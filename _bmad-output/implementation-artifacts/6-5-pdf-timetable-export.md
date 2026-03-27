# Story 6.5: PDF Timetable Export

Status: ready-for-dev

## Story

As a Timetabler,
I want to export the timetable as a PDF,
So that I can distribute printed copies or archive the schedule outside SchediFlow.

## Acceptance Criteria

**Given** I have a published or draft timetable and click "Export PDF"
**When** the PDF is generated
**Then** the download begins automatically; the PDF contains institution name, term name, generation date, and the full grid with subjects, teachers, rooms, and periods legibly rendered

**Given** PDF generation takes more than 1 second
**When** processing
**Then** a loading indicator is shown; on completion a toast appears ("PDF ready — downloading") (UX-DR20)

---

## Epic 7: Reporting & Workload Visibility

A Principal or Timetabler can view a workload report showing total periods per teacher, free period distribution, and preference satisfaction rate — and the timetabler can see the constraint satisfaction summary after each generator run.

**FRs covered:** FR39, FR40

## Tasks / Subtasks

- [ ] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [ ] Implement feature module under `src/features/<area>/` per architecture tree.
- [ ] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [ ] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [ ] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 6 — API focus:** Publish POST `/api/v1/timetables/{id}/publish`; export PDF GET `/api/v1/timetables/{id}/export/pdf`; notifications patterns per UX.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `6-4-teacher-full-school-read-only-grid-view.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 6.5
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
