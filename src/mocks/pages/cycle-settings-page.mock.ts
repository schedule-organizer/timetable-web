import type { AcademicTermsDto, CycleSettingsDto } from '@/types/cycle-term.types'

export const mockCycleSettings: CycleSettingsDto = {
  cycleLengthDays: 5,
  dayLabels: ['Day A', 'Day B', 'Day C', 'Day D', 'Day E'],
}

export const mockAcademicTerms: AcademicTermsDto = {
  terms: [
    {
      id: 'term-mock-1',
      name: 'Spring',
      startDate: '2026-01-15',
      endDate: '2026-06-30',
    },
  ],
}
