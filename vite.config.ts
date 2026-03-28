/// <reference types="vitest" />
import crypto, { webcrypto } from 'crypto'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// Vitest resolves this config before `setupFiles` run; jsdom/Node need `getRandomValues` here.
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    enumerable: false,
    value: webcrypto,
  })
}

if (typeof crypto.getRandomValues !== 'function' && typeof webcrypto?.getRandomValues === 'function') {
  Object.defineProperty(crypto, 'getRandomValues', {
    configurable: true,
    enumerable: false,
    value: webcrypto.getRandomValues.bind(webcrypto),
  })
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    globals: false,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
