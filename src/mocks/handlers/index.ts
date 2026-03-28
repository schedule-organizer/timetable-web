import { authHandlers } from './auth.handlers'
import { settingsHandlers } from './settings.handlers'
import { invitationHandlers } from './invitation.handlers'
import { rbacHandlers } from './rbac.handlers'
import { teacherHandlers } from './teacher.handlers'

export const handlers = [
  ...authHandlers,
  ...settingsHandlers,
  ...invitationHandlers,
  ...rbacHandlers,
  ...teacherHandlers,
]
