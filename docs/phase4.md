# CampusFlow — Phase 4: Project Initialization

CURRENT PROJECT: CampusFlow — Smart University Management System  
CURRENT PHASE: 4 — Project Initialization  
OBJECTIVE: Scaffold the project with framework config, tooling, DB connection, and folder structure with zero business features.

## 1. Project Scaffold & Tech Stack Setup

The application is initialized as a full-stack Next.js (App Router) project using TypeScript and Tailwind CSS v4, aligned with the architectural decisions established in Phase 2.

- **Framework**: Next.js 15 (App Router, Server Components + API Route handlers)
- **Language**: TypeScript with strict mode enabled (`strict: true`) and path alias (`@/*` -> `./src/*`)
- **Styling**: Tailwind CSS v4 with PostCSS plugin (`@tailwindcss/postcss`)
- **Database ORM**: Prisma ORM with PostgreSQL driver
- **Auth Foundation**: NextAuth.js (Auth.js) v5 beta & `bcryptjs`
- **Linting & Formatting**: ESLint (Next core web vitals + Prettier integration) and Prettier with `prettier-plugin-tailwindcss`

## 2. Directory Structure & Folder Purposes

```text
CampusFlow/
├── .env.example          # Environment variable template with documentation & placeholder secrets
├── .env                  # Local environment file (strictly gitignored)
├── .gitignore            # Git exclusion rules (node_modules, .next, .env*, build artifacts)
├── .prettierrc           # Code formatting rules and Tailwind class ordering plugin
├── eslint.config.mjs     # ESLint configuration integrating Next.js rules and Prettier
├── next.config.ts        # Next.js runtime configuration with strict mode & path tracing
├── package.json          # Dependency specifications, project metadata, and automation scripts
├── postcss.config.mjs    # PostCSS configuration for Tailwind CSS v4
├── tsconfig.json         # TypeScript compiler options, type checking rules, and path mappings
├── docs/                 # Engineering documentation across all development phases
│   ├── phase1.md         # Requirements and specifications
│   ├── phase2.md         # Architecture and system design
│   ├── phase3.md         # Database design & schema normalization
│   └── phase4.md         # Project initialization and foundation setup
├── prisma/
│   └── schema.prisma     # Relational schema (11 models, 5 enums, indexes, unique constraints)
└── src/
    ├── app/              # Next.js App Router: layouts, pages, and API routes
    │   ├── api/v1/health # Health-check endpoint (/api/v1/health) for uptime/deployment monitoring
    │   ├── globals.css   # Global styling entry point importing Tailwind CSS
    │   ├── layout.tsx    # Root HTML layout shell with metadata configuration
    │   └── page.tsx      # Landing page placeholder proving Next.js + Tailwind integration
    ├── components/       # Reusable, shared UI components (CourseCard, AttendanceGrid, etc.)
    ├── lib/              # Core utility singletons and shared client libraries
    │   └── prisma.ts     # Global singleton Prisma client (prevents connection pool exhaustion)
    ├── services/         # Decoupled domain business logic layer (enrollment, grade approvals)
    └── types/            # Custom TypeScript types, DTOs, and API response envelope definitions
```

## 3. Environment Variable Structure

The project includes [.env.example](file:///c:/Users/user/Desktop/FINAL%20YEAR%20PROJECTS/CampusFlow/.env.example):
- `DATABASE_URL`: PostgreSQL connection string (Neon / Supabase / local PostgreSQL).
- `NEXTAUTH_SECRET`: Random 32-byte secret for session token signing and encryption.
- `NEXTAUTH_URL`: Canonical root URL of the deployment (`http://localhost:3000` for local development).

Real secrets must never be committed; `.gitignore` is configured to exclude all `.env*` files except `.env.example`.

## 4. Database Connection & Client Singleton

- **Schema**: Defined in [prisma/schema.prisma](file:///c:/Users/user/Desktop/FINAL%20YEAR%20PROJECTS/CampusFlow/prisma/schema.prisma) implementing all 11 normalized models (`User`, `Department`, `Program`, `Course`, `Enrollment`, `AttendanceRecord`, `Assignment`, `Submission`, `Grade`, `GradeChangeLog`, `Announcement`).
- **Client**: Generated via `npm run db:generate`.
- **Singleton**: Implemented in [src/lib/prisma.ts](file:///c:/Users/user/Desktop/FINAL%20YEAR%20PROJECTS/CampusFlow/src/lib/prisma.ts). Caches the `PrismaClient` instance on `globalThis` during development so Next.js Fast Refresh cycles do not exhaust database connections.

## 5. Git Conventions

- **Branch Naming**:
  - `feature/*` — Feature additions
  - `fix/*` — Bug fixes
  - `chore/*` — Dependency updates, tooling, config adjustments
  - `docs/*` — Documentation additions or revisions
- **Commit Style**: Conventional Commits standard (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`).
- **Rule**: No direct commit may be described as "final" or "done" without a corresponding verified test or build pass.

## 6. One-Command Setup & Verification

To run and verify the project locally from scratch:

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run db:generate

# 3. Build project for production
npm run build

# 4. Start development server
npm run dev
```

Verified build output:
```text
Route (app)                                 Size  First Load JS
┌ ○ /                                      127 B         103 kB
├ ○ /_not-found                            995 B         104 kB
└ ƒ /api/v1/health                         127 B         103 kB
+ First Load JS shared by all             103 kB
```

---

COMPLETED: Phase 4 — Project Initialization  
FILES CHANGED: `docs/phase4.md`  
DEFINITION OF DONE MET: YES  
NEXT PHASE: Phase 5 — Authentication & Authorization  
WAITING FOR APPROVAL: YES
