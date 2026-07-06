# Timetable Web

Frontend for the Schedule Organizer — a web application for building school
timetables, managing teachers/rooms/classes/subjects, expressing hard and soft
scheduling constraints, and running the schedule-generation engine.

Built with **React 18 + TypeScript + Vite**, styled with **Tailwind CSS v4**,
data-fetching via **TanStack Query** over an **axios** client, and a full
**Mock Service Worker (MSW)** layer so the entire UI runs without a backend.

---

## Table of contents

- [Requirements](#requirements)
- [Quick start](#quick-start)
- [Running modes: mocked vs. real API](#running-modes-mocked-vs-real-api)
  - [Mocked mode (default)](#1-mocked-mode-default)
  - [Real API mode](#2-real-api-mode)
  - [How the switch actually works](#how-the-switch-actually-works)
- [Seed data & test accounts](#seed-data--test-accounts)
- [Environment variables](#environment-variables)
- [npm scripts](#npm-scripts)
- [Project structure](#project-structure)
- [Authentication flow](#authentication-flow)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Requirements

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | **>= 20** | Pinned in `.node-version` / `.nvmrc`. Use `nvm use` to match. |
| npm | 9+ (ships with Node 20) | `package-lock.json` is committed — use `npm ci` for reproducible installs. |

The npm registry is pinned to the public registry in `.npmrc`
(`registry=https://registry.npmjs.org/`).

---

## Quick start

```bash
# 1. Use the correct Node version
nvm use            # reads .nvmrc (Node 20)

# 2. Install dependencies (reproducible)
npm ci             # or: npm install

# 3. Create your local env file
cp .env.example .env

# 4. Start the dev server (mocked API by default)
npm run dev
```

The app is served by Vite at **http://localhost:5173**.
With a fresh `.env` (empty `VITE_API_BASE_URL`) it runs fully mocked — no
backend required.

> **MSW note:** the mock service worker file (`public/mockServiceWorker.js`) is
> already committed, so no init step is needed. If it is ever missing or
> outdated, regenerate it with `npx msw init public/ --save`.

---

## Running modes: mocked vs. real API

The app supports two data sources, selected entirely through the
`VITE_API_BASE_URL` environment variable.

### 1. Mocked mode (default)

Use this for local UI development, demos, and running the app with no backend.

`.env`:
```dotenv
# Leave empty → MSW serves all /api/v1/* requests from in-memory fixtures
VITE_API_BASE_URL=
```

```bash
npm run dev
```

- All `/api/v1/*` calls are intercepted by MSW handlers in
  `src/mocks/handlers/` and answered from fixtures in `src/mocks/fixtures/`
  and `src/mocks/pages/`.
- No network calls leave the browser.
- Data resets on every page reload (handlers keep state in memory).

### 2. Real API mode

Use this to run the UI against a live backend.

`.env`:
```dotenv
# Point at your running backend's origin (scheme + host + port)
VITE_API_BASE_URL=http://localhost:8080

# Optional — only when live WebSocket integration is enabled
VITE_WS_URL=ws://localhost:8080/ws
```

Then either:

```bash
# Option A — dev server. MSW still boots but bypasses cross-origin requests,
# so calls go to the real backend (see note below).
npm run dev
```

```bash
# Option B — production-style run with mocks fully disabled (recommended for
# integration testing against a real API).
npm run build
npm run preview          # serves the built app at http://localhost:4173
```

> The backend is expected to serve the REST API under the `/api/v1/*` prefix
> (e.g. `POST /api/v1/auth/login`, `GET /api/v1/rooms`). The frontend never
> sends a `tenant_id` — the backend resolves the tenant from the JWT.

### How the switch actually works

There is no separate "mocks on/off" flag — behaviour is driven by two facts:

1. **MSW only starts in dev builds.** `src/main.tsx` starts the worker only when
   `import.meta.env.DEV` is true. A production build (`npm run build` →
   `npm run preview`, or any deployed bundle) never loads MSW, so it always
   talks to the real `VITE_API_BASE_URL`.

2. **In dev, MSW handlers match by path only** (e.g. `/api/v1/rooms`), resolved
   against the page origin (`localhost:5173`). The worker is started with
   `onUnhandledRequest: 'bypass'`, so:
   - Empty `VITE_API_BASE_URL` → axios calls resolve to the same origin →
     **MSW intercepts them (mocked)**.
   - `VITE_API_BASE_URL` pointing at a **different origin** (e.g.
     `http://localhost:8080`) → those requests don't match the same-origin
     handler patterns and are passed straight through to **the real backend**.

**Recommendation:** for a clean, unambiguous run against a real API, use the
production build (`npm run build && npm run preview`) so MSW is out of the
picture entirely.

| Goal | `VITE_API_BASE_URL` | Command |
|------|---------------------|---------|
| Mocked UI dev | *(empty)* | `npm run dev` |
| Real API, quick dev | `http://<backend-host>` (different origin) | `npm run dev` |
| Real API, no mocks at all | `http://<backend-host>` | `npm run build && npm run preview` |

---

## Seed data & test accounts

In mocked mode the app boots with a full, self-consistent dataset for a fictional
**Springfield Academy**, so every screen has meaningful content on first load —
no manual data entry needed. The data lives in `src/mocks/fixtures/` (shared
domain data) and `src/mocks/pages/` (page-level data), and is reset to this seed
on every page reload.

### Logging in

Login is **mocked**: any password is accepted. Enter one of the seed emails below
to experience the app as that role, or enter **any other email** to log in as a
full-access Timetabler.

| Email | Password | Name | Legacy role | Institution roles | Use to test |
|-------|----------|------|-------------|-------------------|-------------|
| `admin@school.edu` | any | Alex Timetabler | ADMIN | TIMETABLER | Full timetabler/admin experience |
| `principal@school.edu` | any | Dr. Sarah Principal | ADMIN | PRINCIPAL | Principal (view + publish) |
| `moderator@school.edu` | any | James Moderator | MODERATOR | MODERATOR | Moderator (view + reports) |
| `alice@school.edu` | any | Alice Chen | TEACHER | TEACHER | Teacher (own timetable + availability) |
| `bob@school.edu` | any | Bob Smith | MODERATOR | TEACHER, MODERATOR | Multi-role user |
| *(any other email)* | any | Alex Timetabler | ADMIN | TIMETABLER, TEACHER | Quick full-access login |

> Roles drive what the UI exposes (`usePermission` uses the legacy role hierarchy;
> `useInstitutionPermission` uses the institution roles). The seed emails match the
> users shown on the **Role management** screen.

### What's seeded

| Domain | Seeded content |
|--------|----------------|
| Subjects | 10 subjects across HIGH/MEDIUM/LOW difficulty (Maths, Physics, Chemistry, Biology, English, History, Geography, Art, PE, Music) |
| Teachers | 9 teachers with subject qualifications that reference the subject catalog (Alice Chen is the "current" teacher for the *My availability* page) |
| Classes | 8 classes across Years 7–11 |
| Rooms | 8 rooms (CLASSROOM / LAB / SPORTS_HALL) with varied capacities |
| Hard constraints | 2 of 3 rule types seeded — the third is left free so the "Add constraint" happy path is testable |
| Soft preferences | 5 preferences spanning weights 1–10 and every satisfaction status |
| Subject rules | 4 rules (1 hard + 3 weighted soft) |
| Bell schedule | 6-period secondary-school day with break/lunch gaps |
| Cycle & terms | 5-day cycle (Day A–E) and 3 academic terms (Autumn/Spring/Summer) |
| Teacher availability | Alice Chen and Diana Flores have submitted availability so the overview isn't empty |
| Invitations | 3 invited teachers (ACTIVE / INVITED / EXPIRED) to exercise the resend flow |
| Users & subscription | 6 institution users with roles; PROFESSIONAL tier with usage aligned to the seeded counts |

### Schedule generation (engine)

Pick any term and run the generator — the mock engine streams progress messages,
then produces a draft timetable plus a constraint-satisfaction report. Two extra
scenarios are available for testing:

- **Failure path** — call `setEngineMockMode('failure')` (exported from
  `src/mocks/handlers/engine.handlers.ts`) to make the next run fail with a
  conflict report instead of succeeding.
- **Constraint relaxation** — running with relaxations returns a schedule plus a
  "relaxed constraints" summary.

### Bulk teacher import

`testdata/teachers-import.csv` is a sample import file (not pre-loaded) crafted to
exercise the CSV-import validation: valid rows, a duplicate email, and rows with a
missing name/email. Use it via **Teachers → Import via CSV**.

### Changing the seed

Edit the files in `src/mocks/fixtures/` and `src/mocks/pages/`; the handlers under
`src/mocks/handlers/` reset from these on load. Keep shapes aligned with the Zod
schemas in `src/types/*.schemas.ts` — the handlers validate write requests against
them.

---

## Environment variables

All client-side variables must be prefixed with `VITE_` to be exposed by Vite.
Copy `.env.example` to `.env` and edit. `.env`, `.env.local`, and
`.env.*.local` are git-ignored.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `''` (empty) | REST API base URL/origin. Empty = use MSW mocks. Set to the backend origin (e.g. `http://localhost:8080`) to call a real backend. |
| `VITE_WS_URL` | No | *(unset)* | WebSocket endpoint for live backend integration (e.g. `ws://localhost:8080/ws`). Reserved for real-time features. |

Vite loads env files in this order (later overrides earlier):
`.env` → `.env.local` → `.env.[mode]` → `.env.[mode].local`.
Restart the dev server after changing any env file.

---

## npm scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run dev` | `vite` | Start the dev server (HMR) at http://localhost:5173. |
| `npm run build` | `tsc -b && vite build` | Type-check and produce a production bundle in `dist/`. Mocks are excluded. |
| `npm run preview` | `vite preview` | Serve the production build locally at http://localhost:4173. |
| `npm run lint` | `eslint .` | Lint the codebase. |
| `npm test` | `vitest run` | Run unit/component tests once. |
| `npm run test:watch` | `vitest` | Run tests in watch mode. |
| `npm run test:ui` | `vitest --ui` | Run tests with the Vitest UI. |
| `npm run test:e2e` | `playwright test` | Run Playwright end-to-end tests. |
| `npm run storybook` | `storybook dev -p 6006` | Component explorer at http://localhost:6006. |
| `npm run build-storybook` | `storybook build` | Build a static Storybook. |

---

## Project structure

```
timetable-web/
├── public/
│   └── mockServiceWorker.js     # MSW worker (committed; do not edit by hand)
├── src/
│   ├── main.tsx                 # Entry point; boots MSW in dev, mounts <App/>
│   ├── App.tsx                  # QueryClientProvider + RouterProvider
│   ├── routes.tsx               # Route definitions
│   ├── api/hooks/               # TanStack Query hooks (useRooms, useAuth, ...)
│   ├── lib/
│   │   ├── axios.ts             # axios instance: baseURL, auth + 401-refresh interceptors
│   │   └── queryClient.ts       # TanStack Query client config
│   ├── features/                # Feature modules (auth, classes, constraints, settings, ...)
│   ├── components/              # Shared UI components
│   ├── store/                   # Zustand stores (e.g. authStore)
│   ├── types/                   # Shared DTO / domain types
│   ├── mocks/
│   │   ├── browser.ts           # setupWorker(...handlers)
│   │   ├── handlers/            # MSW request handlers per domain (index barrel)
│   │   ├── fixtures/            # Shared mock data
│   │   └── pages/               # Page-specific mock data
│   └── test/setup.ts            # Vitest setup
├── testdata/                    # Sample import files (e.g. teachers-import.csv)
├── .env.example                 # Template env file
├── vite.config.ts               # Vite + Vitest config, "@" → ./src alias
└── package.json
```

- The `@` alias maps to `./src` (configured in `vite.config.ts`).
- API DTO contracts live in `src/types/`; keep mock shapes aligned with them so
  the same page components work against mocks and the real backend.

---

## Authentication flow

Handled in `src/lib/axios.ts` together with the Zustand `authStore`:

- A `Bearer` access token from the auth store is attached to every request.
- On a `401` response, the client transparently calls
  `POST /api/v1/auth/refresh` once, updates the stored token, and replays the
  original request. If refresh fails, auth state is cleared.
- `tenant_id` is never sent by the client — the backend derives it from the JWT.

In mocked mode, the auth handlers in `src/mocks/handlers/auth.handlers.ts`
issue fake tokens so the full login/refresh flow works offline. Login is
role-aware: the seed emails in
[Seed data & test accounts](#seed-data--test-accounts) return a matching
identity (`role` + institution `roles`), and any other email logs in as a
full-access Timetabler.

---

## Testing

```bash
npm test              # run all unit/component tests once (Vitest + jsdom)
npm run test:watch    # watch mode
npm run test:ui       # Vitest UI
npm run test:e2e      # Playwright E2E (requires a Playwright config/setup)
```

- Unit/component tests use **Vitest** with **jsdom** and Testing Library;
  global setup is in `src/test/setup.ts`.
- Tests exercise the MSW handlers directly, so they run without a backend.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|--------|--------------------|
| App shows no data / network errors in real API mode | Backend not running, wrong `VITE_API_BASE_URL`, or CORS not allowing `localhost:5173`. Restart dev server after editing `.env`. |
| Requests still hit mocks after setting `VITE_API_BASE_URL` | You set it to the same origin as the dev server, or forgot to restart. For a guaranteed real-API run use `npm run build && npm run preview`. |
| `[MSW] Failed to register the Service Worker` | Regenerate the worker: `npx msw init public/ --save`. |
| Env var change not taking effect | Vite only reads env files at startup — restart `npm run dev`. Only `VITE_`-prefixed vars are exposed to the client. |
| Wrong Node version errors | `nvm use` (Node 20), then `npm ci`. |
```
