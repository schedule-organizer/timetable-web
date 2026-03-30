import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

const MODAL_ROOT_ID = 'modal-root'

function getModalRoot(): HTMLElement {
  if (typeof document === 'undefined') {
    throw new Error('ModalPortal requires a browser DOM')
  }
  const existing = document.getElementById(MODAL_ROOT_ID)
  if (existing) return existing
  const el = document.createElement('div')
  el.id = MODAL_ROOT_ID
  document.body.appendChild(el)
  return el
}

/** Renders into `#modal-root` (see `index.html` + `globals.css`) so overlays sit above `#root` and are not clipped by `main` overflow. */
export function ModalPortal({ children }: { children: ReactNode }) {
  return createPortal(children, getModalRoot())
}
