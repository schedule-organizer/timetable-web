# Story 8 - Daily Operations - Cover, Delegation, and Temporary Schedules

### E8-001: Mark Teacher Absent and Assign Cover [FULL] [P0] [5 points]

**As a** Moderator
**I want** to mark a teacher as absent and assign cover
**So that** all their lessons are covered

**Acceptance Criteria:**
- Given a teacher is absent
- When I navigate to Cover Management
- Then I can mark the teacher as absent for specific dates
- And I see all their lessons that need cover
- And I see a list of available teachers (cover candidates)
- And I can assign cover with one click
- And the assigned teacher receives a notification

**Technical Requirements:**
- POST `/api/v1/cover` endpoint
- GET `/api/v1/cover/candidates` with availability and workload
- Cover assignment creates cover_assignment record
- Notification sent to covering teacher
- Cover badge on lesson card

**UX Requirements:**
- Quick absence form with date picker
- Lesson list with assign buttons
- Cover candidates sorted by: availability, workload, subject qualification
- Bulk assign option for all lessons
- Confirmation before assigning

---

### E8-002: Cover Candidate Ranking [BE] [P0] [3 points]

**As a** system
**I want** to rank cover candidates intelligently
**So that** moderators can quickly find the best teacher for cover

**Acceptance Criteria:**
- Given a lesson needs cover
- When the system calculates cover candidates
- Then it ranks teachers by: availability (free that period), subject qualification, current workload, proximity to room
- And unavailable teachers are excluded
- And teachers at max hours are deprioritized

**Technical Requirements:**
- Ranking algorithm considering multiple factors
- Availability check against teacher's timetable
- Qualification match bonus
- Workload calculation (current hours / max hours)
- Room proximity (if building data available)

**UX Requirements:**
- Candidate list shows ranking score
- Explanation of why each teacher is ranked
- Filter options (qualified only, available only)

---

### E8-003: Teacher Delegation Request [FULL] [P0] [4 points]

**As a** Teacher
**I want** to request another teacher to cover my lessons
**So that** I can arrange coverage for planned absences

**Acceptance Criteria:**
- Given I am logged in as a Teacher
- When I navigate to My Timetable
- Then I can select one or more of my lessons
- And I can choose a colleague to delegate to
- And I can add a note explaining the request
- And the request is sent to a Moderator for approval
- And I receive a notification when it's approved or rejected

**Technical Requirements:**
- POST `/api/v1/delegation` endpoint
- Delegation status: PENDING, APPROVED, REJECTED
- Notification to moderator and target teacher
- Approval workflow

**UX Requirements:**
- Multi-select lessons with checkboxes
- Teacher picker with search
- Optional note field
- Submit for approval button
- Status tracking page

---

### E8-004: Delegation Approval Queue [FULL] [P0] [4 points]

**As a** Moderator
**I want** to review and approve delegation requests
**So that** I can ensure coverage is appropriate

**Acceptance Criteria:**
- Given there are pending delegation requests
- When I navigate to Delegation Queue
- Then I see all pending requests
- And I can see the requesting teacher, target teacher, lessons, and reason
- And I can approve or reject each request
- And both teachers are notified of the decision

**Technical Requirements:**
- GET `/api/v1/delegation?status=PENDING` endpoint
- PATCH `/api/v1/delegation/{id}` to approve/reject
- Notifications to both teachers
- Approved delegations create cover assignments

**UX Requirements:**
- Queue list with filters (pending, approved, rejected)
- Quick approve/reject buttons
- Bulk approve option
- Conflict warnings if target teacher is unavailable
- Rejection reason field

---

### E8-005: Temporary Schedule Creation [FULL] [P0] [6 points]

**As a** Moderator
**I want** to create a temporary schedule for special weeks
**So that** I can handle exam periods, trips, and events without affecting the master timetable

**Acceptance Criteria:**
- Given I am logged in as Moderator
- When I navigate to Temporary Schedules
- Then I can create a new temporary schedule with name and date range
- And I can copy the master timetable as a starting point
- And I can modify lessons for the temporary period
- And the temporary schedule is active only during its date range
- And users see a banner indicating a temporary schedule is active

**Technical Requirements:**
- CRUD endpoints for `/api/v1/temporary-schedules`
- Temporary schedule contains modified lesson assignments
- Date range validation (start < end, no overlaps)
- Active schedule determined by current date
- Master timetable remains unchanged

**UX Requirements:**
- Wizard: name → date range → copy from master → modify
- Visual banner when viewing temporary schedule
- "Back to Master" button
- Expiry countdown
- Archive expired temporary schedules

---

### E8-006: Temporary Schedule Banner [FE] [P0] [2 points]

**As a** user viewing the timetable
**I want** to know when a temporary schedule is active
**So that** I don't confuse it with the master timetable

**Acceptance Criteria:**
- Given a temporary schedule is active
- When I view the timetable
- Then I see a prominent banner at the top
- And the banner shows the temporary schedule name and date range
- And I can click "View Master" to see the normal timetable
- And the banner is color-coded (e.g., orange) to stand out

**Technical Requirements:**
- Check for active temporary schedule on timetable load
- Banner component with schedule details
- Toggle between temporary and master view

**UX Requirements:**
- Fixed position banner (always visible)
- Clear, contrasting color
- Dismissible but reappears on page reload
- Mobile-friendly layout

**Mockup References:**
- [Daily operations hub](../../ux-mockups/daily-operations/index.html)
- [Cover management](../../ux-mockups/daily-operations/cover-management.html)
- [Delegation request](../../ux-mockups/daily-operations/delegation-request.html)
- [Delegation queue](../../ux-mockups/daily-operations/delegation-queue.html)
- [Temporary schedules](../../ux-mockups/daily-operations/temporary-schedules.html)
- [Notifications center](../../ux-mockups/notifications/notification-center.html)

---
