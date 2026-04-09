# Deferred work

## Deferred from: code review of story 5-4-conflict-detection-on-manual-assignment.md (2026-04-01)

- Drag-and-drop `moveLesson` does not surface the SCHEDULING_CONFLICT popover; only slot sheet create/edit flows do. Revisit if product defines drag as manual assignment with the same conflict UX.

- ConflictExplainer flagging when the generator re-runs for lessons with `hasConflict` from manual “keep conflicting placement” is not wired on TimetablePage; depends on engine job output and explainer integration in a later epic/story.

## Deferred from: code review of 5-2-slot-pinning.md (2026-04-01)

- AC2 “re-run the generator” with pinned slots preserved: validated in MSW/mock only (`POST /api/v1/timetables/:id/regenerate-unpinned`); production engine integration and UI remain out of this story’s scope.

- NFR3 (pin state reflected within 500ms): not covered by automated tests or telemetry; add when performance NFRs are enforced app-wide.

- Pin/unpin mutation failures: React Query rolls back optimistic cache but no user-visible error toast; align with timetable error UX when that pattern exists.

## Deferred from: code review of 5-1-timetable-grid-view (2026-03-31)

- MOCK_TIMETABLE_ID import in TimetablePage — mock-first phase by design; address when real timetable selection flow is built in a future story.
- findLesson O(n) scan per cell — no indexed lookup; acceptable at current scale but will degrade with large lesson sets; consider a `Map<key, LessonDto>` pre-built in useMemo.
- subjectColorHex accepts any string, no hex format validation — add `z.string().regex(/^#[0-9a-fA-F]{3,6}$/)` when hardening schemas against the real API.
- setActiveTimetable race on re-mount — effect overwrites real timetableId with mock id if navigate-away-and-back before store hydrates; revisit when real timetable selection is wired.
- yearGroupParam persists in URL when switching to teacher/room pivot — stale filter silently reactivates on switch-back to class view; consider clearing param on view change.
- `sticky top-[29px]` hardcoded pixel height assumption for period header row — will break if day-group header height changes; use a CSS variable or measured ref.
- cellRefs Map may accumulate stale refs on view switch — low risk while React reconciler unmounts old cells; revisit if focus bugs surface.
- cycleDayIndex has no max bound in schema — lesson with out-of-range day index silently dropped by findLesson; add `.max(MAX_CYCLE_DAYS)` when domain constraint is finalised.
- Two lessons with same classId but different className — first-seen label wins silently; data integrity is API's responsibility but may warrant a warning.
- buildMockTimetableLessons called at module evaluation time — depends on peer mock module init order; safe today but fragile if mocks are reorganised.
- dayLabels empty strings cause blank day-group headers — depends on padDayLabels behaviour; verify when real cycle data is wired.
- Skeleton column count capped at 5 — minor layout shift when real grid has more columns; update cap to use actual column count when bell/cycle data is available.
- bell.periods empty array passes TimetablePage gate — `cycleLength > 0` does not guard against empty periods; add `bell.periods.length > 0` to the gate condition.

## Deferred from: code review of 5-1-timetable-grid-view (re-review, 2026-03-31)

- Pinned+focused cell double border — `outline` inline style (pin ring) and `focus-visible:ring` (box-shadow, focus indicator) coexist on pinned+focused `SlotCell`; produces two concentric blue frames; cosmetic only since both are same colour.
- `cycleLengthDays: 0` returned from API (not a fetch error) silently renders infinite skeleton with no error message; add an explicit data-validity check alongside the error check.
- Space key no AT feedback on empty cell — `e.preventDefault()` consumes the event (prevents scroll) but no announcement is made when Space is pressed on an empty gridcell; consider `aria-live` announcement.
- `buildClassRows` cross-year-group class deduplication — if a lesson's `classId` appears with two different `yearGroup` values in the API response, first-seen `yearGroup` wins as `groupLabel`; data integrity concern for the API.
- Fallback queryKey `['timetable', 'none', 'lessons']` is an inline literal — cannot be derived from `timetableQueryKeys`; any future cache invalidation by key construction will miss it.

