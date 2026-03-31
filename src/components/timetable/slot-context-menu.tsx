import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { LessonDto } from '@/types/timetable.types'

export interface SlotContextMenuProps {
  lesson: LessonDto
  position: { x: number; y: number }
  onClose: () => void
  onPin: () => void
  onUnpin: () => void
}

/**
 * Lightweight context menu for slot Pin/Unpin (Story 5.2).
 * Uses a fixed-position portal; closes on Escape or outside click.
 */
export function SlotContextMenu({ lesson, position, onClose, onPin, onUnpin }: SlotContextMenuProps) {
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

  const pinned = lesson.isPinned

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      aria-label="Slot actions"
      className="fixed z-[100] min-w-[140px] rounded-md border border-[--color-border] bg-[--color-surface] py-1 shadow-lg"
      style={{ left: position.x, top: position.y }}
    >
      {!pinned ? (
        <button
          type="button"
          role="menuitem"
          className="block w-full px-3 py-2 text-left text-sm hover:bg-[--color-muted]"
          style={{ color: 'var(--color-text-primary)' }}
          onClick={() => {
            onPin()
            onClose()
          }}
        >
          Pin
        </button>
      ) : (
        <button
          type="button"
          role="menuitem"
          className="block w-full px-3 py-2 text-left text-sm hover:bg-[--color-muted]"
          style={{ color: 'var(--color-text-primary)' }}
          onClick={() => {
            onUnpin()
            onClose()
          }}
        >
          Unpin
        </button>
      )}
    </div>,
    document.body,
  )
}
