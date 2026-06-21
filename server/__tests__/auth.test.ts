// Security tests — Auth & Password (Phase 1.1 findings + confirmed-safe regressions)

import request from "supertest";
import jwt from "jsonwebtoken";
import { buildTestApp } from "./helpers/testApp";
import { createStudent, createTeacher, createAdmin } from "./helpers/fixtures";
import { StudentModel } from "../src/models/Student.model";
import { AdminModel } from "../src/models/Admin.model";
import * as otp from "../src/utils/otp";

const app = buildTestApp();

// Each request gets a unique source IP so the module-level loginLimiter /
// otpLimiter (singletons in auth.routes.ts) don't bleed across tests in this file.
// The harness sets `trust proxy`, so req.ip = leftmost X-Forwarded-For.
// (Limiter threshold behavior itself is exercised in ratelimit.test.ts.)
let ipCounter = 0;
const ip = () =>
	`10.${Math.floor(ipCounter / 65536) % 256}.${Math.floor(ipCounter / 256) % 256}.${ipCounter++ % 256}`;
const aPost = (url: string) => request(app).post(url).set("X-Forwarded-For", ip());
const aGet = (url: string) => request(app).get(url).set("X-Forwarded-For", ip());

describe("Auth — login per role", () => {
	it("logs a student in with correct credentials and returns an access token", async () => {
		await createStudent({ email: "s1@ulab.edu.bd", password: "rightpass1" });
		const res = await aPost("/api/auth/login/student").send({ email: "s1@ulab.edu.bd", password: "rightpass1" });
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.data.accessToken).toBeTruthy();
	});

	it("rejects a wrong password with 401 and a generic message", async () => {
		await createStudent({ email: "s2@ulab.edu.bd", password: "rightpass1" });
		const res = await aPost("/api/auth/login/student").send({ email: "s2@ulab.edu.bd", password: "wrongpass" });
		expect(res.status).toBe(401);
		expect(res.body.message).toMatch(/invalid email or password/i);
	});

	it("rejects an unknown email with the same generic 401 message (no enumeration via message)", async () => {
		const res = await aPost("/api/auth/login/student").send({ email: "nobody@ulab.edu.bd", password: "whatever1" });
		expect(res.status).toBe(401);
		expect(res.body.message).toMatch(/invalid email or password/i);
	});

	it("does not let a teacher log in via the student endpoint (role-segregated login)", async () => {
		await createTeacher({ email: "t1@ulab.edu.bd", password: "rightpass1" });
		const res = await aPost("/api/auth/login/student").send({ email: "t1@ulab.edu.bd", password: "rightpass1" });
		expect(res.status).toBe(401);
	});

	it("logs an admin in and never returns the password or refreshToken field", async () => {
		await createAdmin({ email: "a1@ulab.edu.bd", password: "rightpass1" });
		const res = await aPost("/api/auth/login/admin").send({ email: "a1@ulab.edu.bd", password: "rightpass1" });
		expect(res.status).toBe(200);
		expect(res.body.data.admin).toBeDefined();
		expect(res.body.data.admin.password).toBeUndefined();
		expect(res.body.data.admin.refreshToken).toBeUndefined();
	});

	it("sets the refresh token as an httpOnly cookie, not in the JSON body", async () => {
		await createStudent({ email: "s3@ulab.edu.bd", password: "rightpass1" });
		const res = await aPost("/api/auth/login/student").send({ email: "s3@ulab.edu.bd", password: "rightpass1" });
		const cookies = res.headers["set-cookie"] as unknown as string[];
		expect(cookies.some((c) => c.startsWith("refreshToken=") && /HttpOnly/i.test(c))).toBe(true);
		expect(res.body.data.refreshToken).toBeUndefined();
	});
});

