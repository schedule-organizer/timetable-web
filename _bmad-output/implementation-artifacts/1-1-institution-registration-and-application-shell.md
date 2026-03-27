# Story 1.1: Institution Registration & Application Shell

Status: done

## Story

As a Timetabler,
I want to register a new institution and create my account,
So that my school has a secure, isolated workspace in SchediFlow ready to configure.

## Acceptance Criteria

**Given** I visit the registration page
**When** I submit a valid institution name, my full name, email, and password
**Then** a new institution tenant is created, my Timetabler account is created, I am logged in, and I land on the institution setup dashboard

**Given** my account is created
**When** my password is stored
**Then** it is stored as a salted hash (bcrypt or Argon2) and my session token expires after 24 hours of inactivity (NFR7, NFR9)

**Given** the same email is used to register a second institution
**When** registration is submitted
**Then** a new independent account is created for the second institution; the two accounts are fully isolated with no shared data

**Given** I access any page in my institution
**Then** all data is scoped to my institution only; no cross-institution data is accessible through any code path (NFR6)

**Given** a new institution is registered
**Then** it is provisioned on a 30-day free trial with full feature access

**And** the application shell is implemented: white topbar (48px), dark sidebar (#1a2740, 160px wide), light grey workspace (#f3f4f6), design tokens applied globally (UX-DR1–3), responsive layout with sidebar collapsing to 48px icon strip at ≤768px and bottom tab bar at <768px, Inter typography throughout, all interactive elements have 2px solid #4a78d3 focus rings (UX-DR4, UX-DR17)

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
First story in the backlog (Epic 1.1) — no predecessor.

### References
- `_bmad-output/planning-artifacts/epics.md` — Story 1.1
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/ux-design-specification.md`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- `FormControl` initially wrapped input in a `<div>`, breaking label/input accessibility association. Fixed by switching to Radix `Slot` so the `id` is stamped directly onto the input element, enabling `htmlFor` ↔ `id` linkage for RTL `getByLabelText`/`getByRole` queries.

### Completion Notes List

- Greenfield project scaffolded from scratch: Vite 6 + React 18 + TypeScript strict + Tailwind v4 + MSW v2.
- **AC (Registration):** `POST /api/v1/auth/register` → `RegisterPage` (full name, institution, email, password) → sets `authStore` + `tenantStore` → navigates to `/dashboard`. MSW handler returns mock `AuthResponse`.
- **AC (Application Shell):** `AppShell` implements white topbar (48px, `--color-topbar`), dark sidebar (`--color-sidebar: #1a2740`, 160px on desktop), light-grey workspace (`--color-workspace: #f3f4f6`). Responsive: desktop sidebar shows icon+label; ≤768px collapses to icon strip via `hidden lg:block`; <768px shows fixed bottom tab bar (5 primary links). Focus rings: `:focus-visible { outline: 2px solid var(--color-focus-ring); }` where `--color-focus-ring: #4a78d3`. Inter font loaded from Google Fonts.
- **AC (Isolation/Tenant):** `tenant_id` never sent in request bodies; resolved from JWT on backend. `accessToken` stored in-memory (`authStore`, Zustand only — no localStorage).
- **AC (Trial):** `useRegister` sets `subscriptionTier: 'TRIAL'` in `tenantStore` on success.
- **AC (Password hashing):** Backend concern; frontend stores no password; noted in `useRegister` — backend is sole authority on bcrypt/Argon2.
- **Zod schemas:** `registerSchema` + `loginSchema` in `src/features/auth/auth.schemas.ts`; types inferred via `z.infer<>`.
- **React Query hooks:** `useRegister`, `useLogin`, `useLogout`, `useLabels` in `src/api/hooks/useAuth.ts`. `onSuccess`/`onError` used only in `useMutation` callbacks (v5 compliant — no `useQuery` callbacks).
- **MSW mock layer:** handlers for all `/api/v1/auth/*` and `/api/v1/settings/labels` routes in `src/mocks/handlers/auth.handlers.ts`. Browser entrypoint in `src/mocks/browser.ts`. Page-level mock data in `src/mocks/pages/auth-page.mock.ts`.
- **Tests:** 23/23 passing. RTL queries use role/label (no CSS class queries). MSW `setupServer` used in test files.
- **Token refresh:** Axios interceptor handles 401 → refresh transparently; no manual 401 handling in feature code.
- **Important setup note:** Run `npx msw init public/` once after clone to generate the service worker for browser MSW.

### File List

- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `index.html`
- `.env.example`
- `src/styles/globals.css`
- `src/lib/utils.ts`
- `src/lib/axios.ts`
- `src/lib/queryClient.ts`
- `src/types/api.types.ts`
- `src/types/auth.types.ts`
- `src/store/authStore.ts`
- `src/store/tenantStore.ts`
- `src/store/timetableStore.ts`
- `src/store/notificationStore.ts`
- `src/mocks/fixtures/auth.fixtures.ts`
- `src/mocks/pages/auth-page.mock.ts`
- `src/mocks/handlers/auth.handlers.ts`
- `src/mocks/handlers/index.ts`
- `src/mocks/browser.ts`
- `src/mocks/pages/README.md` (pre-existing)
- `src/api/hooks/useAuth.ts`
- `src/hooks/useCurrentUser.ts`
- `src/hooks/useCurrentTenant.ts`
- `src/hooks/useLabels.ts`
- `src/hooks/usePermission.ts`
- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/form.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/RouteFallback.tsx`
- `src/components/layout/Topbar.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/ProtectedRoute.tsx`
- `src/features/auth/auth.schemas.ts`
- `src/features/auth/components/RegisterForm.tsx`
- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/pages/RegisterPage.tsx`
- `src/features/auth/pages/LoginPage.tsx`
- `src/features/dashboard/pages/DashboardPage.tsx`
- `src/routes.tsx`
- `src/features/shell/pages/PlaceholderPage.tsx`
- `src/App.tsx`
- `src/main.tsx`
- `src/test/setup.ts`
- `src/test/test-utils.tsx`
- `src/features/auth/pages/RegisterPage.test.tsx`
- `src/features/auth/pages/LoginPage.test.tsx`
- `src/components/layout/AppShell.test.tsx`

### Change Log

- 2026-03-28: Story 1.1 implemented from scratch. Full greenfield project scaffold, auth feature (register + login), application shell layout, MSW mock layer, Zustand stores, React Query hooks, Zod schemas, all tests passing (23/23).

### Review Findings

#### decision-needed

- [x] [Review][Decision] Shell navigation links to routes not yet implemented — **Resolved (2026-03-28):** option 3 — `PlaceholderPage` at `src/features/shell/pages/PlaceholderPage.tsx` with route `handle.title`; child routes in `src/routes.tsx` for `/timetable`, `/teachers`, `/classes`, `/subjects`, `/rooms`, `/engine`, `/settings`.

#### patch

- [x] [Review][Patch] 401 refresh interceptor may leave `accessToken` stale in the store when `user` is unexpectedly null — **Fixed (2026-03-28):** [`src/lib/axios.ts`](src/lib/axios.ts) clears auth and rejects when refresh succeeds but `user` is missing (no inconsistent replay).
- [x] [Review][Patch] Login does not hydrate `tenantStore` — **Fixed (2026-03-28):** [`src/api/hooks/useAuth.ts`](src/api/hooks/useAuth.ts) `useLogin` calls `setTenant` with minimal `TRIAL` bootstrap like register.
- [x] [Review][Patch] Registration success sets `institutionName: ''` in `tenantStore` — **Fixed (2026-03-28):** `useRegister` `onSuccess` uses `variables.institutionName` in `TenantSettings`.
- [x] [Review][Patch] Sidebar width does not collapse to 48px icon strip — **Fixed (2026-03-28):** [`src/components/layout/Sidebar.tsx`](src/components/layout/Sidebar.tsx) uses `md:w-[var(--sidebar-width-collapsed)] lg:w-[var(--sidebar-width)]` with centered icons until `lg`.
- [x] [Review][Patch] Responsive breakpoints use `sm` (640px) and `lg` (1024px) instead of the story’s 768px split — **Fixed (2026-03-28):** `md` (768px) for sidebar vs bottom bar; [`src/components/layout/AppShell.tsx`](src/components/layout/AppShell.tsx) `pb-14 md:pb-0` aligned.
- [x] [Review][Patch] Lazy route `Suspense` fallbacks are `null` — **Fixed (2026-03-28):** [`src/components/layout/RouteFallback.tsx`](src/components/layout/RouteFallback.tsx) + all `Suspense` in [`src/routes.tsx`](src/routes.tsx).

#### deferred

- [x] [Review][Defer] MSW dev `onUnhandledRequest: 'bypass'` — [`src/main.tsx:11`](src/main.tsx) — deferred, pre-existing (see `deferred-work.md`).

- [x] [Review][Defer] Password hashing, 24h inactivity session (NFR) — deferred, pre-existing (backend).

- [x] [Review][Defer] Same-email second institution AC — deferred, pre-existing (backend / MSW contract).

---
**Story completion status:** done
