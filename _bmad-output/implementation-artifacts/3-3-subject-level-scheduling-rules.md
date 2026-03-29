# Story 3.3: Subject-Level Scheduling Rules

Status: done

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

- [x] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [x] Implement feature module under `src/features/<area>/` per architecture tree.
- [x] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [x] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [x] Tests: unit/component for core logic; a11y queries by role/label.

### Review Follow-ups (AI)

- [x] [AI-Review][Stale] Subject rules workflow is missing from the Constraints shell — already implemented
- [x] [AI-Review][Stale] Subject rule conflict reports and satisfaction rates have no backing UI — already implemented in SubjectRulesPage
- [x] [AI-Review][Stale] Story 3.3 still claims completion without subject-rule feature — already implemented
- [x] [AI-Review] Teacher roster fetch errors look identical to the empty state — fixed: empty state gated by `!rosterError`
- [x] [AI-Review] Import flow can run before roster emails finish loading — fixed: CSV input disabled while `isRosterLoading`
- [x] [AI-Review] Deleting the signed-in teacher is allowed — fixed: delete button disabled when `currentUser?.email === teacher.email`
- [x] [AI-Review] `TeacherForm` never resets when `initialValues` change — fixed: added `useEffect` with `reset(initialValues)`
- [x] [AI-Review] CSV parser breaks quoted newline rows — fixed: replaced line-split with quote-aware `parseCsvRows()`
- [x] [AI-Review] Year-group filter reports "No classes yet" when classes exist outside filter — fixed: distinguishes empty-list vs filtered-out
- [x] [AI-Review] `bulkImportTeachersRequestSchema` referenced but never imported — fixed: added import
- [x] [AI-Review] `classFormSchema.name` lacks `.trim()` — fixed
- [x] [AI-Review] `teacherFormSchema` names lack `.trim()` — fixed
- [x] [AI-Review] `softPreferenceFormSchema.name` lacks `.trim()` — fixed
- [x] [AI-Review] Mobile nav slices `navItems` — fixed: scrollable mobile nav shows all items
- [x] [AI-Review] Teacher delete confirmation uses `role="alert"` without modal trapping — fixed: proper `role="dialog"` modal with backdrop and Escape
- [x] [AI-Review] Hard constraint delete dialogs lack backdrop and Escape handling — fixed: full-screen modal with backdrop
- [x] [AI-Review] Room delete dialogs lack backdrop and Escape handling — fixed: full-screen modal with backdrop
- [x] [AI-Review] `HeadersPolyfill.append()` overwrites previous values — fixed: combines values with `, ` separator
- [x] [AI-Review] `RequestPolyfill` accepts only strings — fixed: constructor now accepts `string | RequestPolyfill`

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

claude-sonnet-4-6

### Debug Log References

_(none)_

### Completion Notes List

- AC mapping: **Create/save** → `POST /api/v1/constraints/subject-rules` with name + constraintType ('hard'|'soft') + weight (1–10, soft only) + optional description + enabled. **Hard rules** always enforced by generator; **soft rules** have a weight for prioritisation. **Satisfaction report** → `satisfactionRate` (0–100) on DTO, surfaced in per-rule report panel on page.
- Delivered **Subject rules** tab in ConstraintsLayout; `SubjectRulesPage` with full CRUD (create/edit/delete) backed by MSW handlers and React Query (`SUBJECT_RULES_QUERY_KEY` invalidation on mutations).
- Contract: `GET/POST /api/v1/constraints/subject-rules`, `PATCH/DELETE /api/v1/constraints/subject-rules/:id`; paginated list envelope `{ content, page, size, … }`.
- `SubjectRuleForm` has a **hard/soft radio toggle**; weight slider only shown when soft is selected. Hard rules send `weight: undefined` to the API.
- Three mock fixtures seeded: 1 hard rule + 2 soft rules (weights 7 and 4) with satisfaction rates 85% and 60%.
- Satisfaction report panel shows per-rule rates with colour coding (green ≥ 80%, amber ≥ 40%, red < 40%).
- Vitest: `SubjectRulesPage.test.tsx` — 11 tests covering list, empty state, fetch error, mutation error, validation, create hard, create soft, edit, delete, satisfaction report visible, satisfaction report hidden. All 51 constraints + routes + class + room tests pass; zero regressions.
- TypeScript strict mode: zero errors.
- **Review revision (2026-03-30):** Addressed all 16 real review findings: schema `.trim()` additions, `bulkImportTeachersRequestSchema` import fix, polyfill `append()`/`RequestPolyfill` fixes, mobile nav scrollable (all items accessible), CSV parser handles quoted newlines, year-group filter distinguishes empty vs filtered, teacher/hard-constraint/room delete modals converted to proper dialogs with backdrop + Escape, TeacherForm reset on `initialValues` change, import guard while roster loads, signed-in user delete guard, teacher delete dialog changed from `role="alert"` to `role="dialog"`.

