# Story 10 - Reporting, Auditability, and Operational Insight

### E10-001: PDF Export [FULL] [P1] [3 points]

**As a** Timetabler
**I want** to export the timetable to PDF
**So that** I can print and distribute it

**Acceptance Criteria:**
- Given I am viewing a timetable
- When I click "Export to PDF"
- Then a PDF is generated with the current view (class, teacher, room, etc.)
- And the PDF is formatted for printing (A4 or Letter)
- And I can choose portrait or landscape orientation
- And the PDF includes institution name and term dates

**Technical Requirements:**
- GET `/api/v1/timetables/{id}/export/pdf?view=class&id={classId}` endpoint
- Backend PDF generation (e.g., iText, Apache PDFBox)
- Supports all view types
- Includes header with institution logo and term info

**UX Requirements:**
- Export dialog with options (orientation, view, date range)
- Loading indicator during generation
- Auto-download when ready
- Preview option before download

---

### E10-002: CSV Export [FULL] [P1] [2 points]

**As a** Timetabler
**I want** to export the timetable to CSV
**So that** I can analyze it in Excel or import to other systems

**Acceptance Criteria:**
- Given I am viewing a timetable
- When I click "Export to CSV"
- Then a CSV file is generated with all lesson data
- And the CSV includes: class, subject, teacher, room, day, period, start time, end time
- And I can open it in Excel or Google Sheets

**Technical Requirements:**
- GET `/api/v1/timetables/{id}/export/csv` endpoint
- CSV format with headers
- UTF-8 encoding with BOM for Excel compatibility
- All lessons included (not filtered by view)

**UX Requirements:**
- One-click export
- Auto-download
- Filename includes institution name and term

---

### E10-003: iCal Export [FULL] [P1] [3 points]

**As a** Teacher or Student
**I want** to export my timetable to iCal format
**So that** I can add it to my personal calendar (Google, Apple, Outlook)

**Acceptance Criteria:**
- Given I am viewing my personal timetable
- When I click "Export to Calendar"
- Then an .ics file is generated with all my lessons
- And each lesson is a calendar event with: title, location (room), start time, end time, recurrence
- And I can import it into any calendar app

**Technical Requirements:**
- GET `/api/v1/timetables/{id}/export/ical?view=teacher&id={teacherId}` endpoint
- iCal format (RFC 5545)
- Recurring events for weekly lessons
- Location field contains room name
- VALARM for reminders (optional)

**UX Requirements:**
- Export button on personal timetable view
- Instructions for importing to popular calendar apps
- Option to include/exclude breaks
- Reminder preference (5 min, 10 min, 15 min before)

---

### E10-004: Teacher Utilization Report [FULL] [P1] [4 points]

**As a** Principal
**I want** to see a report of teacher workload
**So that** I can ensure fair distribution of teaching hours

**Acceptance Criteria:**
- Given I am logged in as Admin or Moderator
- When I navigate to Reports > Teacher Utilization
- Then I see a table of all teachers with: assigned hours, max hours, utilization percentage
- And I can see a bar chart comparing teachers
- And I can filter by department or subject
- And I can export the report to PDF or CSV

**Technical Requirements:**
- GET `/api/v1/reports/teacher-utilization?termId={termId}` endpoint
- Calculate: assigned hours = count of lessons × lesson duration
- Utilization = (assigned hours / max hours) × 100
- Group by teacher, sort by utilization

**UX Requirements:**
- Table with sortable columns
- Bar chart (Recharts) showing utilization
- Color coding: green (<80%), yellow (80-100%), red (>100%)
- Filter by department, subject, employment type
- Export buttons

---

### E10-005: Room Utilization Report [FULL] [P1] [3 points]

**As a** Principal
**I want** to see a report of room usage
**So that** I can identify underutilized spaces

**Acceptance Criteria:**
- Given I am logged in as Admin or Moderator
- When I navigate to Reports > Room Utilization
- Then I see a table of all rooms with: occupied periods, total periods, utilization percentage
- And I can see which rooms are most/least used
- And I can filter by room type or building
- And I can export the report

**Technical Requirements:**
- GET `/api/v1/reports/room-utilization?termId={termId}` endpoint
- Calculate: occupied periods = count of lessons in room
- Total periods = periods per week × weeks in term
- Utilization = (occupied / total) × 100

**UX Requirements:**
- Table with sortable columns
- Heatmap visualization of room usage
- Filter by room type, building, capacity
- Highlight underutilized rooms (<50%)

---

### E10-006: Subject Coverage Report [FULL] [P1] [3 points]

**As a** Department Head
**I want** to see a report of subject coverage
**So that** I can verify all required hours are scheduled

**Acceptance Criteria:**
- Given I am logged in as Admin or Moderator
- When I navigate to Reports > Subject Coverage
- Then I see a table of all subjects with: required hours, scheduled hours, coverage percentage
- And I can see which subjects are under/over-scheduled
- And I can drill down to see which classes are affected
- And I can export the report

**Technical Requirements:**
- GET `/api/v1/reports/subject-coverage?termId={termId}` endpoint
- Required hours from class_subject_hours
- Scheduled hours from lessons
- Coverage = (scheduled / required) × 100

**UX Requirements:**
- Table with sortable columns
- Color coding: red (<100%), green (100%), yellow (>100%)
- Drill-down to class-level detail
- Warning for subjects with <100% coverage

---

### E10-007: Audit Log [FULL] [P1] [3 points]

**As an** Admin
**I want** to see a log of all changes to the timetable
**So that** I can track who made what changes and when

**Acceptance Criteria:**
- Given I am logged in as Admin
- When I navigate to Reports > Audit Log
- Then I see a paginated list of all changes
- And each entry shows: timestamp, user, action, entity type, entity ID, old value, new value
- And I can filter by date range, user, action type, entity type
- And I can export the log to CSV

**Technical Requirements:**
- GET `/api/v1/audit-log` with pagination and filters
- Audit log table with: id, timestamp, user_id, action, entity_type, entity_id, old_value, new_value
- Actions: CREATE, UPDATE, DELETE, PUBLISH, APPROVE, REJECT
- Entity types: LESSON, TEACHER, CLASS, ROOM, SUBJECT, TIMETABLE, COVER, DELEGATION

**UX Requirements:**
- Paginated table (TanStack Table)
- Date range picker
- Filter dropdowns for user, action, entity type
- Search by entity ID
- Export to CSV

---
