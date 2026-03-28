import { Link } from 'react-router-dom'
import { useBellSchedule } from '@/api/hooks/useBellSchedule'
import { useCycleSettings } from '@/api/hooks/useCycleSettings'
import { useAcademicTerms } from '@/api/hooks/useAcademicTerms'
import { useTerminologyLabels } from '@/api/hooks/useSettings'
import type { TerminologyLabels } from '@/types/settings.types'

type ChecklistItem =
  | {
      kind: 'required'
      label: string
      settingsPath: string
      complete: boolean
      loading: boolean
    }
  | {
      kind: 'terminology'
      label: string
      settingsPath: string
      loading: boolean
      hasCustomLabels: boolean
    }

function terminologyHasCustomLabels(labels: TerminologyLabels | undefined): boolean {
  if (!labels) return false
  return (Object.values(labels) as string[]).some((v) => (v ?? '').trim() !== '')
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  if (item.kind === 'terminology') {
    const { hasCustomLabels, loading } = item
    const statusColor = loading ? 'var(--color-border)' : hasCustomLabels ? '#2c9e78' : '#64748b'
    const statusText = loading ? '…' : hasCustomLabels ? 'Customised' : 'Default labels'
    const iconGlyph = loading ? '·' : '✓'
    const statusAria = loading
      ? 'Loading terminology'
      : hasCustomLabels
        ? 'Custom terminology labels'
        : 'Using default terminology labels'

    return (
      <li
        className="flex items-center justify-between rounded-lg border px-4 py-3"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      >
        <div className="flex items-center gap-3">
          <span
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
            aria-hidden="true"
            style={{
              backgroundColor: statusColor,
              color: '#fff',
            }}
          >
            {iconGlyph}
          </span>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {item.label}
          </span>
          {!loading && (
            <span className="text-xs" style={{ color: statusColor }} aria-label={statusAria}>
              {statusText}
            </span>
          )}
        </div>
        <Link
          to={item.settingsPath}
          className="text-xs font-medium underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2"
          style={{ color: 'var(--color-primary)' }}
          aria-label={`Configure ${item.label}`}
        >
          Configure
        </Link>
      </li>
    )
  }

  return (
    <li
      className="flex items-center justify-between rounded-lg border px-4 py-3"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
          aria-hidden="true"
          style={{
            backgroundColor: item.loading
              ? 'var(--color-border)'
              : item.complete
                ? '#2c9e78'
                : '#d38a36',
            color: '#fff',
          }}
        >
          {item.loading ? '·' : item.complete ? '✓' : '!'}
        </span>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
          {item.label}
        </span>
        {!item.loading && (
          <span
            className="text-xs"
            style={{ color: item.complete ? '#2c9e78' : '#d38a36' }}
            aria-label={item.complete ? 'Complete' : 'Incomplete'}
          >
            {item.complete ? 'Complete' : 'Incomplete'}
          </span>
        )}
      </div>
      <Link
        to={item.settingsPath}
        className="text-xs font-medium underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2"
        style={{ color: 'var(--color-primary)' }}
        aria-label={`Configure ${item.label}`}
      >
        Configure
      </Link>
    </li>
  )
}

export function SetupChecklist() {
  const { data: bellData, isLoading: bellLoading } = useBellSchedule()
  const { data: cycleData, isLoading: cycleLoading } = useCycleSettings()
  const { data: termsData, isLoading: termsLoading } = useAcademicTerms()
  const { data: labelsData, isLoading: labelsLoading } = useTerminologyLabels()

  const items: ChecklistItem[] = [
    {
      kind: 'required',
      label: 'Bell Schedule',
      settingsPath: '/settings/bell-schedule',
      complete: (bellData?.periods.length ?? 0) > 0,
      loading: bellLoading,
    },
    {
      kind: 'required',
      label: 'Cycle',
      settingsPath: '/settings/cycle',
      complete: (cycleData?.cycleLengthDays ?? 0) > 0,
      loading: cycleLoading,
    },
    {
      kind: 'required',
      label: 'Academic Terms',
      settingsPath: '/settings/cycle',
      complete: (termsData?.terms.length ?? 0) > 0,
      loading: termsLoading,
    },
    {
      kind: 'terminology',
      label: 'Terminology',
      settingsPath: '/settings/terminology',
      hasCustomLabels: terminologyHasCustomLabels(labelsData),
      loading: labelsLoading,
    },
  ]

  return (
    <section aria-labelledby="setup-checklist-heading">
      <h2
        id="setup-checklist-heading"
        className="mb-4 text-base font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Setup Checklist
      </h2>
      <p className="mb-4 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Complete all areas before generating a timetable. Click <strong>Configure</strong> to
        update any section.
      </p>
      <ul className="space-y-2" aria-label="Setup checklist">
        {items.map((item) => (
          <ChecklistRow key={item.label} item={item} />
        ))}
      </ul>
    </section>
  )
}
