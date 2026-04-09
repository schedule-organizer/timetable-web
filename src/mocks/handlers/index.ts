import { authHandlers } from './auth.handlers'
import { settingsHandlers } from './settings.handlers'
import { invitationHandlers } from './invitation.handlers'
import { rbacHandlers } from './rbac.handlers'
import { subjectHandlers } from './subject.handlers'
import { teacherHandlers } from './teacher.handlers'
import { classHandlers } from './class.handlers'
import { roomHandlers } from './room.handlers'
import { hardConstraintHandlers } from './hard-constraint.handlers'
import { softPreferenceHandlers } from './soft-preference.handlers'
import { subjectRuleHandlers } from './subject-rule.handlers'
import { engineHandlers } from './engine.handlers'
import { timetableHandlers } from './timetable.handlers'

export const handlers = [
  ...authHandlers,
  ...settingsHandlers,
  ...invitationHandlers,
  ...rbacHandlers,
  ...classHandlers,
  ...subjectHandlers,
  ...teacherHandlers,
  ...roomHandlers,
  ...hardConstraintHandlers,
  ...softPreferenceHandlers,
  ...subjectRuleHandlers,
  ...engineHandlers,
  ...timetableHandlers,
]
