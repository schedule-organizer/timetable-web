import type {
  AvailabilitySlotState,
  TeacherAvailabilityDto,
} from '@/types/teacher-availability.types'

export function slotKey(cycleDayIndex: number, periodId: string): string {
  return `${cycleDayIndex}:${periodId}`
}

export function parseSlotKey(key: string): { cycleDayIndex: number; periodId: string } | null {
  const idx = key.indexOf(':')
  if (idx <= 0) return null
  const day = Number(key.slice(0, idx))
  if (!Number.isInteger(day) || day < 0) return null
  const periodId = key.slice(idx + 1)
  if (!periodId) return null
  return { cycleDayIndex: day, periodId }
}

export function nextAvailabilityState(current: AvailabilitySlotState): AvailabilitySlotState {
  if (current === 'available') return 'unavailable'
  if (current === 'unavailable') return 'preferred'
  return 'available'
}

export function availabilityDtoToStateMap(dto: TeacherAvailabilityDto): Map<string, AvailabilitySlotState> {
  const map = new Map<string, AvailabilitySlotState>()
  for (const u of dto.unavailable) {
    map.set(slotKey(u.cycleDayIndex, u.periodId), 'unavailable')
  }
  for (const p of dto.preferred) {
    map.set(slotKey(p.cycleDayIndex, p.periodId), 'preferred')
  }
  return map
}

export function stateMapToAvailabilityDto(map: Map<string, AvailabilitySlotState>): TeacherAvailabilityDto {
  const unavailable: TeacherAvailabilityDto['unavailable'] = []
  const preferred: TeacherAvailabilityDto['preferred'] = []
  for (const [key, state] of map) {
    if (state === 'available') continue
    const parsed = parseSlotKey(key)
    if (!parsed) continue
    if (state === 'unavailable') unavailable.push(parsed)
    else preferred.push(parsed)
  }
  return { unavailable, preferred }
}

export function getSlotState(
  map: Map<string, AvailabilitySlotState>,
  cycleDayIndex: number,
  periodId: string,
): AvailabilitySlotState {
  return map.get(slotKey(cycleDayIndex, periodId)) ?? 'available'
}

export function setSlotState(
  map: Map<string, AvailabilitySlotState>,
  cycleDayIndex: number,
  periodId: string,
  state: AvailabilitySlotState,
): Map<string, AvailabilitySlotState> {
  const next = new Map(map)
  const k = slotKey(cycleDayIndex, periodId)
  if (state === 'available') next.delete(k)
  else next.set(k, state)
  return next
}
