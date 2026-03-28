// Bell schedule — ordered named periods with time ranges (single day template).
// GET/PUT /api/v1/settings/bell-schedule

export type BellPeriod = {
  id: string
  name: string
  startTime: string
  endTime: string
}

export type BellScheduleDto = {
  periods: BellPeriod[]
}

/** Standard API error envelope when overlap validation fails (HTTP 400). */
export type BellScheduleOverlapErrorBody = {
  status: number
  code: 'BELL_SCHEDULE_OVERLAP'
  message: string
  details: {
    periodA: { id: string; name: string }
    periodB: { id: string; name: string }
  }
  timestamp?: string
}
