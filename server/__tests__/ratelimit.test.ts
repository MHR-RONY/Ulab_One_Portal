// Security tests — Rate Limiting (Phase 1.5)
//
// The limiters (loginLimiter max=10, otpLimiter max=5 per 15m) are module-level
// singletons in auth.routes.ts. Jest gives each test FILE its own module
// registry, so this file's limiter buckets start fresh — but within this file the
// bucket accumulates across requests, which is exactly what we exercise.
//
// NOTE: loginLimiter is shared across /admin/setup + all 3 /login/* routes.

import request from "supertest";
import { buildTestApp } from "./helpers/testApp";
import { createStudent } from "./helpers/fixtures";

const app = buildTestApp();

describe("Rate limiting — login limiter triggers 429 at threshold", () => {
	it("returns 429 after the 10-request login budget is exhausted", async () => {
		await createStudent({ email: "rl@ulab.edu.bd", password: "rightpass1" });

		const statuses: number[] = [];
		// 12 attempts against the shared loginLimiter (max 10 / 15m)
		for (let i = 0; i < 12; i++) {
			const res = await request(app)
				.post("/api/auth/login/student")
				.send({ email: "rl@ulab.edu.bd", password: "wrongpass" });
			statuses.push(res.status);
		}

		// First ~10 are processed (401 wrong password), then limiter kicks in with 429.
		expect(statuses).toContain(429);
		// The 429 must appear only after several attempts, not immediately.
		expect(statuses.slice(0, 5).every((s) => s === 401)).toBe(true);
	});

	it("the 429 response carries the documented JSON shape", async () => {
		// Bucket already exhausted by the previous test (same module instance) —
		// the very next login attempt should be 429.
		const res = await request(app)
			.post("/api/auth/login/student")
			.send({ email: "rl@ulab.edu.bd", password: "whatever1" });
		expect(res.status).toBe(429);
		expect(res.body.success).toBe(false);
		expect(res.body.message).toMatch(/too many/i);
	});
});

describe("Rate limiting — KNOWN GAP: non-auth routes are unrated (documented)", () => {
	// Per CLAUDE.md + Phase 1.5: only /api/auth carries a limiter. This test
	// documents that a protected non-auth route is NOT rate-limited (no 429 under
	// rapid repeat). This is an intentionally-documented gap, not a passing
	// security control — it exists to flag the gap and catch a future regression
	// if/when a limiter is added.
	it("DOC: /api/chat/contacts/search does not return 429 under rapid repeats", async () => {
		const s = await createStudent({ email: "rl2@ulab.edu.bd", password: "rightpass1" });
		const statuses: number[] = [];
		for (let i = 0; i < 15; i++) {
			const res = await request(app)
				.get("/api/chat/contacts/search")
				.query({ q: "ab" })
				.set("Authorization", `Bearer ${s.token}`);
			statuses.push(res.status);
		}
		expect(statuses).not.toContain(429);
	});
});
