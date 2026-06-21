# ULAB One Portal — Phase 2 Consolidated Security Report

> Severity-ranked merge of all Phase 1 findings. No code changed — this is a report.
> Full detail with confirmed-safe patterns lives in `security-audit-findings.md`.
> Severity = realistic impact on a live platform holding student/teacher PII, attendance, chat, and documents.

**Note on Critical:** no finding is a single-request full-compromise (e.g. unauthenticated RCE or direct auth bypass). Login cannot be bypassed by NoSQL injection because bcrypt still runs. The most serious issues are High — they enable cross-tenant data exposure, stored XSS, or platform-wide denial of service.

---

## HIGH

| # | Finding | Location | Impact |
|---|---|---|---|
| H1 | **`group:join-room` IDOR** — joins any client-named group room, no membership check | `chat.socket.ts:101-103` | Any authenticated user receives all future messages of any group (class) they aren't in. |
| H2 | **Stored XSS — chat/note content stored raw** | `chat.socket.ts:142-148,206-212`; `resources.controller.ts:460-472,64-69` | `Message.content`, `Note.title/description/week`, repo fields persisted with no sanitization → script runs in every viewer's session if rendered as HTML. |
| H3 | **No `nosniff`/CSP on `/uploads/*` + spoofable mimetype** | `server.ts:40-105` (helmet at `:108`); `upload.middleware.ts:29-40` | Upload served same-origin with no `X-Content-Type-Options`; unknown extensions sent with no Content-Type at all → MIME-sniff → stored XSS on app origin. |
| H4 | **No global `$`-key stripping middleware** (not even a dependency) | `server.ts:107-123`; sinks `auth.controller.ts:237,285,333,441,510`, `admin.controller.ts:41,47,220`, `schedule.controller.ts:166` | CLAUDE.md-mandated control absent. Operator injection reachable on every body/query sink; login needs bcrypt so not a direct bypass, but probing + future-sink risk. |
| H5 | **`trust proxy` not set → rate-limit key collapses to proxy IP** | `server.ts` (none); `auth.routes.ts:21-35` | Behind nginx all clients share one bucket: 10 logins / 5 OTPs per 15m **total** → trivial platform-wide login & registration DoS. |
| H6 | **Email-send abuse / inbox bombing / Brevo quota** | `auth.controller.ts:142,450`; `emailService.ts:89-121` | No per-recipient cap; `sendStudentOtp` mails any unregistered `@ulab.edu.bd` → unlimited addresses exhaust email quota, deny OTP channel. |
| H7 | **Socket `dm:send`/`group:send` message flooding** | `chat.socket.ts:111-162,187-226` | No per-socket throttle → unbounded Message creation, broadcast amplification (worse via H1), DB/CPU DoS. |
| H8 | **Note PDF submit unrated → R2 cost + memory abuse** | `studentNotes.routes.ts` submit; `upload.middleware.ts:62` | Any student loops 50MB PDFs (memory-buffered + R2 write) → R2 billing inflation, memory-exhaustion DoS. |
| H9 | **`protect` does no DB existence/validity check** | `auth.middleware.ts:16-22` | Deleted/demoted user keeps full access ≤15m; logout doesn't revoke the access token; no jti/revocation. |
| H10 | **Refresh token never rotated; endpoint unauth + unrated** | `auth.controller.ts:372-407`; `auth.routes.ts:56` | Same 7-day refresh token reused for life → no reuse-detection; a captured token mints access tokens for 7d unthrottled. |
| H11 | **Password reset doesn't invalidate existing sessions** | `auth.controller.ts:491-525` | Reset leaves `refreshToken` + live access tokens valid → resetting a compromised account does not evict the attacker (≤7d). |

---

## MEDIUM

| # | Finding | Location | Impact |
|---|---|---|---|
| M1 | **`pre('save')` bcrypt-skip driven by user-input shape** | `User.model.ts:57-64`; `auth.controller.ts:62,516` | A password literally starting `$2b$`/`$2a$` is stored unhashed. Fix: explicit `alreadyHashed` flag. |
| M2 | **Login user-enumeration timing oracle** | `auth.controller.ts:237-247` (+teacher/admin) | Null-user branch returns before bcrypt; timing distinguishes registered emails despite uniform message. |
| M3 | **OTP + rate-limit state in-process memory** | `otp.ts:19,89`; `auth.routes.ts:21-35` | Lost on restart; multi-instance multiplies the 5-attempt cap and limiters by N. |
| M4 | **Weak password policy (min 6, no complexity)** | `User.model.ts:26`; `auth.controller.ts:57-60,113-116,500-503` | Within offline-cracking range; enforced ad-hoc per controller. |
| M5 | **`/uploads/*` unauthenticated + predictable teacher-photo URLs** | `server.ts:59-105`; `teacher.controller.ts:57` | `/<userId>.jpg` fetchable with no token by anyone knowing the id. |
| M6 | **No magic-byte/content validation on uploads** | `upload.middleware.ts:29-40,50-60`; `scheduleUpload.controller.ts:12-20` | Client mimetype/extension trusted; polyglot uploadable (mitigated only by forced serve Content-Type). |
| M7 | **Memory-storage uploads (50MB notes + xlsx) unrated** | `upload.middleware.ts:62-66`; `scheduleUpload.controller.ts:10,22-26` | N concurrent 50MB uploads held in RAM → memory DoS. |
| M8 | **`deleteAdmin` has no last-admin / self guard** | `admin.controller.ts:240-251` | Admin can delete the last admin (incl. self) → permanent panel lockout. |
| M9 | **NoSQL injection in `group:read`/`dm:read` socket payloads** | `chat.socket.ts:165-184,229-243` | `groupId={"$ne":null}` → `updateMany` corrupts `readBy` across all messages (integrity, not disclosure). |
| M10 | **`/auth/refresh-token` unauth + unrated** | `auth.routes.ts:56`; `auth.controller.ts:372-407` | DB read + sha256 every hit → load amplification; pairs with H10. |
| M11 | **schedule `generate`/`build` unrated, unbounded `courseUnicodes`** | `schedule.controller.ts:11-47,222-275` | Per-request CPU bounded internally, but no input cap + no limiter → concurrency CPU/DB DoS. |

