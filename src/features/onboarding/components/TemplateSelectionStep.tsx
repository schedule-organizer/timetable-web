import { TemplateCard } from './TemplateCard'
import { Button } from '@/components/ui/button'
import { useInstitutionTemplates } from '@/api/hooks/useTemplates'
import type { InstitutionTemplate } from '@/types/template.types'

type TemplateSelectionStepProps = {
  selectedTemplateId: string | null
  onSelect: (templateId: string) => void
  onNext: (template: InstitutionTemplate) => void
}

export function TemplateSelectionStep({
  selectedTemplateId,
  onSelect,
  onNext,
}: TemplateSelectionStepProps) {
  const { data, isLoading, isError } = useInstitutionTemplates()

  const selectedTemplate = data?.templates.find((t) => t.id === selectedTemplateId) ?? null

  if (isLoading) {
    return (
      <div aria-busy="true" aria-label="Loading templates">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg"
              style={{ backgroundColor: 'var(--color-border)' }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm text-red-800">
          Failed to load templates. Please refresh and try again.
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Choose a template that matches your school type. Bell Schedule, Cycle, and common
        terminology will be pre-populated — you can customise everything later.
      </p>

      <div
        role="radiogroup"
        aria-label="Institution type templates"
        className="space-y-3"
      >
        {data.templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            selected={template.id === selectedTemplateId}
            onSelect={onSelect}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          type="button"
          disabled={selectedTemplate === null}
          onClick={() => selectedTemplate && onNext(selectedTemplate)}
        >
          Apply This Template
        </Button>
      </div>
    </div>
  )
}
