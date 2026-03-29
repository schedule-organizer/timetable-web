import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BookOpen,
  Building2,
  FlaskConical,
  Shield,
  Zap,
  UserCircle,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/teachers', label: 'Teachers', icon: Users },
  { to: '/classes', label: 'Classes', icon: BookOpen },
  { to: '/subjects', label: 'Subjects', icon: FlaskConical },
  { to: '/rooms', label: 'Rooms', icon: Building2 },
  { to: '/constraints', label: 'Constraints', icon: Shield },
  { to: '/engine', label: 'Engine', icon: Zap },
  { to: '/profile', label: 'My Profile', icon: UserCircle },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  return (
    <>
      {/* Desktop & tablet sidebar */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        className="hidden flex-col gap-1 overflow-hidden py-3 shrink-0 md:flex md:w-[var(--sidebar-width-collapsed)] lg:w-[var(--sidebar-width)]"
        style={{
          backgroundColor: 'var(--color-sidebar)',
          transition: 'width 200ms ease',
        }}
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-center gap-3 px-2 py-2 text-sm font-medium transition-colors lg:justify-start lg:px-3',
                isActive
                  ? 'text-white bg-white/15'
                  : 'text-white/70 hover:text-white hover:bg-white/10',
              )
            }
          >
            <Icon size={16} className="shrink-0" />
            {/* Labels from lg (≥1024px); md–lg uses 48px icon strip per UX-DR */}
            <span className="hidden lg:block">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Mobile bottom tab bar (below md / 768px) — scrollable so all nav items are reachable */}
      <nav
        role="navigation"
        aria-label="Mobile navigation"
        className="fixed bottom-0 left-0 right-0 flex overflow-x-auto border-t py-2 md:hidden"
        style={{
          backgroundColor: 'var(--color-sidebar)',
          borderColor: 'rgba(255,255,255,0.1)',
        }}
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex shrink-0 flex-col items-center gap-0.5 px-3 py-1 text-xs',
                isActive ? 'text-white' : 'text-white/60',
              )
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}