---

## LOW

| # | Finding | Location |
|---|---|---|
| L1 | Missing `ObjectId.isValid` before `findById*` (CastError → clean msg, but violates standard) | `admin.controller.ts:107,122,161,184,242`; `resources.controller.ts:143,165,241,288,308,324,351,436`; chat layer (none) |
| L2 | NoSQL-operator injection on admin lookups (admin-only) | `admin.controller.ts:41,47,145,153,220` |
| L3 | `jwt.verify` does not pin `algorithms: ["HS256"]` | `auth.middleware.ts:16-19`; `auth.controller.ts:381-384`; `chat.socket.ts:71-74` |
| L4 | `toJSON` strips `password` but not `refreshToken` | `User.model.ts:48-54` |
| L5 | Reset-token compared with `===` (non-constant-time) | `otp.ts:150` |
| L6 | Path-traversal guard `startsWith` lacks trailing sep (latent, not exploitable now) | `server.ts:68-75` |
| L7 | Content/extension mismatch — non-JPEG stored/served as `.jpg` (cosmetic) | `upload.middleware.ts:23-26`; `server.ts:88-97` |
| L8 | `originalname` / note text stored unsanitized (stored-XSS sink if rendered) | `scheduleUpload.controller.ts:87`; `resources.controller.ts:471` |
| L9 | R2 objects permanently public (128-bit key, never signed/expiring) | `r2.ts:42-56`; `resources.controller.ts:456-473` |
| L10 | `addMemberToGroup` over-broad — creator can add any user (no course link) | `chat.controller.ts:63-110` |
| L11 | `ValidationError` echoes Mongoose per-field messages (schema/enum names); no `NODE_ENV` gate | `error.middleware.ts:32-38` |
| L12 | Cookie `secure` off when `NODE_ENV≠production`; no CSRF token (mitigated by header-based access + sameSite:strict) | `auth.controller.ts:81-86` etc. |
| L13 | Search endpoints unrated (`searchContacts` regex IS escaped — safe from ReDoS) | `chat.routes.ts`, `teacher.routes.ts`; `chat.controller.ts:377` |

---

## Confirmed-SAFE (verified, not issues)

- **Cross-teacher course IDOR — defended.** Every teacher controller scopes `findOne({_id, teacher: req.user.id})`; `saveAttendance` re-validates enrollment.
- **Mass assignment — defended.** All update controllers use explicit field whitelists; `createAdmin` hardcodes role. A student cannot set `role`/`password`/`email`/`studentId`.
- **Student self-IDOR — defended.** Profile/settings/change-password operate on `req.user.id` only; `changePassword` verifies `currentPassword`.
- **RBAC router coverage — complete.** All routers apply `router.use(protect, authorizeRole(...))`; no per-route gaps.
- **REST chat reads — gated.** `getGroupById/Members/Messages` require membership; `getDirectMessages` forces `userId` into every `$or` branch (no cross-thread read); `removeMemberFromGroup` creator-only.
- **`group:send` membership check — unbypassable.**
- **Auth essentials — safe.** Password never returned; OTP CSPRNG + 5-attempt cap + single-use; reset token 32-byte/10-min/single-use; refresh sha256-hashed + `select:false`; forgot-password enumeration-safe; refresh DB-bound (logout nulls it).
- **CORS — pass.** Exact-string allowlist, validated reflection, Express/Socket.io in sync.
- **Error handling — pass.** No stack/internal leak for unexpected errors; no controller bypasses `errorMiddleware`.
- **`/api/student-notes` browse — acceptable.** Returns only `status:"approved"`; pending notes admin-only.
- **R2 credentials — handled correctly.** Env-sourced, no secret logging.

---

## Test-target mapping (Phase 3)

Findings that are **deterministically testable** with Jest+Supertest+mongodb-memory-server: H1, H2, H4, H9, H10, H11, M1, M2 (smoke), M5, M6, M8, M9, L1, L2, L4, plus all confirmed-safe RBAC/IDOR/mass-assignment/auth invariants (regression tests). DoS/rate findings (H5–H8, M7, M10, M11) are testable at the unit level (limiter triggers 429 at threshold; unrated routes documented as a known gap) but full load behavior is out of scope for unit tests.
