import type { LessonDto } from '@/types/timetable.types'

function teacherInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function subjectAbbreviation(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return (words[0] ?? '').slice(0, 3).toUpperCase()
  return words
    .map((w) => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 3)
}

export interface MiniSlotProps {
  lesson: LessonDto
  size?: 'sm' | 'md'
}

export function MiniSlot({ lesson, size = 'sm' }: MiniSlotProps) {
  const abbr = subjectAbbreviation(lesson.subjectName)
  const initials = teacherInitials(lesson.teacherName)

  const label = `${lesson.subjectName} — ${lesson.teacherName} — ${lesson.roomName}${lesson.isPinned ? ' (pinned)' : ''}${lesson.hasConflict ? ' (conflict)' : ''}`

  return (
    <div
      className="relative flex min-w-0 items-stretch overflow-hidden rounded"
      title={label}
      style={{
        boxShadow: lesson.isPinned ? 'inset 0 0 0 2px #4a78d3' : undefined,
      }}
    >
      {/* Subject colour bar — left 3px strip */}
      <div
        aria-hidden="true"
        className="w-[3px] flex-shrink-0"
        style={{ backgroundColor: lesson.subjectColorHex }}
      />

      <div
        className="flex min-w-0 flex-1 flex-col px-1 py-0.5"
        style={{ fontSize: size === 'sm' ? '10px' : '12px' }}
      >
        <div
          className="flex items-center gap-1"
          style={{ color: 'var(--color-text-primary)' }}
        >
          <span className="font-semibold leading-tight truncate">{abbr}</span>
          {lesson.isPinned && (
            <span aria-hidden="true" className="flex-shrink-0 leading-none" title="Pinned">
              📌
            </span>
          )}
        </div>
        <div
          className="leading-tight truncate"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          {initials} · {lesson.roomName}
        </div>
      </div>
    </div>
  )
}
