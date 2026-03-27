/** Lightweight Suspense fallback for lazy route chunks. */
export function RouteFallback() {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center text-sm"
      style={{ color: 'var(--color-text-muted)' }}
      role="status"
      aria-live="polite"
    >
      Loading…
    </div>
  )
}
