# Story 7 - Publishing & Stakeholder Schedule Access

### E7-001: Publish Timetable [FULL] [P0] [4 points]

**As a** Timetabler
**I want** to publish the timetable
**So that** teachers, students, and parents can access it

**Acceptance Criteria:**
- Given I have a complete timetable with no hard conflicts
- When I click "Publish"
- Then I see a confirmation dialog with a summary
- And the timetable status changes to PUBLISHED
- And all stakeholders receive a notification
- And the timetable becomes visible to teachers, students, and parents

**Technical Requirements:**
- POST `/api/v1/timetables/{id}/publish` endpoint
- Validation: no hard constraint violations
- Status change: DRAFT → PUBLISHED
- Notification sent to all users in institution
- Published timestamp recorded

**UX Requirements:**
- Confirmation dialog with quality score and conflict summary
- Warning if quality score is low
- Option to notify specific user groups
- Success message with next steps
- Unpublish option (Admin only)

---

### E7-002: Personal Timetable Access - Teacher [FULL] [P0] [3 points]

**As a** Teacher
**I want** to access my personal timetable on any device
**So that** I always know my schedule

**Acceptance Criteria:**
- Given the timetable is published
- When I log in as a Teacher
- Then I see my personal timetable on the dashboard
- And I can view it on mobile, tablet, or desktop
- And I see today's lessons highlighted
- And I can export to PDF or iCal

**Technical Requirements:**
- Dashboard widget showing today's lessons
- Responsive design for all screen sizes
- iCal export with teacher-specific lessons
- Current lesson highlighting based on time

**UX Requirements:**
- Mobile-first design
- Today view and week view toggle
- Next lesson countdown
- Quick export button
- Offline access (PWA, future)

---

### E7-003: Personal Timetable Access - Student [FULL] [P0] [3 points]

**As a** Student
**I want** to view my class timetable on my phone
**So that** I know where to go for each lesson

**Acceptance Criteria:**
- Given the timetable is published
- When I log in as a Student
- Then I see my class's timetable
- And I see room numbers for each lesson
- And I can see today's schedule at a glance
- And I can add to my personal calendar

**Technical Requirements:**
- Student resolves to class (and option block choices)
- Mobile-optimized view
- Room information prominently displayed
- iCal export with room locations

**UX Requirements:**
- Simple, clean interface
- Large, readable text
- Current lesson highlighted
- Next lesson preview
- Share timetable with parents option

---

### E7-004: Personal Timetable Access - Parent [FULL] [P0] [3 points]

**As a** Parent
**I want** to view my child's timetable
**So that** I can plan family logistics

**Acceptance Criteria:**
- Given the timetable is published
- When I log in as a Parent
- Then I see my child's timetable
- And I can switch between multiple children if I have more than one
- And I receive notifications of timetable changes
- And I can export to my personal calendar

**Technical Requirements:**
- Parent linked to one or more students
- Read-only access to student timetables
- Notification preferences for changes
- iCal export

**UX Requirements:**
- Child selector if multiple children
- Read-only view (no edit actions)
- Clear indication of changes
- Print-friendly layout

---
