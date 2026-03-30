# Story 3.5: Timetabler Availability Overview & Override

Status: done

## Story

As a Timetabler,
I want to view all teacher availability declarations and override individual entries when needed,
So that I have full visibility and control over the data the generator uses.

## Acceptance Criteria

**Given** I navigate to a specific teacher's Availability tab
**When** I view it
**Then** I see their submitted grid showing all forbidden and preferred slots

**Given** I navigate to Constraints → Availability Overview
**When** I view the overview
**Then** I see all teachers' availability consolidated, filterable by teacher and by slot state (forbidden / preferred / not submitted)

**Given** I override a specific teacher's slot (e.g., changing preferred to forbidden) and save
**Then** the generator uses the overridden value; the teacher's original submission is preserved and the override is visually indicated

**Given** a teacher has not yet submitted their availability
**When** I view the overview
**Then** that teacher is flagged as "Not submitted"

---

## Epic 4: Schedule Generation Engine

A Timetabler can run the constraint-based generator to produce a complete draft timetable, see a plain-language constraint satisfaction report, understand exactly which constraints caused a deadlock, and adjust sensitivity (downgrade hard → soft at runtime) to reach a valid schedule.

**FRs covered:** FR17, FR18, FR19, FR20

## Tasks / Subtasks

- [x] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [x] Implement feature module under `src/features/<area>/` per architecture tree.
- [x] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [x] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [x] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 3 — API focus:** Constraints, forbidden slots, availability: `/api/v1/forbidden-slots`, teacher availability GET/PUT `/api/v1/teachers/{id}/availability`, teaching-groups, option-blocks per architecture.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `3-4-teacher-availability-submission-availability-grid.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 3.5
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Added `TeacherAvailabilityOverrideDto` and `TeacherAvailabilitySummaryItem` types + Zod schemas (`src/types/teacher-availability-override.*`).
- Extended MSW teacher handlers with:
  - `GET /api/v1/teachers/availability-summary` — returns per-teacher submitted/count summary; seeded Alice Chen with mock availability.
  - `GET /api/v1/teachers/:id/availability/override` and `PUT /api/v1/teachers/:id/availability/override` — persists timetabler overrides separately from teacher submissions.
- Added `useAvailabilityOverview.ts` hooks: `useAvailabilitySummary`, `useTeacherAvailabilityOverride`, `useUpdateTeacherAvailabilityOverride`; PUT success invalidates the summary query.
- Extended `AvailabilityGrid` with optional `overriddenKeys?: Set<string>` prop; cells in this set render a blue dot indicator and include "overridden" in their `aria-label`.
- Implemented `AvailabilityOverviewPage` at `/constraints/availability-overview` (tab in ConstraintsLayout): filterable table (by teacher name + slot state: all / forbidden / preferred / not-submitted), "Submitted"/"Not submitted" badges, override counts with blue dot.
- `TeacherAvailabilityDialog` (inline in page file): fetches original availability + existing overrides, initialises editable grid with effective state (original + overrides applied), computes `overriddenKeys` as diff vs original, saves only changed slots as override payload on PUT.
- Added `availability-overview` child route under `/constraints` in `routes.tsx`; added "Availability overview" tab to `ConstraintsLayout`.
- 17 unit/component tests in `AvailabilityOverviewPage.test.tsx` covering table render, filter, not-submitted badge, dialog open/close, save override mutation payload, override count indicator, and loading state.

### File List

- `src/types/teacher-availability-override.schemas.ts`
- `src/types/teacher-availability-override.types.ts`
- `src/api/hooks/useAvailabilityOverview.ts`
- `src/components/domain/availability-grid.tsx`
- `src/features/constraints/pages/AvailabilityOverviewPage.tsx`
- `src/features/constraints/pages/AvailabilityOverviewPage.test.tsx`
- `src/features/constraints/pages/ConstraintsLayout.tsx`
- `src/mocks/handlers/teacher.handlers.ts`
- `src/routes.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- Story 3.5 implemented: Timetabler Availability Overview & Override (Date: 2026-03-30)

---
**Story completion status:** review — Implementation complete; all tasks done, 17 new tests pass, no regressions in related test files.
