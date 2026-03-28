import { z } from 'zod'

const CSV_LINE_SPLIT_RE = /\r?\n/

const emailShape = z.string().email()

const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[ _-]/g, '')

const parseRow = (line: string) => {
  const cells: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      const next = line[i + 1]
      if (inQuotes && next === '"') {
        current += '"'
        i++
        continue
      }
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      cells.push(current)
      current = ''
      continue
    }

    current += char
  }

  cells.push(current)
  return cells.map((value) => value.trim())
}

type ColumnKeys = Array<readonly string[]>

const findColumnIndex = (columns: string[], keySets: ColumnKeys) => {
  const normalizedColumns = columns.map((value) => normalizeHeader(value))
  return keySets
    .map((keySet) =>
      keySet
        .map((key) => normalizedColumns.indexOf(normalizeHeader(key)))
        .find((index) => index >= 0),
    )
    .find((index) => typeof index === 'number') as number | undefined
}

const mapNameParts = (value: string): [string | undefined, string | undefined] => {
  const parts = value.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return [undefined, undefined]
  if (parts.length === 1) return [parts[0], undefined]
  const lastName = parts.pop() ?? ''
  const firstName = parts.join(' ')
  return [firstName || undefined, lastName || undefined]
}

export type TeacherImportStatus = 'valid' | 'invalid' | 'duplicate'

export interface TeacherImportPreviewRow {
  rowNumber: number
  firstName?: string
  lastName?: string
  fullName?: string
  email?: string
  phone?: string
  subjectQualifications: string[]
  errors: string[]
  status: TeacherImportStatus
  rawValues: string[]
}

const FIRST_NAME_KEYS: ColumnKeys = [
  ['firstname', 'first_name', 'first-name'],
  ['givenname', 'given-name'],
]
const NAME_KEYS: ColumnKeys = [['name'], ['fullname']]
const REQUIRED_LAST_NAME_KEYS: ColumnKeys = [
  ['lastname', 'last_name', 'last-name'],
  ['surname'],
]

export function parseTeacherCsv(text: string, existingEmails: string[] = []) {
  const normalizedText = text.replace(/^\uFEFF/, '')
  const lines = normalizedText.split(CSV_LINE_SPLIT_RE).filter((line) => line.trim().length > 0)
  if (lines.length === 0) return []

  const header = parseRow(lines[0])
  const emailIndex = findColumnIndex(header, [['email']])
  if (emailIndex === undefined) {
    throw new Error('CSV file must include an `email` column.')
  }

  const firstNameIndex = findColumnIndex(header, FIRST_NAME_KEYS)
  const lastNameIndex = findColumnIndex(header, REQUIRED_LAST_NAME_KEYS)
  const nameIndex = findColumnIndex(header, NAME_KEYS)

  if (firstNameIndex === undefined && lastNameIndex === undefined && nameIndex === undefined) {
    throw new Error('CSV file must include a `name` column or first/last name columns.')
  }

  const phoneIndex = findColumnIndex(header, [['phone'], ['phoneNumber'], ['phonenumber']])
  const subjectsIndex = findColumnIndex(header, [['subjects'], ['subjectqualifications']])

  const existingSet = new Set(existingEmails.map((email) => email.toLowerCase()))
  const seenEmails = new Set<string>()

  const rows: TeacherImportPreviewRow[] = []

  const columnCount = header.length

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1
    const values = parseRow(lines[i])
    while (values.length < columnCount) {
      values.push('')
    }
    if (values.length > columnCount) {
      values.splice(columnCount)
    }
    if (values.every((value) => value === '')) {
      continue
    }

    const email = values[emailIndex]?.trim()
    const rawName = nameIndex !== undefined ? values[nameIndex] : ''

    let firstName = values[firstNameIndex ?? -1]?.trim() || undefined
    let lastName = values[lastNameIndex ?? -1]?.trim() || undefined
    const errors: string[] = []

    if (!firstName || !lastName) {
      const [computedFirstName, computedLastName] = rawName
        ? mapNameParts(rawName)
        : [undefined, undefined]
      firstName = firstName || computedFirstName
      lastName = lastName || computedLastName
    }

    if (!email) {
      errors.push('Missing email address.')
    } else if (!emailShape.safeParse(email).success) {
      errors.push('Enter a valid email address.')
    }

    if (!firstName || !lastName) {
      errors.push('Missing name components (first and last name are required).')
    }

    const normalizedEmail = email?.toLowerCase() ?? ''
    const emailOk = Boolean(email && emailShape.safeParse(email).success)
    const isDuplicate =
      emailOk &&
      (existingSet.has(normalizedEmail) || seenEmails.has(normalizedEmail))

    if (!isDuplicate && emailOk) {
      seenEmails.add(normalizedEmail)
    }

    const subjectCell = subjectsIndex !== undefined ? values[subjectsIndex] : ''
    const subjectQualifications = subjectCell
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    let status: TeacherImportStatus = 'valid'
    if (errors.length > 0) {
      status = 'invalid'
    } else if (isDuplicate) {
      status = 'duplicate'
    }

    const phone =
      phoneIndex !== undefined && values[phoneIndex]?.trim().length > 0
        ? values[phoneIndex]!.trim()
        : undefined

    rows.push({
      rowNumber,
      firstName,
      lastName,
      fullName: rawName.trim() || `${firstName ?? ''} ${lastName ?? ''}`.trim(),
      email,
      phone,
      subjectQualifications,
      errors,
      status,
      rawValues: values,
    })
  }

  return rows
}
