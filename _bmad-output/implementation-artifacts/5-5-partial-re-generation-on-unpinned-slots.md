# Story 5.5: Partial Re-Generation on Unpinned Slots

Status: ready-for-dev

## Story

As a Timetabler,
I want to re-run the generator on only the unpinned slots,
So that I can iterate on the schedule without losing the parts I've already approved.

## Acceptance Criteria

**Given** I have a mix of pinned and unpinned slots and click "Re-run unpinned"
**When** the generator runs
**Then** all pinned and manually assigned slots remain exactly as-is throughout; only unpinned slots are filled

**Given** the partial re-run completes successfully
**When** the result is shown
**Then** the grid updates with new assignments in previously unpinned slots; the satisfaction banner reflects the full schedule including pinned slots

**Given** the partial re-run cannot produce a valid result for the unpinned slots
**When** the run completes
**Then** the ConflictExplainer is shown scoped to the unsatisfied unpinned portion only

**Given** all slots are pinned
**When** I view the GeneratorStatusBar
**Then** the "Re-run unpinned" button is disabled with tooltip: "All slots are pinned — unpin slots to re-run"

---

## Epic 6: Timetable Publishing & Personal Views

A Timetabler can publish the finished timetable with email notifications to teachers; teachers can view their personal schedule and the full school grid in read-only mode; PDF export is available.

**FRs covered:** FR27, FR28, FR29, FR30, FR32
**Deferred:** FR31 (student personal timetable view — out of scope)

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
Build on patterns from `5-4-conflict-detection-on-manual-assignment.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 5.5
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
