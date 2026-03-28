# Story 1.2: Institution Terminology Configuration

Status: done

## Story

As a Timetabler,
I want to rename SchediFlow's domain terms to match my school's language,
So that the platform feels native to how my institution operates.

## Acceptance Criteria

**Given** I navigate to Institution Settings → Terminology
**When** I view the page
**Then** I see editable fields for each configurable term: Period, Class, Term, Cycle, Bell Schedule, Room, Subject

**Given** I update a term (e.g., "Period" → "Lesson") and save
**When** any user in my institution views any page
**Then** the updated label appears everywhere in the interface — navigation, form labels, grid headers, reports — for all users in the institution

**Given** I clear a term label and save
**Then** the default SchediFlow term is restored for that concept

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
Build on patterns from `1-1-institution-registration-and-application-shell.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 1.2
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Moved `GET /api/v1/settings/labels` and `GET /api/v1/settings/public` from `auth.handlers.ts` to `settings.handlers.ts` so all settings-related MSW handlers are co-located.
- `useLabels` defaults in `src/hooks/useLabels.ts` extended with `cycle` and `bellSchedule` keys (AC requires 7 configurable terms; original story 1.1 only had 6).
- Label sync: AppShell now calls `useTerminologyLabels()` and syncs the result into `tenantStore.labels` via `useEffect`, ensuring `useLabels()` reflects the institution's custom terminology on every page load.
- Tests run correctly only with Node ≥18 (`~/.nvm/versions/node/v20.19.1/bin/node ./node_modules/.bin/vitest run`). Default shell Node 16 causes a `crypto.getRandomValues` startup error — pre-existing infrastructure issue.

### Completion Notes List

- **AC 1 (view fields):** `GET /api/v1/settings/labels` → `SettingsPage` at `/settings` → `TerminologyForm` renders 7 labelled `<input>` fields (Period, Class, Term, Cycle, Bell Schedule, Room, Subject), each accessible by role/label.
- **AC 2 (save updates label everywhere):** `PUT /api/v1/settings/labels` via `useUpdateTerminologyLabels` mutation → `onSuccess` calls `tenantStore.setLabels(data)` + invalidates `['settings', 'labels']` query. `useLabels()` reads from `tenantStore.labels`, so all UI updates without page reload.
- **AC 3 (clear restores default):** `useLabels()` returns the SchediFlow default when a value is an empty string or absent — clearing a field and saving sends `""` which is then treated as "no override".
- **MSW mock layer:** In-memory `currentLabels` in `settings.handlers.ts` persists updates within a session; `resetTerminologyLabels()` exported for test teardown.
- **AppShell sync:** `useTerminologyLabels()` query fires on shell mount; result synced to `tenantStore.labels` so all child pages reflect institution terminology immediately.
- **Tests:** 32/32 passing (9 new SettingsPage tests + 23 regression tests). RTL queries by role/label throughout.

### File List

- `src/types/settings.types.ts` (new)
- `src/mocks/pages/settings-page.mock.ts` (new)
- `src/mocks/handlers/settings.handlers.ts` (new)
- `src/mocks/handlers/auth.handlers.ts` (modified — removed settings handlers now in settings.handlers.ts)
- `src/mocks/handlers/index.ts` (modified — added settingsHandlers)
- `src/hooks/useLabels.ts` (modified — added cycle, bellSchedule defaults; empty string treated as cleared)
- `src/api/hooks/useSettings.ts` (new)
- `src/features/settings/settings.schemas.ts` (new)
- `src/features/settings/components/TerminologyForm.tsx` (new)
- `src/features/settings/pages/SettingsPage.tsx` (new)
- `src/features/settings/pages/SettingsPage.test.tsx` (new)
- `src/components/layout/AppShell.tsx` (modified — added label sync on mount)
- `src/routes.tsx` (modified — wired /settings to SettingsPage)

### Change Log

- 2026-03-28: Story 1.2 implemented. Settings feature module created with TerminologyForm (7 configurable terms), GET/PUT /api/v1/settings/labels MSW handlers with in-memory state, useSettings React Query hooks, AppShell label sync, and 9 new tests. 32/32 tests passing.

- 2026-03-28: Code review follow-up — removed duplicate labels query from `useAuth.ts`; terminology save success banner auto-clears after 4s via `mutation.reset()`.

### Review Findings

- [x] [Review][Patch] Remove or rename duplicate `useLabels` query in `src/api/hooks/useAuth.ts` — Removed unused `useLabels`, `authQueryKeys`, and `useQuery` import; terminology fetching lives only in `useSettings.ts`.

- [x] [Review][Patch] Terminology save success state never clears — `TerminologyForm.tsx` calls `resetMutation()` after 4s when `isSuccess` is true so the green banner does not persist indefinitely.

- [x] [Review][Defer] AC2 “any user in my institution” / cross-session propagation — Real-time or strict multi-user consistency requires server push, polling, or refetch-on-focus; the current Zustand + React Query model updates this client after save and on shell load only. — deferred, pre-existing platform scope

- [x] [Review][Defer] Vitest requires Node ≥18 — `crypto.getRandomValues` startup failure on older Node (documented in Debug Log). Align CI and local `.nvmrc` / engines. — deferred, pre-existing infrastructure

---
**Story completion status:** done
