import type { DifficultyLevel } from '@/types/subject.types'

const difficultyLabel: Record<DifficultyLevel, { label: string; color: string }> = {
  LOW: { label: 'Low', color: 'var(--difficulty-2)' },
  MEDIUM: { label: 'Medium', color: 'var(--difficulty-3)' },
  HIGH: { label: 'High', color: 'var(--difficulty-4)' },
}

interface DifficultyBadgeProps {
  level: DifficultyLevel
}

export function DifficultyBadge({ level }: DifficultyBadgeProps) {
  const meta = difficultyLabel[level]
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
      style={{
        backgroundColor: meta.color,
        color: 'var(--color-text-primary)',
      }}
    >
      {meta.label}
    </span>
  )
}
