# CampusFlow — Phase 1: Requirements & Project Planning

CURRENT PROJECT: CampusFlow — Smart University Management System
CURRENT PHASE: 1 — Requirements & Project Planning
OBJECTIVE: Define scope, requirements, and roadmap before any architecture or code work.

## Assumptions Made (confirm or correct before Phase 4)

This brief covers five modules (registration, attendance, assignments, results, announcements) across four roles — genuinely large scope for a portfolio project. To keep it buildable, MVP goes **broad but shallow**: all five modules exist, but each at a straightforward implementation, with depth features pushed to stretch.

1. **Single institution deployment** for MVP (not multi-tenant SaaS for multiple universities).
2. **Attendance is manually marked by the lecturer** (present/absent/late per session) — not GPS or biometric. You already have a separate GPS + rotating-token attendance project; keeping CampusFlow's attendance simple avoids duplicating that work, and the two could integrate later if you choose.
3. **Course registration** is browse-and-enroll within a registration window and a credit-hour cap — no prerequisite engine or waitlist system in MVP.
4. **Results have an approval step**: a lecturer enters grades, but a Department Admin must approve/publish before students can see them — this models real academic integrity practice and gives the Dept Admin role a meaningful MVP function.
5. **No transcript PDF generation** in MVP — students see results/GPA in the app; formal transcript documents are a stretch feature.
6. **Announcements are text-only** in MVP (no file attachments) — kept simple to control scope.

---

## Project Overview

CampusFlow is a centralized platform for a university's core academic operations: course registration, attendance tracking, assignment submission and grading, results management with an approval workflow, and role-scoped announcements — replacing disconnected manual processes with one integrated system.

## Problem Statement

Universities relying on separate spreadsheets, paper attendance sheets, and email for these processes suffer from data duplication, delayed communication, and no single source of truth for a student's academic record. CampusFlow consolidates these into one system with clear role-based access.

## User Personas

| Persona | Role | Goals |
|---|---|---|
| **Student** | Primary end user | Register for courses, view attendance, submit assignments, check results/GPA, see relevant announcements |
| **Lecturer** | Content/grading owner | Mark attendance, create and grade assignments, enter final grades, post course announcements |
| **Department Admin** | Departmental oversight | Approve/publish grades for their department's courses, post department-wide announcements, manage courses within their department |
| **University Admin** | System-wide oversight | Manage departments and top-level user accounts, post university-wide announcements, view system-wide activity |

## Functional Requirements

**Course Registration**
- FR1: Student can browse courses available for their program and current semester.
- FR2: Student can register for or drop a course within the defined registration window.
- FR3: System enforces a per-semester credit-hour cap and prevents over-enrollment past a course's max capacity.

**Attendance**
- FR4: Lecturer can mark attendance (present/absent/late) for each session of a course they teach.
- FR5: Student can view their own attendance record per enrolled course.
- FR6: System flags a student whose attendance falls below a configurable threshold (e.g., 75%).

**Assignments**
- FR7: Lecturer can create an assignment (title, description, due date, max score) for a course.
- FR8: Student can submit a file for an assignment before its due date.
- FR9: Lecturer can grade a submission and leave feedback.
- FR10: System flags and logs late submissions rather than silently accepting or rejecting them.

**Results**
- FR11: Lecturer can enter/update final grades per student per course.
- FR12: Department Admin must approve and publish a course's grades before students can view them.
- FR13: Student can view published results and their computed GPA.
- FR14: Every change to a published grade is logged (who changed it, old value, new value, when) — academic integrity requirement.

**Announcements**
- FR15: Lecturer can post an announcement visible to students enrolled in their course.
- FR16: Department Admin can post an announcement visible to their entire department.
- FR17: University Admin can post an announcement visible university-wide.
- FR18: Every user sees a single feed combining announcements relevant to their role/scope.

## Non-Functional Requirements

- **Performance**: dashboard and course-list pages load in under 2 seconds under normal load.
- **Peak concurrency**: system supports at least 1,000 concurrent users during a registration window (the known burst-traffic period for this kind of system), and at least 300 concurrent users otherwise.
- **Data integrity**: registration enforces course capacity atomically (no race-condition over-enrollment when many students register simultaneously); every grade change after publication is logged per FR14.
- **Security**: role-based access control strictly enforced server-side on every request — a Department Admin can act only within their own department, a Lecturer only on courses they teach, a Student only on their own records.
- **Availability**: 99% uptime overall, with a stricter internal target during registration windows given the concurrency spike.
- **Auditability**: grade-change logs retained for at least 1 academic year.

## Feature Prioritization

**MVP**
- Auth + 4-role RBAC (Student, Lecturer, Dept Admin, Uni Admin), department-scoped where applicable
- Course registration (browse/register/drop within window, credit cap, capacity enforcement)
- Manual attendance marking, student view, threshold flagging
- Assignment creation, submission, grading with feedback
- Results entry → Dept Admin approval → publish → student GPA view, with change audit log
- Role-scoped announcements with a unified feed

**Advanced / Stretch**
- Prerequisite checking and waitlist system for registration
- GPS/biometric attendance (potential integration point with your existing attendance project)
- Transcript PDF generation
- Plagiarism detection for assignment submissions
- Push/email notifications for announcements
- Native mobile app

## Development Roadmap (rough sequencing)

1. Phase 1 (this document) — done
2. Phase 2: architecture and tech stack
3. Phase 3: database design
4. Phase 4: project scaffold
5. Phase 5: auth + RBAC
6. Phase 6: registration → attendance → assignments → results/approval workflow → announcements (one feature at a time, approved before the next)
7. Phase 7: UI/UX pass
8. Phase 8: testing + security review (RBAC boundary testing is the priority here)
9. Phase 9: CI/CD + deployment
10. Phase 10: documentation + GitHub presentation

**Definition of Done check**: every MVP feature (FR1–FR18) has a one-line acceptance criterion; NFRs carry specific numbers (2s page load, 1,000 concurrent users at peak, 75% attendance threshold, 99% uptime, 1-year audit retention). ✅


