---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/implementation-readiness-report-2026-03-27.md
  - _bmad-output/project-context.md
workflowType: 'architecture'
project_name: 'timetable-web'
user_name: 'Arthur'
date: '2026-03-28'
lastStep: 8
status: 'complete'
completedAt: '2026-03-28'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
SchediFlow has 40 functional requirements organized into 7 epics and 34 stories. Architecturally, the product is a multi-tenant timetable platform with a human-in-the-loop scheduling workflow. In this repository, we are building the frontend only: institution setup, people and resource management, constraint configuration, schedule generation, iterative grid editing, publishing/distribution, and reporting are all consumed through a typed API boundary and initially backed by mocked data.

The requirements imply a set of clear domain boundaries:
- Institution setup must support configurable terminology, bell schedules, cycles, terms, templates, invitations, roles, and subscription enforcement.
- Resource management must cover teachers, classes, subjects, rooms, and teacher self-service profile updates.
- Scheduling rules must support hard constraints, weighted soft preferences, subject difficulty rules, and teacher availability.
- The generator must produce draft schedules, satisfaction reports, and conflict explanations, then support partial regeneration.
- The workspace must support grid-based editing, pinning, manual assignment, and conflict resolution with near real-time feedback.
- Publishing must fan out to teacher and student views, notifications, and exports.
- Reporting must summarize workload and constraint satisfaction for oversight roles.

The story breakdown maps cleanly to the implementation surface:
- Epic 1 drives auth, tenant setup, onboarding, configuration, and policy enforcement.
- Epic 2 drives master-data CRUD and import flows.
- Epic 3 drives constraint modeling and availability capture.
- Epic 4 drives the scheduling engine and conflict-reporting pipeline.
- Epic 5 drives the interactive timetable workspace and realtime synchronization.
- Epic 6 drives publish, notifications, and read-only views.
- Epic 7 drives reporting and analytics.

**Non-Functional Requirements:**
The NFRs are strong enough to shape frontend architecture, not just implementation details.

- Performance: generator response within 30 seconds for the target school size, page loads within 2 seconds, and slot edits reflected within 500ms.
- Security: TLS, at-rest encryption, single-use magic links, server-side RBAC, strict tenant isolation, and hashed passwords.
- Scalability: frontend code must remain modular enough to swap from mock data to the real backend API without disrupting feature code or state boundaries.
- Accessibility: WCAG 2.1 AA, keyboard navigability for the grid, screen-reader-safe status messaging, and color not being the only signal.
- UX-driven technical needs: deep-linkable workspace state, responsive layouts, command palette support, drag-and-drop, optimistic updates, and conflict feedback that is immediate and explainable.

**Scale & Complexity:**
This is a medium-to-high complexity frontend web application with a highly interactive workspace, a typed mock-data layer, and a future API integration boundary. The hardest parts in this repo are the iterative timetable workspace, client state synchronization, and keeping the mock layer compatible with the eventual backend contract.

- Primary domain: frontend web application with mock data and backend contract boundary
- Complexity level: high
- Estimated architectural components: 7
  - app shell and routing
  - auth/session and tenant context
  - mock data and API contract layer
  - people and configuration views
  - timetable workspace and realtime-like synchronization
  - publish/export/reporting views
  - shared UI/system components

### Technical Constraints & Dependencies

The current project context introduces several concrete constraints:

- Frontend stack is React 18 + TypeScript strict + Vite.
- State boundaries are important: TanStack Query for server state, Zustand only for auth/session/tenant/active timetable context, and local component state for UI-only concerns.
- Routing is React Router v7 with `createBrowserRouter`.
- Realtime-style updates in this repo should be simulated through local state, TanStack Query cache updates, or mock event sources rather than a live websocket backend.
- The backend lives in a separate repository; this repo should target a stable typed contract and work against mocked data until integration is enabled.
- Multi-tenant context still matters in the UI, but only as app state and request-scoping metadata for the future API boundary.
- API responses should be modeled with explicit envelopes, including pagination and error shapes, even when mocked locally.
- Teacher qualifications are multi-subject, which affects data modeling and UI forms.
- Accessibility and keyboard navigation are first-class requirements, not polish items.

### Cross-Cutting Concerns Identified

These concerns will affect multiple epics and need to be designed once, not rediscovered in each feature:

