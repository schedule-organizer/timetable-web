# Story 1.4: Cycle & Academic Term Configuration

Status: done

## Story

As a Timetabler,
I want to define my school's Cycle and create Academic Terms,
So that the scheduler knows the repeating day structure and the active scheduling period.

## Acceptance Criteria

**Given** I navigate to Institution Setup → Cycle
**When** I configure the cycle
**Then** I can set the number of days (e.g., 5, 10) and optionally name each cycle day (e.g., "Day A", "Monday")

**Given** I create a new term with a name, start date, and end date
**When** I submit
**Then** the term is saved and appears in the list ordered chronologically with a status indicator (upcoming / active / past)

**Given** I submit a term with an end date before the start date
**Then** a specific validation error is shown and the term is not saved

**Given** at least one term and one cycle are defined
**When** the schedule generator is invoked
**Then** it uses the active term's date range and the cycle definition to compute total schedulable slots

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
Build on patterns from `1-3-bell-schedule-definition.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 1.4
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Debug Log References

### Completion Notes List

- **AC (navigation):** Institution Settings → **Cycle** at `/settings/cycle` (nav link uses `useLabels('cycle')`). Sections: Cycle (length + optional day names) and Academic terms (table).
- **AC (cycle):** `GET/PUT /api/v1/settings/cycle` with `CycleSettingsDto`; `CycleForm` syncs `dayLabels` array length when `cycleLengthDays` changes; save trims labels.
- **AC (terms):** `GET/PUT /api/v1/settings/academic-terms` with `AcademicTermsDto`; terms saved in chronological order; status (Upcoming / Active / Past) from `getTermStatus` + `useWatch`; MSW returns `400` + `TERM_DATE_ORDER` when the end date is before the start date (parity with future API).
- **AC (validation):** Zod `academicTermRowSchema` refine + UI error copy: “End date must be on or after the start date.”
- **AC (schedule generator):** Pure helpers in `src/lib/cycle-term-utils.ts`: `getActiveTerm`, `computeSchedulableSlots({ activeTerm, periodsPerDay, cycleLengthDays })` — inclusive calendar days × periods per day; cycle length reserved for engine labelling (documented in JSDoc). Wire to the engine UI when Epic 4 lands.
- **Tests:** `cycle-term-utils.test.ts` (status, sort, active term, slot math); `CycleSettingsPage.test.tsx` (headings, load, chronological list, date validation, save cycle). **62/62** Vitest tests with Node 20.

### File List

- `src/types/cycle-term.types.ts`
- `src/lib/cycle-term-utils.ts`
- `src/lib/cycle-term-utils.test.ts`
- `src/features/settings/cycle-term.schemas.ts`
- `src/features/settings/components/CycleForm.tsx`
- `src/features/settings/components/AcademicTermsForm.tsx`
- `src/features/settings/pages/CycleSettingsPage.tsx`
- `src/features/settings/pages/CycleSettingsPage.test.tsx`
- `src/api/hooks/useCycleSettings.ts`
- `src/api/hooks/useAcademicTerms.ts`
- `src/mocks/pages/cycle-settings-page.mock.ts`
- `src/mocks/handlers/settings.handlers.ts`
- `src/features/settings/pages/SettingsLayout.tsx`
- `src/routes.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/1-4-cycle-and-academic-term-configuration.md`

### Change Log

- 2026-03-28: Implemented cycle and academic term settings (API DTOs, MSW, RHF+Zod forms, React Query hooks, slot-count helpers, tests). Sprint status `1-4-cycle-and-academic-term-configuration`: ready-for-dev → in-progress → review.
- 2026-03-28: Code review batch fixes (shared API error helper, terminology headings, `.gitignore` tsbuildinfo, dirty-safe form reset, `getTermStatus` invalid dates, overlap JSDoc). Story and sprint → done.

### Review Findings

- [x] [Review][Decision] Overlapping academic terms — **Resolved:** overlaps allowed; documented on `getActiveTerm` (first sorted active term). Row status remains per-term.

- [x] [Review][Patch] Duplicate `getApiErrorMessage` — **Fixed:** `src/lib/api-error-message.ts`; used by `CycleForm`, `AcademicTermsForm`, `BellScheduleForm`.

- [x] [Review][Patch] Section heading terminology — **Fixed:** `CycleSettingsPage` and academic form/table use `Academic ${label('term')}`.

- [x] [Review][Patch] TypeScript build info in repo — **Fixed:** `*.tsbuildinfo` in `.gitignore`.

- [x] [Review][Patch] Form reset vs dirty state — **Fixed:** skip `reset` on query `data` when `isDirty`; `onSuccess` on save resets from server response.

- [x] [Review][Patch] Invalid ISO dates in term status — **Fixed:** `getTermStatus` returns `null` when `dayjs` dates are invalid; test added.

- [x] [Review][Defer] Schedule generator AC (active term + cycle) — Helpers exist in `cycle-term-utils.ts`; wiring to the generator UI is explicitly deferred to Epic 4 per completion notes. — deferred, pre-existing scope boundary

---
**Story completion status:** done — Code review fixes applied (Node 20 for `npm test`)
