import { describe, expect, it } from 'vitest'
import { parseTeacherCsv } from '@/features/teachers/utils/parse-teacher-csv'

describe('parseTeacherCsv', () => {
  it('parses rows with full names and subjects', () => {
    const csv = [
      'Name,Email,Phone,Subjects',
      'Alice Chen,alice@school.edu,+44 20 7946 0000,"Math, Science"',
      'Brian Owens,brian@school.edu,,History',
    ].join('\n')

    const preview = parseTeacherCsv(csv)

    expect(preview).toHaveLength(2)
    expect(preview[0].status).toBe('valid')
    expect(preview[0].subjectQualifications).toEqual(['Math', 'Science'])
    expect(preview[0].firstName).toBe('Alice')
    expect(preview[0].lastName).toBe('Chen')
  })

  it('flags missing email and missing name as invalid', () => {
    const csv = ['Name,Email', ',missing@school.edu', 'NoEmail,'].join('\n')
    const preview = parseTeacherCsv(csv)

    expect(preview.some((row) => row.errors.length > 0)).toBe(true)
    expect(preview.find((row) => row.rowNumber === 2)?.status).toBe('invalid')
    expect(preview.find((row) => row.rowNumber === 3)?.status).toBe('invalid')
  })

  it('marks duplicate rows using existing emails and previous rows', () => {
    const csv = ['Name,Email', 'Existing Teacher,existing@school.edu', 'Existing Duplicate,existing@school.edu'].join('\n')

    const preview = parseTeacherCsv(csv, ['existing@school.edu'])

    expect(preview[0].status).toBe('duplicate')
    expect(preview[1].status).toBe('duplicate')
  })

  it('strips a UTF-8 BOM so the header row is recognized', () => {
    const csv = '\uFEFFName,Email\nTest User,test@school.edu'
    const preview = parseTeacherCsv(csv)
    expect(preview).toHaveLength(1)
    expect(preview[0].email).toBe('test@school.edu')
  })

  it('flags malformed email addresses in the preview', () => {
    const csv = ['Name,Email', 'Bad Email,not-an-email'].join('\n')
    const preview = parseTeacherCsv(csv)
    expect(preview[0].status).toBe('invalid')
    expect(preview[0].errors.some((e) => /valid email/i.test(e))).toBe(true)
  })

  it('pads short rows to align with the header', () => {
    const csv = ['Name,Email,Subjects', 'Solo Name,solo@school.edu'].join('\n')
    const preview = parseTeacherCsv(csv)
    expect(preview[0].rawValues.length).toBe(3)
    expect(preview[0].status).toBe('valid')
  })

  it('ignores cells beyond the header column count', () => {
    const csv = ['Name,Email,Subjects', 'Extra Wide,wide@school.edu,Math,ignored-trailing-cell'].join('\n')
    const preview = parseTeacherCsv(csv)
    expect(preview[0].rawValues).toEqual(['Extra Wide', 'wide@school.edu', 'Math'])
    expect(preview[0].subjectQualifications).toEqual(['Math'])
  })
})
