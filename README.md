# CampusFlow — Smart University Management System

<p align="center">
  <img src="public/logo.png" alt="CampusFlow Banner" width="120" style="border-radius: 16px; margin-bottom: 8px;" onerror="this.style.display='none'"/>
</p>

<p align="center">
  <strong>An enterprise-grade, role-governed Academic Management SaaS Platform.</strong><br>
  Built with Next.js 15, React 19, TypeScript, PostgreSQL, Prisma ORM, Auth.js (v5), and Tailwind CSS v4.
</p>

<p align="center">
  <a href="#-key-features"><img src="https://img.shields.io/badge/Architecture-Clean%20%26%20Decoupled-indigo?style=for-the-badge" alt="Architecture" /></a>
  <a href="#-automated-testing-harness-5959-tests"><img src="https://img.shields.io/badge/Tests-59%2F59%20Passing-emerald?style=for-the-badge" alt="Tests" /></a>
  <a href="#-owasp-top-10-security-shield"><img src="https://img.shields.io/badge/Security-OWASP%20Hardened-blue?style=for-the-badge" alt="OWASP Security" /></a>
  <a href="#-accessibility--2026-design-system"><img src="https://img.shields.io/badge/WCAG%202.1-AA%20Compliant-teal?style=for-the-badge" alt="Accessibility" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-amber?style=for-the-badge" alt="License" /></a>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-seeded-demo-personas">Demo Personas</a> •
  <a href="#-core-modules">Core Modules</a> •
  <a href="#-automated-testing-harness-5959-tests">Test Suites</a> •
  <a href="#-security-architecture">Security Review</a> •
  <a href="#-roadmap--phase-progression">Roadmap</a>
</p>

---

## 📌 Executive Overview & Problem Statement

Academic institutions frequently grapple with fragmented software, paper-based roll calls, and disjointed portals that trigger severe operational risks:
- **Registration Race Conditions**: Over-enrollment surges during peak add/drop periods that compromise course capacity limits.
- **Attendance Compliance Blindspots**: Manual roll calls make detecting students falling beneath statutory participation requirements (e.g. 75%) nearly impossible until final exam exclusions.
- **Audit Deficiencies & Grade Tampering**: Grade revisions executed without immutable departmental approvals or timestamped audit logs.
- **Notification Silos**: Coursework and faculty updates scattered across disconnected noticeboards and email threads.

**CampusFlow** delivers an all-in-one, multi-tenant academic operations platform engineered to resolve these challenges through **database-level concurrency control**, **strict 3-stage grade governance**, **role-scoped communications**, and an **OWASP-hardened security perimeter**.

---

## 🚀 Key Highlights & 2026 UI/UX Experience

- ⚡ **Interactive Concurrency Sandbox**: Live seat-locking simulations demonstrating transactional capacity isolation down to milliseconds.
- 🎯 **Tactile & Responsive Design System**: Adaptive mobile card transformations, subtle dot matrix meshes, high-contrast text hierarchies, and tactile press micro-interactions.
- ⚡ **Role Command Palette (`⌘K` / `Ctrl+K`)**: Global fuzzy search across all academic portals with keyboard navigation.
- 🔄 **Instant Role Switcher Modal**: Single-click demo switching between Student, Lecturer, Department Admin, and University Admin without logging out.
- 📱 **Multi-Screen Responsive Parity**: Zero horizontal table clipping on compact viewports (320px Mobile S through 4K displays).
- ♿ **WCAG 2.1 AA Certified Accessibility**: Contrast ratios exceeding 4.5:1, skip-to-content links, explicit ARIA dialog semantics, and full keyboard-focusable landmarks.

---

## 🏛️ Implemented Core Modules

