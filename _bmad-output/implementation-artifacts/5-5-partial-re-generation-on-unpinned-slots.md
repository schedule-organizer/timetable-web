# Story 5.5: Partial Re-Generation on Unpinned Slots

Status: done

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

- [x] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [x] Implement feature module under `src/features/<area>/` per architecture tree.
- [x] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [x] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [x] Tests: unit/component for core logic; a11y queries by role/label.

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

Composer (dev-story workflow)

### Debug Log References

### Completion Notes List

- **Contract:** `POST /api/v1/timetables/{id}/regenerate-unpinned` — **200** `{ satisfactionReport }` (full timetable including pinned); **422** `details.conflictReport` (unpinned-scoped); **404** unknown id. `regenerateUnpinnedSuccessResponseSchema` / `partialRegenUnsatisfiedDetailsSchema` in `timetable.schemas.ts`; `useRegenerateUnpinned` invalidates `timetableQueryKeys.lessons`.
- **MSW:** `regenerateUnpinnedMockLessons()` returns `MOCK_CONSTRAINT_REPORT` (full-schedule satisfaction); failure path builds `buildMockPartialRegenFailureReport()` (unpinned-scoped conflict).
- **UI:** `TimetablePage` — `GeneratorStatusBar` + `primaryAction` “Re-run unpinned”; disabled + `title` when `countUnpinnedSlotsForSolver === 0`; `SatisfactionBanner` + `ConstraintSatisfactionSummary` on success; `ConflictExplainer` replaces grid on 422 with scoped report; `parsePartialRegenUnsatisfiedDetails` for errors.
- **Tests:** `generator-status-bar.test.tsx` (primary action), `timetable-regenerate.test.ts`, `TimetablePage.test.tsx` mock extended; mock tests reset `setRegenerateUnpinnedMockMode('success')`.

### File List

- `src/types/timetable.schemas.ts`
- `src/types/timetable.types.ts`
- `src/api/hooks/useTimetable.ts`
- `src/lib/timetable-regenerate.ts`
- `src/lib/timetable-regenerate.test.ts`
- `src/mocks/pages/timetable-page.mock.ts`
- `src/mocks/handlers/timetable.handlers.ts`
- `src/mocks/pages/timetable-page.mock.test.ts`
- `src/components/domain/generator-status-bar.tsx`
- `src/components/domain/generator-status-bar.test.tsx`
- `src/features/timetable/pages/TimetablePage.tsx`
- `src/features/timetable/pages/TimetablePage.test.tsx`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/implementation-artifacts/5-5-partial-re-generation-on-unpinned-slots.md`

### Change Log

- 2026-04-01: Story 5.5 — partial re-generation on unpinned slots (POST contract, MSW, TimetablePage UI, satisfaction banner, ConflictExplainer on failure, tests).
- 2026-04-01: Code review follow-up — generic parse error in `useRegenerateUnpinned`, busy-state `disabledTooltip` on partial regen button, TimetablePage RTL tests for success / 422 / pending / cooldown.

### Review Findings

- [x] [Review][Patch] Mutation parse failures should not expose Zod internals in `Error.message` — use a generic client-side message for `safeParse` failures in `useRegenerateUnpinned` [`src/api/hooks/useTimetable.ts`] — fixed

- [x] [Review][Patch] Primary action is disabled while pending or in the post-success cooldown (`busy`) but `disabledTooltip` is only set when all slots are pinned — add a short `title` (or Tooltip) when disabled for busy state for keyboard/screen-reader clarity [`src/features/timetable/pages/TimetablePage.tsx`] — fixed (native `title` for pending + post-success cooldown)

- [x] [Review][Patch] `TimetablePage` tests only stub `useRegenerateUnpinned`; add RTL coverage for the partial-regen flow (success banner, 422 + ConflictExplainer, or MSW-backed integration) to match story testing intent [`src/features/timetable/pages/TimetablePage.test.tsx`] — fixed

- [x] [Review][Defer] Success path satisfaction data uses static `MOCK_CONSTRAINT_REPORT` from mocks — not derived from post-regen lesson set; acceptable for mock phase [`src/mocks/pages/timetable-page.mock.ts`] — deferred, pre-existing mock limitation

- [x] [Review][Defer] `timetable-page.mock.ts` imports `MOCK_CONSTRAINT_REPORT` from `engine.handlers` — cross-module mock coupling; revisit if handlers and page mocks are split [`src/mocks/pages/timetable-page.mock.ts`] — deferred, pre-existing

---
**Story completion status:** done — Review patches applied
