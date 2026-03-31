# Story 4.1: Schedule Generator Run

Status: done

## Story

As a Timetabler,
I want to run the schedule generator for a term,
So that a complete draft timetable is produced automatically from my configured constraints and data.

## Acceptance Criteria

**Given** I have at least one teacher, class, subject, room, Bell Schedule, Cycle, and active Term configured
**When** I click "Generate"
**Then** the generator runs and produces a complete draft timetable for the active term

**Given** the generator is running
**When** I view the workspace
**Then** the GeneratorStatusBar shows a spinner with real-time status text (e.g., "Placing 340 lessons…"); the rest of the UI remains interactive (UX-DR9)

**Given** the generator completes successfully
**When** the result is returned
**Then** the status bar transitions to green "Done"; the timetable grid is populated with the generated schedule within 30 seconds for up to 100 teachers, 60 classes, 5-day cycle (NFR1)

**Given** the generator runs a second time on the same term
**When** it completes
**Then** the previous draft is replaced with the new result; no previously generated data persists unless explicitly pinned

## Tasks / Subtasks

- [x] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [x] Implement feature module under `src/features/<area>/` per architecture tree.
- [x] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [x] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [x] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 4 — API focus:** Engine: POST `/api/v1/engine/run`, GET `/api/v1/engine/jobs/{id}`, cancel job; WebSocket `/topic/solver/{jobId}/*`.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `3-5-timetabler-availability-overview-and-override.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 4.1
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Debug Log References

### Completion Notes List

- Implemented **engine** API surface: `POST /api/v1/engine/run`, `GET/DELETE /api/v1/engine/jobs/:id`, `GET /api/v1/timetable/draft` with Zod-backed DTOs (`engine.*`, `timetable-draft.*`).
- **MSW** (`engine.handlers.ts`) simulates job polling (progress messages including “Placing 340 lessons…”), success with `DraftScheduleDto`, and per-term draft replacement on re-run.
- **Engine** page (`/engine`): prerequisite checks, Generate, `GeneratorStatusBar` (non-blocking strip), `DraftTimetablePreview` grid for the active calendar term.
- React Query: `useRunEngine`, `useEngineJob` (poll while queued/running), `useDraftSchedule`, `useSyncDraftFromEngineJob` (cache sync from job result).
- `useGeneratorPrerequisites` resolves the active term from academic terms API (no separate term id in Zustand until a term picker exists).
- Tests: `generator-status-bar.test.tsx`, `draft-timetable-preview.test.tsx` (RTL by role/label). Full-page MSW integration test was not reliable in this repo’s Vitest/MSW + axios stack; behaviour is covered by MSW handlers + unit tests.
- **Revision (2026-03-31):** `useEngine` parses GET draft, GET job, and POST run responses with `draftScheduleSchema`, `engineJobDtoSchema`, and `engineRunResponseSchema` (aligned with `useTemplates`). Removed unused `activeTermId` / `setActiveTermId` from `timetableStore` until a real caller (e.g. term picker) exists.

### File List

- `src/types/timetable-draft.schemas.ts`
- `src/types/timetable-draft.types.ts`
- `src/types/engine.schemas.ts`
- `src/types/engine.types.ts`
- `src/api/hooks/useEngine.ts`
- `src/api/hooks/useGeneratorPrerequisites.ts`
- `src/mocks/handlers/engine.handlers.ts`
- `src/mocks/handlers/index.ts`
- `src/features/engine/pages/EnginePage.tsx`
- `src/components/domain/generator-status-bar.tsx`
- `src/components/domain/generator-status-bar.test.tsx`
- `src/components/domain/generator-status-bar.stories.tsx`
- `src/components/domain/draft-timetable-preview.tsx`
- `src/components/domain/draft-timetable-preview.test.tsx`
- `src/components/domain/draft-timetable-preview.stories.tsx`
- `src/store/timetableStore.ts`
- `src/routes.tsx`

## Change Log

- 2026-03-30: Story 4.1 — schedule generator run, draft timetable preview, MSW engine/draft handlers.
- 2026-03-31: Revision — Zod parse on engine/draft API responses in `useEngine.ts`; removed unused term id fields from `timetableStore`.

### Review Findings

- [x] [Review][Defer] Cancel run UX — Deferred by product/reviewer: not in Story 4.1 scope. `DELETE /api/v1/engine/jobs/{id}` and `useCancelEngineJob` remain available for a future story; Engine page has no cancel control for now.

- [x] [Review][Decision] `setActiveTermId` on timetable store — **Resolved:** Removed `activeTermId` and `setActiveTermId` from `timetableStore` until a term picker or other feature needs them; active term continues to come from `useGeneratorPrerequisites` / `getActiveTerm`.

- [x] [Review][Patch] Validate engine and draft API responses with Zod in `useEngine.ts` — **Resolved:** `useDraftSchedule`, `useEngineJob`, and `useRunEngine` now `.parse(res.data)` with `draftScheduleSchema`, `engineJobDtoSchema`, and `engineRunResponseSchema`.

- [x] [Review][Defer] NFR1 (draft visible within 30 seconds for large org sizes) — Not measured or covered by automated perf checks; revisit with real backend or E2E when available.

- [x] [Review][Defer] Full-page MSW integration test gap — Already noted in completion notes; risk accepted until the Vitest/MSW/axios stack is stabilized.

- [x] [Review][Defer] Possible brief status bar idle flicker when starting a new run — `onGenerate` sets `jobId` to `null` before the new `jobId` returns; low-impact UX polish.

#### Code review follow-up (2026-03-31)

- [x] [Review][Defer] Engine page error visibility — `useEngineJob`, `useDraftSchedule`, and `useRunEngine` can land in error state (network failure or Zod parse rejection); `EnginePage` does not read `isError` / mutation error, so the user may see an idle or empty grid with no explanation. Consider surfacing errors in the status strip or inline when tightening production hardening.

---
**Story completion status:** done
