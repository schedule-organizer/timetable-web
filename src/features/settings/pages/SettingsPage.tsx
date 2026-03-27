import { TerminologyForm } from '@/features/settings/components/TerminologyForm'

// Institution Settings page — houses configurable sections for this institution.
// Story 1.2 adds the Terminology section; future stories extend with additional tabs.
export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1
        className="text-2xl font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Institution Settings
      </h1>

      <div className="mt-8">
        <h2
          className="mb-4 text-lg font-medium"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Terminology
        </h2>
        <div
          className="max-w-xl rounded-lg border p-6"
          style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
        >
          <TerminologyForm />
        </div>
      </div>
    </div>
  )
}