```
                           ┌───────────────────────────────┐
                           │          CampusFlow           │
                           │   Next.js 15 App Router       │
                           └──────────────┬────────────────┘
                                          │
       ┌──────────────────┬───────────────┴───────────────┬──────────────────┐
       ▼                  ▼                               ▼                  ▼
┌──────────────┐   ┌──────────────┐                ┌──────────────┐   ┌──────────────┐
│ (student)    │   │ (lecturer)   │                │ (dept-admin) │   │ (uni-admin)  │
│ Course Enroll│   │ Attendance   │                │ Grade Queue  │   │ Global News  │
│ Submissions  │   │ Assignments  │                │ Audit Trail  │   │ Audit Oversight
│ GPA Results  │   │ Grade Drafts │                │ Dept Scope   │   │ System Config│
└──────┬───────┘   └──────┬───────┘                └──────┬───────┘   └──────┬───────┘
       │                  │                               │                  │
       └──────────────────┴───────────────┬───────────────┴──────────────────┘
                                          ▼
                      ┌───────────────────────────────────────┐
                      │    Service Layer & Concurrency Locks  │
                      │  Interactive Prisma Transactions      │
                      └──────────────────┬────────────────────┘
                                          ▼
                      ┌───────────────────────────────────────┐
                      │    PostgreSQL Database (3NF Schema)   │
                      │  7 Performance Indexes + Constraints  │
                      └───────────────────────────────────────┘
```

