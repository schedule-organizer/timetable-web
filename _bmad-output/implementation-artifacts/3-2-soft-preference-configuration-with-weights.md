# Story 3.2: Soft Preference Configuration with Weights

Status: ready-for-dev

## Story

As a Timetabler,
I want to define soft preferences with configurable weights,
So that the scheduler balances preferences proportionally rather than treating them as binary pass/fail.

## Acceptance Criteria

**Given** I add a soft preference (e.g., "Teacher A prefers Fridays free") and set a weight (1–10)
**When** saved
**Then** the preference is stored with its weight and the generator attempts to honour it proportionally across all soft preferences

**Given** two soft preferences exist with different weights (e.g., 8 and 3) and the generator cannot satisfy both
**Then** the higher-weighted preference is prioritised; the satisfaction report reflects which were fully, partially, or not satisfied

**Given** I update a preference's weight and re-run the generator
**Then** the new weight is used and the satisfaction report reflects the updated prioritisation

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
Build on patterns from `3-1-hard-constraint-definition.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 3.2
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