describe("Auth — password storage (H/M findings)", () => {
	it("password is stored bcrypt-hashed, never in plaintext (hash not reversible)", async () => {
		const s = await createStudent({ password: "rightpass1" });
		const doc = await StudentModel.findById(s.id).select("+password");
		expect(doc!.password).not.toBe("rightpass1");
		expect(doc!.password).toMatch(/^\$2[ab]\$/);
	});

	it("never returns the password field on the profile endpoint", async () => {
		const s = await createStudent();
		const res = await aGet("/api/student/profile").set("Authorization", `Bearer ${s.token}`);
		expect(res.status).toBe(200);
		expect(JSON.stringify(res.body)).not.toContain("$2b$");
		expect(JSON.stringify(res.body)).not.toContain("$2a$");
	});

	// FINDING M1 — pre('save') bcrypt-skip is driven by user-input shape.
	// DOCUMENTS the current (vulnerable) behavior: a password that is literally a
	// bcrypt-format string is stored verbatim instead of being hashed. If fixed
	// (explicit alreadyHashed flag), update this to assert the value IS re-hashed.
	it("FINDING M1: a bcrypt-shaped password supplied to admin setup is stored unhashed", async () => {
		const precomputed = "$2b$12$abcdefghijklmnopqrstuuWl0Qf3l3l3l3l3l3l3l3l3l3l3l3l3l";
		await aPost("/api/auth/admin/setup").send({ name: "Root", email: "root@ulab.edu.bd", password: precomputed });
		const admin = await AdminModel.findOne({ email: "root@ulab.edu.bd" }).select("+password");
		expect(admin!.password).toBe(precomputed);
	});

	it("rejects a password shorter than 6 chars on admin setup", async () => {
		const res = await aPost("/api/auth/admin/setup").send({ name: "Root", email: "root2@ulab.edu.bd", password: "123" });
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/at least 6/i);
	});
});

describe("Auth — refresh token rotation & reuse (H10)", () => {
	const login = async (email: string, password: string) => {
		await createStudent({ email, password });
		const res = await aPost("/api/auth/login/student").send({ email, password });
		const cookies = res.headers["set-cookie"] as unknown as string[];
		const refreshCookie = cookies.find((c) => c.startsWith("refreshToken="))!;
		return { refreshCookie };
	};

	it("issues a new access token from a valid refresh cookie", async () => {
		const { refreshCookie } = await login("r1@ulab.edu.bd", "rightpass1");
		const res = await aPost("/api/auth/refresh-token").set("Cookie", refreshCookie);
		expect(res.status).toBe(200);
		expect(res.body.data.accessToken).toBeTruthy();
	});

	it("rejects refresh when no cookie is presented", async () => {
		const res = await aPost("/api/auth/refresh-token");
		expect(res.status).toBe(401);
	});

	// FINDING H10 — refresh token is NOT rotated on use. Documents that the SAME
	// refresh cookie keeps working after a refresh (no rotation / reuse-detection).
	it("FINDING H10: the same refresh token still works after being used (no rotation)", async () => {
		const { refreshCookie } = await login("r2@ulab.edu.bd", "rightpass1");
		const first = await aPost("/api/auth/refresh-token").set("Cookie", refreshCookie);
		expect(first.status).toBe(200);
		const second = await aPost("/api/auth/refresh-token").set("Cookie", refreshCookie);
		expect(second.status).toBe(200); // reuse succeeds — documents the gap
	});

	it("logout invalidates the refresh token (stored hash is nulled)", async () => {
		const email = "r3@ulab.edu.bd";
		await createStudent({ email, password: "rightpass1" });
		const loginRes = await aPost("/api/auth/login/student").send({ email, password: "rightpass1" });
		const accessToken = loginRes.body.data.accessToken;
		const cookies = loginRes.headers["set-cookie"] as unknown as string[];
		const refreshCookie = cookies.find((c) => c.startsWith("refreshToken="))!;

		const logoutRes = await aPost("/api/auth/logout")
			.set("Authorization", `Bearer ${accessToken}`)
			.set("Cookie", refreshCookie);
		expect(logoutRes.status).toBe(200);

		const reuse = await aPost("/api/auth/refresh-token").set("Cookie", refreshCookie);
		expect(reuse.status).toBe(401);
	});
});

