import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  MOCK_ASSIGNMENT_CLASSES,
  MOCK_ASSIGNMENT_ROOMS,
  MOCK_ASSIGNMENT_SUBJECTS,
  MOCK_ASSIGNMENT_TEACHERS,
} from '@/mocks/pages/timetable-page.mock'
import type {
  CreateLessonBody,
  GridColumn,
  LessonDto,
  LessonPatchBody,
  TimetableView,
} from '@/types/timetable.types'

const slotFormSchema = z.object({
  classId: z.string().min(1),
  subjectId: z.string().min(1),
  teacherId: z.string().min(1),
  roomId: z.string().min(1),
})

type SlotFormValues = z.infer<typeof slotFormSchema>

export interface SlotEditSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** assign = empty slot; edit = change fields; view = read-only (View detail). */
  mode: 'assign' | 'edit' | 'view'
  pivotView: TimetableView
  rowKey: string
  rowLabel: string
  col: GridColumn
  lesson: LessonDto | null
  isSubmitting: boolean
  onSaveNew: (body: CreateLessonBody) => void
  onSaveEdit: (lessonId: string, patch: LessonPatchBody) => void
}

function defaultValuesForLesson(
  lesson: LessonDto | null,
  pivotView: TimetableView,
  rowKey: string,
): SlotFormValues {
  if (lesson) {
    return {
      classId: lesson.classId,
      subjectId: lesson.subjectId,
      teacherId: lesson.teacherId,
      roomId: lesson.roomId,
    }
  }
  const base: SlotFormValues = {
    classId: MOCK_ASSIGNMENT_CLASSES[0]?.id ?? '',
    subjectId: MOCK_ASSIGNMENT_SUBJECTS[0]?.id ?? '',
    teacherId: MOCK_ASSIGNMENT_TEACHERS[0]?.id ?? '',
    roomId: MOCK_ASSIGNMENT_ROOMS[0]?.id ?? '',
  }
  if (pivotView === 'class') base.classId = rowKey
  if (pivotView === 'teacher') base.teacherId = rowKey
  if (pivotView === 'room') base.roomId = rowKey
  return base
}

export function SlotEditSheet({
  open,
  onOpenChange,
  mode,
  pivotView,
  rowKey,
  rowLabel,
  col,
  lesson,
  isSubmitting,
  onSaveNew,
  onSaveEdit,
}: SlotEditSheetProps) {
  const readOnly = mode === 'view'

  const form = useForm<SlotFormValues>({
    resolver: zodResolver(slotFormSchema),
    defaultValues: defaultValuesForLesson(lesson, pivotView, rowKey),
  })

  useEffect(() => {
    if (open) {
      form.reset(defaultValuesForLesson(lesson, pivotView, rowKey))
    }
  }, [open, lesson, pivotView, rowKey, form])

  const onSubmit = form.handleSubmit((values) => {
    if (readOnly) return
    const base: CreateLessonBody = {
      cycleDayIndex: col.dayIndex,
      periodId: col.periodId,
      classId: values.classId,
      subjectId: values.subjectId,
      teacherId: values.teacherId,
      roomId: values.roomId,
    }
    if (lesson) {
      const patch: LessonPatchBody = {
        classId: values.classId,
        subjectId: values.subjectId,
        teacherId: values.teacherId,
        roomId: values.roomId,
      }
      onSaveEdit(lesson.id, patch)
    } else {
      onSaveNew(base)
    }
  })

  if (!open) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <button
        type="button"
        className="pointer-events-auto fixed inset-0 bg-black/40"
        aria-label="Close sheet"
        onClick={() => onOpenChange(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="slot-edit-title"
        className="pointer-events-auto fixed inset-y-0 right-0 z-[51] flex w-[360px] flex-col border-l border-[--color-border] bg-[--color-surface] shadow-xl"
      >
        <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4">
          <Button type="button" variant="ghost" className="self-start px-0" onClick={() => onOpenChange(false)}>
            Back to grid
          </Button>
          <h2 id="slot-edit-title" className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {mode === 'view' ? 'Slot detail' : lesson ? 'Edit slot' : 'Assign lesson'}
          </h2>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {rowLabel} · {col.dayLabel} · {col.periodName}
          </p>

          <form className="flex flex-col gap-3" onSubmit={onSubmit}>
            <div className="space-y-1">
              <Label htmlFor="slot-class">Class</Label>
              <select
                id="slot-class"
                className="flex h-9 w-full rounded-md border border-[--color-border] bg-[--color-background] px-2 text-sm"
                disabled={readOnly}
                {...form.register('classId')}
              >
                {MOCK_ASSIGNMENT_CLASSES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="slot-subject">Subject</Label>
              <select
                id="slot-subject"
                className="flex h-9 w-full rounded-md border border-[--color-border] bg-[--color-background] px-2 text-sm"
                disabled={readOnly}
                {...form.register('subjectId')}
              >
                {MOCK_ASSIGNMENT_SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="slot-teacher">Teacher</Label>
              <select
                id="slot-teacher"
                className="flex h-9 w-full rounded-md border border-[--color-border] bg-[--color-background] px-2 text-sm"
                disabled={readOnly}
                {...form.register('teacherId')}
              >
                {MOCK_ASSIGNMENT_TEACHERS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="slot-room">Room</Label>
              <select
                id="slot-room"
                className="flex h-9 w-full rounded-md border border-[--color-border] bg-[--color-background] px-2 text-sm"
                disabled={readOnly}
                {...form.register('roomId')}
              >
                {MOCK_ASSIGNMENT_ROOMS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {!readOnly ? (
              <Button type="submit" disabled={isSubmitting} className="mt-2">
                {lesson ? 'Save changes' : 'Place lesson'}
              </Button>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  )
}
