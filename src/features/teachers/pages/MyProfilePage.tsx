import { useMemo, useState } from 'react'
import { TeacherForm } from '@/features/teachers/components/TeacherForm'
import { useMyProfile, useUpdateMyProfile } from '@/api/hooks/useTeachers'
import { getApiErrorMessage } from '@/lib/api-error-message'
import type { TeacherFormValues } from '@/types/teacher.types'

export default function MyProfilePage() {
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const { data: profile, isLoading, error: loadError } = useMyProfile()
  const { mutate: updateProfile, isPending, error: updateError } = useUpdateMyProfile()

  const formInitialValues = useMemo<TeacherFormValues | undefined>(() => {
    if (!profile) return undefined
    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone ?? '',
      subjectQualifications: profile.subjectQualifications.join(', '),
    }
  }, [profile])

  const handleSubmit = (values: TeacherFormValues) => {
    setStatusMessage(null)
    const payload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      phone: values.phone?.trim() || null,
      subjectQualifications: values.subjectQualifications
        ? values.subjectQualifications
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    }
    updateProfile(payload, {
      onSuccess: () => {
        setStatusMessage('Profile updated. Changes are now visible to the timetabler.')
      },
    })
  }

  const loadErrorMessage = loadError ? getApiErrorMessage(loadError) : null
  const updateErrorMessage = updateError ? getApiErrorMessage(updateError) : null

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          My Profile
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Update your name, contact details, and subject qualifications.
        </p>
      </header>

      <section aria-label="Profile form" className="max-w-lg space-y-4">
        {isLoading && (
          <div role="status" className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Loading profile…
          </div>
        )}

        {loadErrorMessage && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {loadErrorMessage}
          </div>
        )}

        {!isLoading && !loadError && profile && (
          <>
            <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5 shadow-sm">
              <TeacherForm
                key={profile.id}
                initialValues={formInitialValues}
                onSubmit={handleSubmit}
                submitLabel="Save profile"
                isLoading={isPending}
              />
              {updateErrorMessage && (
                <p className="mt-4 text-xs text-red-700" role="alert">
                  {updateErrorMessage}
                </p>
              )}
            </div>

            {statusMessage && (
              <div
                role="status"
                className="rounded-md border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-900"
              >
                {statusMessage}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
