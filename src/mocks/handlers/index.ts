import { authHandlers } from './auth.handlers'
import { settingsHandlers } from './settings.handlers'

export const handlers = [...authHandlers, ...settingsHandlers]
