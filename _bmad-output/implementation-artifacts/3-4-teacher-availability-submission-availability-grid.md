# Story 3.4: Teacher Availability Submission (Availability Grid)

Status: ready-for-dev

## Story

As a Teacher,
I want to declare my availability by marking slots as unavailable or preferred in a weekly grid,
So that the scheduler respects my working constraints and preferences.

## Acceptance Criteria

**Given** I navigate to My Availability
**When** I view the grid
**Then** I see a weekly grid using my institution's Bell Schedule periods and cycle days; each cell defaults to Available

**Given** I tap or click a slot
**When** toggled
**Then** the slot cycles through three states: Available (white) → Unavailable/Forbidden (red) → Preferred (green) → Available; the change is visually immediate with no confirmation dialog (UX-DR8)

**Given** I am on a mobile device (<768px)
**When** interacting with the grid
**Then** all cells have a minimum 44×44px touch target; I can swipe to mark a full row

**Given** I click "Mark all as available"
**When** confirmed
**Then** all slots reset to Available state in one action

**Given** I submit my availability
**When** submission succeeds
**Then** a confirmation screen shows a summary of my declared unavailable and preferred slots

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
Build on patterns from `3-3-subject-level-scheduling-rules.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 3.4
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
