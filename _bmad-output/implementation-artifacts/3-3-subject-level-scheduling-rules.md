# Story 3.3: Subject-Level Scheduling Rules

Status: ready-for-dev

## Story

As a Timetabler,
I want to define rules about how subjects are distributed across the cycle (e.g., max one high-difficulty subject per day per class),
So that student workload is balanced and fairness rules are enforced automatically.

## Acceptance Criteria

**Given** I navigate to Constraints → Subject Rules and create a rule (e.g., "Maximum 1 High-difficulty subject per class per cycle day")
**When** saved
**Then** the rule is applied by the generator as either a hard or soft constraint (configurable per rule)

**Given** a subject rule is set as a hard constraint and the generator runs
**Then** no generated arrangement violates the rule; violations cause a conflict report

**Given** a subject rule is set as a soft constraint with a weight and the generator runs
**Then** the rule is satisfied as best as possible; the satisfaction report shows the satisfaction rate per subject rule

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
Build on patterns from `3-2-soft-preference-configuration-with-weights.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 3.3
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
