# Story 1.5: Pre-Built Institution Templates & Onboarding Wizard

Status: ready-for-dev

## Story

As a first-time Timetabler,
I want to initialise my institution from a pre-built template for my school type,
So that Bell Schedule, Cycle, and common settings are pre-populated and I reach scheduling faster.

## Acceptance Criteria

**Given** I register a new institution with no configuration
**When** I land on the setup dashboard
**Then** the onboarding wizard launches with a step progress indicator; step 1 presents template selection

**Given** I view template selection
**When** I browse available templates
**Then** I see a basic set covering common school types (e.g., 5-day secondary school, 5-day primary school, 10-day fortnight) each with a description of what will be pre-populated

**Given** I select a template and confirm
**When** the template is applied
**Then** Bell Schedule, Cycle, and common terminology are pre-populated; I see a summary of applied defaults before moving to the next step

**Given** I navigate back to a previous wizard step
**Then** my data from later steps is preserved; I can review and edit without losing subsequent step data (UX-DR23)

**Given** I have completed all setup steps
**When** I view the setup dashboard
**Then** a checklist shows which configuration areas are complete and which are missing; I can re-enter any step to update it

## Tasks / Subtasks

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 1 — API focus:** Auth: POST `/api/v1/auth/*`; Settings: GET/PUT `/api/v1/settings`, GET `/api/v1/settings/labels`; Users: `/api/v1/users` — see architecture §3.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `1-4-cycle-and-academic-term-configuration.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 1.5
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

_(filled by dev agent)_

### Debug Log References

### Completion Notes List

### File List

---
**Story completion status:** ready-for-dev — Batch story context generated from epics.md
