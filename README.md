# CampusFlow — Smart University Management System

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Relational_DB-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Auth.js](https://img.shields.io/badge/Auth.js-NextAuth_v5-purple?style=flat&logo=auth0)](https://authjs.dev/)

CampusFlow is a production-grade, centralized university management platform designed to unify academic workflows: concurrent course registration with race-condition locking, session attendance roll call with mandatory 75% compliance monitoring, coursework file submissions with automatic late detection, a multi-stage grade approval workflow with post-publication audit logging, and role-scoped campus announcements.

---

## 📌 Problem Statement

Many academic institutions rely on fragmented software, manual paperwork, and disconnected portals to manage student records, enrollments, attendance, and grading. This causes:
- **Registration Bottlenecks**: Race conditions and over-capacity enrollments during peak registration windows.
- **Attendance Compliance Risks**: Manual attendance tracking makes identifying students falling below mandatory participation thresholds (e.g., 75%) difficult until exam periods.
- **Audit Deficiencies**: Grade modifications without departmental approval trails or tamper-evident logging.
- **Communication Silos**: Lack of a unified notification feed combining course, department, and university broadcasts.

CampusFlow provides an integrated, role-governed web application designed to eliminate operational friction, guarantee database-level concurrency protection, and uphold academic governance.

---

## 🚀 Implemented Modules & Architecture

### 1. Course Browsing & Transactional Registration (FR1, FR2, FR3)
- **Domain Service**: `src/services/enrollmentService.ts`
- **Concurrency Protection**: Registration executes inside interactive Prisma database transactions (`prisma.$transaction`) verifying available seats atomically before inserting the enrollment record.
- **Features**: Live credit hours counter (enforcing an 18-credit maximum limit), capacity status meters (`<70%` green, `70-99%` amber, `100%` full), duplicate registration prevention, and drop course workflows.

### 2. Attendance Tracking & Roll Call Marking (FR4, FR5, FR6)
- **Domain Service**: `src/services/attendanceService.ts`
- **Features**: 
  - Lecturer roll call sheet with single-click Present, Late, and Absent status toggles and bulk actions.
  - Automatic UTC date normalization to prevent duplicate sessions for the same calendar date.
  - **FR6 Compliance**: Dynamic 75% participation threshold monitoring, instantly displaying compliance warnings to at-risk students and alerting instructors.

### 3. Coursework Creation, File Submission & Grading (FR7, FR8, FR9, FR10)
- **Domain Service**: `src/services/assignmentService.ts`
- **Features**:
  - Lecturer assignment creation (title, instructions, due date, max score).
  - Multipart coursework attachment uploads to `/public/uploads/` with collision-safe file identifiers.
  - **FR10 Late Detection**: Automatically flags and logs late submissions (`isLate = true`) submitted past the deadline without rejecting student work.
  - Lecturer grading drawer with score bounds validation (`0 <= score <= maxScore`) and qualitative feedback.

### 4. Results, GPA Calculation & Grade Approval Workflow (FR11, FR12, FR13, FR14)
- **Domain Service**: `src/services/gradeService.ts`
- **Features**:
  - Three-stage lifecycle: `DRAFT` (Lecturer) $\to$ `APPROVED` $\to$ `PUBLISHED` (Department Admin).
  - **Data Privacy**: Draft/unapproved grades are mathematically hidden and never leaked to students.
  - Official student transcript calculating weighted semester GPA on a standard 4.0 scale with honours classifications.
  - **FR14 Audit Trail**: Every modification to a published grade is permanently recorded in `GradeChangeLog` capturing the previous score, new score, modifier identity, and exact timestamp.

### 5. Scoped Announcements & Unified Feed (FR15, FR16, FR17, FR18)
- **Domain Service**: `src/services/announcementService.ts`
- **Features**:
  - Hierarchical creation permissions: `UNIVERSITY` (Uni Admin), `DEPARTMENT` (Dept Admin), `COURSE` (Lecturer).
  - **FR18 Unified Feed**: A single bulletin feed synthesizing notifications based on the user's role, department affiliation, and enrolled courses while strictly isolating unrelated departments.

---

## 🛠️ Tech Stack & Decisions

| Layer | Technology | Key Decision & Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router, React 19) | Full-stack server components, nested layouts, edge middleware |
| **Language** | TypeScript (Strict Mode) | End-to-end static typing and domain contract enforcement |
| **Styling** | Tailwind CSS v4 + PostCSS | Token-driven styling with zero runtime overhead |
| **Database** | PostgreSQL | Relational integrity, ACID transactions, foreign key constraints |
| **ORM** | Prisma ORM | Type-safe queries, migration control, and relation queries |
| **Authentication** | NextAuth.js v5 + bcryptjs | Secure JWT session cookies, 12-round bcrypt password hashing |
| **Security & RBAC** | Edge Middleware | Centralized route protection guarding role-specific namespaces |

---

## 📂 Project Structure

