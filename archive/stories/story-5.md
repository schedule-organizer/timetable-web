# Story 5 - Timetable Workspace & Multi-View Navigation

### E5-001: Timetable Grid - Master View [FULL] [P0] [13 points]

**As a** Timetabler
**I want** to view the complete timetable in a grid format
**So that** I can see all lessons across all classes, teachers, and rooms

**Acceptance Criteria:**
- Given I am logged in as Timetabler
- When I navigate to Timetable
- Then I see a grid with days as columns and periods as rows
- And each cell can contain multiple lesson cards
- And lesson cards show class, subject, teacher, and room
- And I can scroll horizontally and vertically for large timetables
- And the grid updates in real-time when other users make changes

**Technical Requirements:**
- GET `/api/v1/timetables/{id}/lessons` endpoint
- CSS Grid layout with dynamic columns/rows based on bell schedule and cycle
- React Query for data fetching and caching
- WebSocket subscription to `/topic/timetable/{id}` for real-time updates
- Responsive design with horizontal scroll for mobile

**UX Requirements:**
- Fixed header row (days) and column (periods)
- Smooth scrolling with scroll shadows
- Loading skeleton during data fetch
- Empty state for new timetables
- Zoom controls for dense timetables

---

### E5-002: Lesson Card Component [FE] [P0] [5 points]

**As a** user viewing the timetable
**I want** to see lesson details in a compact card format
**So that** I can quickly understand what's scheduled

**Acceptance Criteria:**
- Given I am viewing a timetable
- When I look at a lesson card
- Then I see class name, subject, teacher, and room
- And the card is color-coded by subject
- And I can see visual indicators for: pinned lessons, conflicts, cover assignments
- And I can right-click or long-press to open a context menu

**Technical Requirements:**
- LessonCard component with multiple visual states
- Subject color from subject.color_hex
- Conflict badge with red indicator
- Pin indicator (lock icon)
- Cover badge (dashed border)
- Context menu with actions: Pin, Swap, Move, Edit, Mark Forbidden

**UX Requirements:**
- Compact design fitting 3-4 cards per cell
- Truncated text with tooltip on hover
- Accessible keyboard navigation
- Touch-friendly tap targets (min 44x44px)
- Smooth transitions between states

---

### E5-003: View Switcher - Class View [FULL] [P0] [5 points]

**As a** Timetabler or Principal
**I want** to view the timetable filtered by a specific class
**So that** I can see that class's complete weekly schedule

**Acceptance Criteria:**
- Given I am viewing the timetable
- When I select "Class View" and choose a class
- Then I see only lessons for that class
- And the grid shows one lesson per cell (no overlaps)
- And I can navigate between classes using a dropdown or sidebar
- And the URL updates to reflect the selected class

**Technical Requirements:**
- Route: `/timetable/:termId/class/:classId`
- Filter lessons by class_id on frontend
- React Router navigation with URL params
- Breadcrumb navigation showing current class

**UX Requirements:**
- Class selector dropdown with search
- Previous/Next class navigation buttons
- Print-friendly layout
- Export button for this class's timetable

---

### E5-004: View Switcher - Teacher View [FULL] [P0] [5 points]

**As a** Teacher
**I want** to view my personal timetable
**So that** I know when and where I'm teaching

**Acceptance Criteria:**
- Given I am logged in as a Teacher
- When I navigate to My Timetable
- Then I see only my assigned lessons
- And I see my free periods clearly marked
- And I can see cover assignments and delegations
- And I can export my timetable to PDF or iCal

**Technical Requirements:**
- Route: `/timetable/:termId/teacher/:teacherId`
- Filter lessons by teacher_id
- Include cover assignments and delegations
- Free periods calculated from bell schedule

**UX Requirements:**
- Highlight current period
- Free period cells with distinct styling
- Cover assignments with special badge
- Quick export to personal calendar
- Mobile-optimized view

---

### E5-005: View Switcher - Room View [FULL] [P0] [3 points]

**As a** Timetabler
**I want** to view the timetable for a specific room
**So that** I can see room utilization and avoid double-bookings

**Acceptance Criteria:**
- Given I am viewing the timetable
- When I select "Room View" and choose a room
- Then I see all lessons scheduled in that room
- And I can see room capacity vs. class size
- And conflicts (double-bookings) are highlighted
- And I can see room utilization percentage

**Technical Requirements:**
- Route: `/timetable/:termId/room/:roomId`
- Filter lessons by room_id
- Calculate utilization: (occupied periods / total periods) × 100
- Highlight conflicts where multiple lessons share same period

**UX Requirements:**
- Room selector with capacity info
- Utilization percentage badge
- Empty periods clearly marked
- Warning for over-capacity assignments

---

### E5-006: View Switcher - Subject View [FULL] [P0] [3 points]

**As a** Department Head
**I want** to view all lessons for a specific subject
**So that** I can ensure subject coverage and teacher allocation

**Acceptance Criteria:**
- Given I am viewing the timetable
- When I select "Subject View" and choose a subject
- Then I see all lessons for that subject across all classes
- And I can see which teachers are teaching the subject
- And I can see subject distribution across the week
- And I can verify total hours match requirements

**Technical Requirements:**
- Route: `/timetable/:termId/subject/:subjectId`
- Filter lessons by subject_id
- Group by teacher or class (toggle)
- Calculate total hours vs. required hours

**UX Requirements:**
- Subject selector with difficulty badge
- Teacher breakdown table
- Coverage summary (required vs. scheduled hours)
- Distribution chart showing lessons per day

---

### E5-007: View Switcher - Student View [FULL] [P0] [5 points]

**As a** Student
**I want** to view my personal timetable
**So that** I know where to go for each lesson

**Acceptance Criteria:**
- Given I am logged in as a Student
- When I navigate to My Timetable
- Then I see my class's timetable
- And if I have option block choices, I see only my selected options
- And I see room numbers for each lesson
- And I can export to my personal calendar
- And I receive notifications for timetable changes

**Technical Requirements:**
- Route: `/timetable/:termId/student/:studentId`
- Resolve student's class and option block enrollments
- Filter lessons accordingly
- iCal export with room locations

**UX Requirements:**
- Simple, clean layout optimized for mobile
- Current lesson highlighted
- Next lesson preview
- Room directions (if building/floor data available)
- Push notification opt-in

**Mockup References:**
- [Moderator flow board](../../ux-mockups/moderator/index.html)
- [Class view switcher](../../ux-mockups/moderator/view-switcher-class.html)
- [Teacher view switcher](../../ux-mockups/moderator/view-switcher-teacher.html)
- [Room view switcher](../../ux-mockups/moderator/view-switcher-room.html)
- [Subject view switcher](../../ux-mockups/moderator/view-switcher-subject.html)
- [Weekly class overview](../../ux-mockups/moderator/weekly-class-overview.html)
- [Moderator timetable](../../ux-mockups/moderator-timetable.html)
- [Timetable access hub](../../ux-mockups/timetable-access/index.html)
- [Master timetable](../../ux-mockups/timetable-access/master-timetable.html)
- [Teacher timetable](../../ux-mockups/timetable-access/teacher-timetable.html)
- [Student timetable](../../ux-mockups/timetable-access/student-timetable.html)
- [Parent timetable](../../ux-mockups/timetable-access/parent-timetable.html)

---