### 1. Course Registration & Concurrency Engine (FR1, FR2, FR3)
- **Domain Service**: [`src/services/enrollmentService.ts`](file:///c:/Users/user/Desktop/FINAL%20YEAR%20PROJECTS/CampusFlow/src/services/enrollmentService.ts)
- **Transactional Protection**: Leverages Prisma interactive transactions (`prisma.$transaction`) with strict row-level seat verification preventing oversaturation past `maxCapacity`.
- **Academic Guardrails**: Enforces 18 credit-hour semester caps, automated duplicate prevention (`409 Conflict`), and instantaneous seat liberation upon course drop.

### 2. Attendance Roll Call & Compliance Monitoring (FR4, FR5, FR6)
- **Domain Service**: [`src/services/attendanceService.ts`](file:///c:/Users/user/Desktop/FINAL%20YEAR%20PROJECTS/CampusFlow/src/services/attendanceService.ts)
- **Features**: Idempotent session records normalized to UTC midnight, single-click Present/Late/Absent roll calls, and live summary dials.
- **75% Compliance Rule**: Real-time evaluation flagging students as `isAtRisk` when attendance falls below 75%, generating instant warning banners.

### 3. Coursework Lifecycle & Late Detection (FR7, FR8, FR9, FR10)
- **Domain Service**: [`src/services/assignmentService.ts`](file:///c:/Users/user/Desktop/FINAL%20YEAR%20PROJECTS/CampusFlow/src/services/assignmentService.ts)
- **Features**: Assignment publishing, bounds-checked grading drawers (`0 <= score <= maxScore`), and instructor qualitative feedback.
- **Automated Late Tagging**: Submissions past deadline are automatically marked `isLate = true` without blocking student submission.

### 4. Grade Governance, 4.0 GPA & Audit Trail (FR11, FR12, FR13, FR14)
- **Domain Service**: [`src/services/gradeService.ts`](file:///c:/Users/user/Desktop/FINAL%20YEAR%20PROJECTS/CampusFlow/src/services/gradeService.ts)
- **3-Tier Approval Workflow**: `DRAFT` (Lecturer) $\to$ `APPROVED` $\to$ `PUBLISHED` (Department Admin).
- **Data Privacy Barrier**: Students cannot inspect scores while in `DRAFT` or pending status.
- **Immutable Audit Logging**: Any post-publication score alteration triggers mandatory logging in `GradeChangeLog` recording previous score, new score, editor ID, and exact timestamp.

### 5. Scoped Bulletins & Unified Feed (FR15, FR16, FR17, FR18)
- **Domain Service**: [`src/services/announcementService.ts`](file:///c:/Users/user/Desktop/FINAL%20YEAR%20PROJECTS/CampusFlow/src/services/announcementService.ts)
- **Multi-Level Scope**: `UNIVERSITY` (Uni Admin), `DEPARTMENT` (Dept Admin), and `COURSE` (Lecturer).
- **Tenant Isolation**: Unified feed synthesizes notices based on student enrollments while strictly isolating unrelated departmental broadcasts.

---

## 🛡️ OWASP Top 10 Security Shield

CampusFlow embeds proactive security countermeasures directly into the architecture:

| OWASP Vector | Threat Model | Architectural Countermeasure | Verification |
|---|---|---|---|
| **A01: Broken Access Control** | Horizontal & vertical privilege escalation; Student marking roll call; Dept Admin modifying foreign courses. | Service-level role & tenant checks (`ForbiddenAttendanceError`, `ForbiddenGradeError`). Dept Admins strictly bound to `departmentId`. | [`test:security`](scripts/test-security-rbac.ts) (T1–T10) |
| **A02: Cryptographic Failures** | Credential breaches; Plaintext storage; Password disclosure in API envelopes. | 12-round `bcryptjs` hashing (~250ms work factor). Strict Prisma `select` exclusion preventing `passwordHash` disclosure in API payloads. | [`test:security`](scripts/test-security-rbac.ts) (T12) |
| **A03: Injection** | SQL injection via search, filters, or parameters. | 100% parameterized queries via Prisma ORM. Arbitrary SQL payloads are treated as literal strings. | [`test:security`](scripts/test-security-rbac.ts) (T16) |
| **A04: Insecure File Uploads** | Web shells (`.php`, `.exe`); Stored XSS via `.svg` / `.html`; Disk exhaustion DoS. | Binary magic byte inspection (`%PDF-`, PNG, JPEG, ZIP, DOCX), strict extension allowlisting, 15MB file cap, and path traversal sanitization. | [`src/lib/upload-utils.ts`](src/lib/upload-utils.ts) (T13–T15) |
| **A05: Security Misconfiguration** | Clickjacking; MIME sniffing; Insecure transport. | Production headers in [`next.config.ts`](next.config.ts): HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`. | Config Verified |
| **A08: Software & Data Integrity** | Untracked post-publication grade modifications. | Mandatory immutable logging in `GradeChangeLog` capturing previous score, new score, actor ID, and timestamp. | [`test:grades`](scripts/test-grades.ts) (T7) |

---

## 🧪 Automated Testing Harness (59/59 Tests)

All application modules, concurrency boundaries, and RBAC guards are covered by automated integration test suites.

```bash
# Execute master runner with executive summary report:
npm test
```

### Individual Test Suites Breakdown

```bash
npm run test:auth          # Suite 1: Authentication & Password Policies (5/5 PASS)
npm run test:courses       # Suite 2: Registration & Concurrency Locking (6/6 PASS)
npm run test:attendance    # Suite 3: Roll Call & 75% Compliance Rule (8/8 PASS)
npm run test:assignments   # Suite 4: Assignments, File Uploads & Late Flags (8/8 PASS)
npm run test:grades        # Suite 5: 3-Tier Grade Approval & Audit Logs (8/8 PASS)
npm run test:announcements # Suite 6: Scoped Bulletins & Feed Isolation (8/8 PASS)
npm run test:security      # Suite 7: RBAC Authorization & OWASP Top 10 (16/16 PASS)
```

### Static Analysis & Type Checking
```bash
npm run format:check       # 100% Prettier formatting compliance
npx tsc --noEmit           # Strict TypeScript validation (0 errors)
```

---

## ⚡ Tech Stack & Architecture

| Layer | Technology | Key Decision & Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router, React 19) | Server Components, Nested Layouts, Fast Refresh, Streaming |
| **Language** | TypeScript 5 (Strict Mode) | Complete type safety across database schemas, APIs, and components |
| **Styling** | Tailwind CSS v4 + PostCSS | Modern CSS-first design system with zero runtime overhead |
| **Database** | PostgreSQL 16 | Relational consistency, foreign key constraints, ACID compliance |
| **ORM** | Prisma ORM 6 | Type-safe queries, migration control, index optimization |
| **Auth** | NextAuth.js (Auth.js v5) | Stateless JWT sessions, edge-compatible authentication |
| **Security** | Bcrypt (12 rounds) + Headers | OWASP-recommended hashing and production HTTP response headers |

---

## 🏁 Quick Start & Local Setup

### Prerequisites
- **Node.js** (v20+ recommended)
- **PostgreSQL** (running locally or remotely on port 5432)
- **npm** or **pnpm**

### Step-by-Step Installation

1. **Clone Repository**:
   ```bash
   git clone https://github.com/quayecodes/CampusFlow.git
   cd CampusFlow
   ```

2. **Install Dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/campusflow?schema=public"
   AUTH_SECRET="super-secret-key-min-32-characters-long-campusflow"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize Database & Seed Data**:
   ```bash
   # Synchronize schema to PostgreSQL
   npm run db:push

   # Seed foundational departments, programs, courses, and accounts
   npm run db:seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 👥 Seeded Demo Personas

All seeded accounts share the default development password: `CampusFlow2026!`

| Role | Email | Department / Scope | Primary Testing Focus |
|---|---|---|---|
| **University Admin** | `admin@campusflow.edu` | System-Wide | Institution-wide announcements & system oversight |
| **Department Admin** | `dept.admin@campusflow.edu` | Computer Science | 3-tier grade approval queue & tamper-evident audit logs |
| **Lecturer** | `dr.mensah@campusflow.edu` | Computer Science | Attendance roll call, coursework creation & grading |
| **Student 1** | `student1@campusflow.edu` | BSc Computer Science | Course registration, assignments, GPA & transcript |
| **Student 2** | `student2@campusflow.edu` | BSc Computer Science | At-risk attendance (<75%) & late submission testing |

---

## 🗺️ Roadmap & Phase Progression

- [x] **Phase 0**: Discovery, Clarification & MVP Scoping
- [x] **Phase 1**: Requirements & Project Planning ([docs/phase1.md](docs/phase1.md))
- [x] **Phase 2**: System Architecture & Threat Modeling ([docs/phase2.md](docs/phase2.md))
- [x] **Phase 3**: Relational Database Design & Normalization ([docs/phase3.md](docs/phase3.md))
- [x] **Phase 4**: Project Initialization, Tooling & Build Verification ([docs/phase4.md](docs/phase4.md))
- [x] **Phase 5**: Authentication, Password Hashing & Edge RBAC ([docs/phase5.md](docs/phase5.md))
- [x] **Phase 6**: Core Application Features (5/5 Modules Implemented) ([docs/phase6.md](docs/phase6.md))
- [x] **Phase 7**: 2026 Commercial UI/UX & WCAG 2.1 AA Polish ([docs/phase7.md](docs/phase7.md))
- [x] **Phase 8**: Automated Testing, OWASP Security Review & Debt Audit ([docs/phase8.md](docs/phase8.md))
- [ ] **Phase 9**: CI/CD Pipelines & Production Deployment
- [ ] **Phase 10**: Documentation & Portfolio Presentation

---

## 🏷️ Release History

- **v0.3.0-rc1** (Current) — Enterprise hardening: 59 automated test suites, OWASP Top 10 security review, upload magic byte inspector, security headers, database index optimization, and 2026 commercial UI/UX polish.
- **v0.2.0-beta** — Complete implementation of Phase 5 & Phase 6: All 5 core functional modules, interactive UI portals, transactional concurrency controls, and automated test coverage.
- **v0.1.0-alpha** — Scaffolding, PostgreSQL Prisma 3NF schema, NextAuth configuration, and tooling initialization.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