- Tenant-aware UI state and request scoping that can later map cleanly to authenticated API calls.
- Mock-service parity with the eventual backend contract so feature code does not need to change during integration.
- Optimistic updates plus conflict rollback behavior in the timetable workspace.
- Local cache synchronization between user actions and mock event sources.
- Accessibility across dense grid interactions, dialogs, forms, and status updates.
- Configurable terminology and labels propagated throughout UI and validation messages.
- Export and notification side effects represented as frontend flows and mockable commands.
- Deep-linkable workspace state and filter state in the URL.

## Starter Template Evaluation

### Primary Technology Domain

Frontend web application with mocked data and a backend contract boundary for later API integration.

### Starter Options Considered

1. `Vite + React + TypeScript` template
2. `create-react-router` framework starter
3. `shadcn create` project bootstrap

`Vite + React + TypeScript` is the best fit for this project because the project context already defines React 18, TypeScript strict, Vite, React Router v7 data router usage, TanStack Query, Zustand, Tailwind v4, and shadcn/ui. A minimal Vite app gives us a clean frontend shell while leaving the routing, mock data layer, state boundaries, and design system decisions explicit and aligned with the documented conventions.

`create-react-router` was considered because it is the current React Router starter, but it makes framework-mode assumptions that do not match the project rules: this codebase explicitly uses `createBrowserRouter`, not React Router framework mode, and the app is intended to remain a SPA rather than adopt route-module SSR conventions.

`shadcn create` was also considered as a UI bootstrap path, but that is better treated as a component-system setup step after the application shell exists. It is useful for initializing shadcn/Tailwind choices, not for defining the app foundation itself.

### Selected Starter: Vite React TS

**Rationale for Selection:**
It is the lightest starter that matches the repository’s required frontend architecture, avoids conflicting routing assumptions, and keeps the implementation agents free to layer in the exact project conventions from `project-context.md`.

**Initialization Command:**

