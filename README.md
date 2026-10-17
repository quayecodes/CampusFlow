# CampusFlow — Smart University Management System

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Relational_DB-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)

CampusFlow is a centralized, role-based university management platform that unifies academic and administrative processes, including course registration with race-condition prevention, attendance tracking, assignment submissions, multi-stage grade approval workflows, and scoped university announcements.

---

## 📌 Problem Statement

Many academic institutions rely on fragmented software, physical paperwork, and manual interventions to manage student records, course enrollments, attendance, and grading. This causes:
- **Data Duplication & Inconsistencies**: Disconnected silos across departments.
- **Registration Bottlenecks**: Race conditions and over-capacity enrollments during peak course selection periods.
- **Audit Deficiencies**: Grade modifications lacking non-repudiation and department-level approval trails.
- **Administrative Delays**: Bottlenecks in publishing student results and broadcasting official notices.

CampusFlow provides an integrated, role-governed web application designed to eliminate operational friction and ensure academic record integrity.

---

## 🚀 Key Modules & Architecture

1. **Role-Based Access Control (RBAC)**:
   - **Student**: Course registration, attendance tracking, assignment submissions, published grade review, announcement feed.
   - **Lecturer**: Session attendance marking, assignment creation/grading, draft grade submissions, course announcements.
   - **Department Administrator**: Grade approval queues, department course/program oversight, department-level notices.
   - **University Administrator**: System-wide department and user management, university-wide announcements.

2. **Core System Highlights**:
   - **Concurrent Enrollment Safety**: Course registration runs in isolated database transactions enforcing `max_capacity` at the database level to prevent race-condition over-enrollment.
   - **Three-Stage Grade Workflow**: `DRAFT` (Lecturer) $\to$ `APPROVED` (Department Admin review) $\to$ `PUBLISHED` (Visible to Student). Includes a persistent `GradeChangeLog` audit trail.
   - **Decoupled Architecture**: Domain services (`src/services/`) isolated from HTTP API handlers (`src/app/api/v1/`) for testability.
   - **Resilient Connection Pool**: Global singleton Prisma client avoiding pool exhaustion during development hot-reloads.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 15 (App Router, Server Components) | Unified full-stack framework with colocated API route handlers |
| **Language** | TypeScript (Strict Mode) | End-to-end static type safety and contract enforcement |
| **Styling** | Tailwind CSS v4 + PostCSS | High-performance, token-driven utility styling |
| **Database** | PostgreSQL | Relational integrity, foreign key constraints, ACID transactions |
| **ORM** | Prisma ORM | Type-safe database queries, schema migrations, and seeding |
| **Authentication** | NextAuth.js (Auth.js) + bcryptjs | Secure JWT session management with server-side role re-verification |
| **Code Quality** | ESLint + Prettier | Automated linting, consistent code styling, and Tailwind class sorting |

---

## 📂 Project Structure

```text
CampusFlow/
├── .env.example          # Environment variable template
├── docs/                 # Engineering phase documentation
│   ├── phase1.md         # Requirements, user personas, & feature prioritization
│   ├── phase2.md         # Architecture, design decisions, & security mitigations
│   ├── phase3.md         # Normalized 3NF database schema & ERD definitions
│   └── phase4.md         # Initialization, framework setup, & build verification
├── prisma/
│   └── schema.prisma     # 11 models, 5 enums, indexes, and unique constraints
├── src/
    ├── app/              # Next.js App Router (pages, layouts, and /api/v1 routes)
    │   ├── api/v1/health # Health-check endpoint
    │   ├── globals.css   # Tailwind v4 configuration
    │   ├── layout.tsx    # Root layout
    │   └── page.tsx      # Landing page
    ├── components/       # Reusable UI components
    ├── lib/              # Client singletons (Prisma database client)
    ├── services/         # Core business logic layer
    └── types/            # DTOs, API responses, and shared interfaces
```

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)
- PostgreSQL database instance (local, Supabase, or Neon)

### Installation & Setup

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
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your PostgreSQL connection string and a secret for NextAuth:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/campusflow?schema=public"
   NEXTAUTH_SECRET="your-generated-random-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Generate Prisma Client**:
   ```bash
   npm run db:generate
   ```

5. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

6. **Verify Production Build**:
   ```bash
   npm run build
   ```

---

## 🗺️ Roadmap & Phase Progression

- [x] **Phase 0**: Discovery, Clarification & MVP Scoping
- [x] **Phase 1**: Requirements & Project Planning ([docs/phase1.md](docs/phase1.md))
- [x] **Phase 2**: System Architecture & Threat Modeling ([docs/phase2.md](docs/phase2.md))
- [x] **Phase 3**: Relational Database Design & Normalization ([docs/phase3.md](docs/phase3.md))
- [x] **Phase 4**: Project Initialization, Tooling & Build Verification ([docs/phase4.md](docs/phase4.md))
- [ ] **Phase 5**: Authentication & Authorization (NextAuth, RBAC, Password Hashing)
- [ ] **Phase 6**: Core Application Features (Registration, Attendance, Submissions, Grades)
- [ ] **Phase 7**: UI/UX Refinement & Accessibility
- [ ] **Phase 8**: Testing & Security Review
- [ ] **Phase 9**: CI/CD & Production Deployment
- [ ] **Phase 10**: Documentation & Portfolio Presentation

---

## 📄 License
This project is licensed under the MIT License.
