import { TerminologyForm } from '@/features/settings/components/TerminologyForm'
import { useLabels } from '@/hooks/useLabels'

export default function TerminologySettingsPage() {
  const label = useLabels()

  return (
    <div className="mt-8">
      <h2
        className="mb-4 text-lg font-medium"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {label('terminology')}
      </h2>
      <div
        className="max-w-xl rounded-lg border p-6"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <TerminologyForm />
      </div>
    </div>
  )
}
