import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

// Suppress console.error for expected React errors during tests
const originalError = console.error
afterEach(() => {
  console.error = originalError
})

// MSW requires TextEncoder/TextDecoder — available in Node 18+ / jsdom
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = await import('node:util')
  global.TextEncoder = TextEncoder
  // @ts-expect-error TextDecoder type mismatch between node and lib.dom
  global.TextDecoder = TextDecoder
}

// Silence matchMedia (not implemented in jsdom)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
