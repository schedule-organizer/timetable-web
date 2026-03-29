import { type z } from 'zod'
import {
  constraintTypeSchema,
  createSubjectRuleRequestSchema,
  subjectRuleDtoSchema,
  subjectRuleFormSchema,
  subjectRulesListSchema,
  updateSubjectRuleRequestSchema,
} from '@/types/subject-rule.schemas'

export type ConstraintType = z.infer<typeof constraintTypeSchema>
export type SubjectRuleDto = z.infer<typeof subjectRuleDtoSchema>
export type SubjectRulesListDto = z.infer<typeof subjectRulesListSchema>
export type CreateSubjectRuleRequest = z.infer<typeof createSubjectRuleRequestSchema>
export type UpdateSubjectRuleRequest = z.infer<typeof updateSubjectRuleRequestSchema>
export type SubjectRuleFormValues = z.infer<typeof subjectRuleFormSchema>