## Deferred from: code review of 5-1-timetable-grid-view (round 3, 2026-03-31)

- `findLesson` drops the second lesson when two lessons share the same `(cycleDayIndex, periodId, classId/teacherId/roomId)` tuple — only the first matched lesson is rendered; the duplicate is invisible. Data-model question: multi-lesson-per-slot needs an API contract decision before a fix can be designed.
- Empty `subjectName` or `teacherName` (empty string passes `z.string()` schema) produces blank abbreviation/initials in MiniSlot; visible but uninformative. Add `.min(1)` to both schema fields when the API contract is finalised.
- Fallback queryKey `['timetable', 'none', 'lessons']` in `useTimetableLessons` collides with a real timetable whose ID is the literal string `"none"`. Unlikely in practice; fix by using a null-safe key (e.g. `['timetable', null, 'lessons']`) when cleaning up the mock-first phase.

## Deferred from: code review of 4-4-constraint-sensitivity-adjustment.md (2026-03-31)

- `onRelaxConstraint` silently does nothing if the conflict id is not found on the current job (stale client / race). Low probability while ConflictExplainer and job are in sync; consider user-visible feedback if this surfaces in support.

- SensitivityPanel: focus is moved to Cancel on open but focus is not restored to the control that opened the panel after close — same class of deferred modal polish as other domain modals.

## Deferred from: code review of 4-2-constraint-satisfaction-report.md (2026-03-31)

- Custom modal (`ConstraintSatisfactionSummary`) lacks focus trap / focus containment beyond initial focus on close — acceptable for now; revisit if WCAG dialog requirements apply to this surface.

- No client-side validation that aggregate soft counts (`softFullySatisfied`, etc.) match `softPreferences` length — rely on API contract or add Zod refinements when backend is fixed.

## Deferred from: code review of 4-1-schedule-generator-run.md (2026-03-31)

- Cancel run UX (`DELETE /api/v1/engine/jobs/{id}`, UI control): explicitly deferred out of 4.1; implement when a story owns long-running job cancellation. `useCancelEngineJob` may stay as a hook for that work.

- NFR1 (draft timetable visible within 30 seconds at scale): not validated in frontend tests or telemetry; address with real API, profiling, or E2E when the engine is integrated.

- Full-page MSW integration test for the engine flow: deferred until Vitest/MSW/axios interaction is reliable in this repo (per story completion notes).

- Minor UX: clearing `jobId` before starting a new run may flash the status bar through a short idle state; polish if user feedback warrants it.

- Engine page: no dedicated handling when draft/job queries or the run mutation error (including Zod parse failures on unexpected API shapes); user may see an idle or empty workspace. Address when hardening against the real API.

## Deferred from: code review of 3-3-subject-level-scheduling-rules.md (2026-03-30)

- AC2/AC3 generator conflict and satisfaction reporting are only partly representable in the web app — hard-rule violation reports and live satisfaction rates depend on the generator/backend; this story covers rule CRUD and displaying `satisfactionRate` when present.

## Deferred from: code review of 2-6-teacher-self-profile-management.md (2026-03-29)

- No TEACHER-only route wrapper for `/profile`: consistent with auth-only `ProtectedRoute` across the app; API enforces `/me` permissions.

- AC3 test could assert the forbidden message string from `getApiErrorMessage`; low priority polish.

## Deferred from: code review of 2-5-room-management.md (2026-03-29)

- AC3 “scheduled slots flagged”: MSW does not model slot entities or flagging; success copy matches product intent — verify with real API and integration tests when scheduling data exists.

## Deferred from: code review of 2-2-bulk-teacher-import-via-csv.md (2026-03-29) follow-up

- CSV files saved in a legacy encoding (not UTF-8) may mis-parse; document “UTF-8 only” in UI or add detection when product requires it.

- Import preview `<table>` could use a `<caption>` for screen readers; optional a11y polish.

## Deferred from: code review of 2-1-teacher-management-manual-entry.md (2026-03-29)

- No dedicated Vitest case for `GET /api/v1/teachers` failure on the manual roster (error banner path); add when stabilizing error UX or E2E.

