# schediflow-frontend — Architecture & Development Specification
**Version 1.2 | March 2026 | Internal Engineering Document**

> **Related documents:**
> - `SchediFlow_PRD_v3.0` — product requirements
> - `schediflow-backend — Architecture & Development Specification` — backend counterpart
> - `SchediFlow_MRD_v1.0` — market requirements

---

## Table of Contents

1. [Document Purpose](#1-document-purpose)
2. [System Architecture Overview](#2-system-architecture-overview)
3. [API Contract — Provided by Backend](#3-api-contract--provided-by-backend)
4. [WebSocket Contract — Real-Time Layer](#4-websocket-contract--real-time-layer)
5. [Technology Stack](#5-technology-stack)
6. [Design System](#6-design-system)
7. [Project Structure](#7-project-structure)
8. [State Management](#8-state-management)
9. [Routing](#9-routing)
10. [WebSocket Client](#10-websocket-client)
11. [Internationalisation & Configurability](#11-internationalisation--configurability)
12. [Deployment](#12-deployment)
13. [Development Epics & Stories — Frontend](#13-development-epics--stories--frontend)
14. [Additional Recommendations](#14-additional-recommendations)
15. [Open Technical Decisions](#15-open-technical-decisions)

---

## 1. Document Purpose

This document covers the **schediflow-frontend** project only. It defines the technology stack, design system, component architecture, state management, routing, WebSocket client integration, deployment configuration, and frontend development stories.

The backend project is covered in a separate document: `schediflow-backend — Architecture & Development Specification`.

Sections 2, 3, and 4 (System Overview, API Contract, WebSocket Contract) are **intentionally duplicated** in both documents — they represent the shared contract between the two projects and must stay in sync.

---

## 2. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                 schediflow-frontend                               │
│  React 18 + TypeScript + Vite                                    │
│  shadcn/ui + Tailwind CSS + React Query + Zustand               │
│  STOMP WebSocket client (SockJS + @stomp/stompjs)               │
└──────────────────────┬──────────────────────────────────────────┘
                       │  HTTPS / WSS
┌──────────────────────▼──────────────────────────────────────────┐
│                 schediflow-backend                                │
│  Spring Boot 3.x / Java 21                                       │
│  REST API + Spring WebSocket/STOMP                               │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 Two-Project Repository Structure

```
schediflow/
├── schediflow-backend/          ← separate project (see backend spec)
│
├── schediflow-frontend/         ← this project
│   ├── src/
│   ├── public/
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── Dockerfile
│
└── docker-compose.yml           # orchestrates both projects + postgres + mailhog
```

---

## 3. API Contract — Provided by Backend

> **This section is duplicated in the backend spec.** Changes there must be reflected here.

### 3.1 Base URL Configuration

```typescript
// src/lib/axios.ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  // e.g. http://localhost:8080
  headers: { 'Content-Type': 'application/json' },
});
```

### 3.2 Authentication Headers

Every authenticated request includes:
```
Authorization: Bearer <access_token>
```

The Axios interceptor attaches the token automatically and handles 401 → refresh flow transparently.

### 3.3 Pagination Envelope

All paginated list responses:
```json
{
  "content": [...],
  "page": 0,
  "size": 20,
  "totalElements": 247,
  "totalPages": 13
}
```

### 3.4 Error Envelope

All error responses:
```json
{
  "status": 400,
  "code": "CONSTRAINT_VIOLATION",
  "message": "Teacher is not qualified for subject",
  "details": { "teacherId": "...", "subjectId": "..." },
  "timestamp": "2026-03-21T10:00:00Z"
}
```

### 3.5 Tenant Resolution

`tenant_id` is **never** sent in request bodies or query params. The backend resolves it from the JWT. The frontend does not manage tenant routing at the HTTP level.

### 3.6 Full Endpoint Reference

| Method | Path | Description | Used by |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Institution registration | Registration page |
| POST | `/api/v1/auth/login` | Login | Login page |
| POST | `/api/v1/auth/refresh` | Refresh access token | Axios interceptor |
| POST | `/api/v1/auth/logout` | Logout | Auth store |
| POST | `/api/v1/auth/complete-registration` | Teacher completes invite | Complete-profile page |
| GET/PUT | `/api/v1/users/me` | Personal profile | Profile page |
| GET | `/api/v1/users` | User list | User management page |
| POST | `/api/v1/users/invite` | Invite teacher | User management page |
| PUT | `/api/v1/users/{id}/role` | Change role | User management page |
| DELETE | `/api/v1/users/{id}` | Deactivate user | User management page |
| GET/PUT | `/api/v1/settings` | Institution settings | Settings pages |
| GET | `/api/v1/settings/public` | Public settings (locale) | App initialisation |
| GET | `/api/v1/settings/labels` | Configurable terminology | i18n initialisation |
| CRUD | `/api/v1/academic-years` | Academic years | Settings / term management |
| CRUD | `/api/v1/terms` | Terms | Settings / term management |
| CRUD | `/api/v1/bell-schedules` | Bell schedules + periods | Bell schedule builder |
| CRUD | `/api/v1/rooms` | Rooms | Room management |
| CRUD | `/api/v1/subjects` | Subjects | Subject management |
| CRUD | `/api/v1/classes` | School classes | Class management |
| GET/PUT | `/api/v1/classes/{id}/subject-hours` | Hours matrix | Class management |
| CRUD | `/api/v1/teachers` | Teacher profiles | Teacher management |
| POST/DELETE | `/api/v1/teachers/{id}/qualifications` | Subject qualifications | Teacher management |
| GET | `/api/v1/teachers/{id}/availability` | Availability grid | Teacher availability page |
| CRUD | `/api/v1/teaching-groups` | Teaching groups | Teaching group management |
| CRUD | `/api/v1/option-blocks` | Option blocks | Option block builder |
| POST/DELETE | `/api/v1/forbidden-slots` | Forbidden slots | Availability editors |
| CRUD | `/api/v1/timetables` | Timetables | Timetable views |
| GET | `/api/v1/timetables/{id}/lessons` | Lesson grid data | TimetableGrid component |
| POST | `/api/v1/timetables/{id}/publish` | Publish | Engine / timetable view |
| PATCH | `/api/v1/lessons/{id}` | Move lesson (drag/drop) | TimetableGrid |
| POST/DELETE | `/api/v1/lessons/{id}/pin` | Pin / unpin | LessonCard context menu |
| POST | `/api/v1/lessons/{id}/swap` | Swap two cards | LessonCard context menu |
| POST | `/api/v1/engine/run` | Start solver job | Engine control panel |
| GET | `/api/v1/engine/jobs/{id}` | Poll job status | GeneratorProgressPanel |
| POST | `/api/v1/engine/jobs/{id}/cancel` | Cancel job | GeneratorProgressPanel |

Teacher profiles can have multiple subject qualifications. The UI should present them as a selectable chip set or multi-select, not a single primary subject field.
| CRUD | `/api/v1/holidays` | Holiday calendar | Holiday calendar page |
| POST | `/api/v1/holidays/import` | Import from feed | Holiday calendar page |
| POST | `/api/v1/cover` | Assign cover | Cover panel |
| GET | `/api/v1/cover/candidates` | Cover candidates | Cover panel |
| POST | `/api/v1/delegation` | Submit delegation | Teacher delegation page |
| PATCH | `/api/v1/delegation/{id}` | Approve / reject | Delegation queue (moderator) |
| CRUD | `/api/v1/temporary-schedules` | Temporary schedules | Temporary schedule management |
| GET | `/api/v1/timetables/{id}/export/pdf` | PDF export | Export panel |
| GET | `/api/v1/timetables/{id}/export/csv` | CSV export | Export panel |
| GET | `/api/v1/timetables/{id}/export/ical` | .ics export | Personal timetable view |
| GET | `/api/v1/audit-log` | Audit log | Audit log page (Admin) |

---

## 4. WebSocket Contract — Real-Time Layer

> **This section is duplicated in the backend spec.** Changes there must be reflected here.

**Protocol:** STOMP over WebSocket, with SockJS fallback.
**Endpoint:** `import.meta.env.VITE_WS_URL` (e.g. `ws://localhost:8080/ws`)

### 4.1 Topics

| Topic | Description | Frontend Handler |
|---|---|---|
| `/topic/timetable/{timetableId}` | Lesson moved, pinned, conflict changed | TimetableGrid updates via React Query cache mutation |
| `/topic/solver/{jobId}/progress` | Score updates and % complete | GeneratorProgressPanel |
| `/topic/solver/{jobId}/complete` | Final result + quality score | Engine control panel → React Query invalidate |
| `/topic/tenant/{tenantId}/notifications` | Cover, delegation, timetable published | Notification center bell |
| `/user/queue/personal` | User-targeted events | Toast + notification center |

### 4.2 Message Payloads

```typescript
// Discriminated union for all WebSocket messages
type WsMessage =
  | { type: 'LESSON_UPDATED';    payload: LessonUpdatedPayload }
  | { type: 'SOLVER_PROGRESS';   payload: SolverProgressPayload }
  | { type: 'SOLVER_COMPLETE';   payload: SolverCompletePayload }
  | { type: 'COVER_ASSIGNED';    payload: CoverAssignedPayload }
  | { type: 'DELEGATION_UPDATE'; payload: DelegationUpdatePayload }
  | { type: 'TIMETABLE_PUBLISHED'; payload: TimetablePublishedPayload };

interface LessonUpdatedPayload {
  lessonId: string;
  periodSlotId: string;
  roomId: string;
  isPinned: boolean;
  hasConflict: boolean;
}

interface SolverProgressPayload {
  jobId: string;
  percentComplete: number;
  currentScore: string;
  hardViolations: number;
  elapsedSeconds: number;
}

interface SolverCompletePayload {
  jobId: string;
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED';
  qualityScore: number;
  scoreBreakdown: Record<string, number>;
}
```

---

## 5. Technology Stack

| Component | Choice | Rationale |
|---|---|---|
| Language | TypeScript (strict mode) | Mandatory for this domain complexity; catches constraint/entity type errors at compile time |
| Framework | React 18 | Specified |
| Build tool | Vite 6 | Fastest dev server; native ESM; shadcn/ui CLI v4 supports Vite natively |
| UI / Design System | shadcn/ui + Tailwind CSS v4 + Radix UI | See Section 6 |
| State — server | TanStack Query (React Query v5) | Server state caching, background refetch, optimistic updates for drag-and-drop |
| State — global UI | Zustand | Auth state, current tenant, active timetable, notification count |
| State — local | React `useState` / `useReducer` | Modal state, form fields, drag state |
| Routing | React Router v7 | Nested routes suit multi-view timetable layout |
| Forms | React Hook Form + Zod | Performant, uncontrolled forms; Zod schemas shared with TypeScript types |
| HTTP client | Axios | Interceptors for JWT attach, 401 → refresh, error normalisation |
| WebSocket | @stomp/stompjs over SockJS | Matches Spring WebSocket/STOMP server |
| Drag and drop | dnd-kit | Modern, accessible; pointer + keyboard support; used for TimetableGrid cards |
| Charts | Recharts | Pairs well with shadcn; Quality Score breakdown, utilisation reports |
| Data tables | TanStack Table v8 | Headless; used for dense admin tables (users, audit log, constraint config) |
| Date / Time | Day.js | Lightweight; locale-aware formatting; timezone support |
| i18n | react-i18next | Institution-configurable terminology; multi-language support |
| Accessibility testing | axe-core (in Storybook) | Automated WCAG checks on all components |
| Component docs | Storybook 8 | Isolated development and visual testing of all components |
| Testing | Vitest + React Testing Library + Playwright | Unit, component, and end-to-end |
| Linting | ESLint + Prettier | Consistent code style; enforced in CI |

---

## 6. Design System

### 6.1 Why shadcn/ui

shadcn/ui is the right choice for SchediFlow because:

1. **Code ownership** — Components are copied into the repo via CLI, not imported from a package. Every component is a local file we can modify freely. This is essential because SchediFlow's most important components (TimetableGrid, constraint configurator, sensitivity dial) are fully custom and need to live alongside and compose with the base components without fighting a library.

2. **Zero bundle overhead** — No library runtime. Only used components are bundled.

3. **Accessibility** — Built on Radix UI primitives. Full WCAG 2.1 AA: keyboard navigation, ARIA attributes, focus management — all out-of-the-box on dialogs, dropdowns, tooltips, popovers.

4. **Tailwind CSS** — SchediFlow should look like SchediFlow, not like Material Design or Ant Design. Tailwind gives us full visual control with no CSS framework opinion imposed.

5. **Dark mode** — Built-in via CSS variables. SchediFlow supports light and dark mode from day one.

6. **TypeScript-first** — Every component is fully typed.

### 6.2 Design Tokens

Defined in `src/styles/globals.css` and consumed throughout the app via Tailwind's `theme.extend.colors`:

```css
:root {
  /* Brand */
  --brand-primary:  #1E3A5F;
  --brand-accent:   #2E75B6;
  --brand-light:    #D6E4F0;

  /* Semantic surfaces */
  --color-background:      #FFFFFF;
  --color-surface:         #F5F7FA;
  --color-border:          #E2E8F0;
  --color-text-primary:    #1A1A2E;
  --color-text-secondary:  #6B7280;
  --color-text-muted:      #9CA3AF;

  /* Subject difficulty levels — configurable per institution via settings */
  --difficulty-1: #22C55E;   /* Light     — green */
  --difficulty-2: #86EFAC;   /* Moderate  — light green */
  --difficulty-3: #FACC15;   /* Demanding — yellow */
  --difficulty-4: #F97316;   /* Intensive — orange */
  --difficulty-5: #EF4444;   /* Extreme   — red */

  /* Status */
  --color-success: #27AE60;
  --color-warning: #E67E22;
  --color-error:   #E74C3C;
  --color-info:    #2E75B6;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}

.dark {
  --color-background:      #0F172A;
  --color-surface:         #1E293B;
  --color-border:          #334155;
  --color-text-primary:    #F1F5F9;
  --color-text-secondary:  #94A3B8;
  --color-text-muted:      #64748B;
}
```

### 6.3 shadcn/ui Base Components

All installed via `npx shadcn add <component>` into `src/components/ui/`:

| Component | Primary Usage |
|---|---|
| `Button` | All interactive actions; variants: default, secondary, outline, ghost, destructive |
| `Input`, `Textarea` | Form fields |
| `Select`, `Combobox` | Dropdowns, searchable selects (subject picker, teacher picker) |
| `Dialog`, `Sheet` | Modals (edit lesson, confirm publish) and side panels (cover assignment) |
| `Table` | Base for TanStack Table compositions |
| `Card` | Content containers across settings and dashboard |
| `Badge` | Status labels, difficulty levels, role labels |
| `Tooltip` | Contextual help on icons and abbreviated labels |
| `Popover` | Constraint detail overlays on hover |
| `Tabs` | View switching (Class / Teacher / Room / Subject) |
| `DropdownMenu` | Right-click / kebab context menu on LessonCards |
| `Toast` | System notifications (via Sonner, the shadcn-recommended toast library) |
| `Avatar` | User profile images |
| `Skeleton` | Loading placeholders for timetable grid and data tables |
| `Switch`, `Checkbox`, `RadioGroup` | Form controls in settings |
| `Slider` | Soft constraint weight adjustments |
| `Progress` | Generator run progress bar |
| `Alert` | Inline conflict warnings and system notices |
| `Separator` | Visual dividers |
| `ScrollArea` | Timetable grid horizontal/vertical scroll |
| `Command` | Cmd+K global search palette |
| `Calendar` | Date pickers in holiday management and term configuration |

### 6.4 Domain-Specific Components

Custom components built on shadcn/ui + Radix primitives. Live in `src/components/timetable/` and `src/components/domain/`:

| Component | Description |
|---|---|
| `TimetableGrid` | The core scheduling grid. CSS Grid with `N_DAYS + 1` columns and `N_PERIODS + 1` rows. Each cell is a dnd-kit `DroppableCell`. Contains `LessonCard` children. See Section 6.5. |
| `LessonCard` | A draggable card representing one lesson. States: normal, pinned (🔒), conflict (red badge), cover (distinct border). Right-click opens `DropdownMenu` (Pin, Swap, Move, Edit, Mark Forbidden). |
| `TeacherAvailabilityGrid` | Same CSS Grid structure as `TimetableGrid` but used for declaring Forbidden Slots and preferred availability windows. Cells are toggleable. |
| `ConstraintWeightPanel` | A vertical list of soft constraints each with a `Slider` (0–100) and a label. Groups by Hard / Soft. |
| `SensitivityDial` | A segmented button group: Strict / Balanced / Lenient / Minimal. **Not** a slider — labeled options are safer for non-expert users per PRD. |
| `QualityScoreCard` | Shows the generator Quality Score (0–100) as a ring chart and a breakdown table per category. Powered by Recharts. |
| `ConflictBadge` | Red badge overlay on a LessonCard. Click opens a `Popover` explaining the specific Hard Constraint violation and suggesting resolutions. |
| `DifficultyBadge` | Color-coded pill using `--difficulty-N` CSS variables. |
| `PinIndicator` | Lock icon (🔒) shown on pinned LessonCards. |
| `CoverBadge` | Distinct dashed-border style on a LessonCard that has a cover assignment. |
| `TemporaryScheduleBanner` | Fixed banner at the top of the timetable view when a Temporary Schedule is active. Shows name, dates, and a "Back to Master" button. |
| `GeneratorProgressPanel` | Shown during engine runs. Displays: job status, elapsed time, current score (`-3hard / 0medium / -12soft`), hard violations count, progress bar. Driven by WebSocket `SOLVER_PROGRESS` events. |
| `UserAvatar` | Avatar image with online status dot and `RoleBadge`. |
| `RoleBadge` | Color-coded badge: Admin (blue), Moderator (teal), Teacher (green), Student (gray), Parent (gray). |
| `SubjectColorDot` | Small filled circle in the subject's `color_hex`, used in lists and grid headers. |
| `BellScheduleBuilder` | Interactive time-picker grid for configuring bell schedule periods and breaks. |
| `SubjectHoursMatrix` | A table with Classes on rows and Subjects on columns; cells are editable period count inputs. |
| `OptionBlockBuilder` | Wizard-style component for configuring option block choices and enrolling students. |

### 6.5 TimetableGrid — Technical Detail

The timetable grid is the most complex and most performance-sensitive component.

**Grid structure:**
```
columns: [period-label-col] + [day-1] + [day-2] + ... + [day-N]
rows:    [day-header-row] + [period-1] + [period-2] + ... + [period-M]
```

**CSS Grid implementation:**
```tsx
<div
  style={{
    display: 'grid',
    gridTemplateColumns: `80px repeat(${cycleDays}, 1fr)`,
    gridTemplateRows: `40px repeat(${periods.length}, auto)`,
  }}
>
  {/* Period labels — column 0 */}
  {/* Day headers — row 0 */}
  {/* Cells — each contains 0..N DraggableLessonCards */}
</div>
```

**Drag-and-drop with dnd-kit:**
```tsx
<DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
  {cells.map(cell => (
    <DroppableCell key={cell.id} cell={cell}>
      {lessonsInCell.map(lesson => (
        <DraggableLessonCard key={lesson.id} lesson={lesson} />
      ))}
    </DroppableCell>
  ))}
</DndContext>
```

**On drag end:**
1. Optimistic update via React Query cache mutation (instant visual feedback)
2. `PATCH /api/v1/lessons/{id}` with new `periodSlotId`
3. On error: roll back optimistic update and show toast
4. On success: backend broadcasts `LESSON_UPDATED` via WebSocket to all other viewers

**Forbidden Slot shading:** cells with Forbidden Slots render with a hatched background pattern via CSS.

**Performance:** At MVP scale (200 classes × 8 periods × 5 days = 8,000 cells) virtualization is not required. If performance degrades, consider `@tanstack/react-virtual` for the grid rows.

### 6.6 Storybook

Every component in `src/components/ui/` and `src/components/domain/` must have a Storybook story demonstrating:
- All visual states (default, hover, disabled, loading, error)
- Accessibility check (axe-core addon)
- Dark mode variant

---

## 7. Project Structure

```
schediflow-frontend/
├── src/
│   ├── api/
│   │   └── hooks/             # React Query hooks, one file per resource
│   │       ├── useAuth.ts
│   │       ├── useTimetable.ts
│   │       ├── useTeachers.ts
│   │       ├── useRooms.ts
│   │       └── ...
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui base components (auto-generated by CLI)
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ...
│   │   ├── timetable/         # TimetableGrid, LessonCard, and grid sub-components
│   │   └── domain/            # All other domain-specific components
│   │
│   ├── features/              # Feature modules — self-contained
│   │   ├── auth/
│   │   │   ├── pages/         # LoginPage, RegisterPage, CompleteProfilePage
│   │   │   └── components/    # LoginForm, InviteCompleteForm
│   │   ├── timetable/
│   │   │   ├── pages/         # TimetablePage (with view switcher)
│   │   │   └── components/    # ViewSwitcher, ExportPanel, PublishConfirmDialog
│   │   ├── engine/
│   │   │   ├── pages/         # EnginePage, EngineHistoryPage
│   │   │   └── components/    # SensitivityDial, GeneratorProgressPanel, QualityScoreCard
│   │   ├── teachers/
│   │   ├── classes/
│   │   ├── rooms/
│   │   ├── subjects/
│   │   ├── teaching-groups/
│   │   ├── option-blocks/
│   │   ├── cover/
│   │   ├── delegation/
│   │   ├── temporary-schedules/
│   │   ├── calendar/          # Holiday and vacation calendar
│   │   ├── settings/          # Bell schedule, constraints, labels, terms, users
│   │   └── profile/
│   │
│   ├── hooks/                 # Shared custom hooks
│   │   ├── useCurrentTenant.ts
│   │   ├── useCurrentUser.ts
│   │   ├── usePermission.ts   # RBAC checks
│   │   └── useLabels.ts       # Institution-configurable terminology
│   │
│   ├── lib/
│   │   ├── axios.ts           # Axios instance + interceptors
│   │   ├── queryClient.ts     # React Query client config
│   │   ├── i18n.ts            # react-i18next init
│   │   ├── dayjs.ts           # Day.js config with locale
│   │   └── utils.ts
│   │
│   ├── store/
│   │   ├── authStore.ts       # user, accessToken, isAuthenticated
│   │   ├── tenantStore.ts     # tenantId, tenantSettings, labels
│   │   ├── timetableStore.ts  # activeTimetableId, activeTermId, activeView
│   │   └── notificationStore.ts  # unread count, notification list
│   │
│   ├── types/                 # TypeScript interfaces matching backend DTOs
│   │   ├── auth.types.ts
│   │   ├── timetable.types.ts
│   │   ├── teacher.types.ts
│   │   └── ...
│   │
│   ├── websocket/
│   │   ├── stompClient.ts     # STOMP client singleton, connection management
│   │   ├── subscriptions.ts   # subscription helpers per topic
│   │   └── messageHandlers.ts # typed handlers → React Query mutations / store updates
│   │
│   └── styles/
│       └── globals.css        # Tailwind directives + CSS variable design tokens
│
├── .storybook/
├── public/
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── Dockerfile
```

---

## 8. State Management

| State Type | Tool | When to Use |
|---|---|---|
| **Server state** | TanStack Query | All data fetched from the API. Handles caching, deduplication, background refresh, and optimistic updates. Never duplicate server data in Zustand. |
| **Global UI state** | Zustand | Auth session (user, token), current tenant context (tenantId, settings, labels), active timetable/term selection, notification unread count. |
| **Local component state** | `useState` / `useReducer` | Modal open/close, form field values, drag state, accordion expanded state. Never needs to outlive the component. |
| **Real-time events** | STOMP handlers | WebSocket messages arrive → mutate React Query cache directly or update Zustand store → component re-renders. No separate real-time state store. |

### 8.1 Zustand Stores

```typescript
// store/authStore.ts
interface AuthStore {
  user: UserDto | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserDto, token: string) => void;
  clearAuth: () => void;
}

// store/tenantStore.ts
interface TenantStore {
  tenantId: string | null;
  settings: TenantSettings | null;
  labels: Record<string, string>;  // institution-configurable terminology
  setTenant: (tenantId: string, settings: TenantSettings) => void;
  setLabels: (labels: Record<string, string>) => void;
}

// store/timetableStore.ts
interface TimetableStore {
  activeTimetableId: string | null;
  activeTermId: string | null;
  activeView: 'class' | 'teacher' | 'room' | 'subject' | 'student' | 'master';
  setActiveTimetable: (id: string) => void;
  setActiveView: (view: TimetableView) => void;
}
```

### 8.2 React Query Key Conventions

```typescript
// Consistent key factory — use everywhere
export const queryKeys = {
  timetable: (id: string) => ['timetable', id] as const,
  timetableLessons: (id: string) => ['timetable', id, 'lessons'] as const,
  teachers: () => ['teachers'] as const,
  teacher: (id: string) => ['teachers', id] as const,
  teacherAvailability: (id: string) => ['teachers', id, 'availability'] as const,
  rooms: () => ['rooms'] as const,
  subjects: () => ['subjects'] as const,
  classes: () => ['classes'] as const,
  solverJob: (id: string) => ['solver-job', id] as const,
  // ...
};
```

### 8.3 Optimistic Updates (Drag-and-Drop)

```typescript
const moveLessonMutation = useMutation({
  mutationFn: (args: MoveLessonArgs) => api.patch(`/lessons/${args.lessonId}`, args),

  onMutate: async (args) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.timetableLessons(timetableId) });
    const previous = queryClient.getQueryData(queryKeys.timetableLessons(timetableId));

    // Optimistic update — move card instantly in cache
    queryClient.setQueryData(queryKeys.timetableLessons(timetableId), (old) =>
      updateLessonInCache(old, args)
    );
    return { previous };
  },

  onError: (_err, _args, context) => {
    // Roll back on error
    queryClient.setQueryData(queryKeys.timetableLessons(timetableId), context?.previous);
    toast.error('Could not move lesson — please try again');
  },
});
```

---

## 9. Routing

```
/                           → redirect based on auth state
/auth/login
/auth/register                 → Teacher registration request / bootstrap path
/auth/complete-registration → Teacher invite completion

/dashboard

/timetable
/timetable/:termId
/timetable/:termId/class/:classId
/timetable/:termId/teacher/:teacherId
/timetable/:termId/room/:roomId
/timetable/:termId/subject/:subjectId
/timetable/:termId/student/:studentId    → personal student view

/engine
/engine/history

/classes
/classes/:id
/teachers
/teachers/:id
/teachers/:id/availability
/subjects
/rooms
/teaching-groups
/option-blocks

/cover
/delegation
/temporary-schedules
/calendar

/settings
/settings/bell-schedule
/settings/terms
/settings/constraints
/settings/labels               → configurable terminology
/settings/users

/profile
```

**Route guards:** A `<ProtectedRoute>` wrapper component checks `authStore.isAuthenticated` and redirects to `/auth/login` if not. A `<RoleGuard role="ADMIN">` wrapper renders `null` (or a redirect) for insufficient roles. When a user has multiple roles, the frontend keeps an `activeRole` in auth state, defaults to the highest available role when no explicit choice is made, and exposes a header role switcher for changing the active role after login.

---

## 10. WebSocket Client

```typescript
// src/websocket/stompClient.ts

let client: Client | null = null;

export function connectStomp(token: string, tenantId: string) {
  client = new Client({
    webSocketFactory: () => new SockJS(import.meta.env.VITE_WS_URL),
    connectHeaders: { Authorization: `Bearer ${token}` },

    onConnect: () => {
      // Subscribe to tenant-wide notifications
      client!.subscribe(`/topic/tenant/${tenantId}/notifications`, handleNotification);
      // Subscribe to personal queue
      client!.subscribe('/user/queue/personal', handlePersonalMessage);
    },

    onStompError: (frame) => console.error('STOMP error', frame),
    reconnectDelay: 5000,
  });

  client.activate();
}

export function subscribeTimetable(timetableId: string, handler: (msg: WsMessage) => void) {
  return client?.subscribe(`/topic/timetable/${timetableId}`, (frame) => {
    handler(JSON.parse(frame.body) as WsMessage);
  });
}

export function subscribeSolverJob(jobId: string, handler: (msg: WsMessage) => void) {
  return client?.subscribe(`/topic/solver/${jobId}/progress`, (frame) => {
    handler(JSON.parse(frame.body) as WsMessage);
  });
}

export function disconnectStomp() {
  client?.deactivate();
  client = null;
}
```

**Message handling:** typed handlers in `messageHandlers.ts` receive `WsMessage` objects and either:
- Mutate the React Query cache directly (e.g., `LESSON_UPDATED` → update lesson in `timetableLessons` cache)
- Update Zustand store (e.g., `SOLVER_PROGRESS` → update `solverJobStore`)
- Show a toast (e.g., `TIMETABLE_PUBLISHED`, `COVER_ASSIGNED`)

---

## 11. Internationalisation & Configurability

### 11.1 i18n Setup

react-i18next with a base English namespace (`en/common.json`). Institution-configurable labels (e.g., "Class" vs. "Section") are loaded from `/api/v1/settings/labels` on app boot and merged into the i18n namespace.

```typescript
// src/lib/i18n.ts
i18n.init({
  lng: 'en',
  resources: { en: { common: baseTranslations } },
});

// After login, load institution-specific labels and merge
const labels = await api.get('/settings/labels');
i18n.addResourceBundle('en', 'common', labels, true, true);  // deep merge
```

### 11.2 `useLabels` Hook

```typescript
// Returns institution-specific label or falls back to system default
function useLabel(key: 'class' | 'period' | 'term' | 'teacher' | 'subject' | 'room'): string {
  const { labels } = useTenantStore();
  return labels[key] ?? defaultLabels[key];
}

// Usage in a component
const classLabel = useLabel('class');
// → "Class" (default) or "Section" or "Form" depending on institution config
```

### 11.3 Locale & Timezone

The institution's `locale` and `timezone` are fetched from `/api/v1/settings/public` at startup (before login) and stored in `tenantStore`. Day.js is configured with the institution locale for all date formatting.

---

## 12. Deployment

### 12.1 Frontend Dockerfile

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### 12.2 nginx.conf

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index index.html;

  # SPA fallback — all routes return index.html
  location / {
    try_files $uri $uri/ /index.html;
  }

  # Cache static assets
  location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### 12.3 Local Development Without Docker

```bash
cd schediflow-frontend
cp .env.example .env.local
# Set VITE_API_BASE_URL=http://localhost:8080
# Set VITE_WS_URL=ws://localhost:8080/ws
npm install
npm run dev
# Vite dev server on http://localhost:5173
```

### 12.4 Environment Variables

| Variable | Example | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend REST API base URL |
| `VITE_WS_URL` | `ws://localhost:8080/ws` | WebSocket endpoint |

### 12.5 K8s Migration Path (Future)

Frontend → `Deployment` + `Service` + `Ingress` with TLS termination. NGINX serves the static build. Environment variables baked in at Docker build time or provided via `ConfigMap` + init container pattern.

---

## 13. Development Epics & Stories — Frontend

Stories marked **[FE]** are frontend-only. See backend spec for **[BE]** stories.

### EPIC 1 — Foundation & Infrastructure [FE]

| Story | Description | Points |
|---|---|---|
| FOUND-02 | Initialize schediflow-frontend: Vite 6, React 18, TypeScript strict, shadcn/ui CLI setup | 2 |
| FOUND-10 | Axios client: base URL config, JWT attach interceptor, 401 → refresh flow | 3 |
| FOUND-11 | Zustand stores: authStore, tenantStore (initial structure) | 2 |
| FOUND-12 | React Query client: queryClient config, error boundary, devtools | 2 |
| FOUND-13 | react-i18next: base English translations, institution label merge | 2 |
| FOUND-14 | Tailwind config: CSS variable design tokens, font config, dark mode class | 2 |
| FOUND-15 | Storybook: setup with axe-core, dark mode switcher, all shadcn base components documented | 3 |

### EPIC 2 — Authentication & User Management [FE]

| Story | Description | Points |
|---|---|---|
| AUTH-11 | Login page (email + password form, error states, redirect on success) | 3 |
| AUTH-12 | Teacher self-registration completion page (token validation, password + profile form) | 4 |
| AUTH-13 | Profile management page — all roles (avatar upload, about me, contact prefs) | 5 |
| AUTH-14 | User management page — Admin/Mod (list, invite, role change, deactivate) | 4 |
| AUTH-15 | Route guards: ProtectedRoute, RoleGuard components | 2 |
| AUTH-16 | Avatar upload component (local file → multipart POST, preview) | 3 |

### EPIC 3 — Institution Configuration [FE]

| Story | Description | Points |
|---|---|---|
| CONFIG-06 | Institution settings page: terminology/label editor, difficulty scale, room types | 5 |
| CONFIG-07 | Bell Schedule builder: interactive period time-picker, break/lunch toggle, multi-variant | 6 |
| CONFIG-08 | Academic Year + Term management page | 4 |

### EPIC 4 — Holiday & Vacation Calendar [FE]

| Story | Description | Points |
|---|---|---|
| HOL-06 | Holiday calendar management page: country picker for import, manual add/edit, calendar view | 5 |

### EPIC 5 — Resource Management [FE]

| Story | Description | Points |
|---|---|---|
| RES-12 | Room management page (list, CRUD form, forbidden slot editor grid) | 5 |
| RES-13 | Subject management page (list, CRUD form, difficulty picker, spread config) | 4 |
| RES-14 | Class management page (list, CRUD form, SubjectHoursMatrix editor) | 6 |
| RES-15 | Teacher management page (list, CRUD form, TeacherAvailabilityGrid) | 7 |
| RES-16 | Teaching Group management (class-split and cross-class merge UI) | 5 |
| RES-17 | Option Block builder (wizard: add subjects, assign students) | 6 |

### EPIC 6 — Timetable & Scheduling Engine [FE]

| Story | Description | Points |
|---|---|---|
| SCHED-12 | TimetableGrid component: CSS Grid, dnd-kit DroppableCell + DraggableLessonCard, optimistic updates | 13 |
| SCHED-13 | LessonCard component: all states (normal, pinned, conflict, cover), context menu | 5 |
| SCHED-14 | View switcher: Class / Teacher / Room / Subject / Student / Master views | 5 |
| SCHED-15 | Engine control panel: SensitivityDial, run/cancel button, GeneratorProgressPanel | 6 |
| SCHED-16 | QualityScoreCard component: score ring chart + category breakdown table | 3 |
| SCHED-17 | Constraint configuration panel: ConstraintWeightPanel with sliders | 5 |
| SCHED-18 | Conflict detail panel: ConflictBadge popover with violation details + suggested fixes | 3 |

### EPIC 7 — Cover, Delegation & Temporary Schedules [FE]

| Story | Description | Points |
|---|---|---|
| COVER-08 | Cover assignment panel: mark teacher absent, show candidates list, one-click assign | 5 |
| COVER-09 | Delegation request flow — teacher view: select lessons, choose receiving teacher, submit | 4 |
| COVER-10 | Delegation approval queue — moderator view: list pending, review impact, approve/reject | 4 |
| COVER-11 | Temporary Schedule management: create, edit modified lessons, view expiry, TemporaryScheduleBanner | 6 |

### EPIC 8 — Notifications [FE]

| Story | Description | Points |
|---|---|---|
| NOTIF-01 | Notification center: bell icon with unread badge, dropdown list, mark-as-read | 5 |
| NOTIF-04 | Notification preferences page: per-event, per-channel toggles | 3 |

### EPIC 9 — Export & Reporting [FE]

| Story | Description | Points |
|---|---|---|
| EXPORT-04 | Export panel: PDF / CSV / iCal download buttons per active view | 3 |
| EXPORT-05 | Teacher utilization report page (Recharts bar chart + table) | 4 |
| EXPORT-06 | Room utilization report page | 3 |
| EXPORT-07 | Subject coverage report page | 3 |
| EXPORT-08 | Audit log page: paginated table with filters (actor, entity type, date range) | 3 |

### EPIC 10 — Setup Templates [FE]

| Story | Description | Points |
|---|---|---|
| TMPL-05 | Template selection screen: institution type cards with descriptions, select + apply | 4 |

---

## 14. Additional Recommendations

- **axe-core in Storybook** — run automated accessibility checks in CI; fail the build on new WCAG violations
- **TimetableGrid keyboard navigation** — arrow keys to move focus between cells; `Enter` to open card context menu; `Space` to pin/unpin — this is required for WCAG compliance
- **Drag-and-drop keyboard alternative** — dnd-kit supports keyboard drag with `KeyboardSensor`; enable from the start
- **React Query devtools** — include `ReactQueryDevtools` in development builds; invaluable for cache debugging
- **Error boundaries per feature** — wrap each feature route in an `<ErrorBoundary>` so one broken feature does not crash the entire app
- **Vitest + React Testing Library** — test every component in isolation; mock API calls with `msw` (Mock Service Worker)
- **Playwright E2E tests** — cover the critical path: login → configure institution → run engine → view timetable → pin a card
- **Sentry (post-MVP)** — frontend error monitoring; add `@sentry/react` when moving to production
- **Bundle analysis** — run `vite-bundle-visualizer` periodically; watch for unexpected large dependencies

---

## 15. Open Technical Decisions

| # | Decision | Options | Recommendation | Urgency |
|---|---|---|---|---|
| TD-08 | Testing scope | Vitest + RTL only vs. + Playwright E2E | All three from day one | High |
| TD-09 | Toast library | shadcn Toast vs. Sonner | Sonner (the shadcn-recommended replacement); better DX | Low |
| TD-10 | TimetableGrid virtualization | None vs. @tanstack/react-virtual | None for MVP; add if performance degrades past 200 classes | Low |
| TD-11 | PDF generation | Backend-generated vs. client-side (react-pdf) | Backend-generated PDF via export API; simpler, better for complex layouts | Medium |
| TD-12 | Calendar export (iCal live sync) | Static .ics download vs. CalDAV subscription URL | Static .ics for MVP; CalDAV subscription as Phase 2 enhancement | Low |

---

*This document covers schediflow-frontend only. See the backend specification for schediflow-backend.*
