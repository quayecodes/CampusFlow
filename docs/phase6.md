# Phase 6 — Core Application Features Documentation

## Executive Summary

Phase 6 implements the core academic and administrative workflows for CampusFlow:
1. **Course Browsing & Transactional Registration** (FR1, FR2, FR3)
2. **Attendance Tracking & Roll Call Marking** (FR4, FR5, FR6)
3. **Assignment Creation, File Submission & Grading** (FR7, FR8, FR9, FR10)
4. **Results, GPA Calculation & Grade Approval Workflow** (FR11, FR12, FR13, FR14)
5. **Scoped Announcements & Unified Notification Feed** (FR15, FR16, FR17, FR18)

Every feature strictly enforces:
- Separation of business logic (`src/services/`) from HTTP handlers (`src/app/api/v1/`).
- Server-side role authorization and data isolation.
- Comprehensive loading, empty, and validation feedback states.
- Dedicated automated integration test suites.

---

## 1. Feature Breakdown & Acceptance Criteria

### Feature 1: Course Browsing & Transactional Registration
- **Domain Service:** `src/services/enrollmentService.ts`
- **APIs:** `GET /api/v1/courses`, `GET & POST /api/v1/enrollments`, `PATCH /api/v1/enrollments/[id]/drop`
- **UI:** `src/components/courses/CourseCard.tsx`, `src/app/(student)/student/courses/page.tsx`
- **Key Architectural Solution:** Over-enrollment is prevented using interactive database transactions (`prisma.$transaction`). The course row's active enrollment count is checked atomically against `maxCapacity` before inserting the enrollment row, eliminating race conditions under concurrent requests.
- **Verification:** `scripts/test-course-registration.ts` (6/6 tests passing).

### Feature 2: Attendance Tracking & Marking
- **Domain Service:** `src/services/attendanceService.ts`
- **APIs:** `GET /api/v1/attendance/courses`, `GET & POST /api/v1/attendance/courses/[courseId]`, `GET /api/v1/attendance/student`
- **UI:** `src/components/attendance/AttendanceBadge.tsx`, `src/components/attendance/AttendanceThresholdBadge.tsx`, `src/app/(lecturer)/lecturer/attendance/page.tsx`, `src/app/(student)/student/attendance/page.tsx`
- **Key Features:**
  - Lecturer roll call sheet with Present, Late, and Absent status marking and quick bulk actions.
  - Automatic UTC date normalization preventing duplicate sessions for the same calendar date.
  - Mandatory 75% attendance threshold compliance monitoring (FR6) dynamically flagging at-risk students on both lecturer and student dashboards.
- **Verification:** `scripts/test-attendance.ts` (8/8 tests passing).

### Feature 3: Assignment Creation, File Submission & Grading
- **Domain Service:** `src/services/assignmentService.ts`
- **APIs:** `GET & POST /api/v1/assignments`, `GET /api/v1/assignments/[id]`, `POST /api/v1/assignments/[id]/submit`, `PATCH /api/v1/assignments/[id]/grade`, `POST /api/v1/uploads`
- **UI:** `src/app/(lecturer)/lecturer/assignments/page.tsx`, `src/app/(student)/student/assignments/page.tsx`
- **Key Features:**
  - Lecturer coursework creation (title, description, due date, max score).
  - Student file submissions via multipart upload to `/public/uploads/` with sanitized file identifiers.
  - Automatic late submission detection (FR10): flags `isLate = true` when submitted after deadline without rejecting submission.
  - Lecturer grading interface with bounds validation (`0 <= score <= maxScore`) and qualitative feedback.
- **Verification:** `scripts/test-assignments.ts` (8/8 tests passing).

### Feature 4: Results, GPA Calculation & Grade Approval Workflow
- **Domain Service:** `src/services/gradeService.ts`
- **APIs:** `GET & POST /api/v1/grades/courses/[courseId]`, `GET /api/v1/grades/dept-admin/queue`, `POST /api/v1/grades/dept-admin/approve`, `GET /api/v1/grades/dept-admin/audit`, `GET /api/v1/grades/student`
- **UI:** `src/app/(lecturer)/lecturer/grades/page.tsx`, `src/app/(dept-admin)/dept-admin/grades/page.tsx`, `src/app/(student)/student/results/page.tsx`
- **Key Features:**
  - Lecturer final percentage score entry with real-time letter grade calculation on a standard 4.0 GPA scale.
  - Department Admin review queue and official publication workflow (FR12).
  - Complete data privacy: unapproved draft grades are mathematically hidden and never leaked to students.
  - Official student transcript view with semester GPA calculation and honours classifications.
  - Persistent `GradeChangeLog` audit trail (FR14) recording before/after values, modifier identity, and timestamps whenever published grades are revised.
- **Verification:** `scripts/test-grades.ts` (8/8 tests passing).

### Feature 5: Scoped Announcements & Unified Notification Feed
- **Domain Service:** `src/services/announcementService.ts`
- **APIs:** `GET & POST /api/v1/announcements`, `DELETE /api/v1/announcements/[id]`
- **UI:** `src/components/announcements/AnnouncementCard.tsx`, `src/components/announcements/AnnouncementFeed.tsx`, dedicated portal feeds across all 4 roles.
- **Key Features:**
  - Role-scoped creation boundaries: `UNIVERSITY` (Uni Admin), `DEPARTMENT` (Dept Admin), `COURSE` (Lecturer).
  - Single unified feed for every user dynamically combining announcements relevant to their enrolled courses, department, and campus-wide broadcasts (FR18).
  - Scope pill badges, full-text search, and author deletion actions.
- **Verification:** `scripts/test-announcements.ts` (8/8 tests passing).

---

## 2. Test Suites Summary

| Test Suite Script | Module | Tests Passed | Status |
|---|---|---|---|
| `scripts/test-course-registration.ts` | Course Registration & Transactions | 6 / 6 | ✅ PASS |
| `scripts/test-attendance.ts` | Attendance & 75% Threshold | 8 / 8 | ✅ PASS |
| `scripts/test-assignments.ts` | Assignments, Uploads & Grading | 8 / 8 | ✅ PASS |
| `scripts/test-grades.ts` | Grades, GPA & Approval Workflow | 8 / 8 | ✅ PASS |
| `scripts/test-announcements.ts` | Scoped Announcements & Feed | 8 / 8 | ✅ PASS |
| **Total Automated Tests** | | **38 / 38** | **100% PASS** |

---

## 3. Production Build Status

- **Command:** `npx next build`
- **Status:** Exit code 0 (Passing)
- **Routes Compiled:** 36 static and dynamic routes
- **TypeScript & Linting:** 0 errors
