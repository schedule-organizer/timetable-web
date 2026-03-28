import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { InviteTeachersDialog } from '@/features/teachers/components/InviteTeachersDialog'
import { TeacherStatusBadge } from '@/features/teachers/components/TeacherStatusBadge'
import { useInvitations, useResendInvitation } from '@/api/hooks/useInvitations'
import { getApiErrorMessage } from '@/lib/api-error-message'

export default function TeacherListPage() {
  const [showInviteDialog, setShowInviteDialog] = useState(false)

  const { data, isLoading, error } = useInvitations()
  const { mutate: resendInvitation, isPending: isResending, variables: resendingId } = useResendInvitation()

  const teachers = data?.content ?? []

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Teachers
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Invite teachers via magic link — no password required.
          </p>
        </div>
        <Button type="button" onClick={() => setShowInviteDialog(true)}>
          Invite Teachers
        </Button>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-800">{getApiErrorMessage(error)}</p>
        </div>
      )}

      {isLoading && (
        <div role="status" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Loading teachers…
        </div>
      )}

      {!isLoading && teachers.length === 0 && (
        <div
          className="rounded-lg border py-12 text-center"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No teachers yet. Invite your first teacher to get started.
          </p>
        </div>
      )}

      {!isLoading && teachers.length > 0 && (
        <div
          className="overflow-hidden rounded-lg border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
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
              {teachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  style={{ borderBottom: '1px solid var(--color-border)' }}
                >
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                    {teacher.email}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--color-text-primary)' }}>
                    {teacher.fullName ?? <span style={{ color: 'var(--color-text-secondary)' }}>—</span>}
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

      {showInviteDialog && (
        <InviteTeachersDialog onClose={() => setShowInviteDialog(false)} />
      )}
    </div>
  )
}
