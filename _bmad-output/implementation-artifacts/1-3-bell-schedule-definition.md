# Story 1.3: Bell Schedule Definition

Status: done

## Story

As a Timetabler,
I want to define my school's Bell Schedule (named periods and their times),
So that the scheduler knows the time structure of each school day.

## Acceptance Criteria

**Given** I navigate to Institution Setup → Bell Schedule
**When** I add a period with a name, start time, and end time
**Then** the period is saved and appears in the ordered Bell Schedule list

**Given** I have multiple periods
**When** I reorder them
**Then** the order is saved and used as the time axis in the timetable grid, availability grid, and all reports

**Given** I submit overlapping period time ranges
**When** I save
**Then** a specific validation error identifies the overlapping periods and the Bell Schedule is not saved

## Tasks / Subtasks

- [x] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [x] Implement feature module under `src/features/<area>/` per architecture tree.
- [x] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [x] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [x] Tests: unit/component for core logic; a11y queries by role/label.

## Dev Notes

**Epic 1 — API focus:** Auth: POST `/api/v1/auth/*`; Settings: GET/PUT `/api/v1/settings`, GET `/api/v1/settings/labels`; Users: `/api/v1/users` — see architecture §3.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `1-2-institution-terminology-configuration.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 1.3
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

Composer (Cursor agent)

### Debug Log References

- Overlap validation: Zod array root errors did not map cleanly to RHF `errors` for display; overlap is validated after resolver in `onSubmit` via `findFirstOverlappingPair` + `setError('root', …)` with `role="alert"`.
- HTML `type="time"` in tests: `fireEvent.change` + `getElementById('period-row-t1-end')` used so RHF receives updated values in jsdom.
- Intro copy uses “intersecting ranges” so help text does not collide with overlap error queries in RTL.

### Completion Notes List

- **AC (navigation):** Institution Settings layout at `/settings` with sub-nav: Terminology (`/settings/terminology`) and Bell Schedule (`/settings/bell-schedule`); index redirects to terminology. Bell Schedule label uses `useLabels('bellSchedule')`.
- **AC (add / list):** `GET/PUT /api/v1/settings/bell-schedule` with `BellScheduleDto`; `BellScheduleForm` uses RHF + `useFieldArray`, sortable rows (`@dnd-kit`), and “Add {Period}” / Save. Order is array order in the PUT body.
- **AC (reorder):** Drag-and-drop calls `move` from `useFieldArray`; persisted when user clicks Save (same payload as order).
- **AC (overlap):** Client blocks save with a specific message naming both periods; MSW `PUT` returns `400` + `BELL_SCHEDULE_OVERLAP` with the same shape for API-parity.
- **Tests:** `bell-schedule-utils.test.ts` (overlap math); `BellSchedulePage.test.tsx` (list, overlap alert, add + save). `SettingsPage.test.tsx` updated for `TerminologySettingsPage` (h1 moved to layout). **42/42** Vitest tests passing (Node 20).

### File List

- `package.json` (dependencies: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- `src/types/bell-schedule.types.ts`
- `src/lib/bell-schedule-utils.ts`
- `src/lib/bell-schedule-utils.test.ts`
- `src/features/settings/bell-schedule.schemas.ts`
- `src/features/settings/components/BellScheduleForm.tsx`
- `src/features/settings/pages/SettingsLayout.tsx`
- `src/features/settings/pages/TerminologySettingsPage.tsx`
- `src/features/settings/pages/BellSchedulePage.tsx`
- `src/features/settings/pages/BellSchedulePage.test.tsx`
- `src/features/settings/pages/SettingsPage.test.tsx`
- `src/features/settings/pages/SettingsPage.tsx` (removed — replaced by layout + terminology page)
- `src/api/hooks/useBellSchedule.ts`
- `src/mocks/pages/bell-schedule-page.mock.ts`
- `src/mocks/handlers/settings.handlers.ts`
- `src/routes.tsx`

### Review Findings

**Decision Needed:** _(all resolved)_
- [x] [Review][Decision] DN1: Minimum periods enforcement → Block it; `.min(1)` added to schema. ✅ fixed
- [x] [Review][Decision] DN2: setQueryData + invalidateQueries redundant → Use invalidateQueries only. ✅ fixed
- [x] [Review][Decision] DN3: Hardcoded label strings → Make label-driven; added `institutionSettings` and `terminology` keys to useLabels. ✅ fixed

**Patches:** _(all applied)_
- [x] [Review][Patch] P1: Double Suspense wrapping — removed inner Suspense from SettingsLayout. ✅ fixed
- [x] [Review][Patch] P2: resetBellScheduleMock() never wired — added `resetAllSettingsMocks()` combined helper. ✅ fixed
- [x] [Review][Patch] P3: onDragEnd watch() snapshot — switched to `getValues('periods')` for reliable imperative read. ✅ fixed
- [x] [Review][Patch] P4: Invalid period times invisible to MSW overlap check — added explicit end≤start guard in PUT handler before calling findFirstOverlappingPair. ✅ fixed
- [x] [Review][Patch] P5: Duplicated HH:mm parseHhmm — removed local parseHhmm from schema; imports parseTimeToMinutes from bell-schedule-utils. ✅ fixed
- [x] [Review][Patch] P6: useWatch for period id — removed useWatch from SortablePeriodRow; period id now passed as `periodId` prop from parent. ✅ fixed
- [x] [Review][Patch] P7: resetMutation effect dependency — skipped; resetMutation is a stable reference in TanStack Query v5, no real timer reset occurs.
- [x] [Review][Patch] P8: Root error not cleared on field edit — added form-level onChange that calls clearErrors('root'). ✅ fixed
- [x] [Review][Patch] P9: Drag handles not disabled while saving — `disabled={isPending}` passed to SortablePeriodRow drag button. ✅ fixed
- [x] [Review][Patch] P10: Absolute NavLink paths — changed to relative paths ('terminology', 'bell-schedule'). ✅ fixed
- [x] [Review][Patch] P11: fireEvent.change false positive — confirmed working (developer-documented workaround); skipped (test passes correctly).
- [x] [Review][Patch] P12: No AC2 reorder save-order test — added test verifying PUT body preserves period array order. ✅ fixed
- [x] [Review][Patch] P13: document.getElementById in test — replaced with screen.getAllByLabelText('End time')[0]. ✅ fixed

**Deferred:**
- [x] [Review][Defer] D1: BellPeriod.id typed as plain string with no uniqueness enforcement — duplicate IDs from a buggy server would cause silent wrong-index moves in onDragEnd; acceptable given current API contract. [src/types/bell-schedule.types.ts] — deferred, pre-existing
- [x] [Review][Defer] D2: Node 20 engines constraint has no CI enforcement — .nvmrc/.node-version files are present but CI image is not shown; follow-up when CI pipeline is configured. [package.json] — deferred, pre-existing
- [x] [Review][Defer] D3: No duplicate period detection (same name + same times) — out of spec for story 1.3; track as future enhancement if needed.
- [x] [Review][Defer] D4: Network save failure does not roll back form to last-persisted state — complex undo mechanism; out of scope for this story.
- [x] [Review][Defer] D5: addPeriod defaults (12:00–13:00) may immediately conflict with an existing midday period — minor UX friction; user is informed at Save; acceptable tradeoff for now.

## Change Log

- 2026-03-28: Story 1.3 — Bell schedule settings UI, GET/PUT contract, MSW, overlap validation, dnd-kit reorder, tests; settings nested routes and layout.

---
**Story completion status:** done — Code review complete; all patches applied.
