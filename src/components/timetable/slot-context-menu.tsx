import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { LessonDto } from '@/types/timetable.types'

export interface SlotContextMenuProps {
  lesson: LessonDto | null
  /** When false, Pin/Unpin are disabled (e.g. parent did not pass pin mutation handlers). */
  pinActionsAvailable: boolean
  position: { x: number; y: number }
  onClose: () => void
  onAssignLesson: () => void
  onPin: () => void
  onUnpin: () => void
  onClear: () => void
  onViewDetail: () => void
}

function menuItemClass(disabled: boolean): string {
  const base =
    'block w-full px-3 py-2 text-left text-sm focus:outline-none focus-visible:bg-[--color-muted]'
  if (disabled) {
    return `${base} cursor-not-allowed opacity-50`
  }
  return `${base} cursor-pointer hover:bg-[--color-muted]`
}

/**
 * Context menu for timetable slots (Story 5.3 — UX-DR16: Shift+F10 / right-click).
 * Options: Assign lesson, Pin (or Unpin), Clear, View detail.
 */
export function SlotContextMenu({
  lesson,
  pinActionsAvailable,
  position,
  onClose,
  onAssignLesson,
  onPin,
  onUnpin,
  onClear,
  onViewDetail,
}: SlotContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current?.contains(e.target as Node)) return
      onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const t = window.setTimeout(() => {
      document.addEventListener('mousedown', onPointerDown)
    }, 0)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('mousedown', onPointerDown)
    }
  }, [onClose])

  const hasLesson = lesson !== null
  const pinned = lesson?.isPinned ?? false
  const pinDisabled = !hasLesson || !pinActionsAvailable

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Slot actions"
      className="fixed z-[100] min-w-[180px] rounded-md border border-[--color-border] bg-[--color-surface] py-1 shadow-lg"
      style={{ left: position.x, top: position.y }}
    >
      <button
        type="button"
        role="menuitem"
        className={menuItemClass(false)}
        style={{ color: 'var(--color-text-primary)' }}
        onClick={() => {
          onAssignLesson()
          onClose()
        }}
      >
        Assign lesson
      </button>
      <button
        type="button"
        role="menuitem"
        aria-disabled={pinDisabled}
        disabled={pinDisabled}
        className={menuItemClass(pinDisabled)}
        style={{ color: 'var(--color-text-primary)' }}
        onClick={() => {
          if (pinDisabled) return
          if (pinned) onUnpin()
          else onPin()
          onClose()
        }}
      >
        {hasLesson ? (pinned ? 'Unpin' : 'Pin') : 'Pin'}
      </button>
      <button
        type="button"
        role="menuitem"
        aria-disabled={!hasLesson}
        disabled={!hasLesson}
        className={menuItemClass(!hasLesson)}
        style={{ color: 'var(--color-text-primary)' }}
        onClick={() => {
          if (!hasLesson) return
          onClear()
          onClose()
        }}
      >
        Clear
      </button>
      <button
        type="button"
        role="menuitem"
        aria-disabled={!hasLesson}
        disabled={!hasLesson}
        className={menuItemClass(!hasLesson)}
        style={{ color: 'var(--color-text-primary)' }}
        onClick={() => {
          if (!hasLesson) return
          onViewDetail()
          onClose()
        }}
      >
        View detail
      </button>
    </div>,
    document.body,
  )
}
