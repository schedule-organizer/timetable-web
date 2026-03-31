import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { timetableLessonsResponseSchema } from '@/types/timetable.schemas'

export const timetableQueryKeys = {
  lessons: (timetableId: string) => ['timetable', timetableId, 'lessons'] as const,
}

export function useTimetableLessons(timetableId: string | null) {
  return useQuery({
    queryKey: timetableId
      ? timetableQueryKeys.lessons(timetableId)
      : ['timetable', 'none', 'lessons'],
    queryFn: () => {
      if (!timetableId) throw new Error('timetableId is required')
      return api
        .get(`/api/v1/timetables/${timetableId}/lessons`)
        .then((res) => {
          const result = timetableLessonsResponseSchema.safeParse(res.data)
          if (!result.success) {
            throw new Error(`Invalid timetable response: ${result.error.message}`)
          }
          return result.data
        })
    },
    enabled: !!timetableId,
  })
}
