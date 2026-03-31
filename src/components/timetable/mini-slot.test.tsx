import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/test-utils'
import { MiniSlot } from './mini-slot'
import type { LessonDto } from '@/types/timetable.types'

const baseLesson: LessonDto = {
  id: 'lesson-1',
  cycleDayIndex: 0,
  periodId: 'period-1',
  classId: 'class-1',
  className: 'Year 7A',
  yearGroup: 'Year 7',
  subjectId: 'subject-1',
  subjectName: 'Mathematics',
  subjectColorHex: '#3b82f6',
  teacherId: 'teacher-1',
  teacherName: 'Alice Brown',
  roomId: 'room-1',
  roomName: 'R101',
  isPinned: false,
  hasConflict: false,
}

describe('MiniSlot', () => {
  it('renders subject abbreviation for single-word name', () => {
    render(<MiniSlot lesson={{ ...baseLesson, subjectName: 'Physics' }} />)
    expect(screen.getByText('PHY')).toBeInTheDocument()
  })

  it('renders subject abbreviation for multi-word name', () => {
    render(<MiniSlot lesson={{ ...baseLesson, subjectName: 'Physical Education' }} />)
    expect(screen.getByText('PE')).toBeInTheDocument()
  })

  it('renders teacher initials and room label', () => {
    render(<MiniSlot lesson={baseLesson} />)
    expect(screen.getByText(/AB/)).toBeInTheDocument()
    expect(screen.getByText(/R101/)).toBeInTheDocument()
  })

  it('shows pin icon when lesson is pinned', () => {
    render(<MiniSlot lesson={{ ...baseLesson, isPinned: true }} />)
    expect(screen.getByTitle('Pinned')).toBeInTheDocument()
  })

  it('does not show pin icon when not pinned', () => {
    render(<MiniSlot lesson={baseLesson} />)
    expect(screen.queryByTitle('Pinned')).not.toBeInTheDocument()
  })

  it('includes full detail in title tooltip', () => {
    // MiniSlot aria-label was removed (plain div has no role); accessible label lives
    // on the outer gridcell. The title attribute provides the hover tooltip.
    render(<MiniSlot lesson={baseLesson} />)
    const el = document.querySelector('[title]')
    expect(el?.getAttribute('title')).toContain('Mathematics')
    expect(el?.getAttribute('title')).toContain('Alice Brown')
    expect(el?.getAttribute('title')).toContain('R101')
  })

  it('includes pinned state in title tooltip when pinned', () => {
    render(<MiniSlot lesson={{ ...baseLesson, isPinned: true }} />)
    const el = document.querySelector('[title*="pinned"]')
    expect(el).toBeInTheDocument()
  })

  it('includes conflict state in title tooltip when in conflict', () => {
    render(<MiniSlot lesson={{ ...baseLesson, hasConflict: true }} />)
    const el = document.querySelector('[title*="conflict"]')
    expect(el).toBeInTheDocument()
  })

  it('renders colour bar with subject colour', () => {
    render(<MiniSlot lesson={baseLesson} />)
    const colourBar = document.querySelector('[aria-hidden="true"]') as HTMLElement
    expect(colourBar?.style.backgroundColor).toBe('rgb(59, 130, 246)')
  })
})
