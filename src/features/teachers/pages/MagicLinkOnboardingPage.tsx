import { useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMagicLinkValidate, useMagicLinkComplete } from '@/api/hooks/useInvitations'
import { magicLinkCompleteRequestSchema, type MagicLinkCompleteFormData } from '@/types/invitation.schemas'
import { getApiErrorMessage } from '@/lib/api-error-message'

export default function MagicLinkOnboardingPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [isActivated, setIsActivated] = useState(false)

  const { data: linkData, isLoading: isValidating, error: validateError } = useMagicLinkValidate(token)
  const { mutate: completeOnboarding, isPending, error: completeError } = useMagicLinkComplete()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MagicLinkCompleteFormData>({
    resolver: zodResolver(magicLinkCompleteRequestSchema),
    defaultValues: { token: token ?? '', fullName: '', photoUrl: '' },
  })

  function onSubmit(data: MagicLinkCompleteFormData) {
    completeOnboarding(
      { token: data.token, fullName: data.fullName, photoUrl: data.photoUrl || undefined },
      {
        onSuccess: () => {
          setIsActivated(true)
        },
      },
    )
  }

  // No token in URL
  if (!token) {
    return (
      <PageShell>
        <InvalidLinkMessage reason="missing" />
      </PageShell>
    )
  }

  // Validating token
  if (isValidating) {
    return (
      <PageShell>
        <div role="status" className="text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Validating your invitation link…
        </div>
      </PageShell>
    )
  }

  // Invalid / expired / used token
  if (validateError || !linkData) {
    const message = validateError ? getApiErrorMessage(validateError) : 'This link is invalid.'
    return (
      <PageShell>
        <InvalidLinkMessage reason="invalid" message={message} />
      </PageShell>
    )
  }

  // Activation success
  if (isActivated) {
    return (
      <PageShell>
        <div className="text-center">
          <div className="mb-4 text-4xl">✓</div>
          <h2
            className="mb-2 text-xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            You're all set!
          </h2>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Your account at <strong>{linkData.institutionName}</strong> is now active. You'll
            receive a notification when your timetable is ready.
          </p>
        </div>
      </PageShell>
    )
  }

  // Onboarding form
  return (
    <PageShell>
      <div className="mb-6 text-center">
        <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
          {linkData.institutionName}
        </p>
        <h2
          className="mt-1 text-xl font-semibold"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Welcome! Let's confirm your details.
        </h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          No password needed — just confirm your name to activate your account.
        </p>
      </div>

      {completeError && (
        <div role="alert" className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-800">{getApiErrorMessage(completeError)}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <input type="hidden" {...register('token')} />

        <div className="mb-4">
          <Label htmlFor="email-display">Email</Label>
          <Input
            id="email-display"
            type="email"
            value={linkData.email}
            readOnly
            className="mt-1 opacity-70"
            aria-label="Your email address"
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="fullName">Your name</Label>
          <Input
            id="fullName"
            type="text"
            className="mt-1"
            placeholder="e.g. Jane Smith"
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            {...register('fullName')}
          />
          {errors.fullName && (
            <p id="fullName-error" className="mt-1 text-xs text-red-600" role="alert">
              {errors.fullName.message}
            </p>
          )}
        </div>

        <div className="mb-6">
          <Label htmlFor="photoUrl">
            Profile photo URL{' '}
            <span className="font-normal" style={{ color: 'var(--color-text-secondary)' }}>
              (optional)
            </span>
          </Label>
          <Input
            id="photoUrl"
            type="url"
            className="mt-1"
            placeholder="https://…"
            aria-describedby={errors.photoUrl ? 'photoUrl-error' : undefined}
            {...register('photoUrl')}
          />
          {errors.photoUrl && (
            <p id="photoUrl-error" className="mt-1 text-xs text-red-600" role="alert">
              {errors.photoUrl.message}
            </p>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Activating…' : 'Activate My Account'}
        </Button>
      </form>
    </PageShell>
  )
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div
        className="w-full max-w-sm rounded-lg border p-8 shadow-md"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div
          className="mb-6 text-center text-lg font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          SchediFlow
        </div>
        {children}
      </div>
    </div>
  )
}

interface InvalidLinkMessageProps {
  reason: 'missing' | 'invalid'
  message?: string
}

function InvalidLinkMessage({ reason, message }: InvalidLinkMessageProps) {
  const defaultMsg =
    reason === 'missing'
      ? 'No invitation token found in this link.'
      : 'This link has expired or has already been used.'

  return (
    <div className="text-center">
      <div className="mb-4 text-4xl">⚠</div>
      <h2
        className="mb-2 text-lg font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
        role="alert"
      >
        {message ?? defaultMsg}
      </h2>
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Ask your timetabler to send you a new invitation.
      </p>
    </div>
  )
}