```text
CampusFlow/
├── docs/                             # Engineering phase specifications
│   ├── phase1.md                     # Requirements & feature prioritization
│   ├── phase2.md                     # System architecture & threat modeling
│   ├── phase3.md                     # 3NF database schema & ERD definitions
│   ├── phase4.md                     # Project initialization & tooling
│   ├── phase5.md                     # Authentication & authorization review
│   └── phase6.md                     # Core features acceptance criteria & test results
├── prisma/
│   ├── schema.prisma                 # 11 models, 5 enums, indexes, constraints
│   └── seed.ts                       # Foundational seed data (departments, courses, users)
├── public/
│   └── uploads/                      # Coursework submission file storage
├── scripts/                          # Automated integration test suites
│   ├── test-auth.ts                  # Auth & bcrypt verification
│   ├── test-course-registration.ts   # Capacity locking & transactional registration
│   ├── test-attendance.ts            # Roll call marking & 75% threshold compliance
│   ├── test-assignments.ts           # Coursework, file uploads & late flags
│   ├── test-grades.ts                # Grade approval, 4.0 GPA & audit trail
│   └── test-announcements.ts         # Scoped announcements & unified feed
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # /login, /register
│   │   ├── (student)/                # /student/courses, /attendance, /assignments, /results, /announcements
│   │   ├── (lecturer)/               # /lecturer/attendance, /assignments, /grades, /announcements
│   │   ├── (dept-admin)/             # /dept-admin/grades, /announcements
│   │   ├── (uni-admin)/              # /uni-admin/announcements
│   │   └── api/v1/                   # REST API routes with envelope format { data, error }
│   ├── components/                   # Reusable UI components & cards
│   ├── lib/                          # Singleton Prisma client & password helpers
│   ├── services/                     # Decoupled business logic layer
│   └── types/                        # TypeScript declarations & NextAuth extensions
└── next.config.ts                    # Build & workspace tracing configuration
```

---

## 🏁 Getting Started

### Prerequisites
- **Node.js** (v20+ recommended)
- **PostgreSQL** (running locally or remote on port 5432)
- **npm** or **pnpm**

### Installation & Environment Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/quayecodes/CampusFlow.git
   cd CampusFlow
   ```

2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campusflow?schema=public"
   NEXTAUTH_SECRET="your-development-nextauth-secret-key-min-32-chars"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Synchronize database schema and seed data**:
   ```bash
   # Push schema to PostgreSQL
   npm run db:push

   # Seed foundational departments, programs, courses, and accounts
   npm run db:seed
   ```

5. **Start development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Seeded Demo Accounts

All seeded demo accounts use the standard password: `CampusFlow2026!`

| Role | Email | Scope / Assigned Area | Primary Testing Focus |
|---|---|---|---|
| **University Admin** | `admin@campusflow.edu` | System-Wide | Campus-wide broadcast announcements |
| **Department Admin** | `dept.admin@campusflow.edu` | Computer Science | Grade approval queue & audit logs |
| **Lecturer** | `dr.mensah@campusflow.edu` | CS201 & CS202 Instructor | Attendance roll call, assignments & grading |
| **Student 1** | `student1@campusflow.edu` | BSc Computer Science | Course registration, submissions, results & GPA |
| **Student 2** | `student2@campusflow.edu` | BSc Computer Science | At-risk attendance (<75%) and late submission testing |

---

## 🧪 Automated Test Suites

CampusFlow includes automated test suites covering all domain logic, concurrency locks, and security boundaries:

```bash
# Test Authentication & Password Hashing
npx tsx scripts/test-auth.ts

# Test Course Registration & Capacity Locking
npx tsx scripts/test-course-registration.ts

# Test Attendance & 75% Threshold Flagging
npx tsx scripts/test-attendance.ts

# Test Assignment Uploads, Late Flags & Grading
npx tsx scripts/test-assignments.ts

# Test Grade Approval Workflow, GPA & Audit Logging
npx tsx scripts/test-grades.ts

# Test Scoped Announcements & Unified Feed
npx tsx scripts/test-announcements.ts
```

---

## 🗺️ Roadmap & Phase Progression

- [x] **Phase 0**: Discovery, Clarification & MVP Scoping
- [x] **Phase 1**: Requirements & Project Planning ([docs/phase1.md](docs/phase1.md))
- [x] **Phase 2**: System Architecture & Threat Modeling ([docs/phase2.md](docs/phase2.md))
- [x] **Phase 3**: Relational Database Design & Normalization ([docs/phase3.md](docs/phase3.md))
- [x] **Phase 4**: Project Initialization, Tooling & Build Verification ([docs/phase4.md](docs/phase4.md))
- [x] **Phase 5**: Authentication, Password Hashing & Edge RBAC ([docs/phase5.md](docs/phase5.md))
- [x] **Phase 6**: Core Application Features (5/5 Modules Implemented) ([docs/phase6.md](docs/phase6.md))
- [x] **Phase 7**: UI/UX Refinement, Accessibility (WCAG 2.1 AA) & Design Polish ([docs/phase7.md](docs/phase7.md))
- [ ] **Phase 8**: Unit & E2E Testing, OWASP Security Review & Debt Audit
- [ ] **Phase 9**: CI/CD Pipelines & Production Deployment
- [ ] **Phase 10**: Documentation & Portfolio Presentation

---

## 🏷️ Release History

- **v0.2.0-beta** (Current) — Complete implementation of Phase 5 & Phase 6: All 5 core functional modules, interactive UI portals, transactional concurrency controls, and automated test coverage.
- **v0.1.0-alpha** — Scaffolding, PostgreSQL Prisma 3NF schema, NextAuth configuration, and tooling initialization.

---

## 📄 License
This project is licensed under the MIT License.
