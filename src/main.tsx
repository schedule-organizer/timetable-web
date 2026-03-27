import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import '@/styles/globals.css'

async function prepare() {
  if (import.meta.env.DEV) {
    // Mock Service Worker — intercepts API calls with mock handlers.
    // Requires `npx msw init public/` to have been run once.
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledRequest: 'bypass' })
  }
}

prepare().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
})
