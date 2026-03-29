import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-[--color-surface] text-[--color-text-primary] shadow-sm'
      : 'text-[--color-text-secondary] hover:text-[--color-text-primary]',
  )

// Parent shell for scheduling rules: hard constraints today; soft preferences (story 3.x) can add a sibling tab.
export default function ConstraintsLayout() {
  return (
    <div className="min-h-full" style={{ backgroundColor: 'var(--color-background)' }}>
      <div className="border-b border-[--color-border] px-6 pt-6">
        <h1
          className="text-2xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Constraints
        </h1>
        <p className="mt-1 text-sm text-[--color-text-secondary]">
          Configure mandatory scheduling rules and future preference weights for your institution.
        </p>
        <nav
          className="mt-6 flex flex-wrap gap-2 border-b border-[--color-border] pb-3"
          aria-label="Constraint sections"
        >
          <NavLink to="/constraints/hard" className={linkClass}>
            Hard constraints
          </NavLink>
        </nav>
      </div>
      <Outlet />
    </div>
  )
}
