// Configurable terminology keys — institutions rename these to match their language.
export type TerminologyKey = 'period' | 'class' | 'term' | 'cycle' | 'bellSchedule' | 'room' | 'subject'

// Full set of institution-configured labels; empty string means "use SchediFlow default".
export type TerminologyLabels = Record<TerminologyKey, string>

// PUT /api/v1/settings/labels request body — same shape as the stored labels.
export type UpdateTerminologyRequest = TerminologyLabels

// GET/PUT /api/v1/settings/labels response envelope.
export type TerminologyLabelsResponse = TerminologyLabels
