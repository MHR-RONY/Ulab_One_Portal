# Security Test Plan — ULAB One Portal

> Executable security regression suite backing `security-audit-report.md`.
> Stack: Jest + ts-jest + Supertest + mongodb-memory-server. No external network
> calls (Brevo email and Cloudflare R2 are mocked).

## Running

```bash
cd server
npm test            # jest --runInBand --forceExit
npx jest auth       # a single suite
```

First run downloads an in-memory MongoDB binary (cached under
`node_modules/.cache/mongodb-memory-server`), so it is slower; subsequent runs
take ~20s.

## Architecture

- **`__tests__/setup.ts`** — `setupFilesAfterEach`: spins up `MongoMemoryServer`,
  sets the env vars the app reads (`JWT_SECRET`, `CLIENT_URL`, etc.), mocks
  `utils/emailService` and `utils/r2`, and wipes all collections after each test.
- **`__tests__/helpers/testApp.ts`** — rebuilds the exact `server.ts` middleware
  order and route mounts (helmet, CORS, `/uploads` handler, error middleware)
  **without** the import-time side effects (`connectDB`, `app.listen`,
  `process.exit`). `server.ts` cannot be imported directly because of those.
  Sets `trust proxy = 1` (test-only) so tests can pin `req.ip` via
  `X-Forwarded-For` to isolate per-test rate-limit buckets.
- **`__tests__/helpers/fixtures.ts`** — creates real Student/Teacher/Admin docs
  via the production models and mints tokens with the real `generateToken` util,
  plus forged/expired-token helpers.

### Why some tests assert the *vulnerable* behavior

Findings that are open gaps (not yet fixed) are encoded as tests prefixed
`FINDING <id>:` that assert the **current** behavior. They serve two purposes:
(1) prove the finding is real and reproducible, (2) act as a tripwire — when the
gap is fixed, the test fails and must be flipped to assert the secure behavior.
This keeps the audit and the code in sync. Confirmed-safe invariants are plain
regression tests that must always pass.

## Coverage by suite (70 tests)

| Suite | Findings / invariants exercised |
|---|---|
| `auth.test.ts` | Role-segregated login; generic 401 (no enumeration via message); password never returned; refresh cookie is httpOnly; bcrypt-at-rest; **M1** bcrypt-skip-by-shape (documented); **H10** no refresh rotation (documented); logout invalidates refresh; **H4/1.6-B** NoSQL injection on login (bcrypt still blocks); JWT validity (missing/malformed/expired/forged); OTP send + single-use + non-ulab reject + forgot-password enumeration-safe. |
| `rbac.test.ts` | Role segregation across all routers (403); forged/expired token reject (401); **mass-assignment** defense (student can't set role/email/password); **cross-teacher course IDOR** defense (404); **1.4-A** last-admin deletion lockout (documented); **1.4-C** bad ObjectId returns clean 4xx (no stack); student-notes browse is protect-only. |
| `chat.test.ts` | Group history membership-gated (non-member 404, member 200); group metadata/members gated; **DM thread participant-scoped** (no cross-thread read); member mutation creator-only; **L10** creator can add unrelated user (documented); sync-course-groups admin/teacher-only. |
| `uploads.test.ts` | Note PDF type reject (non-PDF 400); happy-path submit (pending); **M6** spoofed mimetype accepted (documented); file/title required; student-only submit (teacher 403); **M5** `/uploads/*` unauthenticated (documented); only approved notes exposed. |
| `crosscutting.test.ts` | CORS exact-match allowlist (allowed reflected, evil + substring not); helmet `nosniff` on `/api/*`; **H3/1.6-A** no `nosniff` on `/uploads/*` (documented); path-traversal guard holds; clean JSON 404 + no stack leak; query-string NoSQL injection neutralized (`searchContacts`); body-size limit rejects >10mb. |
| `ratelimit.test.ts` | **F1-related**: login limiter triggers 429 at the 10-request threshold with documented JSON shape; **KNOWN GAP** doc-test: non-auth route (`contacts/search`) is unrated (no 429). |

## Out of scope for this suite

- **Socket.io events** (H1 `group:join-room` IDOR, M9 `group:read`/`dm:read`
  injection, H7 message flooding) — require a socket.io test client harness;
  the REST surface that guards message *history* is covered instead. H1 is the
  highest-priority untested-at-integration finding — recommend a follow-up
  socket-level suite.
- **Load/DoS behavior** (H5–H8, M7, M11) — unit-testable signals only (limiter
  429, unrated routes documented); true load behavior is not asserted.
- **Frontend output-encoding** for the stored-XSS sinks (H2/1.6-C) — server
  stores raw; rendering safety is a frontend concern.
- **Multi-instance** limiter/OTP-state correctness (M3) — single-process only.
