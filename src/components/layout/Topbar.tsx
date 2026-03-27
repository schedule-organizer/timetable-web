import { useAuthStore } from '@/store/authStore'
import { useLogout } from '@/api/hooks/useAuth'

export function Topbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()

  return (
    <header
      role="banner"
      className="flex shrink-0 items-center justify-between px-4"
      style={{
        height: 'var(--topbar-height)',
        backgroundColor: 'var(--color-topbar)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-base font-bold" style={{ color: 'var(--brand-primary)' }}>
          SchediFlow
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-4">
          <span className="hidden text-sm sm:block" style={{ color: 'var(--color-text-secondary)' }}>
            {user.fullName}
          </span>
          <button
            onClick={() => logout.mutate()}
            className="text-sm"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="Sign out"
          >
            Sign out
          </button>
        </div>
      )}
    </header>
  )
}
