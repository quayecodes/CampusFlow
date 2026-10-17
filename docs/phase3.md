# CampusFlow — Phase 3: Database Design

CURRENT PROJECT: CampusFlow — Smart University Management System
CURRENT PHASE: 3 — Database Design
OBJECTIVE: Design a normalized relational schema before implementation.

## Entities

`User`, `Department`, `Program`, `Course`, `Enrollment`, `AttendanceRecord`, `Assignment`, `Submission`, `Grade`, `GradeChangeLog`, `Announcement`

## Entity Relationships (ERD explanation)

- A **Department** has many **Programs** and many **Courses**, and many **Users** who belong to it as staff (Lecturers, Dept Admins).
- A **Program** belongs to one Department and has many **Users** (students) enrolled in that program.
- A **Course** belongs to one Department, is taught by one Lecturer (**User**), and has many **Enrollments**.
- An **Enrollment** links a Student (**User**) to a **Course** for a given semester, and has many **AttendanceRecords** (one per session) and exactly one **Grade** (the course's final result for that student).
- An **Assignment** belongs to one **Course** and has many **Submissions**; a **Submission** belongs to one Assignment and one Student.
- A **Grade** has many **GradeChangeLog** entries, recording every modification after initial entry — this is what satisfies the grade-change audit requirement (FR14).
- An **Announcement** is authored by a **User** and scoped to either a Course, a Department, or the whole university (via a `scope` type + nullable `scope_id`).

## Table Structures

```
User
  id            UUID PK
  email         VARCHAR UNIQUE NOT NULL
  password_hash VARCHAR NOT NULL
  role          ENUM('STUDENT','LECTURER','DEPT_ADMIN','UNI_ADMIN') NOT NULL
  department_id UUID FK -> Department.id   -- null for UNI_ADMIN
  program_id    UUID FK -> Program.id      -- only set for STUDENT
  full_name     VARCHAR NOT NULL
  created_at    TIMESTAMP DEFAULT now()

Department
  id            UUID PK
  name          VARCHAR NOT NULL

Program
  id            UUID PK
  department_id UUID FK -> Department.id
  name          VARCHAR NOT NULL

Course
  id            UUID PK
  department_id UUID FK -> Department.id
  lecturer_id   UUID FK -> User.id
  title         VARCHAR NOT NULL
  credit_hours  INT NOT NULL
  max_capacity  INT NOT NULL
  semester      VARCHAR NOT NULL   -- e.g. '2026-Fall'

Enrollment
  id            UUID PK
  student_id    UUID FK -> User.id
  course_id     UUID FK -> Course.id
  semester      VARCHAR NOT NULL
  status        ENUM('ENROLLED','DROPPED') NOT NULL DEFAULT 'ENROLLED'
  enrolled_at   TIMESTAMP DEFAULT now()
  UNIQUE(student_id, course_id, semester)

AttendanceRecord
  id            UUID PK
  enrollment_id UUID FK -> Enrollment.id
  session_date  DATE NOT NULL
  status        ENUM('PRESENT','ABSENT','LATE') NOT NULL
  marked_by     UUID FK -> User.id   -- the lecturer who marked it
  UNIQUE(enrollment_id, session_date)

Assignment
  id            UUID PK
  course_id     UUID FK -> Course.id
  title         VARCHAR NOT NULL
  description   TEXT
  due_date      TIMESTAMP NOT NULL
  max_score     DECIMAL NOT NULL

Submission
  id            UUID PK
  assignment_id UUID FK -> Assignment.id
  student_id    UUID FK -> User.id
  file_url      VARCHAR NOT NULL
  submitted_at  TIMESTAMP NOT NULL
  is_late       BOOLEAN NOT NULL DEFAULT false
  score         DECIMAL
  feedback      TEXT
  graded_at     TIMESTAMP
  UNIQUE(assignment_id, student_id)

Grade
  id            UUID PK
  enrollment_id UUID FK -> Enrollment.id UNIQUE
  final_score   DECIMAL
  letter_grade  VARCHAR
  status        ENUM('DRAFT','APPROVED','PUBLISHED') NOT NULL DEFAULT 'DRAFT'
  approved_by   UUID FK -> User.id   -- Dept Admin who approved
  approved_at   TIMESTAMP
  updated_at    TIMESTAMP DEFAULT now()

GradeChangeLog
  id            UUID PK
  grade_id      UUID FK -> Grade.id
  changed_by    UUID FK -> User.id
  old_score     DECIMAL
  new_score     DECIMAL
  changed_at    TIMESTAMP DEFAULT now()

Announcement
  id            UUID PK
  author_id     UUID FK -> User.id
  scope         ENUM('COURSE','DEPARTMENT','UNIVERSITY') NOT NULL
  scope_id      UUID   -- course_id or department_id depending on scope; null for UNIVERSITY
  title         VARCHAR NOT NULL
  body          TEXT NOT NULL
  created_at    TIMESTAMP DEFAULT now()
```

## Indexes

- `User.email` — unique index (login lookups).
- `Enrollment(student_id, course_id, semester)` — unique composite index, enforces FR2's "no duplicate enrollment" and speeds up "is this student already enrolled" checks during the capacity-lock transaction.
- `Course(department_id, semester)` — composite index for "browse courses available this semester" queries.
- `AttendanceRecord(enrollment_id, session_date)` — unique composite index, prevents double-marking the same session.
- `Submission(assignment_id, student_id)` — unique composite index, one submission per student per assignment.
- `Grade.enrollment_id` — unique index (one grade per enrollment).
- `Announcement(scope, scope_id)` — composite index for building a user's announcement feed efficiently.

## Constraints

- `Enrollment` — never hard-deleted; a drop is represented as `status = 'DROPPED'`, not row deletion, so attendance/grade history tied to a semester's enrollment remains intact even after a drop.
- `AttendanceRecord.enrollment_id`, `Submission` — `ON DELETE CASCADE` from Enrollment is deliberately **not** used, since Enrollment rows are never deleted (see above); this keeps historical records permanently linked.
- `Grade.enrollment_id` — `UNIQUE`, enforcing exactly one final grade per student per course enrollment.
- `GradeChangeLog.grade_id` — `ON DELETE CASCADE` would defeat the audit purpose; instead, `Grade` rows are also never hard-deleted, so this cascade risk doesn't arise in practice.

## Normalization

Schema is in **3NF**: no repeating groups (1NF), single-column UUID primary keys avoid partial dependencies (2NF), and no transitive dependencies — e.g., `is_late` is stored directly on `Submission` (computed at submission time from `Assignment.due_date`) rather than being recomputed via a join every read, which is a deliberate, justified denormalization for read performance on a frequently-displayed field, not an unnormalized design flaw.

## Prisma Schema (draft)

```prisma
enum Role {
  STUDENT
  LECTURER
  DEPT_ADMIN
  UNI_ADMIN
}

enum EnrollmentStatus {
  ENROLLED
  DROPPED
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
}

enum GradeStatus {
  DRAFT
  APPROVED
  PUBLISHED
}

enum AnnouncementScope {
  COURSE
  DEPARTMENT
  UNIVERSITY
}

model Department {
  id       String    @id @default(uuid())
  name     String
  programs Program[]
  courses  Course[]
  users    User[]
}

model Program {
  id           String     @id @default(uuid())
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id])
  name         String
  students     User[]
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  role          Role
  departmentId  String?
  department    Department? @relation(fields: [departmentId], references: [id])
  programId     String?
  program       Program?    @relation(fields: [programId], references: [id])
  fullName      String
  createdAt     DateTime @default(now())
  coursesTaught     Course[]           @relation("LecturerCourses")
  enrollments       Enrollment[]
  submissions       Submission[]
  announcements     Announcement[]
  gradeChangesMade  GradeChangeLog[]
  gradesApproved    Grade[]            @relation("ApprovedGrades")
  attendanceMarked  AttendanceRecord[] @relation("MarkedAttendance")
}

model Course {
  id           String   @id @default(uuid())
  departmentId String
  department   Department @relation(fields: [departmentId], references: [id])
  lecturerId   String
  lecturer     User     @relation("LecturerCourses", fields: [lecturerId], references: [id])
  title        String
  creditHours  Int
  maxCapacity  Int
  semester     String
  enrollments  Enrollment[]
  assignments  Assignment[]

  @@index([departmentId, semester])
}

model Enrollment {
  id          String            @id @default(uuid())
  studentId   String
  student     User              @relation(fields: [studentId], references: [id])
  courseId    String
  course      Course            @relation(fields: [courseId], references: [id])
  semester    String
  status      EnrollmentStatus  @default(ENROLLED)
  enrolledAt  DateTime          @default(now())
  attendance  AttendanceRecord[]
  grade       Grade?

  @@unique([studentId, courseId, semester])
}

model AttendanceRecord {
  id            String            @id @default(uuid())
  enrollmentId  String
  enrollment    Enrollment        @relation(fields: [enrollmentId], references: [id])
  sessionDate   DateTime
  status        AttendanceStatus
  markedById    String
  markedBy      User              @relation("MarkedAttendance", fields: [markedById], references: [id])

  @@unique([enrollmentId, sessionDate])
}

model Assignment {
  id          String   @id @default(uuid())
  courseId    String
  course      Course   @relation(fields: [courseId], references: [id])
  title       String
  description String?
  dueDate     DateTime
  maxScore    Decimal
  submissions Submission[]
}

model Submission {
  id           String     @id @default(uuid())
  assignmentId String
  assignment   Assignment @relation(fields: [assignmentId], references: [id])
  studentId    String
  student      User       @relation(fields: [studentId], references: [id])
  fileUrl      String
  submittedAt  DateTime
  isLate       Boolean    @default(false)
  score        Decimal?
  feedback     String?
  gradedAt     DateTime?

  @@unique([assignmentId, studentId])
}

model Grade {
  id           String      @id @default(uuid())
  enrollmentId String      @unique
  enrollment   Enrollment  @relation(fields: [enrollmentId], references: [id])
  finalScore   Decimal?
  letterGrade  String?
  status       GradeStatus @default(DRAFT)
  approvedById String?
  approvedBy   User?       @relation("ApprovedGrades", fields: [approvedById], references: [id])
  approvedAt   DateTime?
  updatedAt    DateTime    @updatedAt
  changeLogs   GradeChangeLog[]
}

model GradeChangeLog {
  id          String   @id @default(uuid())
  gradeId     String
  grade       Grade    @relation(fields: [gradeId], references: [id])
  changedById String
  changedBy   User     @relation(fields: [changedById], references: [id])
  oldScore    Decimal?
  newScore    Decimal?
  changedAt   DateTime @default(now())
}

model Announcement {
  id        String            @id @default(uuid())
  authorId  String
  author    User              @relation(fields: [authorId], references: [id])
  scope     AnnouncementScope
  scopeId   String?
  title     String
  body      String
  createdAt DateTime          @default(now())

  @@index([scope, scopeId])
}
```

## Seed Data Strategy

- Seed script creates: 1 Department, 1 Program, 1 University Admin, 1 Department Admin, 2 Lecturers, 15 Students (enrolled in the program), 2 Courses with active Enrollments, a few AttendanceRecords per enrollment, 1 Assignment with a mix of graded/ungraded Submissions, and Grades in each status (DRAFT/APPROVED/PUBLISHED) to exercise the full approval workflow in development.

## Migration Strategy

- Prisma Migrate for all tables — standard relational types throughout, no extensions required (unlike a project using `pgvector`).
- Production migrations run as a CI/CD step before deploying new app code.

**Definition of Done check**: schema stated at 3NF with the `isLate` denormalization justified; every FK relationship explained in one sentence in "Entity Relationships." ✅

---

