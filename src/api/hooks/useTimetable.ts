import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { timetableLessonsResponseSchema } from '@/types/timetable.schemas'
import type {
  CreateLessonBody,
  LessonDto,
  LessonMoveBody,
  LessonPatchBody,
  TimetableLessonsResponse,
} from '@/types/timetable.types'

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

export function usePinLesson(timetableId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lessonId: string) => {
      if (!timetableId) {
        return Promise.reject(new Error('timetableId is required'))
      }
      return api.post(`/api/v1/lessons/${lessonId}/pin`)
    },
    onMutate: async (lessonId) => {
      if (!timetableId) return
      await queryClient.cancelQueries({ queryKey: timetableQueryKeys.lessons(timetableId) })
      const previous = queryClient.getQueryData<TimetableLessonsResponse>(
        timetableQueryKeys.lessons(timetableId),
      )
      if (previous) {
        queryClient.setQueryData(timetableQueryKeys.lessons(timetableId), {
          ...previous,
          lessons: previous.lessons.map((l) =>
            l.id === lessonId ? { ...l, isPinned: true } : l,
          ),
        })
      }
      return { previous }
    },
    onError: (_err, _lessonId, context) => {
      if (timetableId && context?.previous) {
        queryClient.setQueryData(timetableQueryKeys.lessons(timetableId), context.previous)
      }
    },
    onSettled: () => {
      if (timetableId) {
        void queryClient.invalidateQueries({ queryKey: timetableQueryKeys.lessons(timetableId) })
      }
    },
  })
}

export function useUnpinLesson(timetableId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lessonId: string) => {
      if (!timetableId) {
        return Promise.reject(new Error('timetableId is required'))
      }
      return api.delete(`/api/v1/lessons/${lessonId}/pin`)
    },
    onMutate: async (lessonId) => {
      if (!timetableId) return
      await queryClient.cancelQueries({ queryKey: timetableQueryKeys.lessons(timetableId) })
      const previous = queryClient.getQueryData<TimetableLessonsResponse>(
        timetableQueryKeys.lessons(timetableId),
      )
      if (previous) {
        queryClient.setQueryData(timetableQueryKeys.lessons(timetableId), {
          ...previous,
          lessons: previous.lessons.map((l) =>
            l.id === lessonId ? { ...l, isPinned: false } : l,
          ),
        })
      }
      return { previous }
    },
    onError: (_err, _lessonId, context) => {
      if (timetableId && context?.previous) {
        queryClient.setQueryData(timetableQueryKeys.lessons(timetableId), context.previous)
      }
    },
    onSettled: () => {
      if (timetableId) {
        void queryClient.invalidateQueries({ queryKey: timetableQueryKeys.lessons(timetableId) })
      }
    },
  })
}

export function useUpdateLesson(timetableId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ lessonId, patch }: { lessonId: string; patch: LessonPatchBody }) => {
      if (!timetableId) {
        return Promise.reject(new Error('timetableId is required'))
      }
      return api.patch(`/api/v1/lessons/${lessonId}`, patch)
    },
    onMutate: async ({ lessonId, patch }) => {
      if (!timetableId) return
      await queryClient.cancelQueries({ queryKey: timetableQueryKeys.lessons(timetableId) })
      const previous = queryClient.getQueryData<TimetableLessonsResponse>(
        timetableQueryKeys.lessons(timetableId),
      )
      if (previous) {
        queryClient.setQueryData(timetableQueryKeys.lessons(timetableId), {
          ...previous,
          lessons: previous.lessons.map((l) =>
            l.id === lessonId ? ({ ...l, ...patch } as LessonDto) : l,
          ),
        })
      }
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (timetableId && context?.previous) {
        queryClient.setQueryData(timetableQueryKeys.lessons(timetableId), context.previous)
      }
    },
    onSettled: () => {
      if (timetableId) {
        void queryClient.invalidateQueries({ queryKey: timetableQueryKeys.lessons(timetableId) })
      }
    },
  })
}

export function useDeleteLesson(timetableId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (lessonId: string) => {
      if (!timetableId) {
        return Promise.reject(new Error('timetableId is required'))
      }
      return api.delete(`/api/v1/lessons/${lessonId}`)
    },
    onMutate: async (lessonId) => {
      if (!timetableId) return
      await queryClient.cancelQueries({ queryKey: timetableQueryKeys.lessons(timetableId) })
      const previous = queryClient.getQueryData<TimetableLessonsResponse>(
        timetableQueryKeys.lessons(timetableId),
      )
      if (previous) {
        queryClient.setQueryData(timetableQueryKeys.lessons(timetableId), {
          ...previous,
          lessons: previous.lessons.filter((l) => l.id !== lessonId),
        })
      }
      return { previous }
    },
    onError: (_err, _lessonId, context) => {
      if (timetableId && context?.previous) {
        queryClient.setQueryData(timetableQueryKeys.lessons(timetableId), context.previous)
      }
    },
    onSettled: () => {
      if (timetableId) {
        void queryClient.invalidateQueries({ queryKey: timetableQueryKeys.lessons(timetableId) })
      }
    },
  })
}

export function useCreateLesson(timetableId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateLessonBody) => {
      if (!timetableId) {
        return Promise.reject(new Error('timetableId is required'))
      }
      return api.post<LessonDto>(`/api/v1/timetables/${timetableId}/lessons`, body).then((r) => r.data)
    },
    onSettled: () => {
      if (timetableId) {
        void queryClient.invalidateQueries({ queryKey: timetableQueryKeys.lessons(timetableId) })
      }
    },
  })
}

export function useMoveLesson(timetableId: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ lessonId, ...body }: { lessonId: string } & LessonMoveBody) => {
      if (!timetableId) {
        return Promise.reject(new Error('timetableId is required'))
      }
      return api.post(`/api/v1/lessons/${lessonId}/move`, body)
    },
    onSettled: () => {
      if (timetableId) {
        void queryClient.invalidateQueries({ queryKey: timetableQueryKeys.lessons(timetableId) })
      }
    },
  })
}
