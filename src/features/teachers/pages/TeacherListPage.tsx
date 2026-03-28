import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InviteTeachersDialog } from '@/features/teachers/components/InviteTeachersDialog'
import { TeacherForm } from '@/features/teachers/components/TeacherForm'
import { TeacherStatusBadge } from '@/features/teachers/components/TeacherStatusBadge'
import { useCreateTeacher, useDeleteTeacher, useTeachers, useUpdateTeacher } from '@/api/hooks/useTeachers'
import { useInvitations, useResendInvitation } from '@/api/hooks/useInvitations'
import { getApiErrorMessage } from '@/lib/api-error-message'
import type { TeacherDto, TeacherFormValues } from '@/types/teacher.types'

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
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [isRosterFormOpen, setIsRosterFormOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<TeacherDto | null>(null)
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherDto | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

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

  const handleImportClick = () => {
    setStatusMessage('CSV import is coming soon. Stay tuned.')
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
          <Button type="button" variant="ghost" onClick={handleAddTeacherClick}>
            {editingTeacher ? 'Add another teacher' : 'Add teacher manually'}
          </Button>
        </div>

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
        ) : teachers.length === 0 ? (
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
              <Button type="button" variant="ghost" onClick={handleImportClick}>
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
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            <p>
              Are you sure you want to remove {formatName(teacherToDelete)} from the roster?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="ghost" onClick={() => setTeacherToDelete(null)}>
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
