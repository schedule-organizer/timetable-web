import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { api } from '@/lib/axios'
import { engineJobDtoSchema, engineRunResponseSchema } from '@/types/engine.schemas'
import { draftScheduleSchema } from '@/types/timetable-draft.schemas'
import type { EngineJobDto, EngineRunRequest } from '@/types/engine.types'

export const engineQueryKeys = {
  job: (jobId: string) => ['engine', 'job', jobId] as const,
}

export const draftScheduleQueryKeys = {
  term: (termId: string) => ['timetable', 'draft', termId] as const,
}

export function useDraftSchedule(termId: string | null) {
  return useQuery({
    queryKey: termId ? draftScheduleQueryKeys.term(termId) : ['timetable', 'draft', 'none'],
    queryFn: () =>
      api
        .get('/api/v1/timetable/draft', { params: { termId } })
        .then((res) => draftScheduleSchema.parse(res.data)),
    enabled: !!termId,
  })
}

export function useEngineJob(jobId: string | null) {
  return useQuery({
    queryKey: jobId ? engineQueryKeys.job(jobId) : ['engine', 'job', 'none'],
    queryFn: () =>
      api.get(`/api/v1/engine/jobs/${jobId}`).then((res) => engineJobDtoSchema.parse(res.data)),
    enabled: !!jobId,
    refetchInterval: (query) => {
      const s = query.state.data?.status
      return s === 'queued' || s === 'running' ? 300 : false
    },
  })
}

/** When a job completes, sync the draft timetable cache from the job result (same shape as GET draft). */
export function useSyncDraftFromEngineJob(
  termId: string | null,
  job: EngineJobDto | undefined,
) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!termId || job?.status !== 'succeeded' || !job.result) return
    queryClient.setQueryData(draftScheduleQueryKeys.term(termId), job.result)
  }, [termId, job?.status, job?.result, queryClient])
}

export function useRunEngine() {
  return useMutation({
    mutationFn: (body: EngineRunRequest) =>
      api
        .post('/api/v1/engine/run', body)
        .then((res) => engineRunResponseSchema.parse(res.data)),
  })
}

export function useCancelEngineJob() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (jobId: string) => api.delete(`/api/v1/engine/jobs/${jobId}`),
    onSuccess: (_, jobId) => {
      queryClient.invalidateQueries({ queryKey: engineQueryKeys.job(jobId) })
    },
  })
}
