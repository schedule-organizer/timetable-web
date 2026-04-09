import type { TimetableView } from '@/types/timetable.types'

const VIEW_OPTIONS: { value: TimetableView; label: string }[] = [
  { value: 'class', label: 'Full School' },
  { value: 'teacher', label: 'By Teacher' },
  { value: 'room', label: 'By Room' },
]

export interface ViewPivotToolbarProps {
  activeView: TimetableView
  onChange: (view: TimetableView) => void
}

export function ViewPivotToolbar({ activeView, onChange }: ViewPivotToolbarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Timetable view"
      className="flex rounded-lg border border-[--color-border] bg-[--color-surface] p-0.5"
    >
      {VIEW_OPTIONS.map(({ value, label }) => {
        const isActive = activeView === value
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(value)}
            className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
            style={{
              backgroundColor: isActive ? 'var(--brand-accent)' : 'transparent',
              color: isActive ? '#ffffff' : 'var(--color-text-secondary)',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
