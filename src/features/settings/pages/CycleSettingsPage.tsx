import { AcademicTermsForm } from '@/features/settings/components/AcademicTermsForm'
import { CycleForm } from '@/features/settings/components/CycleForm'
import { useLabels } from '@/hooks/useLabels'

export default function CycleSettingsPage() {
  const label = useLabels()

  return (
    <div className="mt-8 space-y-12">
      <section aria-labelledby="cycle-heading">
        <h2
          id="cycle-heading"
          className="mb-4 text-lg font-medium"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {label('cycle')}
        </h2>
        <div
          className="max-w-3xl rounded-lg border p-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <CycleForm />
        </div>
      </section>

      <section aria-labelledby="academic-terms-heading">
        <h2
          id="academic-terms-heading"
          className="mb-4 text-lg font-medium"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Academic {label('term')}
        </h2>
        <div
          className="max-w-4xl rounded-lg border p-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <AcademicTermsForm />
        </div>
      </section>
    </div>
  )
}
