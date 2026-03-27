---
project_name: 'SchediFlow'
user_name: 'Arthur'
date: '2026-03-28'
sections_completed:
  - technology_stack
  - language_rules
  - framework_rules
  - testing_rules
  - code_quality_style
  - workflow_rules
  - critical_rules
  - repository_scope_mock_first
status: complete
rule_count: 49
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Repository scope & mock-first delivery

- **This repository is frontend only.** The backend is built in a **separate** codebase; do not add server logic here.
- **Ship every feature against mocked data first**, then swap to the real REST API when the backend is ready. UI and hooks should not need rewrites if the mock matches the contract.
- **Contract-first access:** `src/types/` DTOs and `src/api/hooks/*` are the stable surface. Responses must use the same envelopes in mocks as in production (`{ content, page, … }` pagination, `{ status, code, message, … }` errors).
- **Mock layer:** MSW (see `_bmad-output/planning-artifacts/architecture.md`) with handlers and fixtures under `src/mocks/`. Keep handler paths and JSON shapes aligned with the documented API so integration is mostly wiring env + base URL.
- **Page mock data:** Put page/story-specific mock data in `src/mocks/pages/`. When starting a story, first reuse or extend existing page mocks before creating new fixtures. The rule is "mock first, reuse before inventing." Once the backend is available, page mocks should be swapped to real API-backed hooks without changing the page component contract.
- **Realtime:** Until a real backend exists, simulate engine progress, timetable updates, and notifications via **mock timers, in-memory stores, or MSW**—not a live STOMP connection. After integration, use the WebSocket rules in this file.
- **Default dev experience:** App should run fully without the backend repo; mocks enabled for local dev and tests unless explicitly pointed at a real `VITE_API_BASE_URL`.

## Technology Stack & Versions

**Frontend:** React 18 | TypeScript (strict) | Vite 6
**UI:** shadcn/ui (CLI v4: `npx shadcn@latest add`) + Tailwind CSS v4 + Radix UI
**State:** TanStack Query v5 (server) | Zustand (global UI) | useState/useReducer (local)
**Routing:** React Router v7 (data router API — `createBrowserRouter`)
**Forms:** React Hook Form + Zod (`@hookform/resolvers/zod`)
**HTTP:** Axios | **WebSocket:** @stomp/stompjs + SockJS
**DnD:** `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (3 separate packages)
**Tables:** TanStack Table v8 | **Charts:** Recharts | **Dates:** Day.js
**i18n:** react-i18next | **Testing:** Vitest + React Testing Library + Playwright
**Docs:** Storybook 8 (CSF3 format) | **Linting:** ESLint + Prettier
**Backend (separate repo — not in this workspace):** Spring Boot 3.x / Java 21 + PostgreSQL; integrate later via HTTP only.

## Critical Implementation Rules

### Language-Specific Rules (TypeScript)

- **Strict mode is mandatory** — `"strict": true` in `tsconfig.json`; never use `any`, `// @ts-ignore`, or `as unknown as X` casts
- All backend DTO shapes live in `src/types/` (e.g. `auth.types.ts`, `timetable.types.ts`) — no inline ad-hoc interfaces in feature files
- Infer TypeScript types from Zod schemas: `type FormData = z.infer<typeof schema>` — do not duplicate type definitions
- Feature modules use **named exports** (not default exports), except page components for lazy loading
- Path alias `@/` maps to `src/` — always use `@/components/...`, `@/hooks/...`, `@/types/...` etc.; never use relative `../` paths crossing feature boundaries
- API errors use the standard envelope `{ status, code, message, details, timestamp }` — always type and handle this shape, never assume raw strings
- Axios interceptor handles 401 → token refresh transparently; **do not add manual 401 handling** in feature code
- Never try/catch inside a React Query `mutationFn` unless rethrowing — let errors surface via `mutation.error`

### Framework-Specific Rules (React)

**State Management:**
- Server state = TanStack Query **only** — never duplicate API data in Zustand; if it came from the API, it lives in React Query cache
- Zustand stores are for: auth session, tenant context, active timetable/term selection, notification unread count — nothing else
- WebSocket messages mutate the React Query cache directly via `queryClient.setQueryData` — no separate real-time state store
- Local component state (`useState`/`useReducer`) for anything that doesn't outlive the component (modals, form fields, drag state)

**React Query v5:**
- No `onSuccess`/`onError` callbacks in `useQuery` options (removed in v5) — use `useEffect` or `useMutation` callbacks instead
- `cacheTime` is now `gcTime` in v5
- React Query hooks live in `src/api/hooks/` — one file per resource (e.g. `useTeachers.ts`, `useTimetable.ts`)
- Story/page mock fixtures live in `src/mocks/pages/` and should be reused across stories before introducing new mock shapes.

**Routing (React Router v7):**
- Use `createBrowserRouter` (data router API) — never `<BrowserRouter>`, `<Switch>`, or v6 legacy patterns
- Route-level code splitting via `lazy()` + default export page components only

**Component Structure:**
- `src/components/ui/` — shadcn/ui base (CLI-generated, freely modifiable)
- `src/components/timetable/` — TimetableGrid and sub-components
- `src/components/domain/` — all other domain-specific components
- `src/features/<name>/pages/` — page/route-level components; `src/features/<name>/components/` — feature-local
- Every component in `src/components/ui/` and `src/components/domain/` **must have a Storybook story** in CSF3 format (`satisfies Meta<typeof Component>`)

