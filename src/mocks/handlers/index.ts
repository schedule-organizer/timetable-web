import { authHandlers } from './auth.handlers'
import { settingsHandlers } from './settings.handlers'
import { invitationHandlers } from './invitation.handlers'
import { rbacHandlers } from './rbac.handlers'

export const handlers = [...authHandlers, ...settingsHandlers, ...invitationHandlers, ...rbacHandlers]