```bash
npm create vite@latest schediflow-frontend -- --template react-ts
cd schediflow-frontend
npm install
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript front end with a standard React 18 application shell. This gives us a strict, modern frontend base without imposing SSR or file-based routing patterns.

**Styling Solution:**
No styling system is forced by the starter. That is intentional here, because the project context already standardizes on Tailwind CSS v4 and shadcn/ui, which will be layered on next.

**Build Tooling:**
Vite provides the dev server, build pipeline, and modern ESM-based module graph. Current official docs show `npm create vite@latest` as the scaffold command, and the current `create-vite` package is published at version 9.0.3 with Vite itself at 8.0.3.

**Testing Framework:**
No test runner is included by default, which is acceptable because this project standardizes on Vitest + React Testing Library + Playwright. Those tools should be added deliberately rather than inherited from a generic starter.

**Code Organization:**
The starter gives a minimal app entrypoint and a clean source tree. That simplicity is beneficial because this project’s real structure comes from the agreed frontend conventions: feature folders, explicit `src/components/ui`, `src/components/domain`, `src/features/*`, and `src/api/hooks`.

**Development Experience:**
Fast local dev server, TypeScript-first bootstrapping, and a minimal amount of framework magic. That makes the repository easier for agents to reason about and reduces the risk of accidental coupling to a starter’s opinionated routing model.

**Note:** Project initialization using this command should be the first implementation story, followed immediately by routing, design system, and data-layer setup.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Frontend-only repository with mocked data first and a future backend API boundary.
- Vite React TS as the app foundation.
- Contract-first data access so feature code does not change when mocks are replaced by real API calls.

**Important Decisions (Shape Architecture):**
- MSW 2.12.14 for browser and test-time API mocking.
- TanStack Query as the single source of truth for server-like data in the client.
- Zustand limited to session, tenant context, and active workspace selection.
- React Router v7 `createBrowserRouter` for SPA routing.

**Deferred Decisions (Post-MVP):**
- Real backend API integration details.
- Auth transport and tenant resolution with the Spring Boot backend.
- WebSocket/SockJS event wiring.

### Data Architecture

The frontend data layer will use a contract-first approach:
- Domain and transport types live in `src/types/` and `src/types/*.types.ts` files.
- Query hooks live in `src/api/hooks/` and expose the same interface regardless of whether they read from MSW or the real API later.
- API request functions live in `src/api/client/`, with a thin adapter layer between hooks and transport.
- Mock data lives in `src/mocks/`, with MSW handlers simulating the same REST shape the backend will eventually expose.
- React Query owns async server-like state, cache updates, retries, and invalidation.
- Local component state handles editor interactions, dialogs, and transient UI state only.

This repo will not hard-code real backend URLs into feature code. Instead, a single API client boundary will be swapped from mock handlers to real HTTP calls when backend integration is enabled.

**Mocking Strategy:**
- Use MSW 2.12.14 for browser mocking and test-time interception.
- Keep handlers and fixture data aligned with the eventual REST contract.
- Reuse the same mock layer in Storybook, Vitest, and development mode where helpful.

**Data Model Rules:**
- Prefer normalized collections in the client mock store, then derive screen-specific views in selectors or hook-level transforms.
- Keep schedule draft state versioned so pinning, regeneration, and publishing can be simulated without rewriting feature logic later.
- Treat paginated endpoints as enveloped collections even when mocked.

**Validation Rules:**
- Zod validates forms and local interaction payloads.
- Shared schema definitions should be reused for both mock response shaping and client-side form validation where practical.

### Authentication & Security

Frontend security decisions in this repo are limited to client-side enforcement and safe handling of future auth state:
- Access token and tenant context live only in memory/state management, never in localStorage.
- Route guards and feature gating are supplementary UI protections, not security boundaries.
- All user-facing authorization states must assume the backend remains the source of truth later.

### API & Communication Patterns

- REST-style contract shapes will be modeled now, even while backed by mocks.
- Error envelopes should match the project context contract shape so feature code can handle real API failures later without change.
- Realtime behavior will be represented with mock events or local cache updates, not a live websocket implementation in this repo.

### Frontend Architecture

- React Query owns server-like state and cache lifecycles.
- Zustand stores only auth/session, tenant, and active timetable/workspace selection.
- Component organization follows `src/components/ui`, `src/components/domain`, and `src/features/*`.
- Route-level pages remain lazy-loaded and isolated from data implementation details.

### Infrastructure & Deployment

For this repo, deployment concerns are limited to frontend hosting and environment configuration:
- Build output must remain static-host friendly.
- Environment variables should cover only frontend concerns such as API base URL and mock mode toggles.
- Local development should support mock mode by default so the UI stays functional without the backend repo running.

### Decision Impact Analysis

**Implementation Sequence:**
1. Scaffold the Vite React TS app.
2. Add shared types, mock fixtures, and MSW handlers.
3. Wire React Query and Zustand boundaries.
4. Build route shell and layout system.
5. Implement feature pages against the mock contract.
6. Swap mock transport to real API client when backend integration begins.

**Cross-Component Dependencies:**
- Mock handlers and typed contracts must stay aligned so feature hooks do not fork between development and production.
- The query layer depends on stable response envelopes.
- Route guards and workspace state depend on auth/session and tenant store shape.
- Form validation depends on shared domain types and Zod schemas.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
8 areas where AI agents could make different choices:
- file and folder naming
- feature and component placement
- API contract shape
- mock data structure
- query key conventions
- state ownership boundaries
- error/loading behavior
- event and update naming

### Naming Patterns

**API Naming Conventions:**
- Mocked REST endpoints use plural nouns, such as `/teachers`, `/classes`, and `/timetables`.
- Route params use `:id` style segments in route definitions, not bracket syntax.
- Query parameter names stay in `camelCase` to match frontend code, while transport adapters normalize to the backend contract when needed.
- Headers are only defined in the API client boundary; feature code never sets auth or tenant headers directly.

**Code Naming Conventions:**
- Components use `PascalCase`, for example `TeacherCard`.
- Hooks use `camelCase` with a `use` prefix, for example `useTeachers`.
- Stores use `camelCase` and end with `Store`, for example `authStore`.
- Files use `kebab-case`, for example `teacher-card.tsx`, `use-teachers.ts`, `teacher.types.ts`.
- Mock files use suffixes like `*.mock.ts`, `*.handlers.ts`, or `*.fixtures.ts`.

### Structure Patterns

**Project Organization:**
- Route-level pages live in `src/features/<feature>/pages/`.
- Feature-local UI lives in `src/features/<feature>/components/`.
- Shared UI primitives live in `src/components/ui/`.
- Domain components live in `src/components/domain/`.
- Contract types live in `src/types/`.
- Query hooks live in `src/api/hooks/`.
- API client adapters live in `src/api/client/`.
- Mock fixtures and handlers live in `src/mocks/`.

**File Structure Patterns:**
- Co-locate tests with the unit under test as `<name>.test.tsx` or `<name>.test.ts`.
- Co-locate Storybook stories with shared UI/domain components as `<name>.stories.tsx`.
- Keep route definitions separate from feature implementation so lazy loading stays simple.
- Do not cross feature boundaries with relative imports; use `@/` aliases only.

### Format Patterns

**API Response Formats:**
- Lists use the page envelope pattern: `{ content, page, size, totalElements, totalPages }`.
- Single-resource responses use camelCase JSON objects.
- Error responses use the standard envelope shape `{ status, code, message, details, timestamp }`.
- Feature code should never assume a bare array response from a collection endpoint.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
The architecture is internally consistent for a frontend-only repository. Vite React TS, React Router v7, TanStack Query, Zustand, and MSW work together without structural conflict. The data layer is contract-first, which means mocked responses and future real API calls can share the same feature hooks and types. The decision to keep backend integration external to this repo removes the earlier full-stack contradiction and clarifies the scope.

**Pattern Consistency:**
The implementation patterns reinforce the architectural decisions. Naming rules, file placement, mock conventions, query ownership, and error/loading behavior all align with the frontend stack and the contract-first approach. React Query remains the source of truth for async data, Zustand remains limited to local app context, and shared types stay in `src/types/`.

**Structure Alignment:**
The project structure supports the architecture cleanly. Feature folders, shared UI/domain components, API adapters, mock handlers, and story/test placement all match the required behavior. The structure also supports the migration path from mocked data to real backend integration without forcing feature rewrites.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
All 7 epics are covered by the planned frontend feature structure. Auth/onboarding, people/resource management, constraint setup, generator workspace, timetable editing, publishing, and reporting each have a clear home in the tree and shared component model.

**Functional Requirements Coverage:**
All 40 functional requirements have architectural support in the planned frontend scope. The UI includes feature pages, shared components, mock data, and state management needed for the current repository’s responsibilities. Backend-owned behaviors are represented as contract-driven mocked flows rather than omitted.

**Non-Functional Requirements Coverage:**
Performance, accessibility, and UX responsiveness are addressed at the frontend architecture level through Vite, React Query, lazy-loaded routes, skeleton/loading patterns, and accessible component boundaries. Security is handled as client-side safety and future-auth readiness in this repo, while true enforcement remains the backend’s responsibility in its own repository.

### Implementation Readiness Validation ✅

**Decision Completeness:**
The core decisions are documented with enough specificity for implementation: frontend-only scope, starter choice, contract-first data layer, mocking strategy, state boundaries, routing strategy, and pattern enforcement. No unresolved technology choice blocks the frontend scaffold.

**Structure Completeness:**
The project tree is concrete enough to drive implementation and covers root config, source organization, mocks, tests, docs, and Storybook. The structure is specific rather than generic and maps directly to the epics.

**Pattern Completeness:**
The pattern rules cover naming, structure, formats, communication, process, and enforcement. They are sufficient for multiple AI agents to work in the repository without inventing conflicting conventions.

### Gap Analysis Results

**Important Gap:**
The real backend contract is not yet available in this repository, so mock fixtures and typed adapters must stay intentionally aligned with the separate backend repo as integration work begins. This is not blocking, but it should be treated as a coordination dependency.

**Minor Gap:**
Some generated directories in the structure are prospective rather than existing today, because this repository is still in the planning phase. That is expected and does not affect architecture validity.

### Validation Issues Addressed

The main issue found during architecture planning was scope drift: the repo initially read like a full-stack platform, but it is actually frontend-only. That was corrected by rewriting the data and structure decisions around mocked data, contract-first adapters, and an external backend boundary. No remaining blocking issues were found.

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Data Exchange Formats:**
- Transport-layer dates use ISO 8601 strings.
- UI date math uses Day.js objects, but conversion back to ISO happens at the API boundary.
- Form schemas use Zod and derive TypeScript types with `z.infer`.
- Mock responses should mirror the future API contract shape exactly, even if fixture data is simplified.

### Communication Patterns

**Event System Patterns:**
- Mock domain events use lowercase dot-separated names such as `timetable.updated` or `slot.pinned`.
- Event payloads carry a `type` field plus a typed `payload` object.
- UI event handlers should update React Query cache first, then emit any mock side effects.

**State Management Patterns:**
- React Query owns remote-like and mock-backed server state.
- Zustand only stores auth/session, tenant context, and active timetable/workspace selection.
- Local component state owns dialogs, drag state, and in-progress form edits.
- Optimistic updates must update cache immediately, then roll back on failure.
- Components must not duplicate query data into Zustand.

### Process Patterns

**Error Handling Patterns:**
- Feature code handles typed error envelopes only; no raw string errors in UI logic.
- Forms show inline validation errors near fields and reserve toast notifications for async failures or success.
- Route-level failures render an error state, not a blank screen.
- User-facing messages should explain the next action, not just the failure.

**Loading State Patterns:**
- Initial loads use skeletons for data-heavy surfaces.
- Background refetches are quiet and non-blocking.
- Short-lived actions should not flash a spinner for very brief operations.
- Workspace actions should preserve layout stability while loading so the grid does not jump.

### Enforcement Guidelines

**All AI Agents MUST:**
- Use the shared contract types from `src/types/` instead of ad hoc interfaces.
- Keep server-like data in React Query, not in Zustand.
- Follow the feature-folder structure and alias imports exactly.

**Pattern Enforcement:**
- Verify patterns through linting, test placement, and code review against this architecture document.
- Document any unavoidable deviations directly in the feature or story output, not silently in code.
- Update this section if a new pattern becomes a repeated source of agent conflict.

### Pattern Examples

**Good Examples:**
- `useTeachers()` reads from `src/api/hooks/use-teachers.ts` and returns the contract-shaped data.
- `TeacherCard` lives in `src/components/domain/teacher-card.tsx`.
- Mock pagination returns `{ content: [...], page: 0, size: 20, totalElements: 48, totalPages: 3 }`.
- A failed save shows an inline field error plus a retryable toast.

**Anti-Patterns:**
- Putting backend DTOs inline inside feature components.
- Storing fetched teachers in Zustand.
- Returning naked arrays from mocked list endpoints.
- Using inconsistent naming like `TeachersList`, `teacher_list.tsx`, and `use_teacher_data` in the same feature.

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
timetable-web/
├── README.md
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── prettier.config.js
├── .env.example
├── .gitignore
├── .storybook/
│   ├── main.ts
│   ├── preview.ts
│   └── tsconfig.json
├── public/
│   ├── favicon.svg
│   └── mockServiceWorker.js
├── src/
│   ├── app/
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── root-layout.tsx
│   ├── api/
│   │   ├── client/
│   │   │   ├── http-client.ts
│   │   │   ├── contract-adapter.ts
│   │   │   └── response-parsers.ts
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-teachers.ts
│   │   │   ├── use-classes.ts
│   │   │   ├── use-subjects.ts
│   │   │   ├── use-rooms.ts
│   │   │   ├── use-constraints.ts
│   │   │   ├── use-availability.ts
│   │   │   ├── use-timetables.ts
│   │   │   └── use-reports.ts
│   │   └── query-keys.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── skeleton.tsx
│   │   │   └── ...
│   │   └── domain/
│   │       ├── teacher-card.tsx
│   │       ├── timetable-grid.tsx
│   │       ├── slot-cell.tsx
│   │       ├── conflict-explainer.tsx
│   │       ├── workload-summary.tsx
│   │       └── sensitivity-dial.tsx
│   ├── features/
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── login-page.tsx
│   │   │   │   ├── register-page.tsx
│   │   │   │   └── complete-registration-page.tsx
│   │   │   └── components/
│   │   ├── institution/
│   │   │   ├── pages/
│   │   │   └── components/
│   │   ├── people/
│   │   │   ├── pages/
│   │   │   └── components/
│   │   ├── constraints/
│   │   │   ├── pages/
│   │   │   └── components/
│   │   ├── timetable/
│   │   │   ├── pages/
│   │   │   ├── components/
│   │   │   └── hooks/
│   │   ├── publishing/
│   │   │   ├── pages/
│   │   │   └── components/
│   │   └── reporting/
│   │       ├── pages/
│   │       └── components/
│   ├── mocks/
│   │   ├── browser.ts
│   │   ├── handlers/
│   │   │   ├── auth.handlers.ts
│   │   │   ├── people.handlers.ts
│   │   │   ├── timetable.handlers.ts
│   │   │   └── reports.handlers.ts
│   │   ├── pages/
│   │   │   ├── auth-page.mock.ts
│   │   │   ├── institution-setup-page.mock.ts
│   │   │   ├── people-page.mock.ts
│   │   │   ├── timetable-page.mock.ts
│   │   │   └── reporting-page.mock.ts
│   │   ├── fixtures/
│   │   │   ├── teachers.fixtures.ts
│   │   │   ├── classes.fixtures.ts
│   │   │   └── timetable.fixtures.ts
│   │   └── events/
│   ├── stores/
│   │   ├── auth-store.ts
│   │   ├── tenant-store.ts
│   │   └── workspace-store.ts
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── teacher.types.ts
│   │   ├── timetable.types.ts
│   │   ├── constraint.types.ts
│   │   ├── report.types.ts
│   │   └── api.types.ts
│   ├── styles/
│   │   └── globals.css
│   ├── lib/
│   │   ├── dayjs.ts
│   │   ├── labels.ts
│   │   └── utils.ts
│   ├── i18n/
│   │   ├── index.ts
│   │   └── locales/
│   └── main.tsx
├── docs/
│   ├── ux-mockups/
│   └── architecture/
├── output/
│   └── playwright/
├── tests/
│   ├── setup.ts
│   ├── fixtures/
│   └── utils/
└── storybook-static/
```

### Architectural Boundaries

**API Boundaries:**
- `src/api/client/` is the only place that knows how requests are executed.
- `src/api/hooks/` is the only place feature code should talk to for server-like data.
- `src/mocks/handlers/` mirrors the future backend contract and is swapped out later without changing feature components.
- Feature components never call `fetch` or transport helpers directly.

**Component Boundaries:**
- `src/components/ui/` holds reusable primitives only.
- `src/components/domain/` holds cross-feature business UI such as timetable cells, conflict panels, and report cards.
- `src/features/<feature>/` owns feature-specific pages, components, and feature-local hooks.
- Route-level pages stay thin and delegate to feature components.

**State Boundaries:**
- React Query owns remote-like data and cache lifecycles.
- Zustand owns only auth/session, tenant context, and active workspace selection.
- Local component state owns drag interactions, dialogs, and transient form state.

**Data Boundaries:**
- `src/types/` is the canonical source of contract types.
- `src/mocks/fixtures/` contains deterministic mock data for development and tests.
- `src/mocks/pages/` contains page-specific mock data that can be reused while implementing each story.
- `src/mocks/events/` contains any simulated realtime event helpers.
- API response parsing and normalization happens in `src/api/client/`, not inside components.

### Requirement to Structure Mapping

**Epic 1: Platform Foundation & Institution Onboarding**
- Lives in `src/features/auth/`, `src/features/institution/`, `src/stores/tenant-store.ts`, and `src/api/hooks/use-auth.ts`.
- Shared UI in `src/components/domain/` for setup forms, wizard steps, and label configuration.

**Epic 2: People & Resource Management**
- Lives in `src/features/people/` with hooks from `src/api/hooks/use-teachers.ts`, `use-classes.ts`, `use-subjects.ts`, and `use-rooms.ts`.
- Shared cards, tables, and dialog shells in `src/components/domain/`.

**Epic 3: Teacher Availability & Constraint Configuration**
- Lives in `src/features/constraints/` and `src/features/people/` for availability-related screens.
- Shared availability grid and sensitivity controls in `src/components/domain/`.

**Epic 4: Schedule Generation Engine**
- Lives in `src/features/timetable/` with generator status, conflict explainer, and schedule summary components.
- Mocked generator output sits in `src/mocks/handlers/timetable.handlers.ts` and `src/mocks/fixtures/timetable.fixtures.ts`.

**Epic 5: Iterative Schedule Workspace**
- Lives in `src/features/timetable/` with `timetable-grid`, `slot-cell`, pinning, manual assignment, and partial regeneration flows.
- Shared workspace state in `src/stores/workspace-store.ts`.

**Epic 6: Timetable Publishing & Personal Views**
- Lives in `src/features/publishing/`.
- Read-only timetable views and export controls reuse `src/components/domain/timetable-grid.tsx`.

**Epic 7: Reporting & Visibility**
- Lives in `src/features/reporting/` with workload and constraint summary pages.
- Shared report cards and chart primitives in `src/components/domain/`.

### Integration Boundaries

**Backend Contract Boundary:**
- The backend remains external to this repo.
- All integration happens through typed request/response adapters so the UI can swap from mocks to real endpoints later.

**Mock Boundary:**
- Development mode can run entirely on MSW fixtures.
- Tests and stories can reuse the same handlers and fixture data for deterministic behavior.

**UI System Boundary:**
- Design-system primitives stay in `src/components/ui/`.
- Business-specific UI never bypasses these primitives for shared controls unless there is a documented reason.

**State and Event Boundary:**
- Query cache updates happen through hooks and store actions, not directly in presentational components.
- Simulated events only affect the workspace through the same update paths the future backend events will use.
