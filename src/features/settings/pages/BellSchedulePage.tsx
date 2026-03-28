import { BellScheduleForm } from '@/features/settings/components/BellScheduleForm'
import { useLabels } from '@/hooks/useLabels'

export default function BellSchedulePage() {
  const label = useLabels()

  return (
    <div className="mt-8">
      <h2
        className="mb-4 text-lg font-medium"
        style={{ color: 'var(--color-text-primary)' }}
      >
        {label('bellSchedule')}
      </h2>
      <div
        className="max-w-3xl rounded-lg border p-6"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <BellScheduleForm />
      </div>
    </div>
  )
}
