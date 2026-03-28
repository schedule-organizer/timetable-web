import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useSendInvitations } from '@/api/hooks/useInvitations'
import { sendInvitationsRequestSchema } from '@/types/invitation.schemas'
import { getApiErrorMessage } from '@/lib/api-error-message'

interface InviteTeachersDialogProps {
  onClose: () => void
}

function parseEmails(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((e) => e.trim())
    .filter(Boolean)
}

export function InviteTeachersDialog({ onClose }: InviteTeachersDialogProps) {
  const [emailsRaw, setEmailsRaw] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const { mutate: sendInvitations, isPending, error: mutationError, isSuccess } = useSendInvitations()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setValidationError(null)

    const emails = parseEmails(emailsRaw)
    const result = sendInvitationsRequestSchema.safeParse({ emails })

    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? 'Invalid email(s).'
      setValidationError(msg)
      return
    }

    sendInvitations(
      { emails: result.data.emails },
      {
        onSuccess: () => {
          setTimeout(onClose, 800)
        },
      },
    )
  }

  const apiError = mutationError ? getApiErrorMessage(mutationError) : null

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-dialog-title"
    >
      <div
        className="w-full max-w-md rounded-lg border p-6 shadow-lg"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h2
          id="invite-dialog-title"
          className="mb-1 text-lg font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Invite Teachers
        </h2>
        <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Enter one or more email addresses (one per line or comma-separated). Each teacher will
          receive a magic link — no password required.
        </p>

        {isSuccess && (
          <div role="status" className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm text-green-800">Invitations sent successfully!</p>
          </div>
        )}

        {(validationError || apiError) && (
          <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-800">{validationError ?? apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <Label htmlFor="invite-emails">Email addresses</Label>
            <textarea
              id="invite-emails"
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[--color-primary]"
              style={{
                borderColor: 'var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                minHeight: '100px',
                resize: 'vertical',
              }}
              placeholder={'alice@school.edu\nbob@school.edu'}
              value={emailsRaw}
              onChange={(e) => setEmailsRaw(e.target.value)}
              aria-describedby={validationError ? 'invite-error' : undefined}
              disabled={isPending || isSuccess}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isSuccess}>
              {isPending ? 'Sending…' : 'Send Invitations'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
