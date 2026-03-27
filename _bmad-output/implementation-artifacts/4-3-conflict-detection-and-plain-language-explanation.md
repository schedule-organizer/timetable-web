# Story 4.3: Conflict Detection & Plain-Language Explanation

Status: ready-for-dev

## Story

As a Timetabler,
I want the system to detect hard-constraint deadlocks and explain them in plain language,
So that I understand exactly what is causing the problem and know my options — with no dead ends.

## Acceptance Criteria

**Given** the generator cannot produce a valid schedule due to conflicting hard constraints
**When** the run completes
**Then** the GeneratorStatusBar shows a red "Failed" state with a link to the ConflictExplainer (UX-DR9)

**Given** I open the ConflictExplainer
**When** I view it
**Then** a full-panel screen (not a modal or toast) shows: a plain-language summary identifying the specific teacher(s), class(es), and slots in conflict; a miniature grid preview with affected slots highlighted red; and three action buttons: "Relax constraint", "Assign manually", "Edit source data" (UX-DR10)

**Given** the conflict explanation is displayed
**When** I read the summary
**Then** language is specific and human-readable (e.g., "Teacher A cannot cover Year 10B in any available slot because all valid windows overlap with their Forbidden Slot: Friday PM") — not a technical error code

**Given** multiple hard constraints are in conflict simultaneously
**When** the ConflictExplainer is shown
**Then** each conflict is listed separately with its own plain-language explanation and affected entities named

## Tasks / Subtasks

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 4 — API focus:** Engine: POST `/api/v1/engine/run`, GET `/api/v1/engine/jobs/{id}`, cancel job; WebSocket `/topic/solver/{jobId}/*`.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `4-2-constraint-satisfaction-report.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 4.3
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
