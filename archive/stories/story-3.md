# Story 3 - Core Resource Management

### E3-001: Room Management [FULL] [P0] [5 points]

**As an** Admin or Moderator
**I want** to manage rooms in my institution
**So that** the scheduling engine can assign lessons to appropriate spaces

**Acceptance Criteria:**
- Given I am logged in as Admin or Moderator
- When I navigate to Rooms
- Then I can view a list of all rooms
- And I can add new rooms with name, capacity, type, and building
- And I can edit and delete rooms
- And I cannot delete rooms that are assigned to lessons
- And I can mark rooms as unavailable for certain periods

**Technical Requirements:**
- CRUD endpoints for `/api/v1/rooms`
- Room fields: name, capacity, room_type_id, building, floor
- Soft delete with usage check
- Forbidden slots for room unavailability
- Search and filter by type, building, capacity

**UX Requirements:**
- Grid view with sortable columns
- Quick add form in modal
- Bulk import from CSV
- Visual indicator for rooms in use
- Forbidden slot editor (grid similar to availability)

---

### E3-002: Subject Management [FULL] [P0] [4 points]

**As an** Admin or Moderator
**I want** to manage subjects taught at my institution
**So that** I can assign them to classes and teachers

**Acceptance Criteria:**
- Given I am logged in as Admin or Moderator
- When I navigate to Subjects
- Then I can view all subjects
- And I can add subjects with name, code, difficulty level, and color
- And I can configure subject spread preferences (min/max lessons per day)
- And I can mark subjects as requiring specific room types
- And I cannot delete subjects assigned to teaching groups

**Technical Requirements:**
- CRUD endpoints for `/api/v1/subjects`
- Subject fields: name, code, difficulty_level, color_hex, spread_min, spread_max
- Room type requirements (many-to-many relationship)
- Color picker for visual identification
- Validation: unique subject codes

**UX Requirements:**
- Color-coded subject list
- Difficulty badge on each subject
- Spread configuration with slider (0-5 lessons/day)
- Room type multi-select
- Subject usage count displayed

---

### E3-003: Class Management [FULL] [P0] [6 points]

**As an** Admin or Moderator
**I want** to manage school classes
**So that** I can define which subjects each class needs

**Acceptance Criteria:**
- Given I am logged in as Admin or Moderator
- When I navigate to Classes
- Then I can view all classes
- And I can add classes with name, year level, and student count
- And I can define required subject hours for each class (Subject Hours Matrix)
- And I can see total weekly hours for each class
- And I can copy class configurations to create similar classes

**Technical Requirements:**
- CRUD endpoints for `/api/v1/classes`
- GET/PUT `/api/v1/classes/{id}/subject-hours` for hours matrix
- Class fields: name, year_level, student_count, academic_year_id
- Subject hours stored as class_subject_hours table
- Validation: total hours must fit within weekly schedule

**UX Requirements:**
- Subject Hours Matrix: editable grid with classes as rows, subjects as columns
- Auto-calculate total weekly hours
- Warning if total exceeds available periods
- Clone class button for quick setup
- Bulk edit for multiple classes

---

### E3-004: Teacher Management [FULL] [P0] [7 points]

**As an** Admin or Moderator
**I want** to manage teacher profiles and qualifications
**So that** the scheduling engine assigns teachers to appropriate subjects

**Acceptance Criteria:**
- Given I am logged in as Admin or Moderator
- When I navigate to Teachers
- Then I can view all teachers
- And I can add/edit teacher details (name, email, max hours per week)
- And I can assign subject qualifications to each teacher
- And I can define teacher availability and forbidden slots
- And I can see each teacher's current workload

**Technical Requirements:**
- CRUD endpoints for `/api/v1/teachers`
- POST/DELETE `/api/v1/teachers/{id}/qualifications` for subject assignments
- GET `/api/v1/teachers/{id}/availability` for availability grid
- Teacher fields: user_id, max_hours_per_week, employment_type
- Forbidden slots stored in forbidden_slots table

**UX Requirements:**
- Teacher list with workload indicators
- Subject qualification multi-select with badges
- Availability grid (same structure as timetable grid)
- Click cells to toggle forbidden slots
- Visual workload bar (current hours / max hours)
- Filter by qualification, availability, workload

---

### E3-005: Teaching Group Management [FULL] [P0] [5 points]

**As an** Admin or Moderator
**I want** to create teaching groups
**So that** I can handle class splits and cross-class groupings

**Acceptance Criteria:**
- Given I am logged in as Admin or Moderator
- When I navigate to Teaching Groups
- Then I can create groups from one or more classes
- And I can assign a subject and teacher to each group
- And I can specify the number of lessons per week
- And I can see which students are in each group (if student data available)
- And I can handle both class splits (one class, multiple groups) and merges (multiple classes, one group)

**Technical Requirements:**
- CRUD endpoints for `/api/v1/teaching-groups`
- Teaching group fields: name, subject_id, teacher_id, lessons_per_week
- Many-to-many relationship with classes
- Validation: teacher must be qualified for subject
- Validation: total lessons must match class subject hours

**UX Requirements:**
- Wizard for creating groups: select classes → select subject → assign teacher → set lessons
- Visual representation of class splits and merges
- Conflict warnings if teacher is overallocated
- Quick create from class subject hours matrix

---

### E3-006: Option Block Builder [FULL] [P0] [6 points]

**As an** Admin or Moderator
**I want** to create option blocks for elective subjects
**So that** students can choose from multiple subjects scheduled at the same time

**Acceptance Criteria:**
- Given I am logged in as Admin or Moderator
- When I navigate to Option Blocks
- Then I can create an option block with a name and target classes
- And I can add multiple subjects to the block
- And I can assign teachers to each subject option
- And I can see student enrollment in each option (if student data available)
- And the scheduling engine schedules all options in the block simultaneously

**Technical Requirements:**
- CRUD endpoints for `/api/v1/option-blocks`
- Option block contains multiple teaching groups
- Constraint: all groups in block must be scheduled at same time
- Many-to-many relationship with classes
- Student enrollment tracking (optional for MVP)

**UX Requirements:**
- Wizard: name block → select classes → add subject options → assign teachers
- Visual representation of option structure
- Enrollment balance indicator
- Warning if option has no teacher assigned
- Preview of how block appears in timetable

**Mockup References:**
- [Teachers list](../../ux-mockups/system-admin/teachers-view.html)
- [Add teacher](../../ux-mockups/system-admin/add-teacher.html)
- [Edit teacher](../../ux-mockups/system-admin/edit-teacher.html)
- [Teacher detail](../../ux-mockups/system-admin/teacher-detail.html)
- [Subject management](../../ux-mockups/system-admin/subject-management.html)
- [Class management](../../ux-mockups/system-admin/class-management.html)
- [Room management](../../ux-mockups/system-admin/room-management.html)
- [Teaching groups](../../ux-mockups/system-admin/teaching-groups.html)
- [Option block builder](../../ux-mockups/system-admin/option-block-builder.html)

---
