import type { AcademicTermsDto, CycleSettingsDto } from '@/types/cycle-term.types'

// 5-day rotating cycle (Day A–Day E) for mock mode.
export const mockCycleSettings: CycleSettingsDto = {
  cycleLengthDays: 5,
  dayLabels: ['Day A', 'Day B', 'Day C', 'Day D', 'Day E'],
}

// A full academic year of terms so the term selector and per-term generation
// have something to switch between. The Summer term covers the current date.
export const mockAcademicTerms: AcademicTermsDto = {
  terms: [
    {
      id: 'term-mock-1',
      name: 'Autumn Term',
      startDate: '2025-09-01',
      endDate: '2025-12-19',
    },
    {
      id: 'term-mock-2',
      name: 'Spring Term',
      startDate: '2026-01-05',
      endDate: '2026-04-02',
    },
    {
      id: 'term-mock-3',
      name: 'Summer Term',
      startDate: '2026-04-20',
      endDate: '2026-07-17',
    },
  ],
}
