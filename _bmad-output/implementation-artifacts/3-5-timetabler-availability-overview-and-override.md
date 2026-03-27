# Story 3.5: Timetabler Availability Overview & Override

Status: ready-for-dev

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

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

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

_(filled by dev agent)_

### Debug Log References

### Completion Notes List

### File List

---
**Story completion status:** ready-for-dev — Batch story context generated from epics.md
