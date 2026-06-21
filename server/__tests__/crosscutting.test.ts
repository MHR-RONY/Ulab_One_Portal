// Security tests — Cross-cutting (Phase 1.6): CORS, error leakage, headers, NoSQL

import request from "supertest";
import { buildTestApp } from "./helpers/testApp";
import { createStudent, createAdmin } from "./helpers/fixtures";

const app = buildTestApp();

describe("CORS — exact-match allowlist (confirmed-safe 1.6-D)", () => {
	it("reflects an allowed origin", async () => {
		const res = await request(app)
			.get("/api/health")
			.set("Origin", "https://app.test");
		expect(res.headers["access-control-allow-origin"]).toBe("https://app.test");
	});

	it("does not reflect a non-allowed origin", async () => {
		const res = await request(app)
			.get("/api/health")
			.set("Origin", "https://evil.test");
		// cors() throws -> the origin is NOT echoed back
		expect(res.headers["access-control-allow-origin"]).toBeUndefined();
	});

	it("does not treat a substring of an allowed origin as allowed", async () => {
		const res = await request(app)
			.get("/api/health")
			.set("Origin", "https://app.test.evil.com");
		expect(res.headers["access-control-allow-origin"]).toBeUndefined();
	});
});

describe("Security headers", () => {
	it("sets helmet headers on /api/* responses", async () => {
		const res = await request(app).get("/api/health");
		expect(res.headers["x-content-type-options"]).toBe("nosniff");
	});

	// FINDING H3 / 1.6-A: /uploads/* is served BEFORE helmet, so it gets no nosniff.
	// Documents the gap. When fixed (handler sets nosniff explicitly), flip this
	// to expect "nosniff".
	it("FINDING H3: /uploads/* responses lack X-Content-Type-Options (served before helmet)", async () => {
		const res = await request(app).get("/uploads/notes/does-not-exist.pdf");
		// 404 (file missing) but the header behavior is what we assert: no nosniff.
		expect(res.headers["x-content-type-options"]).toBeUndefined();
	});
});

describe("Path traversal guard on /uploads/* (confirmed-safe 1.2.4)", () => {
	it("blocks an encoded traversal attempt without escaping the uploads dir", async () => {
		const res = await request(app).get("/uploads/..%2f..%2f..%2fetc%2fpasswd");
		// Either stripped+404 (file not found inside uploads) or 403 — never 200 with file contents.
		expect([403, 404]).toContain(res.status);
	});

	it("blocks a deep relative traversal", async () => {
		const res = await request(app).get("/uploads/notes/../../../../../../etc/passwd");
		expect([403, 404]).toContain(res.status);
		expect(res.text || "").not.toMatch(/root:.*:0:0:/);
	});
});

describe("Error handling — no internals leaked (confirmed-safe 1.6-E)", () => {
	it("returns clean JSON 404 for unknown routes (never HTML / stack)", async () => {
		const res = await request(app).get("/api/this-route-does-not-exist");
		expect(res.status).toBe(404);
		expect(res.body).toEqual({ success: false, message: "Route not found" });
	});

	it("an admin route with a bad ObjectId returns a clean message, not a stack trace", async () => {
		const a = await createAdmin();
		const res = await request(app)
			.delete("/api/admin/student/!!!notvalid!!!")
			.set("Authorization", `Bearer ${a.token}`);
		expect(res.status).toBeGreaterThanOrEqual(400);
		const body = JSON.stringify(res.body);
		expect(body).not.toMatch(/at \/|node_modules|\.ts:\d+|Cast to ObjectId failed for value/);
	});
});

describe("NoSQL operator injection via query string (H4 / 1.6-B)", () => {
	it("contacts/search with operator-injected q does not error-leak or dump all users", async () => {
		const s = await createStudent();
		// q is type-checked to string in the controller; an object query param is ignored.
		const res = await request(app)
			.get("/api/chat/contacts/search")
			.query({ "q[$ne]": "" })
			.set("Authorization", `Bearer ${s.token}`);
		expect(res.status).toBe(200);
		// q is not a string -> treated as empty -> returns []
		expect(Array.isArray(res.body.data)).toBe(true);
		expect(res.body.data).toHaveLength(0);
	});
});

describe("Body size limit", () => {
	// The 10mb express.json limit DOES reject the oversized body. Note: errorMiddleware
	// has no PayloadTooLargeError branch, so it surfaces as a generic 500 rather than
	// 413 — minor gap (the body is still rejected and never reaches the controller).
	it("rejects a JSON body larger than 10mb (not processed as a login)", async () => {
		const big = "x".repeat(11 * 1024 * 1024);
		const res = await request(app)
			.post("/api/auth/login/student")
			.set("Content-Type", "application/json")
			.send(JSON.stringify({ email: "a@ulab.edu.bd", password: big }));
		// Rejected before the controller — never a 200 with a token.
		expect(res.status).toBeGreaterThanOrEqual(400);
		expect(res.body.data?.accessToken).toBeUndefined();
	});
});
