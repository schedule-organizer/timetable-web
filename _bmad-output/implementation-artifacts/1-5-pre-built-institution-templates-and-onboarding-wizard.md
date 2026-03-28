# Story 1.5: Pre-Built Institution Templates & Onboarding Wizard

Status: done

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

- [x] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [x] Implement feature module under `src/features/<area>/` per architecture tree.
- [x] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [x] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [x] Tests: unit/component for core logic; a11y queries by role/label.

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
claude-sonnet-4-6

### Debug Log References
- Fixed duplicate h2 heading when wizard is on step 3: renamed step label from "Setup Checklist" to "Setup Complete" to avoid conflict with SetupChecklist component's own heading.

### Completion Notes List
- Implemented 3-step onboarding wizard (Choose Template → Review Defaults → Setup Complete) on the DashboardPage.
- Template selection step fetches templates from GET /api/v1/settings/templates (mocked via MSW) and renders them as radio-button cards.
- Applying a template POSTs to /api/v1/settings/apply-template which updates Bell Schedule, Cycle, and Terminology in the MSW in-memory store, then shows a summary in step 2.
- Non-linear back navigation supported: step indicator allows clicking completed steps; going back from step 2 to step 1 preserves the selected template (UX-DR23).
- SetupChecklist component derives completion status from existing hooks (useBellSchedule, useCycleSettings, useAcademicTerms) and provides "Configure" links to each settings page.
- After clicking "Go to Dashboard", useOnboardingStore marks the wizard complete; DashboardPage then renders the checklist view without wizard chrome.
- All 75 tests pass (12 new onboarding tests + 63 regression tests).

### File List
- src/types/template.types.ts (new)
- src/mocks/pages/onboarding-page.mock.ts (new)
- src/mocks/handlers/settings.handlers.ts (modified — added template GET/POST handlers)
- src/api/hooks/useTemplates.ts (new)
- src/store/onboardingStore.ts (new)
- src/features/onboarding/components/WizardStepIndicator.tsx (new)
- src/features/onboarding/components/TemplateCard.tsx (new)
- src/features/onboarding/components/TemplateSelectionStep.tsx (new)
- src/features/onboarding/components/AppliedSummaryStep.tsx (new)
- src/features/onboarding/components/SetupChecklist.tsx (new)
- src/features/onboarding/components/OnboardingWizard.tsx (new)
- src/features/dashboard/pages/DashboardPage.tsx (modified)
- src/features/onboarding/pages/OnboardingWizardPage.test.tsx (new)

## Change Log

- 2026-03-28: Implemented Story 1.5 — Pre-Built Institution Templates & Onboarding Wizard. Added template types, MSW handlers, React Query hooks, Zustand onboarding store, and complete 3-step wizard UI with SetupChecklist.
- 2026-03-28: Code review (batch): Zod schemas for template DTOs, MSW request validation, terminology checklist states (Customised vs Default labels), sprint timestamp and story status synced to done.

### Review Findings

- [x] [Review][Decision] Terminology row always “Complete” vs acceptance criteria — Resolved: terminology row now uses `useTerminologyLabels()` and shows **Customised** (green) when any label is non-empty, otherwise **Default labels** (neutral slate) — distinct from required rows’ Complete/Incomplete. [`SetupChecklist.tsx`]
- [x] [Review][Patch] Zod for template DTOs — Resolved: added `src/types/template.schemas.ts` with `institutionTemplatesDtoSchema`, `applyTemplateRequestSchema`, `appliedTemplateSettingsSchema`; hooks parse API responses; MSW validates POST body. [`template.schemas.ts`, `useTemplates.ts`, `settings.handlers.ts`]
- [x] [Review][Patch] Sprint `last_updated` — Resolved: set monotonic `last_updated` in `sprint-status.yaml`.

---
**Story completion status:** done
