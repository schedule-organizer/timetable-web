import { authHandlers } from './auth.handlers'
import { settingsHandlers } from './settings.handlers'
import { invitationHandlers } from './invitation.handlers'
import { rbacHandlers } from './rbac.handlers'
import { subjectHandlers } from './subject.handlers'
import { teacherHandlers } from './teacher.handlers'
import { classHandlers } from './class.handlers'
import { roomHandlers } from './room.handlers'

export const handlers = [
  ...authHandlers,
  ...settingsHandlers,
  ...invitationHandlers,
  ...rbacHandlers,
  ...classHandlers,
  ...subjectHandlers,
  ...teacherHandlers,
  ...roomHandlers,
]
