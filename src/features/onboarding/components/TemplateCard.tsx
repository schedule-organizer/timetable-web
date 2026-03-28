import type { InstitutionTemplate } from '@/types/template.types'

type TemplateCardProps = {
  template: InstitutionTemplate
  selected: boolean
  onSelect: (templateId: string) => void
}

export function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
  const { id, name, description, previewDetails } = template

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(id)}
      className="w-full rounded-lg border p-4 text-left transition-colors focus:outline-none focus-visible:ring-2"
      style={{
        borderColor: selected ? 'var(--color-primary)' : 'var(--color-border)',
        backgroundColor: selected ? 'var(--color-surface-hover, #eff6ff)' : 'var(--color-surface)',
        outlineColor: 'var(--color-primary)',
        boxShadow: selected ? '0 0 0 2px var(--color-primary)' : undefined,
      }}
    >
      <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {name}
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
        {description}
      </p>
      <ul
        className="mt-3 space-y-1 text-xs"
        style={{ color: 'var(--color-text-secondary)' }}
        aria-label={`${name} details`}
      >
        <li>
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Cycle:
          </span>{' '}
          {previewDetails.cycleDescription}
        </li>
        <li>
          <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
            Periods per day:
          </span>{' '}
          {previewDetails.periodsPerDay}
        </li>
      </ul>
    </button>
  )
}