## Deferred from: code review of 1-7-role-management-rbac-and-subscription-tier-limits.md (2026-03-28)

- Cross-tenant isolation and 403 responses (FR37): frontend mocks and client checks are supplementary; full enforcement belongs to the API — confirm with contract/integration tests when the real backend is wired.

## Deferred from: code review of 1-6-teacher-invitation-and-magic-link-onboarding.md (2026-03-28)

- AC1: Per-teacher email delivery and message content are backend/email-system concerns; the web app posts invitations and shows success. Confirm end-to-end when the real API and mailer exist.

- MSW `POST /api/v1/auth/magic-link/complete` could use `magicLinkCompleteRequestSchema` for parity with production validation and with `POST /api/v1/invitations`; low priority for local mocks.

## Deferred from: code review of 1-4-cycle-and-academic-term-configuration.md (2026-03-28)

- Schedule generator acceptance criterion (use active term date range + cycle when generator runs) — UI wiring belongs to Epic 4; pure helpers are in place per story notes.

## Deferred from: code review of 1-3-bell-schedule-definition.md (2026-03-28)

- D1: BellPeriod.id typed as plain string with no uniqueness enforcement — duplicate IDs from a buggy server would cause silent wrong-index moves in onDragEnd; acceptable given current API contract. Track when API contract is formalised.
- D2: Node 20 engines constraint has no CI enforcement — .nvmrc/.node-version present but CI image not configured; follow up when CI pipeline is set up.
- D3: No duplicate period detection (same name + same times) — out of spec for story 1.3; consider as future enhancement in the bell schedule refinement story.
- D4: Network save failure does not roll back form to last-persisted state — complex optimistic-update/undo mechanism; out of scope for this story.
- D5: addPeriod defaults (12:00–13:00) may immediately conflict with an existing midday period — minor UX friction; user is informed at Save; revisit if UX research flags it.

## Deferred from: code review of 1-2-institution-terminology-configuration.md (2026-03-28)

- AC2 multi-user / cross-tab terminology sync depends on backend or client polling beyond single-tab Zustand + React Query; track when real API and collaboration requirements land.

- Vitest/Vite require a modern Node (≥18); enforce via `engines` / CI image / `.nvmrc` so contributors do not hit `crypto.getRandomValues` startup errors.

## Deferred from: code review of 1-1-institution-registration-and-application-shell.md (2026-03-28)

- [x] [Review][Defer] MSW dev bypass — `worker.start({ onUnhandledRequest: 'bypass' })` in `src/main.tsx` can send unmatched paths to the real network when `VITE_API_BASE_URL` points at a backend; stricter `warn`/`error` or path-scoped handlers reduce surprise during integration. — deferred, pre-existing

- [x] [Review][Defer] Password hashing, 24h session inactivity (NFR7/NFR9) — enforced on backend; frontend cannot satisfy alone; track in backend repo / integration tests. — deferred, pre-existing

- [x] [Review][Defer] Same email registering a second institution (AC) — isolation and duplicate-policy are backend concerns; MSW always mints a new user. Confirm with API contract tests when backend exists. — deferred, pre-existing

## Deferred from: code review of 5-3-manual-slot-assignment.md (2026-04-01)

- Optimistic `useUpdateLesson` applies `{ ...l, ...patch } as LessonDto` — denormalized display fields can be wrong until refetch; same class of risk as other optimistic merges.

- `moveLessonInMock` swaps with an occupied target without checking whether the target lesson is pinned — may diverge from future backend rules.

- NFR3 (500ms) is not asserted in tests or telemetry — align when NFRs are enforced app-wide.

- Drag-and-drop move has no keyboard-only equivalent — broader a11y pass.

## Deferred from: code review of 5-5-partial-re-generation-on-unpinned-slots.md (2026-04-01)

- Success path satisfaction data uses static `MOCK_CONSTRAINT_REPORT` from mocks — not derived from post-regen lesson set; acceptable until real engine returns live reports.

- `timetable-page.mock.ts` imports `MOCK_CONSTRAINT_REPORT` from `engine.handlers` — cross-module mock coupling; revisit if handlers and page mocks are reorganised.
