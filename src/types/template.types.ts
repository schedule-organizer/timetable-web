// Institution templates — pre-built configuration bundles for common school types.
// GET  /api/v1/settings/templates
// POST /api/v1/settings/apply-template

export type {
  InstitutionTemplate,
  InstitutionTemplatesDto,
  ApplyTemplateRequest,
  AppliedTemplateSettings,
} from './template.schemas'

export {
  institutionTemplateSchema,
  institutionTemplatesDtoSchema,
  applyTemplateRequestSchema,
  appliedTemplateSettingsSchema,
} from './template.schemas'