**Drag-and-Drop (dnd-kit):**
- Import from `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` — three separate packages; never `from 'dnd-kit'`
- Optimistic update pattern: mutate React Query cache immediately → `PATCH` API → roll back on error + show toast

**Performance:**
- TimetableGrid (~8,000 cells at MVP scale) does not need virtualization yet; add `@tanstack/react-virtual` only if performance degrades

### Testing Rules

**Critical: Vitest syntax — not Jest:**
- `import { describe, it, expect, vi } from 'vitest'` — never from `@jest/globals`
- Mocks: `vi.fn()`, `vi.mock()`, `vi.spyOn()` — not `jest.fn()` / `jest.mock()` / `jest.spyOn()`

**Test Organization:**
- Unit/component tests: co-located as `ComponentName.test.tsx` or in `__tests__/` within the feature folder
- E2E tests: `output/playwright/` directory
- Storybook stories: `ComponentName.stories.tsx` co-located with the component

**React Testing Library:**
- Test behaviour, not implementation — query by role/label/text, never by CSS class or internal state
- Use `userEvent` from `@testing-library/user-event` for interactions, not `fireEvent`

**Storybook (CSF3 format):**
- Every `src/components/ui/` and `src/components/domain/` component requires stories for: default, loading, error, dark mode
- Include axe-core accessibility check in each story
- Format: `export default { component: Foo } satisfies Meta<typeof Foo>`

### Code Quality & Style Rules

**Naming Conventions:**
- Files: `kebab-case` (e.g. `auth-store.ts`, `lesson-card.tsx`, `use-permission.ts`)
- Components: `PascalCase` | Hooks: `camelCase` prefixed `use` | Stores: `camelCase` suffixed `Store`
- Type files: `kebab-case` suffixed `.types.ts` (e.g. `timetable.types.ts`)

**Tailwind CSS v4 (breaking change from v3):**
- Design tokens live in `src/styles/globals.css` under `:root {}` and `.dark {}` — this is the v4 approach
- **Never generate `tailwind.config.ts` with `theme.extend`** — that is Tailwind v3 and will not work
- Reference tokens in classes: `bg-[--color-surface]`, `text-[--color-text-primary]`
- Difficulty colours: use `--difficulty-1` through `--difficulty-5` CSS variables — never hardcode hex

**shadcn/ui:**
- Install: `npx shadcn@latest add <component>` — not `npx shadcn-ui` (old CLI)
- Components live in `src/components/ui/` and are project-owned — modify freely
- shadcn/ui is **not** a runtime npm package — never `import from 'shadcn/ui'`

**Internationalisation / Labels:**
- Use `useLabels()` hook for all domain terms (Class, Period, Term, etc.) — institutions rename these
- Never hardcode domain terminology as string literals in UI components
- Labels are fetched from `/api/v1/settings/labels` and stored in `tenantStore`

**Comments:**
- No JSDoc on every function — document only genuinely non-obvious logic
- Prefer self-documenting naming over explanatory comments

### Development Workflow Rules

**Repository structure:**
- **timetable-web** is the **web app only**; backend services live elsewhere. Do not assume a sibling backend folder in this repo.
- Container/orchestration (e.g. docker-compose with Postgres) applies when integrating with a real API—**not** required for mock-first UI work.

**Environment variables:**
- `VITE_API_BASE_URL` — REST base URL when calling a real backend; with mocks, may point at the dev server origin or be unused depending on MSW setup
- `VITE_WS_URL` — WebSocket endpoint when live integration is enabled; optional during mock-only phases
- Never commit `.env` files — use `.env.example` as template

**Branch Naming (observed):**
- Pattern: `<type>/<description>` (e.g. `requirements/bmad`, `feature/timetable-grid`)
- Main branch: `main`

### Critical Don't-Miss Rules

**Security / Architecture:**
- `tenant_id` is **NEVER** sent in request bodies or query params — backend resolves it from JWT; adding it to payloads is a security violation
- Access token lives in `authStore` (Zustand, in-memory) only — never `localStorage`
- Axios interceptor attaches `Authorization: Bearer <token>` automatically — never manually set auth headers in feature code

**API Contract:**
- Paginated responses always use envelope: `{ content, page, size, totalElements, totalPages }` — always destructure `content`; never treat the response as a plain array
- Teacher qualifications are **multi-subject** — render as chip set / multi-select, never as a single primary subject field

**WebSocket (when connected to a real backend):**
- SockJS client: `new Client({ webSocketFactory: () => new SockJS(url) })` — NOT `new Client({ brokerURL })` (that bypasses SockJS fallback)
- All WS messages are a discriminated union — always narrow on `type` field before accessing `payload`
- **Before integration:** do not require a live socket; drive the same UI updates from mocks or local emitters so features are testable offline

**Day.js (immutability):**
- Day.js is immutable — `date.add(1, 'day')` returns a new value, does NOT mutate
- Always capture return: `const tomorrow = today.add(1, 'day')`

**Zustand / React Query boundary:**
- Never fetch data inside a Zustand store action — stores hold state only
- Never call `queryClient.invalidateQueries` from inside a Zustand store

**Domain Component:**
- `SensitivityDial` is a **segmented button group** (Strict / Balanced / Lenient / Minimal) — NOT a slider; labelled options are required per architecture spec

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code in this project
- Follow ALL rules exactly as documented — especially version-specific syntax (Tailwind v4, RQ v5, RR v7, Vitest)
- For mock vs API details and MSW layout, also read `_bmad-output/planning-artifacts/architecture.md`
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge during implementation

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack or conventions change
- Remove rules that become obvious over time

_Last Updated: 2026-03-28_
