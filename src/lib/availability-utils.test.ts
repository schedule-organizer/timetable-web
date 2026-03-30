import { describe, expect, it } from 'vitest'
import {
  availabilityDtoToStateMap,
  getSlotState,
  nextAvailabilityState,
  parseSlotKey,
  setSlotState,
  slotKey,
  stateMapToAvailabilityDto,
} from '@/lib/availability-utils'
import type { AvailabilitySlotState } from '@/types/teacher-availability.types'

describe('availability-utils', () => {
  it('slotKey and parseSlotKey round-trip', () => {
    expect(slotKey(2, 'p-1')).toBe('2:p-1')
    expect(parseSlotKey('2:p-1')).toEqual({ cycleDayIndex: 2, periodId: 'p-1' })
    expect(parseSlotKey('bad')).toBeNull()
  })

  it('nextAvailabilityState cycles available → unavailable → preferred → available', () => {
    expect(nextAvailabilityState('available')).toBe('unavailable')
    expect(nextAvailabilityState('unavailable')).toBe('preferred')
    expect(nextAvailabilityState('preferred')).toBe('available')
  })

  it('maps DTO to state map and back', () => {
    const dto = {
      unavailable: [{ cycleDayIndex: 0, periodId: 'a' }],
      preferred: [{ cycleDayIndex: 1, periodId: 'b' }],
    }
    const map = availabilityDtoToStateMap(dto)
    expect(getSlotState(map, 0, 'a')).toBe('unavailable')
    expect(getSlotState(map, 1, 'b')).toBe('preferred')
    expect(getSlotState(map, 0, 'b')).toBe('available')
    const back = stateMapToAvailabilityDto(map)
    expect(back.unavailable).toEqual(dto.unavailable)
    expect(back.preferred).toEqual(dto.preferred)
  })

  it('setSlotState clears key when state is available', () => {
    let m = new Map<string, AvailabilitySlotState>()
    m = setSlotState(m, 0, 'p', 'unavailable')
    expect(getSlotState(m, 0, 'p')).toBe('unavailable')
    m = setSlotState(m, 0, 'p', 'available')
    expect(getSlotState(m, 0, 'p')).toBe('available')
  })
})
