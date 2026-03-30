import { useMemo } from 'react'
import { useAcademicTerms } from '@/api/hooks/useAcademicTerms'
import { useBellSchedule } from '@/api/hooks/useBellSchedule'
import { useClasses } from '@/api/hooks/useClasses'
import { useCycleSettings } from '@/api/hooks/useCycleSettings'
import { useRooms } from '@/api/hooks/useRooms'
import { useSubjects } from '@/api/hooks/useSubjects'
import { useTeachers } from '@/api/hooks/useTeachers'
import { getActiveTerm } from '@/lib/cycle-term-utils'

export type GeneratorPrerequisiteKey =
  | 'teacher'
  | 'class'
  | 'subject'
  | 'room'
  | 'bellSchedule'
  | 'cycle'
  | 'activeTerm'

export function useGeneratorPrerequisites() {
  const teachers = useTeachers()
  const classes = useClasses()
  const subjects = useSubjects()
  const rooms = useRooms()
  const bell = useBellSchedule()
  const cycle = useCycleSettings()
  const terms = useAcademicTerms()

  return useMemo(() => {
    const teacherCount = teachers.data?.content?.length ?? 0
    const classCount = classes.data?.content?.length ?? 0
    const subjectCount = subjects.data?.content?.length ?? 0
    const roomCount = rooms.data?.content?.length ?? 0
    const periodCount = bell.data?.periods?.length ?? 0
    const cycleLength = cycle.data?.cycleLengthDays ?? 0
    const activeTerm =
      terms.data?.terms && terms.data.terms.length > 0
        ? getActiveTerm(terms.data.terms)
        : null

    const missing: GeneratorPrerequisiteKey[] = []
    if (teacherCount < 1) missing.push('teacher')
    if (classCount < 1) missing.push('class')
    if (subjectCount < 1) missing.push('subject')
    if (roomCount < 1) missing.push('room')
    if (periodCount < 1) missing.push('bellSchedule')
    if (cycleLength < 1) missing.push('cycle')
    if (!activeTerm) missing.push('activeTerm')

    const isLoading =
      teachers.isLoading ||
      classes.isLoading ||
      subjects.isLoading ||
      rooms.isLoading ||
      bell.isLoading ||
      cycle.isLoading ||
      terms.isLoading

    return {
      canRun: missing.length === 0,
      missing,
      activeTerm,
      isLoading,
    }
  }, [
    teachers.data,
    teachers.isLoading,
    classes.data,
    classes.isLoading,
    subjects.data,
    subjects.isLoading,
    rooms.data,
    rooms.isLoading,
    bell.data,
    bell.isLoading,
    cycle.data,
    cycle.isLoading,
    terms.data,
    terms.isLoading,
  ])
}
