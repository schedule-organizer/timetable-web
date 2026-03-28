// Cycle — repeating day structure for scheduling (e.g. 5-day week, 10-day rotating pattern).
// GET/PUT /api/v1/settings/cycle

export type CycleSettingsDto = {
  cycleLengthDays: number
  /** One label per cycle position; empty strings mean unnamed positions. */
  dayLabels: string[]
}

// Academic terms — named date ranges within the school year.
// GET/PUT /api/v1/settings/academic-terms

export type AcademicTermDto = {
  id: string
  name: string
  /** ISO calendar date YYYY-MM-DD */
  startDate: string
  /** ISO calendar date YYYY-MM-DD */
  endDate: string
}

export type AcademicTermsDto = {
  terms: AcademicTermDto[]
}

/** Standard API error when a term has end before start (HTTP 400). */
export type AcademicTermDateOrderErrorBody = {
  status: number
  code: 'TERM_DATE_ORDER'
  message: string
  timestamp?: string
}
