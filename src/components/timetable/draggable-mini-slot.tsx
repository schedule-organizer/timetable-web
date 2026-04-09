import { useDraggable } from '@dnd-kit/core'
import { MiniSlot } from '@/components/timetable/mini-slot'
import type { LessonDto } from '@/types/timetable.types'

export interface DraggableMiniSlotProps {
  lesson: LessonDto
}

export function DraggableMiniSlot({ lesson }: DraggableMiniSlotProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lesson.id,
    disabled: lesson.isPinned,
  })

  return (
    <div
      ref={setNodeRef}
      className={isDragging ? 'opacity-60' : undefined}
      {...listeners}
      {...attributes}
    >
      <MiniSlot lesson={lesson} size="sm" />
    </div>
  )
}
