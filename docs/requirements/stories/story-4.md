# Story 4 - Holiday & Vacation Calendar

### E4-001: Holiday Calendar Management [FULL] [P0] [5 points]

**As an** Admin
**I want** to manage holidays and vacation periods
**So that** the timetable respects non-teaching days

**Acceptance Criteria:**
- Given I am logged in as Admin
- When I navigate to Calendar
- Then I can view all holidays and vacations
- And I can manually add holidays with name, date, and type
- And I can import public holidays from a country-specific API
- And I can mark multi-day vacation periods
- And holidays are visually indicated in the timetable grid

**Technical Requirements:**
- CRUD endpoints for `/api/v1/holidays`
- POST `/api/v1/holidays/import` with country parameter
- Integration with public holiday API (e.g., Calendarific, Nager.Date)
- Holiday types: PUBLIC_HOLIDAY, VACATION, STAFF_DEVELOPMENT, CUSTOM
- Date range support for multi-day periods

**UX Requirements:**
- Calendar view showing all holidays
- Country selector for import with preview
- Bulk import confirmation dialog
- Color-coded holiday types
- Recurring holiday support (e.g., every Monday)

---
