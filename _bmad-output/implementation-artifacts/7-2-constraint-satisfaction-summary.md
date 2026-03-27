# Story 7.2: Constraint Satisfaction Summary

Status: ready-for-dev

## Story

As a Timetabler,
I want to view a detailed constraint satisfaction summary after each generator run,
So that I can audit which soft preferences were honoured, partially met, or skipped and guide my next refinement.

## Acceptance Criteria

**Given** the generator has completed a run (full or partial)
**When** I open the Constraint Satisfaction Summary
**Then** I see every soft preference listed with: preference description, assigned weight, and satisfaction status (Fully Satisfied / Partially Satisfied / Not Satisfied)

**Given** a soft preference was not satisfied
**When** I view its row
**Then** the reason is shown (e.g., "Could not avoid Monday morning for Teacher B — no valid alternative slot available given hard constraints")

**Given** the summary is shown after a partial re-run
**When** I view it
**Then** the summary reflects the combined state of the full schedule — both pinned and newly generated slots — not just the re-run portion

**Given** I view run history
**When** multiple generator runs have been performed
**Then** each run is listed with its overall satisfaction percentage and timestamp; I can expand any run to see its full summary

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
Build on patterns from `7-1-workload-report.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 7.2
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
