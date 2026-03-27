# Story 2 - Institution Setup & Configuration

### E2-001: Institution Settings - Basic Information [FULL] [P0] [3 points]

**As an** Admin
**I want** to configure my institution's basic settings
**So that** the system reflects our school's identity and preferences

**Acceptance Criteria:**
- Given I am logged in as Admin
- When I navigate to Settings > Institution
- Then I can edit institution name, country, timezone, and locale
- And changes are saved and applied system-wide
- And date/time formatting updates to match locale
- And timezone affects all time displays

**Technical Requirements:**
- GET/PUT `/api/v1/settings` endpoint
- Timezone validation against IANA timezone database
- Locale affects Day.js formatting throughout app
- Settings stored in tenant_settings table

**UX Requirements:**
- Timezone autocomplete with search
- Locale dropdown with common options
- Preview of date/time format before saving
- Warning if changing timezone with existing timetables

---

### E2-002: Configurable Terminology [FULL] [P0] [5 points]

**As an** Admin
**I want** to customize the terminology used throughout the system
**So that** it matches how my institution refers to classes, periods, and other concepts

**Acceptance Criteria:**
- Given I am logged in as Admin
- When I navigate to Settings > Labels
- Then I can customize labels for: Class, Period, Term, Teacher, Subject, Room, Student
- And I can see a preview of how labels appear in the UI
- And changes are applied immediately across the entire application
- And default labels are shown if I clear a custom label

**Technical Requirements:**
- GET/PUT `/api/v1/settings/labels` endpoint
- Labels stored as JSON in tenant_settings
- Frontend: `useLabel` hook retrieves institution-specific labels
- react-i18next integration for label merging
- Labels loaded on app initialization

**UX Requirements:**
- Side-by-side preview showing before/after
- Reset to defaults button
- Examples of where each label appears
- Validation: labels cannot be empty

---

### E2-003: Difficulty Scale Configuration [FULL] [P0] [3 points]

**As an** Admin
**I want** to define difficulty levels for subjects
**So that** the scheduling engine can balance cognitive load across the day

**Acceptance Criteria:**
- Given I am logged in as Admin
- When I navigate to Settings > Difficulty Scale
- Then I can define 3-7 difficulty levels with custom names and colors
- And I can reorder levels from easiest to hardest
- And colors are used in subject badges and timetable grid
- And I can see a preview of the color scheme

**Technical Requirements:**
- Difficulty levels stored as JSON array in tenant_settings
- Each level: { id, name, color_hex, order }
- Color picker component with preset palette
- Validation: at least 3 levels, unique names and colors

**UX Requirements:**
- Drag-and-drop reordering
- Color picker with accessibility contrast check
- Preview of difficulty badges
- Default scale provided: Light, Moderate, Demanding, Intensive, Extreme

---

### E2-004: Room Type Configuration [FULL] [P0] [2 points]

**As an** Admin
**I want** to define room types used in my institution
**So that** I can categorize rooms and apply type-specific constraints

**Acceptance Criteria:**
- Given I am logged in as Admin
- When I navigate to Settings > Room Types
- Then I can add, edit, and delete room types
- And each type has a name and optional description
- And I can see which rooms are assigned to each type
- And I cannot delete a type that is in use

**Technical Requirements:**
- Room types stored in room_types table
- Foreign key relationship with rooms table
- Validation: cannot delete type with associated rooms
- Default types provided: Classroom, Lab, Gym, Auditorium, Library

**UX Requirements:**
- Inline editing for quick changes
- Usage count shown for each type
- Confirmation dialog for deletion
- Suggested default types on first setup

---

### E2-005: Academic Year & Term Management [FULL] [P0] [4 points]

**As an** Admin
**I want** to define academic years and terms
**So that** I can organize timetables by time period

**Acceptance Criteria:**
- Given I am logged in as Admin
- When I navigate to Settings > Academic Years
- Then I can create academic years with start and end dates
- And I can add multiple terms within each year
- And terms cannot overlap within the same year
- And I can mark one term as "current"
- And I can see a calendar view of all terms

**Technical Requirements:**
- CRUD endpoints for `/api/v1/academic-years` and `/api/v1/terms`
- Date validation: terms must be within academic year bounds
- Overlap detection for terms
- Current term flag affects default timetable view

**UX Requirements:**
- Calendar visualization of academic year structure
- Drag to adjust term dates
- Quick templates: 2-term, 3-term, 4-term year
- Warning when creating timetable for past term

---

### E2-006: Bell Schedule Builder [FULL] [P0] [6 points]

**As an** Admin
**I want** to create and manage bell schedules
**So that** the timetable grid reflects our actual daily time structure

**Acceptance Criteria:**
- Given I am logged in as Admin
- When I navigate to Settings > Bell Schedule
- Then I can create multiple bell schedule variants (e.g., Normal Day, Early Release)
- And I can add periods with start and end times
- And I can mark periods as breaks or lunch
- And I can see a visual timeline of the day
- And I can assign different schedules to different days of the week

**Technical Requirements:**
- CRUD endpoints for `/api/v1/bell-schedules`
- Each schedule has multiple periods with time ranges
- Period types: LESSON, BREAK, LUNCH
- Validation: no overlapping periods, times in chronological order
- Support for multiple schedules per institution

**UX Requirements:**
- Interactive time picker for each period
- Visual timeline showing period blocks
- Drag to adjust period duration
- Copy schedule to create variants
- Templates: 6-period, 7-period, 8-period day

**Mockup References:**
- [System admin hub](../../ux-mockups/system-admin/index.html)
- [Institution settings](../../ux-mockups/system-admin/institution-settings.html)
- [Labels configuration](../../ux-mockups/system-admin/labels-configuration.html)
- [Difficulty scale / constraints](../../ux-mockups/system-admin/settings/constraints.html)
- [Academic years and terms](../../ux-mockups/system-admin/academic-years-terms.html)
- [Bell schedule builder](../../ux-mockups/system-admin/bell-schedule-builder.html)
- [Holiday calendar](../../ux-mockups/system-admin/holiday-calendar.html)

---
