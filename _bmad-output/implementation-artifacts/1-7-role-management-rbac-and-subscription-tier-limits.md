# Story 1.7: Role Management, RBAC & Subscription Tier Limits

Status: done

## Story

As a Timetabler,
I want to assign roles to users and have the system automatically enforce access permissions and subscription limits,
So that every user can only do what they're permitted and the institution stays within its plan.

## Acceptance Criteria

**Given** I assign one or more roles (Timetabler, Teacher, Moderator, Principal) to a user
**When** roles are saved
**Then** the user may hold multiple roles simultaneously; changes take effect on their next authenticated request (FR34)

**Given** a user attempts an action not permitted by their role(s)
**When** the request reaches the server
**Then** it is denied with an appropriate error; the UI does not render controls for unpermitted actions (NFR8, FR36)

**Given** my institution is on the Starter tier (limit: 20 classes, 30 teachers, 2 terms)
**When** I attempt to exceed any limit
**Then** the creation is blocked server-side with a message identifying the limit and an upgrade prompt (FR38)

**Given** my institution is on the Professional tier (100 classes, 200 teachers, unlimited terms)
**When** I operate within those limits
**Then** all operations succeed without restriction

**Given** any request attempts to access another institution's data
**When** the server processes it
**Then** a 403 is returned; no cross-tenant data is included in the response (FR37, NFR6)

---

## Epic 2: People & Resource Management

A Timetabler can build out the full school data model — add teachers manually or via CSV bulk import, create class groups, configure subjects with difficulty levels, and manage rooms. Teachers can maintain their own profiles and qualifications.

**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11

## Tasks / Subtasks

- [x] Map acceptance criteria to API routes and UI surfaces (see Dev Notes).
- [x] Implement feature module under `src/features/<area>/` per architecture tree.
- [x] Add/update Zod schemas and `src/types/*.types.ts` for DTOs.
- [x] React Query hooks in `src/api/hooks/`; mutations invalidate correct query keys.
- [x] Tests: unit/component for core logic; a11y queries by role/label.

### Review Findings

- [x] [Review][Patch] Gate role management UI with `useInstitutionPermission('roles:assign')` — hide or redirect `/settings/roles`, hide “Roles & Access” nav, and/or disable edit actions when the permission is absent so client-side gating matches AC (NFR8 / “UI does not render controls for unpermitted actions”). [`src/routes.tsx`, `src/features/settings/pages/SettingsLayout.tsx`, `src/features/settings/pages/RoleManagementPage.tsx`]

- [x] [Review][Patch] Subscription limits card uses client `TIER_LIMITS[tier]` for max values while the API returns `limits`; if server and client ever diverge, usage display is wrong. Prefer `data.limits` for max and handle `useSubscriptionLimits` error state (currently `!data` renders nothing after load). [`src/features/settings/pages/RoleManagementPage.tsx` — `SubscriptionLimitsCard`]

- [x] [Review][Patch] Copy says role changes take effect on “next login”; story AC says “next authenticated request”. Align wording with FR34. [`src/features/settings/pages/RoleManagementPage.tsx` ~256]

- [x] [Review][Patch] `setTimeout(onClose, 600)` after successful role save has no unmount cleanup; navigation away could theoretically call `onClose` after unmount. Prefer cleanup or closing without arbitrary delay. [`src/features/settings/pages/RoleManagementPage.tsx` ~140]

- [x] [Review][Defer] Cross-tenant 403 and authoritative denial (FR37) — MSW cannot replace full server enforcement; verify with integration/API tests when backend exists. — deferred, pre-existing

## Dev Notes

**Epic 1 — API focus:** Auth: POST `/api/v1/auth/*`; Settings: GET/PUT `/api/v1/settings`, GET `/api/v1/settings/labels`; Users: `/api/v1/users` — see architecture §3.

### Stack & conventions
Follow `_bmad-output/project-context.md` (React 18, TS strict, Vite 6, RR v7 data router, TanStack Query v5, Zustand, Tailwind v4 tokens in `globals.css`, shadcn/ui, Vitest+RTL). Never send `tenant_id` in payloads; tokens in-memory only.

### Architecture reference
`archive/architecture/schediflow-frontend_Architecture_v1.2.md` — project structure under `src/features/`, `src/api/hooks/`, `src/types/`, `src/store/`.

### Testing
Vitest + RTL; Playwright E2E when flows warrant. Storybook for `src/components/ui/` and `src/components/domain/` components touched.


### Previous story
Build on patterns from `1-6-teacher-invitation-and-magic-link-onboarding.md` (previous story in sequence).

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 1.7
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used
claude-sonnet-4-6

### Debug Log References
- Fixed "shows loading state initially" test: page renders two concurrent `role="status"` elements (subscription limits loading + users loading); updated test to use `getAllByRole('status')`.
- Fixed "displays subscription limits card with tier and usage" test: `waitFor` was matching the loading skeleton's `aria-label` before data arrived; switched to await the usage text content instead.

### Completion Notes List
- Implemented composable multi-role system: `InstitutionRole` = TIMETABLER | TEACHER | MODERATOR | PRINCIPAL with permission map in `src/types/rbac.types.ts`.
- Extended `UserDto` with optional `roles?: InstitutionRole[]` field (backward compatible); updated auth mock handlers to include `roles: ['TIMETABLER']` for registered/logged-in users.
- Extended `usePermission.ts` with `useInstitutionPermission(permission)` and `useUserPermissions()` hooks for supplementary client-side RBAC (NFR8).
- Added `GET /api/v1/users` endpoint (list users with roles), `PUT /api/v1/users/:id/roles` (assign roles with Zod validation), and `GET /api/v1/subscription/limits` (tier + usage) MSW handlers.
- Subscription limits card shows tier badge, used/max counts for classes/teachers/terms; at-limit entries highlighted with upgrade prompt (FR38).
- Role Management page at `/settings/roles` lists all institution users with role badges; "Edit Roles" dialog with checkboxes supports assigning multiple roles simultaneously (FR34).
- 117 tests pass: 18 RoleManagementPage + 99 regression.

### File List
- src/types/rbac.types.ts (new)
- src/types/rbac.schemas.ts (new)
- src/types/auth.types.ts (modified — added `roles?: InstitutionRole[]` to UserDto)
- src/hooks/usePermission.ts (modified — added `useInstitutionPermission` and `useUserPermissions`)
- src/mocks/pages/rbac-page.mock.ts (new)
- src/mocks/handlers/rbac.handlers.ts (new)
- src/mocks/handlers/index.ts (modified — added rbacHandlers)
- src/mocks/handlers/auth.handlers.ts (modified — added `roles: ['TIMETABLER']` to mock user)
- src/api/hooks/useRoles.ts (new)
- src/features/settings/pages/RoleManagementPage.tsx (new)
- src/features/settings/pages/RoleManagementPage.test.tsx (new)
- src/features/settings/pages/SettingsLayout.tsx (modified — added "Roles & Access" nav link)
- src/routes.tsx (modified — added /settings/roles route)

## Change Log

- 2026-03-28: Implemented Story 1.7 — Role Management, RBAC & Subscription Tier Limits. Added composable InstitutionRole types, permission map, MSW handlers for user roles and subscription limits, React Query hooks, RoleManagementPage with role assignment dialog and subscription limits card. All 116 tests pass.
- 2026-03-28: Code review batch fixes — gated `/settings/roles` and nav with `roles:assign`; subscription card uses API `limits` and shows query errors; FR34 copy; `useEffect` + cleared timeout for post-save dialog close; tests seed auth with `TIMETABLER` and cover redirect without permission.

---
**Story completion status:** done