describe("Auth — NoSQL operator injection on login (H4 / 1.6-B)", () => {
	it("does not authenticate when email is a NoSQL operator object", async () => {
		await createStudent({ email: "victim@ulab.edu.bd", password: "rightpass1" });
		// {$gt:""} may MATCH the victim doc, but the attacker does not know the
		// password — bcrypt must still reject, so login must NOT succeed.
		const res = await aPost("/api/auth/login/student").send({ email: { $gt: "" }, password: "attacker-guess" });
		expect(res.status).not.toBe(200);
		expect(res.body.data?.accessToken).toBeUndefined();
	});

	it("does not authenticate with operator-injected password", async () => {
		await createStudent({ email: "victim2@ulab.edu.bd", password: "rightpass1" });
		const res = await aPost("/api/auth/login/student").send({ email: "victim2@ulab.edu.bd", password: { $gt: "" } });
		expect(res.status).not.toBe(200);
		expect(res.body.data?.accessToken).toBeUndefined();
	});
});

describe("Auth — JWT validity in protect", () => {
	it("rejects a request with no Authorization header (401)", async () => {
		const res = await aGet("/api/student/profile");
		expect(res.status).toBe(401);
	});

	it("rejects a malformed bearer token (401)", async () => {
		const res = await aGet("/api/student/profile").set("Authorization", "Bearer not-a-jwt");
		expect(res.status).toBe(401);
	});

	it("rejects an expired-but-correctly-signed token (401)", async () => {
		const s = await createStudent();
		const expired = jwt.sign(
			{ id: s.id, role: "student", email: s.email },
			process.env.JWT_SECRET as string,
			{ expiresIn: "-10s" }
		);
		const res = await aGet("/api/student/profile").set("Authorization", `Bearer ${expired}`);
		expect(res.status).toBe(401);
	});

	it("rejects a token signed with the wrong secret (forgery, 401)", async () => {
		const forged = jwt.sign({ id: "x", role: "admin", email: "e@x.com" }, "wrong-secret");
		const res = await aGet("/api/admin/me").set("Authorization", `Bearer ${forged}`);
		expect(res.status).toBe(401);
	});
});

describe("Auth — OTP flow (confirmed-safe regressions)", () => {
	it("sends an OTP on student registration and stores a pending registration", async () => {
		const res = await aPost("/api/auth/register/student/send-otp").send({
			name: "New Student",
			email: "new@ulab.edu.bd",
			password: "rightpass1",
			studentId: "S-NEW-1",
			department: "CSE",
		});
		expect(res.status).toBe(200);
		expect(otp.getPendingRegistration("new@ulab.edu.bd")).toBeDefined();
	});

	it("rejects registration for a non-ulab email", async () => {
		const res = await aPost("/api/auth/register/student/send-otp").send({
			name: "X",
			email: "x@gmail.com",
			password: "rightpass1",
			studentId: "S-X",
			department: "CSE",
		});
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/ulab\.edu\.bd/i);
	});

	it("rejects a wrong OTP and accepts the correct one (single-use)", async () => {
		await aPost("/api/auth/register/student/send-otp").send({
			name: "Y",
			email: "y@ulab.edu.bd",
			password: "rightpass1",
			studentId: "S-Y",
			department: "CSE",
		});
		const pending = otp.getPendingRegistration("y@ulab.edu.bd")!;
		const correctOtp = pending.otp;
		const wrongOtp = correctOtp === "000000" ? "111111" : "000000";

		const wrong = await aPost("/api/auth/register/student/verify-otp").send({ email: "y@ulab.edu.bd", otp: wrongOtp });
		expect(wrong.status).toBe(400);

		const ok = await aPost("/api/auth/register/student/verify-otp").send({ email: "y@ulab.edu.bd", otp: correctOtp });
		expect(ok.status).toBe(201);

		// OTP consumed — pending registration removed, so reuse fails.
		const reuse = await aPost("/api/auth/register/student/verify-otp").send({ email: "y@ulab.edu.bd", otp: correctOtp });
		expect(reuse.status).toBe(400);
	});

	it("forgot-password returns a generic response for an unknown email (no enumeration)", async () => {
		const res = await aPost("/api/auth/forgot-password/student/send-otp").send({ email: "ghost@ulab.edu.bd" });
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
	});
});
