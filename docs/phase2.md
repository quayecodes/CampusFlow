# CampusFlow — Phase 2: System Architecture & Design

CURRENT PROJECT: CampusFlow — Smart University Management System
CURRENT PHASE: 2 — System Architecture & Design
OBJECTIVE: Define technical architecture before any implementation.

## Architecture Diagram (text form)

```
┌───────────────────────────────────────────────────────────┐
│      Browser (Student / Lecturer / Dept Admin / Uni Admin)   │
│              Next.js React client (TypeScript)                │
└───────────────────────────┬─────────────────────────────────┘
                             │ HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│                     Next.js App (Vercel)                       │
│  ┌──────────────────┐  ┌───────────────────────────────────┐ │
│  │ React pages/       │  │ API Routes (/api/v1/*)            │ │
│  │ Server Components  │  │ - auth                            │ │
│  │                    │  │ - courses / enrollments            │ │
│  │                    │  │ - attendance                       │ │
│  │                    │  │ - assignments / submissions         │ │
│  │                    │  │ - grades / approvals                │ │
│  │                    │  │ - announcements                     │ │
│  └──────────────────┘  └──────────────┬────────────────────┘ │
└──────────────────────────────────────┼─────────────────────────┘
                                        │ Prisma Client
                          ┌─────────────▼──────────────┐
                          │   PostgreSQL (Neon/Supabase) │
                          └─────────────┬──────────────┘
                                        │
                          ┌─────────────▼──────────────┐
                          │  Object storage               │
                          │  (assignment submission files) │
                          │  e.g. Supabase Storage         │
                          └───────────────────────────────┘
```

No LLM/AI component is needed for this system — it's a role-based CRUD and workflow platform, and adding an AI dependency here wouldn't serve a real requirement.

## Technology Stack & Justification

| Layer | Choice | Why | Rejected alternative |
|---|---|---|---|
| Frontend/Backend | Next.js + TypeScript | Single deployable framework; consistent with your other portfolio projects | Separate SPA + API server — added complexity not justified for this scope |
| Database | PostgreSQL | Highly relational data (departments, programs, courses, enrollments, grades) with strict integrity needs (e.g., no double-enrollment past capacity) | MongoDB — this data is inherently relational with many enforced constraints; a document model would push referential integrity into application code unnecessarily |
| ORM | Prisma | Type-safe queries, transaction support for the capacity-enforcement logic below | Raw SQL — more control but slower to iterate and more error-prone across five modules |
| File storage | S3-compatible object storage (e.g., Supabase Storage) | Assignment submission files shouldn't live in the relational DB | Storing file bytes in Postgres — bloats DB, complicates backups |
| Auth | NextAuth (Credentials provider) + JWT | Handles session plumbing; role claim embedded in the token | Custom auth — not justified for this scope |

## Frontend Architecture

- `app/(auth)/` — login
- `app/(student)/` — registration, attendance view, assignment submission, results/GPA, announcement feed
- `app/(lecturer)/` — attendance marking, assignment creation/grading, grade entry, course announcements
- `app/(dept-admin)/` — grade approval queue, department course management, department announcements
- `app/(uni-admin)/` — department/user management, university-wide announcements
- Shared `components/` — course card, attendance grid, submission list, grade approval table

## Backend Architecture

- REST API under `/api/v1/*`, with every route enforcing role + scope checks server-side (never trusting client-side role display as the actual security boundary).
- **Registration capacity enforcement**: the enroll endpoint runs inside a database transaction that locks the course row, checks current enrollment count against `max_capacity`, and only commits the new Enrollment if capacity remains — this is the concrete mechanism behind the "no race-condition over-enrollment" NFR from Phase 1.
- **Grade approval workflow**: a `Grade` record has a status (`DRAFT` → `APPROVED` → `PUBLISHED`); only a Dept Admin scoped to that course's department can transition `DRAFT`→`APPROVED`, and only the system (on approval) transitions to `PUBLISHED`. Students can only ever read `PUBLISHED` grades.
- Business logic lives in a `services/` layer (`enrollmentService`, `gradeService`, `attendanceService`) separate from route handlers, so the capacity-locking and approval-workflow logic is unit-testable independent of HTTP.

## Authentication Strategy

- Credentials-based login, bcrypt-hashed passwords.
- JWT session (HttpOnly cookie), with role and (where applicable) department ID embedded as claims.
- Every request re-validates role/department scope against the database, not just the JWT claim, for any action with real consequences (grade approval, department management) — the JWT claim is a fast-path hint, not the sole authority, since a role change (e.g., a Lecturer promoted to Dept Admin) shouldn't require waiting for token expiry to take effect.

## API Communication Strategy

- REST, JSON, versioned (`/api/v1/`).
- Standard response envelope: `{ data, error }`.

## Security Considerations (OWASP-mapped)

| Risk | Relevance to CampusFlow | Mitigation |
|---|---|---|
| **Broken Access Control (the dominant risk here)** | A Dept Admin approving grades outside their department; a Student editing another student's submission; a Lecturer marking attendance for a course they don't teach | Every mutating endpoint checks both role AND scope (department ID / course ownership) server-side, derived from the authenticated user's actual DB record, not client-supplied parameters |
| Injection | Course/assignment text fields, submission metadata | Prisma parameterizes all queries; no raw SQL concatenation |
| Sensitive data exposure | Grades and attendance are FERPA-adjacent sensitive academic records | Access strictly scoped per the RBAC model above; grade change log (FR14) makes any unauthorized access or tampering attributable |
| Security misconfiguration | Default secrets, verbose errors in prod | Environment variables only; generic error messages in production |
| Race conditions (not classic OWASP, but critical here) | Concurrent registration requests over-filling a course | Database transaction + row lock on enroll, as described above |

## Scalability Considerations

- Registration windows are the known traffic spike (per the 1,000-concurrent-user NFR) — the transactional enroll endpoint is the contention point; if load testing at Phase 8 shows lock contention issues, consider a queue-based registration model (requests processed in order rather than all racing for the same row lock) as a follow-up optimization.
- Stateless API routes scale horizontally via Vercel's serverless model for the other four modules, which don't have the same contention profile as registration.

## Out of Scope (explicitly not building in MVP)

- Prerequisite/waitlist engine
- GPS/biometric attendance (separate existing project of yours; possible future integration)
- Transcript PDF generation
- Plagiarism detection
- Native mobile app

**Definition of Done check**: each major decision above states what was rejected and why. ✅

