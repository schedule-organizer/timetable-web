# Story 5.1: Timetable Grid View

Status: ready-for-dev

## Story

As a Timetabler,
I want to view the generated schedule in an interactive grid layout,
So that I can see the full school timetable at a glance and navigate it efficiently.

## Acceptance Criteria

**Given** a schedule has been generated
**When** I view the workspace
**Then** the TimetableGrid renders with rows = classes (grouped by year group), columns = cycle days × Bell Schedule periods; each filled slot shows a MiniSlot with subject colour bar, subject abbreviation, teacher initials, and room label (UX-DR5, UX-DR7)

**Given** I select a view pivot from the toolbar
**When** switching between Full School, By Teacher, and By Room
**Then** the same grid re-renders with the new pivot without leaving the workspace

**Given** I use a year-group filter tab above the grid
**When** I select a year group
**Then** only that year group's rows are shown; the filter state is reflected in the URL (UX-DR15)

**Given** the grid is loading
**When** data is being fetched
**Then** a skeleton shimmer is shown for 6 rows; the grid renders within 2 seconds (NFR2, UX-DR22)

**Given** I navigate the grid by keyboard
**When** I use arrow keys
**Then** focus moves cell by cell; Space pins/unpins, Enter opens the slot edit Sheet, Escape deselects (NFR15, UX-DR16)

**Given** I view a slot cell with a screen reader
**Then** each cell announces class, day, period, subject, and teacher; empty cells announce "Empty"; the grid has `role="grid"` with `aria-rowcount` and `aria-colcount` (NFR16, UX-DR18)

**Given** conflict and pinned states are shown
**Then** conflict cells show a red top border AND a text/icon indicator; pinned slots show a ring AND a pin icon — colour is never the sole differentiator (NFR17, UX-DR19)

## Tasks / Subtasks

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 5 — API focus:** Timetable: GET `/api/v1/timetables/{id}/lessons`, PATCH `/api/v1/lessons/{id}`, POST/DELETE pin, swap; WS `/topic/timetable/{timetableId}`.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `4-4-constraint-sensitivity-adjustment.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 5.1
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
