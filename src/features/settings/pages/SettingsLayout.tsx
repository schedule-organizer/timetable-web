import { NavLink, Outlet } from 'react-router-dom'
import { useLabels } from '@/hooks/useLabels'
import { useInstitutionPermission } from '@/hooks/usePermission'
import { cn } from '@/lib/utils'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm ring-1 ring-[var(--color-border)]'
      : 'text-[var(--color-text-secondary)] hover:bg-black/[0.04] hover:text-[var(--color-text-primary)]',
  )

// Institution Settings — sub-routes for terminology, bell schedule, and future setup sections.
export default function SettingsLayout() {
  const label = useLabels()
  const canAssignRoles = useInstitutionPermission('roles:assign')

  return (
    <div className="p-6">
      <h1
        className="text-2xl font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {label('institutionSettings')}
      </h1>

      <nav
        className="mt-6 flex flex-wrap gap-2 border-b pb-3"
        style={{ borderColor: 'var(--color-border)' }}
        aria-label="Institution settings sections"
      >
        <NavLink to="terminology" className={linkClass}>
          {label('terminology')}
        </NavLink>
        <NavLink to="bell-schedule" className={linkClass}>
          {label('bellSchedule')}
        </NavLink>
        <NavLink to="cycle" className={linkClass}>
          {label('cycle')}
        </NavLink>
        {canAssignRoles && (
          <NavLink to="roles" className={linkClass}>
            Roles &amp; Access
          </NavLink>
        )}
      </nav>

      <Outlet />
    </div>
  )
}
