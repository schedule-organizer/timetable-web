import { describe, it, expect } from 'vitest'
import { buildRelaxationImpactPreviewLine } from './relaxation-impact-preview'
import type { ConflictExplanationDto } from '@/types/engine.types'

const periods = [
  { id: 'period-2', name: 'Period 2', order: 2 },
  { id: 'period-3', name: 'PM', order: 3 },
]

describe('buildRelaxationImpactPreviewLine', () => {
  it('returns undefined when there are no affected slots', () => {
    const conflict: ConflictExplanationDto = {
      id: 'c1',
      constraintId: 'hc-1',
      constraintName: 'Test',
      explanation: 'x',
      affectedTeachers: [],
      affectedClasses: [],
      affectedSlots: [],
    }
    expect(buildRelaxationImpactPreviewLine(conflict, ['Mon'], 1, periods)).toBeUndefined()
  })

  it('mentions teacher and day/period from first slot', () => {
    const conflict: ConflictExplanationDto = {
      id: 'c1',
      constraintId: 'hc-4',
      constraintName: 'Teacher forbidden slots respected',
      explanation: '…',
      affectedTeachers: [{ id: 't1', name: 'Jane Smith' }],
      affectedClasses: [{ id: 'cl1', name: 'Year 10B' }],
      affectedSlots: [{ cycleDayIndex: 4, periodId: 'period-3' }],
    }
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const line = buildRelaxationImpactPreviewLine(conflict, labels, 5, periods)
    expect(line).toContain('Fri')
    expect(line).toContain('PM')
    expect(line).toContain('Jane Smith')
  })
})
