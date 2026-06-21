# ULAB One Portal — Security Audit Findings

> Living document. Phase 0 is the shared codebase map. Phases 1–2 append findings.
> Generated from a full read of `server/src`, not assumptions.

---

## Phase 0 — Full Codebase Map

### Global middleware order (`server/src/server.ts`)

1. `app.options("/uploads/*")` — CORS preflight for uploads (before Helmet).
2. `app.get("/uploads/*")` — manual static file server with path-traversal guard (before Helmet).
3. `helmet()` — applies to everything **after** this line (i.e. all `/api/*`, NOT `/uploads/*`).
4. `cors({ origin: allowlist, credentials: true })` — allowlist from `CLIENT_URL` (comma-separated). No-origin requests allowed.
5. `express.json({ limit: "10mb" })`
6. `cookieParser()`
7. Route mounts (see table).
8. 404 JSON handler.
9. `errorMiddleware` (last).

**Path-traversal guard** (`server.ts:59-105`): `path.normalize(rel).replace(/^(\.\.[/\\])+/, "")` then `path.join(UPLOADS_DIR, safePath)` and `if (!absolutePath.startsWith(UPLOADS_DIR)) → 403`. Serves with explicit `Content-Type` from an extension allowlist. **No auth check** — any file under `/uploads` is publicly readable by anyone who knows/guesses the path.

### Auth primitives

