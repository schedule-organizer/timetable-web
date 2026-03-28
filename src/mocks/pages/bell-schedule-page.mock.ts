import type { BellScheduleDto } from '@/types/bell-schedule.types'

export const mockBellSchedule: BellScheduleDto = {
  periods: [
    { id: 'period-mock-1', name: 'Period 1', startTime: '08:00', endTime: '09:00' },
    { id: 'period-mock-2', name: 'Period 2', startTime: '09:00', endTime: '10:00' },
    { id: 'period-mock-3', name: 'Period 3', startTime: '10:00', endTime: '11:00' },
  ],
}