### File List

- `src/types/subject-rule.schemas.ts`
- `src/types/subject-rule.types.ts`
- `src/types/teacher.types.ts`
- `src/types/teacher.schemas.ts`
- `src/types/class.schemas.ts`
- `src/types/soft-preference.schemas.ts`
- `src/api/hooks/useSubjectRules.ts`
- `src/mocks/fixtures/subject-rules.fixtures.ts`
- `src/mocks/handlers/subject-rule.handlers.ts`
- `src/mocks/handlers/index.ts`
- `src/features/constraints/components/SubjectRuleForm.tsx`
- `src/features/constraints/pages/SubjectRulesPage.tsx`
- `src/features/constraints/pages/SubjectRulesPage.test.tsx`
- `src/features/constraints/pages/ConstraintsLayout.tsx`
- `src/features/constraints/pages/ConstraintsLayout.test.tsx`
- `src/features/constraints/pages/HardConstraintsPage.tsx`
- `src/features/teachers/pages/TeacherListPage.tsx`
- `src/features/teachers/components/TeacherForm.tsx`
- `src/features/teachers/utils/parse-teacher-csv.ts`
- `src/features/classes/pages/ClassManagementPage.tsx`
- `src/features/rooms/pages/RoomManagementPage.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/test/polyfills.ts`
- `src/routes.tsx`
- `src/routes.test.tsx`
- `_bmad-output/implementation-artifacts/3-3-subject-level-scheduling-rules.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-03-29: Story 3.3 — subject rule CRUD UI (hard/soft toggle, weight slider for soft), Zod schemas, types, React Query hooks, MSW fixtures/handlers, "Subject rules" nav tab, route, 11 Vitest tests; sprint status → review.
- 2026-03-30: Addressed code review findings — 16 fixes across schema trimming, polyfills, mobile nav, CSV parser, class filter empty state, delete modals (backdrop + Escape), TeacherForm reset, import guard, signed-in user delete guard; sprint status → review.
- 2026-03-30: Follow-up BMAD review — subject-rule Zod `.trim()`, stable `formInitialValues` via `useMemo`, story wording aligned for modal a11y (no full Tab trap).

---
**Story completion status:** done

### Review Findings

- [x] [Review][Patch] Subject rules workflow is missing from the Constraints shell [src/features/constraints/pages/ConstraintsLayout.tsx:160-220] — Stale: already implemented
- [x] [Review][Patch] Subject rule conflict reports and satisfaction rates have no backing UI or DTOs [src/features/constraints/pages/ConstraintsLayout.tsx:160-220] — Stale: already implemented in SubjectRulesPage
- [x] [Review][Patch] Story 3.3 still claims completion even though the sprint status and diff show no subject-rule feature [_bmad-output/implementation-artifacts/3-3-subject-level-scheduling-rules.md:1-30] — Stale: already implemented
- [x] [Review][Patch] Teacher roster fetch errors look identical to the empty state, hiding API failures [src/features/teachers/pages/TeacherListPage.tsx:495-633] — Fixed: empty state gated by `!rosterError`
- [x] [Review][Patch] The import flow can run before roster emails finish loading, so duplicates slip through [src/features/teachers/pages/TeacherListPage.tsx:150-172] — Fixed: CSV input disabled while `isRosterLoading`
- [x] [Review][Patch] Deleting a teacher while they are the signed-in user is currently allowed from the roster actions [src/features/teachers/pages/TeacherListPage.tsx:586-607] — Fixed: delete button disabled when `currentUser?.email === teacher.email`
- [x] [Review][Patch] `TeacherForm` never resets when `initialValues` change, so normalized profile data stays stale [src/features/teachers/components/TeacherForm.tsx:24-31] — Fixed: added `useEffect` with `reset(initialValues)`
- [x] [Review][Patch] The CSV parser breaks quoted newline rows into multiple preview entries [src/features/teachers/utils/parse-teacher-csv.ts:3-41] — Fixed: replaced line-split approach with quote-aware `parseCsvRows()`
- [x] [Review][Patch] Applying a year-group filter still reports "No classes yet," even when classes exist outside the filter [src/features/classes/pages/ClassManagementPage.tsx:205-231] — Fixed: distinguishes between no classes vs filtered-out classes
- [x] [Review][Patch] `bulkImportTeachersRequestSchema` is referenced in `TeacherImport` types but never imported, so the type is undefined [src/types/teacher.types.ts:1-24] — Fixed: added import
- [x] [Review][Patch] `classFormSchema.name` lacks `.trim()`, allowing whitespace-only class names to pass validation [src/types/class.schemas.ts:1-28] — Fixed
- [x] [Review][Patch] `teacherDtoSchema`/`teacherFormSchema` validate names without trimming, so "   " becomes an empty string during submission [src/types/teacher.schemas.ts:1-41] — Fixed: added `.trim()` to firstName, lastName, email
- [x] [Review][Patch] `softPreferenceFormSchema.name` also skips `.trim()`, admitting blank-but-spaced rules [src/types/soft-preference.schemas.ts:1-49] — Fixed
- [x] [Review][Patch] Mobile nav still slices `navItems`, leaving Constraints/Profile unreachable on phones [src/components/layout/Sidebar.tsx:1-40] — Fixed: scrollable mobile nav shows all items
- [x] [Review][Patch] The teacher delete confirmation is an `role="alert"` without modal trapping, so the user can keep interacting with the page [src/features/teachers/pages/TeacherListPage.tsx:586-607] — Fixed: proper `role="dialog"` modal with backdrop, initial focus on Cancel, and Escape
- [x] [Review][Patch] Hard constraint delete dialogs claim `role="dialog"` but lack a backdrop, Escape handling, and focus trap [src/features/constraints/pages/HardConstraintsPage.tsx:150-200] — Fixed: full-screen modal with backdrop and Escape handler
- [x] [Review][Patch] Room delete dialogs have the same non-modal issue, letting focus leak behind the destructive overlay [src/features/rooms/pages/RoomManagementPage.tsx:220-270] — Fixed: full-screen modal with backdrop and Escape handler
- [x] [Review][Patch] `HeadersPolyfill.append()` overwrites previous values instead of preserving duplicates, skewing header-sensitive tests [src/test/polyfills.ts:1-120] — Fixed: combines values with `, ` separator
- [x] [Review][Patch] `RequestPolyfill` constructors accept only strings, breaking code paths that clone or wrap an existing `Request` [src/test/polyfills.ts:120-210] — Fixed: constructor now accepts `string | RequestPolyfill`

- [x] [Review][Decision] Modal “focus trap” wording vs behaviour — Resolved: documentation aligned to actual behaviour (backdrop, Escape, initial focus on Cancel); full Tab focus containment deferred to a future app-wide pattern if product requires it.

- [x] [Review][Patch] Subject rule names are not trimmed in Zod (`createSubjectRuleRequestSchema`, `updateSubjectRuleRequestSchema`, `subjectRuleFormSchema`), so whitespace-only or padded names can pass client validation — inconsistent with `teacherFormSchema` / `softPreferenceFormSchema` fixes in this branch [src/types/subject-rule.schemas.ts:25–58] — Fixed: `.trim()` on name (and description) fields

- [x] [Review][Patch] `SubjectRuleForm` resets when `initialValues` identity changes; `SubjectRulesPage` builds `getFormInitialValues(editing)` inline, so any parent re-render (e.g. rules refetch, status banner) produces a new object and can wipe in-progress edits [src/features/constraints/pages/SubjectRulesPage.tsx:178–190] [src/features/constraints/components/SubjectRuleForm.tsx:46–48] — Fixed: `useMemo` on `editing` + module-level `getFormInitialValues`

- [x] [Review][Defer] AC2/AC3 generator conflict and satisfaction reporting are only partly representable in the web app — hard-rule violation reports and live satisfaction rates depend on the generator/backend; this story covers rule CRUD and displaying `satisfactionRate` when present [N/A] — deferred, pre-existing scope boundary
