import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Button } from '@/components/ui/button'
import { InviteTeachersDialog } from '@/features/teachers/components/InviteTeachersDialog'
import { TeacherForm } from '@/features/teachers/components/TeacherForm'
import { TeacherStatusBadge } from '@/features/teachers/components/TeacherStatusBadge'
import { useCreateTeacher, useDeleteTeacher, useImportTeachers, useTeachers, useUpdateTeacher } from '@/api/hooks/useTeachers'
import { useInvitations, useResendInvitation } from '@/api/hooks/useInvitations'
import { getApiErrorMessage } from '@/lib/api-error-message'
import { parseTeacherCsv, type TeacherImportPreviewRow } from '@/features/teachers/utils/parse-teacher-csv'
import type { TeacherDto, TeacherFormValues } from '@/types/teacher.types'
import { useAuthStore } from '@/store/authStore'

/** CSV uploads are parsed fully in memory; cap size to avoid freezing the tab. */
const MAX_TEACHER_CSV_BYTES = 2 * 1024 * 1024

function normalizeSubjects(raw?: string) {
  if (!raw) return []
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
}

function formatName(teacher: TeacherDto) {
  return `${teacher.firstName} ${teacher.lastName}`
}

export default function TeacherListPage() {
  const currentUser = useAuthStore((s) => s.user)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [isRosterFormOpen, setIsRosterFormOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<TeacherDto | null>(null)
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherDto | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const deleteDialogCancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!teacherToDelete) return
    deleteDialogCancelRef.current?.focus()
  }, [teacherToDelete])

  useEffect(() => {
    if (!teacherToDelete) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTeacherToDelete(null)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [teacherToDelete])

  const { data: rosterResponse, isLoading: isRosterLoading, error: rosterError } = useTeachers()
  const teachers = rosterResponse?.content ?? []

  const {
    mutate: createTeacher,
    isPending: isCreating,
    error: createError,
  } = useCreateTeacher()
  const {
    mutate: updateTeacher,
    isPending: isUpdating,
    error: updateError,
  } = useUpdateTeacher()
  const {
    mutate: deleteTeacher,
    isPending: isDeleting,
    error: deleteError,
  } = useDeleteTeacher()

  const isFormSubmitting = isCreating || isUpdating
  const mutationError = createError ?? updateError ?? deleteError
  const operationErrorMessage = mutationError ? getApiErrorMessage(mutationError) : null

  const [isImportPanelOpen, setIsImportPanelOpen] = useState(false)
  const [importPreview, setImportPreview] = useState<TeacherImportPreviewRow[]>([])
  const [csvParsingError, setCsvParsingError] = useState<string | null>(null)
  const [importFeedback, setImportFeedback] = useState<string | null>(null)
  const [importFileKey, setImportFileKey] = useState(0)

  const {
    mutate: importTeachers,
    isPending: isImporting,
    error: importError,
  } = useImportTeachers()

  const validPreviewRows = importPreview.filter((row) => row.status === 'valid')
  const duplicatePreviewRows = importPreview.filter((row) => row.status === 'duplicate')
  const invalidPreviewRows = importPreview.filter((row) => row.status === 'invalid')
  const importErrorMessage = importError ? getApiErrorMessage(importError) : null

  const handleFormClose = () => {
    setIsRosterFormOpen(false)
    setEditingTeacher(null)
  }

  const handleAddTeacherClick = () => {
    setStatusMessage(null)
    setEditingTeacher(null)
    setIsRosterFormOpen(true)
  }

  const handleEditTeacher = (teacher: TeacherDto) => {
    setStatusMessage(null)
    setEditingTeacher(teacher)
    setIsRosterFormOpen(true)
  }

  const handleFormSubmit = (values: TeacherFormValues) => {
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() || null,
      subjectQualifications: normalizeSubjects(values.subjectQualifications),
    }

    if (editingTeacher) {
      updateTeacher(
        { id: editingTeacher.id, data: payload },
        {
          onSuccess: () => {
            setStatusMessage('Teacher updated successfully.')
            handleFormClose()
          },
        },
      )
    } else {
      createTeacher(payload, {
        onSuccess: () => {
          setStatusMessage('Teacher added to the roster.')
          handleFormClose()
        },
      })
    }
  }

  const handleDeleteConfirm = () => {
    if (!teacherToDelete) return
    const removed = teacherToDelete
    deleteTeacher(removed.id, {
      onSuccess: () => {
        setStatusMessage(
          `${formatName(removed)} was removed from the roster. If they had timetable assignments, review the schedule — those slots may still need attention before publish.`,
        )
        setTeacherToDelete(null)
      },
    })
  }

  const resetImportPreview = () => {
    setImportPreview([])
    setCsvParsingError(null)
    setImportFeedback(null)
    setImportFileKey((key) => key + 1)
  }

  const openImportPanel = () => {
    resetImportPreview()
    setIsImportPanelOpen(true)
  }

  const closeImportPanel = () => {
    resetImportPreview()
    setIsImportPanelOpen(false)
  }

  const handleCsvUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > MAX_TEACHER_CSV_BYTES) {
      setCsvParsingError(
        `File is too large (max ${Math.floor(MAX_TEACHER_CSV_BYTES / 1024 / 1024)} MB). Split the CSV or remove unneeded columns.`,
      )
      setImportPreview([])
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setCsvParsingError('Unable to read the selected CSV file.')
        setImportPreview([])
        return
      }

      try {
        const preview = parseTeacherCsv(reader.result, teachers.map((teacher) => teacher.email))
        setImportPreview(preview)
        setCsvParsingError(null)
        setImportFeedback(null)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'The CSV file could not be parsed.'
        setCsvParsingError(message)
        setImportPreview([])
      }
    }
    reader.onerror = () => {
      setCsvParsingError('Unable to read the selected CSV file.')
      setImportPreview([])
    }
    reader.readAsText(file)
  }

  const handleImportSubmit = () => {
    if (validPreviewRows.length === 0) return

    const payload = {
      teachers: validPreviewRows.map((row) => ({
        firstName: row.firstName ?? '',
        lastName: row.lastName ?? '',
        email: row.email ?? '',
        phone: row.phone ?? null,
        subjectQualifications: [...row.subjectQualifications],
      })),
    }

    importTeachers(payload, {
      onSuccess: (response) => {
        const skipped = response.skipped.length
        const skippedPhrase =
          skipped === 0 ? 'None were skipped.' : `${skipped} duplicate or existing row(s) were skipped.`
        setImportFeedback(
          `Imported ${response.imported.length} teacher(s). ${skippedPhrase} ${response.remainingQuota} slot(s) remain.`,
        )
        setImportPreview((prev) => prev.filter((row) => row.status !== 'valid'))
        setImportFileKey((key) => key + 1)
      },
    })
  }

  const formInitialValues: TeacherFormValues | undefined = editingTeacher
    ? {
        firstName: editingTeacher.firstName,
        lastName: editingTeacher.lastName,
        email: editingTeacher.email,
        phone: editingTeacher.phone ?? '',
        subjectQualifications: editingTeacher.subjectQualifications.join(', '),
      }
    : undefined

  const formKey = editingTeacher ? editingTeacher.id : 'new'

  const { data, isLoading, error } = useInvitations()
  const { mutate: resendInvitation, isPending: isResending, variables: resendingId } =
    useResendInvitation()
  const invitedTeachers = data?.content ?? []

  return (
    <div className="p-6">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Teachers
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Manage teachers manually or invite them with a magic link.
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" onClick={handleAddTeacherClick}>
            Add teacher
          </Button>
          <Button type="button" variant="outline" onClick={() => setShowInviteDialog(true)}>
            Invite teachers
          </Button>
        </div>
      </header>

      <section aria-label="Manual teacher roster" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Teacher roster
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Add, update, and remove teacher records that feed into scheduling flows.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={openImportPanel}
              aria-label={isImportPanelOpen ? 'Hide CSV import' : 'Import via CSV (from roster)'}
            >
              {isImportPanelOpen ? 'Hide CSV import' : 'Import via CSV'}
            </Button>
            <Button type="button" variant="ghost" onClick={handleAddTeacherClick}>
              {editingTeacher ? 'Add another teacher' : 'Add teacher manually'}
            </Button>
          </div>
        </div>

        {isImportPanelOpen && (
          <div className="mt-3 rounded-xl border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Import teachers via CSV
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Upload a CSV with Name (or First/Last name) and Email columns. Optional fields: Phone, Subjects (comma separated).
                  If you use a single <strong>Name</strong> column, include at least two words (given name and family name); for one-word names, use separate <strong>First name</strong> and <strong>Last name</strong> columns instead.
                  Invalid rows stay highlighted so you can fix them before importing.
                </p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={closeImportPanel}>
                Close
              </Button>
            </div>

            <label htmlFor="teacher-import-file" className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              CSV file
            </label>
            <input
              id="teacher-import-file"
              key={importFileKey}
              type="file"
              accept=".csv,text/csv"
              className="mt-1 w-full rounded-md border border-[--color-border] bg-transparent px-3 py-2 text-sm text-[--color-text-primary] disabled:opacity-50"
              disabled={isRosterLoading}
              aria-describedby={isRosterLoading ? 'import-roster-loading-note' : undefined}
              onChange={handleCsvUpload}
            />
            {isRosterLoading && (
              <p id="import-roster-loading-note" className="mt-1 text-xs text-[--color-text-secondary]">
                Waiting for roster to load before checking for duplicates…
              </p>
            )}
            <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Required columns: Name/email or First name, Last name, and Email. Phone and Subjects can be present to enrich each record.
              A lone <code>Name</code> value must split into first and last (two or more words); otherwise use First name and Last name columns.
            </p>

            {csvParsingError && (
              <div
                role="alert"
                className="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
              >
                {csvParsingError}
              </div>
            )}

            {importPreview.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    Preview: {importPreview.length} row{importPreview.length === 1 ? '' : 's'} · {validPreviewRows.length}{' '}
                    ready · {duplicatePreviewRows.length} duplicates · {invalidPreviewRows.length} invalid
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={resetImportPreview}>
                    Reset preview
                  </Button>
                </div>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-[--color-border]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        className="bg-[--color-surface] text-[--color-text-secondary]"
                      >
                        <th className="px-3 py-2 text-left font-medium">Row</th>
                        <th className="px-3 py-2 text-left font-medium">Name</th>
                        <th className="px-3 py-2 text-left font-medium">Email</th>
                        <th className="px-3 py-2 text-left font-medium">Subjects</th>
                        <th className="px-3 py-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((row) => (
                        <tr
                          key={`preview-${row.rowNumber}`}
                          className={`border-b border-[--color-border] ${
                            row.status === 'invalid'
                              ? 'bg-red-50'
                              : row.status === 'duplicate'
                              ? 'bg-orange-50'
                              : 'bg-[--color-surface]'
                          }`}
                        >
                          <td className="px-3 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                            {row.rowNumber}
                          </td>
                          <td className="px-3 py-2" style={{ color: 'var(--color-text-primary)' }}>
                            {row.fullName || '—'}
                          </td>
                          <td className="px-3 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                            {row.email || '—'}
                          </td>
                          <td className="px-3 py-2" style={{ color: 'var(--color-text-secondary)' }}>
                            {row.subjectQualifications.length > 0 ? row.subjectQualifications.join(', ') : '—'}
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`text-xs font-semibold ${
                                row.status === 'valid'
                                  ? 'text-emerald-700'
                                  : row.status === 'duplicate'
                                  ? 'text-orange-700'
                                  : 'text-red-700'
                              }`}
                            >
                              {row.status === 'valid'
                                ? 'Ready'
                                : row.status === 'duplicate'
                                ? 'Duplicate'
                                : 'Invalid'}
                            </span>
                            {row.status === 'duplicate' && (
                              <p className="text-xs text-orange-700">Teacher already exists.</p>
                            )}
                            {row.errors.map((error, index) => (
                              <p key={`${row.rowNumber}-error-${index}`} className="text-xs text-red-700">
                                {error}
                              </p>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {importPreview.length === 0 && !csvParsingError && (
              <p className="mt-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Upload a CSV to preview records before importing them.
              </p>
            )}

            {importErrorMessage && (
              <div
                role="alert"
                className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
              >
                {importErrorMessage}
              </div>
            )}

            {importFeedback && (
              <div
                role="status"
                className="mt-4 rounded-md border border-green-100 bg-green-50 px-4 py-2 text-sm text-green-900"
              >
                {importFeedback}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={handleImportSubmit}
                disabled={validPreviewRows.length === 0 || isImporting}
              >
                {isImporting ? 'Importing…' : 'Import valid rows'}
              </Button>
              <Button type="button" variant="ghost" onClick={resetImportPreview}>
                Clear preview
              </Button>
            </div>

            {importPreview.length > 0 && validPreviewRows.length === 0 && (
              <p className="mt-2 text-sm text-orange-700">
                Only duplicates or invalid rows remain. Fix the errors or try a different file.
              </p>
            )}
          </div>
        )}

        {isRosterFormOpen && (
          <div
            key={formKey}
            className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5 shadow-sm"
          >
            <h3 className="mb-4 text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {editingTeacher ? 'Edit teacher' : 'Add teacher'}
            </h3>
            <TeacherForm
              initialValues={formInitialValues}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
              submitLabel={editingTeacher ? 'Save changes' : 'Create teacher'}
              isLoading={isFormSubmitting}
            />
            {operationErrorMessage && (
              <p className="mt-4 text-xs text-red-700" role="alert">
                {operationErrorMessage}
              </p>
            )}
          </div>
        )}

        {statusMessage && (
          <div role="status" className="rounded-md border border-green-100 bg-green-50 px-4 py-2 text-sm text-green-900">
            {statusMessage}
          </div>
        )}

        {operationErrorMessage && !isRosterFormOpen && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
          >
            {operationErrorMessage}
          </div>
        )}

        {rosterError && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800"
          >
            {getApiErrorMessage(rosterError)}
          </div>
        )}

        {isRosterLoading ? (
          <div role="status" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Loading roster…
          </div>
        ) : !rosterError && teachers.length === 0 ? (
          <div
            className="rounded-lg border border-dashed border-[--color-border] p-6 text-center"
            style={{ backgroundColor: 'var(--color-surface)' }}
          >
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              No teachers yet. Import via CSV or add individually.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button type="button" onClick={handleAddTeacherClick}>
                Add teacher
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={openImportPanel}
                aria-label="Import via CSV (empty roster)"
              >
                Import via CSV
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-[--color-border]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[--color-surface]">
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Subjects
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Status
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="border-b border-[--color-border] last:border-b-0">
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                      {formatName(teacher)}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {teacher.email}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {teacher.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {teacher.subjectQualifications.length > 0
                        ? teacher.subjectQualifications.join(', ')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <TeacherStatusBadge status={teacher.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => handleEditTeacher(teacher)}>
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => setTeacherToDelete(teacher)}
                          disabled={currentUser?.email === teacher.email}
                          title={currentUser?.email === teacher.email ? 'You cannot delete your own account' : undefined}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {teacherToDelete && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-delete-dialog-title"
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setTeacherToDelete(null)}
              aria-hidden="true"
            />
            <div className="relative z-10 w-full max-w-sm rounded-lg border border-red-200 bg-white p-6 shadow-xl">
              <h2
                id="teacher-delete-dialog-title"
                className="text-base font-semibold text-red-950"
              >
                Remove teacher?
              </h2>
              <p className="mt-2 text-sm text-red-900">
                Are you sure you want to remove {formatName(teacherToDelete)} from the roster? If
                they had timetable assignments, those slots may need attention before publish.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  ref={deleteDialogCancelRef}
                  type="button"
                  variant="secondary"
                  onClick={() => setTeacherToDelete(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting…' : 'Delete teacher'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      <section aria-label="Teacher invitations" className="mt-10 space-y-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Teacher invitations
        </h2>
        {error && (
          <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p>{getApiErrorMessage(error)}</p>
          </div>
        )}
        {isLoading && (
          <div role="status" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Loading invites…
          </div>
        )}
        {!isLoading && invitedTeachers.length === 0 && (
          <div
            className="rounded-lg border py-12 text-center"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              No teacher invitations yet.
            </p>
          </div>
        )}
        {!isLoading && invitedTeachers.length > 0 && (
          <div className="overflow-hidden rounded-lg border" style={{ borderColor: 'var(--color-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Email
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Name
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                    Date Invited
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {invitedTeachers.map((teacher) => (
                  <tr key={teacher.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                      {teacher.email}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                      {teacher.fullName ?? (
                        <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <TeacherStatusBadge status={teacher.status} />
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                      {new Date(teacher.invitedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(teacher.status === 'INVITED' || teacher.status === 'EXPIRED') && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => resendInvitation(teacher.id)}
                          disabled={isResending && resendingId === teacher.id}
                          aria-label={`Resend invite to ${teacher.email}`}
                        >
                          {isResending && resendingId === teacher.id ? 'Sending…' : 'Resend'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showInviteDialog && <InviteTeachersDialog onClose={() => setShowInviteDialog(false)} />}
    </div>
  )
}
