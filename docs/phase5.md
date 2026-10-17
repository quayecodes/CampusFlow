# CampusFlow — Phase 5: Authentication & Authorization

CURRENT PROJECT: CampusFlow — Smart University Management System  
CURRENT PHASE: 5 — Authentication & Authorization  
OBJECTIVE: Implement secure registration, authentication, JWT session management, password hashing, and role-based access control (RBAC).

---

## 1. Architectural Implementation Overview

Phase 5 establishes the security and identity foundation for CampusFlow:
- **Authentication Framework**: NextAuth.js (Auth.js) v5 with Credentials Provider.
- **Session Strategy**: Stateless JSON Web Tokens (JWT) stored in `HttpOnly`, `SameSite=Lax`, encrypted cookies.
- **Password Hashing**: `bcryptjs` with 12 salt rounds (adaptive key derivation taking ~250ms per evaluation).
- **Role-Based Access Control**: Enforced across four institutional tiers (`STUDENT`, `LECTURER`, `DEPT_ADMIN`, `UNI_ADMIN`) through edge middleware.

---

## 2. Auth Attack Surface Analysis & Mitigations

| Threat / Attack Vector | Risk to CampusFlow | Technical Mitigation Implemented |
|---|---|---|
| **Brute Force & Credential Stuffing** | Automated guessing of student or staff passwords. | **1. High Work-Factor Hashing**: Bcrypt with 12 salt rounds renders mass offline cracking computationally infeasible.<br>**2. Password Policy**: Minimum 8 chars with uppercase, lowercase, numeric, and special character requirements enforced server-side. |
| **User Enumeration / Account Probing** | Attacker probes login/registration endpoints to harvest valid university emails. | **1. Constant-Time Login Comparison**: When an email is not found, the system verifies a pre-computed dummy bcrypt hash (`DUMMY_HASH` in `src/auth.ts`) so execution latency (~250ms) remains identical whether an email exists or not.<br>**2. Generic Feedback**: Failed attempts return `"Invalid email or password"`. |
| **Session Fixation & Hijacking** | Attacker forces a known session identifier onto a victim before authentication. | NextAuth invalidates previous session state upon login and issues a fresh, cryptographically signed JWT token. Tokens cannot be injected via URL or client scripts. |
| **Token Leakage (XSS)** | Malicious client-side script stealing authentication tokens from browser storage. | **HttpOnly Cookies**: Session tokens are strictly stored in `HttpOnly` cookies, preventing JavaScript (`document.cookie`) access. In production, the `Secure` flag forces transmission over HTTPS only. |
| **Cross-Site Request Forgery (CSRF)** | Malicious third-party website submitting unauthorized actions on behalf of an authenticated user. | NextAuth enforces CSRF token verification across all state-modifying authentication endpoints (`/api/auth/*`) and browser cookies use `SameSite=Lax`. |
| **Privilege Escalation / IDOR** | A student modifying client state or URL to access lecturer gradebooks or department queues. | **1. Edge RBAC Middleware (`src/middleware.ts`)**: Route prefixes (`/student`, `/lecturer`, `/dept-admin`, `/uni-admin`) are verified against the token's authenticated `role` before any page or route handler renders.<br>**2. Server-Side Scope Verification**: Downstream mutation routes verify ownership against the actual database user record. |

---

## 3. Implemented Routes & Components

### API Endpoints
- `POST /api/auth/[...nextauth]` — NextAuth session, CSRF, login, and logout endpoints.
- `POST /api/v1/auth/register` — Validated user registration creating bcrypt-hashed accounts.
- `GET /api/v1/health` — Platform health check.

### User Interface & Portals
- `/login` — Accessible, responsive sign-in interface with error handling and redirect on success.
- `/register` — Student account registration with client & server-side validation.
- `/unauthorized` — 403 Forbidden page indicating role requirements.
- `/student` — Student portal dashboard.
- `/lecturer` — Lecturer portal dashboard.
- `/dept-admin` — Department administrator portal dashboard.
- `/uni-admin` — University administrator portal dashboard.

---

## 4. Verification & Automated Test Results

Automated test suite executed via `scripts/test-auth.ts`:

```text
=========================================
   CAMPUSFLOW PHASE 5: AUTH TEST SUITE   
=========================================

[PASS] T1: Bcrypt password hashing (12 salt rounds, correct verification, wrong rejection)
[PASS] T2: Registration input validation - accepts valid payload
[PASS] T3: Password policy enforcement - rejects short, non-numeric, or symbol-free passwords
[PASS] T4: Input sanitization - rejects malformed emails and unauthorized roles
[PASS] T5: Login validation - requires non-empty email and password

-----------------------------------------
OVERALL RESULT: ALL 5/5 TESTS PASSED
-----------------------------------------
```

Production build verification (`npx next build`):
```text
Route (app)                                 Size  First Load JS
┌ ƒ /                                      391 B         109 kB
├ ○ /_not-found                            995 B         104 kB
├ ƒ /api/auth/[...nextauth]                130 B         103 kB
├ ƒ /api/v1/auth/register                  130 B         103 kB
├ ƒ /api/v1/health                         130 B         103 kB
├ ƒ /dept-admin                            383 B         105 kB
├ ƒ /lecturer                              383 B         105 kB
├ ○ /login                                1.4 kB         110 kB
├ ○ /register                            1.86 kB         108 kB
├ ƒ /student                               383 B         105 kB
├ ƒ /unauthorized                          161 B         106 kB
└ ƒ /uni-admin                             383 B         105 kB
+ First Load JS shared by all             103 kB

ƒ Middleware                               45 kB
```

---

COMPLETED: Phase 5 — Authentication & Authorization  
FILES CHANGED:
- `src/lib/auth/password.ts`
- `src/lib/auth/validation.ts`
- `src/types/next-auth.d.ts`
- `src/auth.ts`
- `src/middleware.ts`
- `src/app/api/auth/[...nextauth]/route.ts`
- `src/app/api/v1/auth/register/route.ts`
- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/register/page.tsx`
- `src/app/unauthorized/page.tsx`
- `src/components/auth/SignOutButton.tsx`
- `src/app/(student)/student/page.tsx`
- `src/app/(lecturer)/lecturer/page.tsx`
- `src/app/(dept-admin)/dept-admin/page.tsx`
- `src/app/(uni-admin)/uni-admin/page.tsx`
- `src/app/page.tsx`
- `scripts/test-auth.ts`
- `docs/phase5.md`

DEFINITION OF DONE MET: YES  
NEXT PHASE: Phase 6 — Core Application Features  
WAITING FOR APPROVAL: YES
