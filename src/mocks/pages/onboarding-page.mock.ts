import type { InstitutionTemplatesDto } from '@/types/template.types'

export const mockInstitutionTemplates: InstitutionTemplatesDto = {
  templates: [
    {
      id: 'tpl-secondary-5day',
      name: '5-Day Secondary School',
      description:
        'Standard secondary school with a 5-day week and 6 periods per day. Suitable for Year 7–13 institutions.',
      previewDetails: {
        cycleLengthDays: 5,
        periodsPerDay: 6,
        cycleDescription: '5-day rotating cycle (Day 1–Day 5)',
      },
    },
    {
      id: 'tpl-primary-5day',
      name: '5-Day Primary School',
      description:
        'Primary school setup with a Monday-to-Friday timetable and 5 teaching sessions per day.',
      previewDetails: {
        cycleLengthDays: 5,
        periodsPerDay: 5,
        cycleDescription: 'Monday to Friday',
      },
    },
    {
      id: 'tpl-fortnight-10day',
      name: '10-Day Fortnight',
      description:
        'Two-week rotating fortnight schedule giving more flexibility for specialist subjects.',
      previewDetails: {
        cycleLengthDays: 10,
        periodsPerDay: 6,
        cycleDescription: '10-day rotating cycle (Day 1–Day 10)',
      },
    },
  ],
}

// Bell schedule definitions per template id
export const mockTemplateBellSchedules: Record<string, { name: string; startTime: string; endTime: string }[]> = {
  'tpl-secondary-5day': [
    { name: 'Period 1', startTime: '08:00', endTime: '09:00' },
    { name: 'Period 2', startTime: '09:00', endTime: '10:00' },
    { name: 'Period 3', startTime: '10:20', endTime: '11:20' },
    { name: 'Period 4', startTime: '11:20', endTime: '12:20' },
    { name: 'Period 5', startTime: '13:10', endTime: '14:10' },
    { name: 'Period 6', startTime: '14:10', endTime: '15:10' },
  ],
  'tpl-primary-5day': [
    { name: 'Session 1', startTime: '08:30', endTime: '09:30' },
    { name: 'Session 2', startTime: '09:30', endTime: '10:30' },
    { name: 'Session 3', startTime: '10:50', endTime: '11:50' },
    { name: 'Session 4', startTime: '13:00', endTime: '14:00' },
    { name: 'Session 5', startTime: '14:00', endTime: '15:00' },
  ],
  'tpl-fortnight-10day': [
    { name: 'Period 1', startTime: '08:00', endTime: '09:00' },
    { name: 'Period 2', startTime: '09:00', endTime: '10:00' },
    { name: 'Period 3', startTime: '10:20', endTime: '11:20' },
    { name: 'Period 4', startTime: '11:20', endTime: '12:20' },
    { name: 'Period 5', startTime: '13:10', endTime: '14:10' },
    { name: 'Period 6', startTime: '14:10', endTime: '15:10' },
  ],
}

export const mockTemplateCycles: Record<
  string,
  { cycleLengthDays: number; dayLabels: string[] }
> = {
  'tpl-secondary-5day': {
    cycleLengthDays: 5,
    dayLabels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
  },
  'tpl-primary-5day': {
    cycleLengthDays: 5,
    dayLabels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  'tpl-fortnight-10day': {
    cycleLengthDays: 10,
    dayLabels: [
      'Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5',
      'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10',
    ],
  },
}

export const mockTemplateTerminologyOverrides: Record<string, Record<string, string>> = {
  'tpl-secondary-5day': {},
  'tpl-primary-5day': {
    period: 'Session',
    class: 'Form',
  },
  'tpl-fortnight-10day': {},
}