- **`protect`** (`auth.middleware.ts:6`): requires `Authorization: Bearer <jwt>`, verifies with `JWT_SECRET`, sets `req.user = decoded`. No DB lookup — trusts the JWT payload fully (no check that the user still exists or token wasn't invalidated).
- **`authorizeRole(...roles)`** (`auth.middleware.ts:29`): 403 unless `req.user.role` is in the list.
- **JWT payload** (`IJwtPayload`): `{ id, role, email }`. Access token 15m (`JWT_SECRET`), refresh 7d (`JWT_REFRESH_SECRET`).
- **Access token** returned in JSON body; **refresh token** set as httpOnly cookie (`secure` only in production, `sameSite: strict`) AND stored **sha256-hashed** in `User.refreshToken` (`select: false`).
- **Socket.io auth** (`chat.socket.ts:63-80`): `io.use` verifies `handshake.auth.token` with `JWT_SECRET`; rejects if missing/invalid. Same payload trust as `protect`.

### Routes → middleware → methods → controller

| Mount | File | Router-level guard | Route | Method | Controller |
|---|---|---|---|---|---|
| `/api/auth` | `auth.routes.ts` | none (public) | `/admin/check-setup` | GET | `checkAdminSetup` |
| | | `loginLimiter` | `/admin/setup` | POST | `setupAdmin` |
| | | `otpLimiter` | `/register/student/send-otp` | POST | `sendStudentOtp` |
| | | `otpLimiter` | `/register/student/verify-otp` | POST | `verifyStudentOtp` |
| | | `loginLimiter` | `/login/student` | POST | `loginStudent` |
| | | `loginLimiter` | `/login/teacher` | POST | `loginTeacher` |
| | | `loginLimiter` | `/login/admin` | POST | `loginAdmin` |
| | | `otpLimiter` | `/forgot-password/student/send-otp` | POST | `forgotStudentPassword` |
| | | `otpLimiter` | `/forgot-password/student/verify-otp` | POST | `verifyResetOtp` |
| | | `otpLimiter` | `/forgot-password/student/reset` | POST | `resetStudentPassword` |
| | | **none** | `/refresh-token` | POST | `refreshToken` (cookie-based) |
| | | `protect` | `/logout` | POST | `logout` |
| `/api/student` | `student.routes.ts` | `protect, authorizeRole("student")` | dashboard, attendance, attendance/day, profile (GET/PUT), settings (GET/PUT), change-password | — | student.controller |
| `/api/teacher` | `teacher.routes.ts` | `protect, authorizeRole("teacher")` | profile, profile/avatar (upload), settings, courses CRUD, course students, students/search, attendance, holiday | — | teacher.controller |
| `/api/admin` | `admin.routes.ts` | `protect, authorizeRole("admin")` | me, dashboard-stats, admins, admin (POST/DELETE `:id`), teacher CRUD (`:id`), students, student (DELETE `:id`) | — | admin.controller |
| `/api/schedule` | `schedule.routes.ts` | `protect, authorizeRole("student")` | build, generate, save-sections, my-schedule, offered-courses | — | schedule.controller |
| `/api/admin/schedule` | `scheduleUpload.routes.ts` | `protect, authorizeRole("admin")` | upload-schedule, parse-preview, confirm-save, offered-courses CRUD, upload-logs, schedule-stats | — | scheduleUpload.controller |
| `/api/chat` | `chat.routes.ts` | `protect` (all); `sync-course-groups` adds `authorizeRole("admin","teacher")` | conversations, conversations/:contactId/messages, contacts/search, contacts/:targetId/block (GET/POST/DELETE), groups, groups/:groupId, groups/:groupId/members (GET/POST/DELETE :memberId), groups/:groupId/messages | — | chat.controller |
| `/api/resources` | `resources.routes.ts` | `protect, authorizeRole("admin")` | stats, repositories, repository (POST), notes/pending, notes/:id/approve, notes/:id/reject, department/:deptId, repository/:repoId/notes, repository/:id (PUT/DELETE) | — | resources.controller |
| `/api/student-notes` | `studentNotes.routes.ts` | **`protect` only** on browse routes; `authorizeRole("student")` on upvote+submit | recent-notes (GET), repositories (GET), repository/:repoId (GET), repository/:repoId/notes (GET), notes/:id/upvote (PUT, student), repository/:repoId/submit (POST, student, `handlePdfUpload`) | — | resources.controller |

**RBAC observations to verify in Phase 1:**
- `/api/student-notes` browse routes are accessible by **any authenticated role** (student/teacher/admin) — flagged in CLAUDE.md as "confirm intentional."
- `protect` does **no DB existence check** — a JWT for a deleted user remains valid until expiry (15m access).
- `/api/auth/refresh-token` is **not rate-limited** and not behind `protect` (by design — uses cookie).

### File-upload entry points

| Entry | Middleware | Storage | Filter | Limit | Notes |
|---|---|---|---|---|---|
| Teacher avatar | `uploadTeacherPhoto` (`upload.middleware.ts:42`) | diskStorage → `uploads/teacher-photos/<userId>.jpg` | mimetype in {jpeg,png,webp,gif} | 5 MB | **Filename = `${req.user.id}.jpg`** regardless of real type/ext. Client-reported mimetype only — no magic-byte check. Overwrites by user id (no IDOR on write). |
| Note PDF | `uploadNotePdf` (`upload.middleware.ts:62`) | memoryStorage → R2 | mimetype === `application/pdf` | 50 MB | Client-reported mimetype only. Uploaded to R2 with random 16-byte hex key. |
| Schedule xlsx | `upload` (`scheduleUpload.controller.ts:22`) | memoryStorage | `fileFilter` (line 12 — need to confirm xlsx mimetype check) | 50 MB | admin-only. |

**`/uploads/*` serving:** public, no auth, path-traversal guarded. Teacher photos live here (`uploads/teacher-photos/<userId>.jpg`) → predictable filenames; anyone can fetch any teacher's photo by user id. Notes are on R2 (public bucket via `R2_PUBLIC_URL`), not `/uploads`.

### Socket.io events (`chat.socket.ts`)

| Event | Auth check beyond handshake? | Notes |
|---|---|---|
| connection | handshake JWT required | auto-joins all `group:<id>` rooms where `members: userId`, plus `user:<id>`. |
| `group:join-room` | **none** | joins **any** `group:<groupId>` room the client names — no membership check. IDOR: can join arbitrary group room and receive its future messages. |
| `group:leave-room` | none | leaves a room. |
| `dm:send` | block-check both directions | rejects self/empty/>5000 chars. |
| `dm:read` | none beyond handshake | marks messages read by contactId→user. |
| `group:send` | **membership verified** (`findOne {_id, members: userId}`) | good. |
| `group:read` | **none** | updates readBy on any groupId (no membership check; low impact). |
| `typing:start/stop` | none | broadcasts to `group:<targetId>` or `user:<targetId>` — can emit typing to arbitrary rooms. |
| `users:online-status` | none | leaks online status of arbitrary user ids. |
| disconnect | — | — |

### Rate limiting coverage

- **Only `/api/auth`** routes that explicitly attach `loginLimiter` (max 10 / 15m) or `otpLimiter` (max 5 / 15m).
- **`/api/auth/refresh-token`**: NOT rate-limited.
- **`/api/auth/admin/check-setup`**: NOT rate-limited.
- **All other routers** (student, teacher, admin, schedule, chat, resources, student-notes): NOT rate-limited.
- **Socket.io events** (dm:send, group:send): NOT rate-limited → message-flood abuse possible.

### Models & sensitive fields

- **`User`** (base, discriminatorKey `role`): `password` (`select:false`, bcrypt cost 12), `refreshToken` (`select:false`, sha256-hashed), `blockedUsers`. `toJSON` strips `password` only — **does it strip `refreshToken`?** Transform removes `password` explicitly; `refreshToken` is `select:false` so normally absent, but if ever selected (`+refreshToken`) it would survive `toJSON`. Verify in Phase 1.
- **`Student`/`Teacher`/`Admin`**: discriminators on User — inherit password/refreshToken. Student adds studentId, department, phone (PII). Teacher adds teacherId, bio, avatar. Admin adds permissions.
- **`Message`**: content (stored chat text — XSS sink if rendered unescaped), sender/receiver/chatGroup, readBy.
- **`Note`**: `voters` Map (userId→vote), uploaderName, fileUrl, adminFeedback.
- **`UploadLog`**: uploadedBy, fileName/size.
- Others: Course, OfferedCourse, Schedule, Attendance, Holiday, ChatGroup, NoteRepository, TeacherDirectory.

### Cross-cutting notes for Phase 1

- **NoSQL injection**: `protect` trusts JWT; no global `$`-key stripping middleware seen in `server.ts`. Login uses `findOne({ email })` with `email` straight from `req.body` — if a client sends `{ "email": { "$gt": "" } }` it could match the first user. **Each controller must be checked for `$`-operator injection.** CLAUDE.md says "strip `$`-prefixed keys" but no such middleware is mounted globally.
- **Error leakage**: `errorMiddleware` maps known error types to clean messages and defaults to generic "Internal server error" (500) — does NOT send `err.stack` or `err.message` for unknown errors. Good. Verify no controller does `res.json(err)` directly.
- **CORS**: allowlist from `CLIENT_URL`; no-origin requests pass (server-to-server / curl). Socket.io CORS mirrors it.
- **`refresh-token` reuse**: on refresh, the stored hashed token is **not rotated** (`refreshToken` controller issues a new access token but does not issue/replace the refresh token) → no refresh-token rotation; a leaked refresh token is valid for full 7d. Verify.

---

## Phase 1.1 — Auth & Password Security

### High

**[High] No DB existence/validity check in `protect`** — `auth.middleware.ts:16-22`. Verifies JWT signature, trusts `{id,role,email}` with no User lookup. A deleted/role-changed user passes every gate until 15m access-token expiry. Logout (`auth.controller.ts:409`) clears only the refresh token; the access token stays usable. No revocation/jti.

**[High] Refresh token never rotated; endpoint unauth + unrated** — `auth.controller.ts:372-407`, `auth.routes.ts:56`. On refresh, only a new access token is minted; the same 7-day refresh token is reused for its whole lifetime. No rotation -> no reuse-detection. A captured refresh token is a 7-day access-minting oracle with no throttle.

**[High] Password reset/change doesn't invalidate existing sessions** — `auth.controller.ts:491-525`. `resetStudentPassword` updates the credential but leaves `refreshToken` untouched and existing access tokens valid. Resetting a compromised account's password does not evict the attacker (<=7d).

### Medium

**[Medium] NoSQL operator injection on auth `findOne({email})`** — `auth.controller.ts:237,285,333,118,124,441,510`. No express-validator/`validate` on auth routes, no global `$`-stripping. `email` from body goes straight into `findOne`. `{"email":{"$gt":""}}` matches first user. Not a full login bypass (bcrypt still required) but enables record probing on uniqueness/forgot lookups and violates the documented rule.

**[Medium] `pre('save')` bcrypt-skip driven by user-input shape** — `User.model.ts:57-64`, exploited via `auth.controller.ts:62` (setupAdmin) and `:516` (reset). Hook skips hashing if password starts with `$2b$`/`$2a$`. Raw-password paths assign user input directly; a user supplying a self-computed bcrypt hash gets it stored verbatim. Fix: explicit `alreadyHashed` flag, not field-content sniffing.

**[Medium] Login user-enumeration timing oracle** — `auth.controller.ts:237-247` (+teacher/admin). "User not found" returns before any bcrypt compare; existing user runs cost-12 bcrypt. Uniform message but timing delta distinguishes registered emails. Fix: dummy bcrypt compare on the null branch.

**[Medium] OTP & rate-limit state in-process memory** — `otp.ts:19,89`, `auth.routes.ts:21-35`. Lost on restart; under multi-instance the 5-attempt OTP cap and login/OTP limiters are per-instance -> effective budget x N.

**[Medium] Weak password policy (min 6, no complexity)** — `User.model.ts:26`, `auth.controller.ts:57-60,113-116,500-503`. Only length>=6, checked ad-hoc per controller.

### Low / Informational

**[Low] `jwt.verify` does not pin `algorithms`** — `auth.middleware.ts:16-19`, `auth.controller.ts:381-384`, `chat.socket.ts:71-74`. Not currently exploitable (symmetric secret) but defense-in-depth.

**[Low] `toJSON` strips `password` but not `refreshToken`** — `User.model.ts:48-54`. Protected today only by `select:false`.

**[Low] Reset-token compared with `===` (non-constant-time)** — `otp.ts:150`. 256-bit token so not practically exploitable.

**Confirmed-SAFE:** OTP entropy (`crypto.randomInt`, 6-digit) + 5-attempt cap; OTP single-use; reset token random 32-byte/10-min/single-use; refresh token sha256-hashed + `select:false`; password never returned (toJSON strips); forgot-password enumeration-safe; refresh DB-binding correct (logout nulls it).

---

## Phase 1.2 — File Access & Uploads

**[Medium] 1.2.1 No content/magic-byte validation on any upload** — `upload.middleware.ts:29-40,50-60`, `scheduleUpload.controller.ts:12-20`. All three filters trust client `mimetype`/extension. Spoofed `Content-Type`/filename uploads a polyglot. Avatar mitigated by forced `.jpg` Content-Type on serve; notes isolated on R2 origin; xlsx parsed-only.

**[Medium] 1.2.2 `/uploads/*` served before Helmet -> no `nosniff`/CSP** — `server.ts:40-105` (helmet at `:108`). Missing `X-Content-Type-Options: nosniff` on the one route serving attacker bytes -> MIME-sniff -> potential stored XSS on app origin.

**[Medium] 1.2.3 `/uploads/*` unauthenticated + predictable teacher-photo URLs** — `server.ts:59-105`, `teacher.controller.ts:57` (`/uploads/teacher-photos/<userId>.jpg`). Anyone knowing a user id fetches the photo with no token.

**[Medium] 1.2.7 Memory-storage uploads (50MB notes + 50MB xlsx) unrated -> memory DoS** — `upload.middleware.ts:62-66`, `scheduleUpload.controller.ts:10,22-26`. Full upload buffered in RAM before processing; no rate/concurrency cap.

**[Low] 1.2.4 Path-traversal guard effective; `startsWith` prefix bug latent** — `server.ts:68-75`. All traversal attempts defeated by `path.join` rooting. Latent: `startsWith(UPLOADS_DIR)` without trailing sep would match a sibling `uploads-secret`. Fix: `UPLOADS_DIR + path.sep`.

**[Low] 1.2.5 Content/extension mismatch** — `upload.middleware.ts:23-26`, `server.ts:88-97`. PNG/WEBP/GIF stored & served as `.jpg`. Cosmetic. Write-side IDOR: none (filename = `req.user.id`).

**[Low] 1.2.6 `originalname`/note text stored unsanitized** — `scheduleUpload.controller.ts:87` (UploadLog.fileName), `resources.controller.ts:471`. No FS injection but stored-XSS sink if rendered unescaped.

**[Low] 1.2.8 R2 bucket public-read; pending note files publicly fetchable** — `r2.ts:42-56`, `resources.controller.ts:456-473`. Files public via 128-bit random key the instant uploaded. List endpoints filter `status:"approved"`; pending fileUrl exposed only to uploader+admin. Residual: permanently public, never signed.

**[Info] 1.2.9 R2 credentials handled correctly** — `r2.ts:6-13`. Env-sourced, no secret logging. Minor: keys default to `""` + only `console.warn` on misconfig.

---

## Phase 1.3 — Chat & Group Access

**[High] Finding 1 — IDOR `group:join-room` joins any group room without membership check** — `chat.socket.ts:101-103`. Handler joins client-named `group:<id>` with zero membership verification (contrast connection auto-join at `:89-92`, `group:send` check at `:196-199`). Any authenticated user emits `group:join-room` with a guessable groupId -> receives all future `group:receive` broadcasts. Leaks future messages only (history protected by REST check).

**[Medium] Finding 7 — Stored chat messages not sanitized server-side** — `Message.model.ts:23-28`, `chat.socket.ts:142-148,206-212`. `content` stored with only `trim`+`maxlength:5000`. `<img src=x onerror=...>` stored raw, served verbatim by all read endpoints.

**[Low-Medium] Finding 6 — NoSQL operator injection in `group:read`/`dm:read` socket payloads** — `chat.socket.ts:165-184,229-243`. `group:read` with `groupId={"$ne":null}` -> `updateMany` matches every group message, adding attacker to `readBy` on all. Read-state corruption (not disclosure). No `ObjectId.isValid` anywhere in chat layer.

**[Low] Finding 3 note — `addMemberToGroup` over-broad** — `chat.controller.ts:63-110`. Group creator can add any UserModel doc (only existence check); no course-relationship check. Bounded by teacher/creator trust.

**Confirmed-SAFE:** handshake auth rejects missing/bad/expired; `group:send` membership check unbypassable; REST `getGroupById/Members/Messages` all gated `findOne({_id,members:userId})` -> non-member 404; `getDirectMessages` forces `userId` into every `$or` branch -> no cross-thread read; `removeMemberFromGroup` creator-only + blocks self-removal; `sync-course-groups` never reads caller identity; 5000-char cap consistent. `algorithms` not pinned on socket verify (Low).

---

## Phase 1.4 — Admin Panel & RBAC / IDOR

**[Medium] 1.4-A No "last admin"/self-deletion guard on `deleteAdmin`** — `admin.controller.ts:240-251`. `findByIdAndDelete(req.params.id)` with no guard against deleting the last admin or self -> permanent admin-panel lockout.

**[Medium] 1.4-B `protect`/`authorizeRole` trust JWT role with no DB re-check** — `auth.middleware.ts:6-27,29-42`. Deleted/demoted user keeps access <=15m. Every RBAC/ownership decision rests on JWT signature alone.

**[Low] 1.4-C Missing `ObjectId` validation before `findById*`** — admin: `admin.controller.ts:107,122,161,184,242`; resources: `resources.controller.ts:143,165,241,288,308,324,351,436`. Malformed id -> CastError (mapped clean by errorMiddleware) but violates documented standard.

**[Low] 1.4-D NoSQL-operator injection on admin lookups** — `admin.controller.ts:41,47,145,153,220`. `email`/`teacherId` from body into `findOne` with no type check. Admin-only routes so low exposure.

**Confirmed-SAFE:** Cross-teacher course IDOR DEFENDED — every teacher controller scopes `findOne({_id,teacher:req.user.id})` (`teacher.controller.ts:131,157,215,287,383,436,463`); `saveAttendance` re-validates enrollment (`:395-400`). Mass-assignment DEFENDED — all updates use explicit field whitelists (`student.controller.ts:94-99,258-263`; `teacher.controller.ts:31-37,479-490`; `admin.controller.ts:162-167`); `createAdmin` hardcodes role (`:226`). Student IDOR DEFENDED — operate on `req.user.id` only; changePassword verifies currentPassword. RBAC router-level coverage COMPLETE. `/api/student-notes` browse returns only `status:"approved"` (`resources.controller.ts:397,241`); pending admin-only; voters stripped — acceptable.

---

## Phase 1.5 — Rate Limiting & Abuse

**[High] F1 `trust proxy` not set -> limiter key collapses to proxy IP** — `server.ts` (no `app.set("trust proxy")`); affects `auth.routes.ts:21-35`. Behind nginx, `req.ip` = proxy IP for all clients -> all users share one bucket. 10 login attempts total/15m trips `loginLimiter` site-wide -> global login DoS; 5 OTP/15m freezes registration+reset platform-wide. Correct fix is a specific hop count.

**[High] F4 Email-send abuse / inbox bombing** — `auth.controller.ts:142,450`, `emailService.ts:89-121`. No per-recipient send cap; limiter keys on sender IP not target email (global-bucketed per F1). `sendStudentOtp` sends for any unregistered `@ulab.edu.bd` -> unlimited addresses burn Brevo quota. bcrypt cost-12 per call = CPU amplifier.

**[High] F5b Socket `dm:send`/`group:send` message flooding** — `chat.socket.ts:111-162,187-226`. No per-socket throttle. Thousands of events/sec -> unbounded Message creation, broadcast amplification (worse via `group:join-room` IDOR), DB/CPU DoS.

**[High] F5c Note PDF submit unrated -> R2 cost / memory abuse** — `studentNotes.routes.ts` submit, `upload.middleware.ts:62`. Any student loops 50MB PDFs; each buffers 50MB RAM + R2 write. R2 billing inflation + memory DoS.

**[Medium] F5a `/auth/refresh-token` unauth + unrated** — `auth.routes.ts:56`, `auth.controller.ts:372-407`. DB read + sha256 on every hit; unauthenticated DB-load amplification. Refresh not rotated -> leaked token valid full 7d.

**[Medium] F5d schedule `generate`/`build` unrated** — `schedule.routes.ts`, `schedule.controller.ts:11-47,222-275`. Generator internally bounded (`MAX_VALID=500`, `MAX_NODES=200_000`) but `courseUnicodes` length unbounded + no limiter -> sustained-concurrency CPU/DB DoS.

**[Low-Medium] F5e search endpoints unrated** — `contacts/search`, `students/search`. Unrated DB query flooding. (`searchContacts` regex IS escaped — `chat.controller.ts:377` — not ReDoS.)

**[Info] F2/F3** Login limiter returns 429 + `RateLimit-*` headers; shared `loginLimiter` across 3 login routes + setup; no per-account lockout. OTP per-IP limiter + in-Map per-email cap (5) — both undermined by F1/multi-instance.

**[Info] F6** `express.json({limit:"10mb"})` global (`server.ts:122`); doesn't apply to multipart.

---

## Phase 1.6 — Cross-Cutting

**[High] 1.6-A No `nosniff`/headers on `/uploads/*` + client-controlled content -> stored XSS via MIME sniffing** — `server.ts:40-105` (before helmet `:108`). Unknown extensions served with NO Content-Type -> browser sniffs. Same-origin + no CSP = real stored-XSS vector. Fix: `nosniff` + octet-stream default + `Content-Disposition: attachment` + reject unknown ext.

**[High] 1.6-B No global `$`-key stripping middleware mounted (not even a dependency)** — `server.ts:107-123`, `server/package.json`. CLAUDE.md requires it; absent. Reachable sinks: `auth.controller.ts:237,285,333,118,124,181,441,510`; `admin.controller.ts:41,47,145,153,220`; `schedule.controller.ts:166`. Login not bypassable alone (bcrypt) -> Medium per-sink, missing required control is the High headline. `searchContacts` correctly escapes/type-checks — safe.

**[High] 1.6-C Stored XSS — chat & note content stored raw** — `chat.socket.ts:142-148,206-212`; `resources.controller.ts:460-472,64-69`. Zero server-side sanitization. Recommend server-side strip/encode.

**[Low] 1.6-D CORS — PASS** — `server.ts:109-121`, `chat.socket.ts:41-58`. Exact-string allowlist; origin validated before reflection; Express+Socket.io in sync; `/uploads` uses same allowlist. Note: `!origin->true` allows non-browser clients (acceptable).

**[Low] 1.6-E Error handling — PASS, minor** — `error.middleware.ts:5-58`. Unknown errors -> generic 500, never `err.message`/`.stack`. No controller bypass. Minor: `ValidationError` (`:32-38`) echoes Mongoose per-field messages (schema field/enum names); no `NODE_ENV` gate.

**[Low] 1.6-F Cookie security — good, no CSRF token** — `auth.controller.ts:81-86` etc. refreshToken httpOnly + sameSite:strict + secure(prod) + 7d. `sameSite:strict` is sole CSRF defense on cookie-only `/refresh-token` — acceptable given header-based access token.
