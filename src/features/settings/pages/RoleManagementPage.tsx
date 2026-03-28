import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useUsers, useAssignUserRoles, useSubscriptionLimits } from '@/api/hooks/useRoles'
import { useInstitutionPermission } from '@/hooks/usePermission'
import { INSTITUTION_ROLES, ROLE_LABELS, type InstitutionRole, type UserWithRoles } from '@/types/rbac.types'
import { getApiErrorMessage } from '@/lib/api-error-message'

// ── Subscription Limits Card ──────────────────────────────────────────────────

function SubscriptionLimitsCard() {
  const { data, isLoading, isError, error } = useSubscriptionLimits()

  if (isLoading) {
    return (
      <div
        className="mb-6 rounded-lg border p-4"
        style={{ borderColor: 'var(--color-border)' }}
        role="status"
        aria-label="Loading subscription limits"
      >
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Loading subscription information…
        </p>
      </div>
    )
  }

  if (isError) {
    return (
      <div
        className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
        role="alert"
        aria-label="Subscription limits error"
      >
        <p className="text-sm text-red-800">{getApiErrorMessage(error)}</p>
      </div>
    )
  }

  if (!data) return null

  const { tier, limits, usage } = data

  function limitDisplay(used: number, max: number | null): string {
    return max === null ? `${used} / Unlimited` : `${used} / ${max}`
  }

  function isNearLimit(used: number, max: number | null): boolean {
    if (max === null) return false
    return used / max >= 0.8
  }

  function isAtLimit(used: number, max: number | null): boolean {
    if (max === null) return false
    return used >= max
  }

  return (
    <div
      className="mb-6 rounded-lg border p-4"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      aria-label="Subscription limits"
    >
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Subscription
        </h2>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          {tier.charAt(0) + tier.slice(1).toLowerCase()} Tier
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(
          [
            { label: 'Classes', used: usage.classes, max: limits.maxClasses },
            { label: 'Teachers', used: usage.teachers, max: limits.maxTeachers },
            { label: 'Terms', used: usage.terms, max: limits.maxTerms },
          ] as const
        ).map(({ label, used, max }) => (
          <div key={label}>
            <p className="mb-1 text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              {label}
            </p>
            <p
              className="text-sm font-semibold"
              style={{
                color: isAtLimit(used, max)
                  ? 'var(--color-error, #dc2626)'
                  : isNearLimit(used, max)
                    ? 'var(--color-warning, #d97706)'
                    : 'var(--color-text-primary)',
              }}
            >
              {limitDisplay(used, max)}
            </p>
            {isAtLimit(used, max) && (
              <p className="mt-0.5 text-xs" style={{ color: 'var(--color-error, #dc2626)' }}>
                Limit reached — upgrade to add more
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Assign Roles Dialog ───────────────────────────────────────────────────────

interface AssignRolesDialogProps {
  user: UserWithRoles
  onClose: () => void
}

function AssignRolesDialog({ user, onClose }: AssignRolesDialogProps) {
  const [selected, setSelected] = useState<Set<InstitutionRole>>(new Set(user.roles))
  const [validationError, setValidationError] = useState<string | null>(null)

  const { mutate: assignRoles, isPending, error: mutationError, isSuccess } = useAssignUserRoles()

  useEffect(() => {
    if (!isSuccess) return
    const id = window.setTimeout(() => onClose(), 600)
    return () => window.clearTimeout(id)
  }, [isSuccess, onClose])

  function toggle(role: InstitutionRole) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(role)) {
        next.delete(role)
      } else {
        next.add(role)
      }
      return next
    })
    setValidationError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selected.size === 0) {
      setValidationError('At least one role must be assigned.')
      return
    }
    assignRoles({ userId: user.id, data: { roles: Array.from(selected) } })
  }

  const apiError = mutationError ? getApiErrorMessage(mutationError) : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-roles-title"
    >
      <div
        className="w-full max-w-sm rounded-lg border p-6 shadow-lg"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <h2
          id="assign-roles-title"
          className="mb-1 text-lg font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Assign Roles
        </h2>
        <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {user.fullName} ({user.email})
        </p>

        {isSuccess && (
          <div role="status" className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm text-green-800">Roles updated successfully!</p>
          </div>
        )}

        {(validationError || apiError) && (
          <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-800">{validationError ?? apiError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <fieldset className="mb-4">
            <legend className="mb-2 text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Roles
            </legend>
            <div className="space-y-2">
              {INSTITUTION_ROLES.map((role) => (
                <label
                  key={role}
                  className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors"
                  style={{
                    borderColor: selected.has(role) ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: selected.has(role)
                      ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)'
                      : 'transparent',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(role)}
                    onChange={() => toggle(role)}
                    disabled={isPending || isSuccess}
                    aria-label={ROLE_LABELS[role]}
                  />
                  {ROLE_LABELS[role]}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isSuccess}>
              {isPending ? 'Saving…' : 'Save Roles'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Role Badges ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: InstitutionRole }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
    >
      {ROLE_LABELS[role]}
    </span>
  )
}

// ── Role Management Page ──────────────────────────────────────────────────────

export default function RoleManagementPage() {
  const canAssignRoles = useInstitutionPermission('roles:assign')
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null)

  const { data, isLoading, error } = useUsers()
  const users = data?.content ?? []

  if (!canAssignRoles) {
    return <Navigate to="/settings/terminology" replace />
  }

  return (
    <div className="mt-6">
      <SubscriptionLimitsCard />

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            User Roles
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Assign one or more roles to each user. Role changes take effect on their next authenticated
            request.
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-800">{getApiErrorMessage(error)}</p>
        </div>
      )}

      {isLoading && (
        <div role="status" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Loading users…
        </div>
      )}

      {!isLoading && users.length === 0 && (
        <div
          className="rounded-lg border py-12 text-center"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No users found.
          </p>
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <div
          className="overflow-hidden rounded-lg border"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                }}
              >
                <th
                  className="px-4 py-3 text-left font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  User
                </th>
                <th
                  className="px-4 py-3 text-left font-medium"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Roles
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                      {user.fullName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {user.email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.length === 0 ? (
                        <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
                      ) : (
                        user.roles.map((role) => <RoleBadge key={role} role={role} />)
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingUser(user)}
                      aria-label={`Edit roles for ${user.fullName}`}
                    >
                      Edit Roles
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editingUser && (
        <AssignRolesDialog user={editingUser} onClose={() => setEditingUser(null)} />
      )}
    </div>
  )
}
