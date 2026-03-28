import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Service worker must be initialised via `npx msw init public/` before first run.
export const worker = setupWorker(...handlers)
