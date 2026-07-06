import type { BellScheduleDto } from '@/types/bell-schedule.types'

// Seed bell schedule for mock mode — a realistic 6-period secondary-school day
// with morning-break and lunch gaps between periods.
// NOTE: period-mock-1..3 ids are referenced by the teacher-availability seed in
// teacher.handlers.ts — keep those ids stable.
export const mockBellSchedule: BellScheduleDto = {
  periods: [
    { id: 'period-mock-1', name: 'Period 1', startTime: '08:00', endTime: '09:00' },
    { id: 'period-mock-2', name: 'Period 2', startTime: '09:00', endTime: '10:00' },
    { id: 'period-mock-3', name: 'Period 3', startTime: '10:20', endTime: '11:20' },
    { id: 'period-mock-4', name: 'Period 4', startTime: '11:20', endTime: '12:20' },
    { id: 'period-mock-5', name: 'Period 5', startTime: '13:10', endTime: '14:10' },
    { id: 'period-mock-6', name: 'Period 6', startTime: '14:10', endTime: '15:10' },
  ],
}
