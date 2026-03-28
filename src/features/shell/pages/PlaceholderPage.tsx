import { useMatches } from 'react-router-dom'

interface RouteHandle {
  title: string
}

/**
 * Stub surface for shell nav targets not yet implemented in a dedicated story.
 * Title comes from the active route's `handle.title` (see `routes.tsx`).
 */
export default function PlaceholderPage() {
  const matches = useMatches()
  const last = matches[matches.length - 1]
  const handle = last?.handle as RouteHandle | undefined
  const title = handle?.title ?? 'Page'

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
        {title}
      </h1>
      <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        This page is coming soon.
      </p>
    </div>
  )
}
