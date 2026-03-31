export interface YearGroupFilterProps {
  yearGroups: string[]
  selected: string | null
  onChange: (yearGroup: string | null) => void
}

export function YearGroupFilter({ yearGroups, selected, onChange }: YearGroupFilterProps) {
  if (yearGroups.length === 0) return null

  return (
    <div role="group" aria-label="Filter by year group" className="flex flex-wrap gap-1">
      <button
        type="button"
        aria-pressed={selected === null}
        onClick={() => onChange(null)}
        className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
        style={{
          backgroundColor: selected === null ? 'var(--brand-accent)' : 'var(--color-surface)',
          borderColor: selected === null ? 'var(--brand-accent)' : 'var(--color-border)',
          color: selected === null ? '#ffffff' : 'var(--color-text-primary)',
        }}
      >
        All
      </button>
      {yearGroups.map((yg) => (
        <button
          key={yg}
          type="button"
          aria-pressed={selected === yg}
          onClick={() => onChange(yg)}
          className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
          style={{
            backgroundColor: selected === yg ? 'var(--brand-accent)' : 'var(--color-surface)',
            borderColor: selected === yg ? 'var(--brand-accent)' : 'var(--color-border)',
            color: selected === yg ? '#ffffff' : 'var(--color-text-primary)',
          }}
        >
          {yg}
        </button>
      ))}
    </div>
  )
}
