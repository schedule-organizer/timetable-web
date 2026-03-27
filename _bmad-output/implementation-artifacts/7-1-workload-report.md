# Story 7.1: Workload Report

Status: ready-for-dev

## Story

As a Principal or Timetabler,
I want to view a workload report showing each teacher's period count, free periods, and preference satisfaction rate,
So that I can verify the timetable is fair and flag any issues before it is finalised.

## Acceptance Criteria

**Given** a timetable has been published or is in draft state
**When** I navigate to Reports → Workload
**Then** I see a report listing every teacher with: total periods assigned, free period count, and preference satisfaction percentage

**Given** I view the report in compact mode
**When** each teacher row is rendered
**Then** it shows avatar, teacher name, total periods badge, free periods badge, and a preference satisfaction % bar in a 40px compact row (UX-DR12)

**Given** I expand a teacher's row
**When** the expanded view is shown
**Then** I see a day-by-day breakdown of periods assigned and free slots for that teacher

**Given** a teacher's assigned period count exceeds their contracted hours (if set)
**When** I view the report
**Then** that teacher's row is visually flagged with an amber warning indicator

**Given** I am logged in as a Principal and view the report
**When** I click the "Flag" button on a teacher row
**Then** a comment is sent as a notification to the Timetabler (UX-DR12)

**Given** no timetable has been published
**When** I navigate to the workload report
**Then** an empty state reads "Publish a timetable to see workload data."

## Tasks / Subtasks

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 7 — API focus:** Reporting endpoints per backend (workload, constraint summary) — align with PRD FR39–FR40 when wiring.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `6-5-pdf-timetable-export.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 7.1
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
