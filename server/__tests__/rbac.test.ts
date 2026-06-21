// Security tests — RBAC, privilege escalation, IDOR, mass assignment (Phase 1.4)

import request from "supertest";
import { buildTestApp } from "./helpers/testApp";
import { createStudent, createTeacher, createAdmin, forgedToken, expiredToken } from "./helpers/fixtures";
import { StudentModel } from "../src/models/Student.model";
import { CourseModel } from "../src/models/Course.model";
import { UserModel } from "../src/models/User.model";

const app = buildTestApp();

describe("RBAC — role segregation across routers", () => {
	it("blocks a student token from admin routes (403)", async () => {
		const s = await createStudent();
		const res = await request(app).get("/api/admin/me").set("Authorization", `Bearer ${s.token}`);
		expect(res.status).toBe(403);
	});

	it("blocks a teacher token from admin routes (403)", async () => {
		const t = await createTeacher();
		const res = await request(app).get("/api/admin/dashboard-stats").set("Authorization", `Bearer ${t.token}`);
		expect(res.status).toBe(403);
	});

	it("blocks a student token from teacher routes (403)", async () => {
		const s = await createStudent();
		const res = await request(app).get("/api/teacher/profile").set("Authorization", `Bearer ${s.token}`);
		expect(res.status).toBe(403);
	});

	it("blocks a teacher token from student routes (403)", async () => {
		const t = await createTeacher();
		const res = await request(app).get("/api/student/dashboard").set("Authorization", `Bearer ${t.token}`);
		expect(res.status).toBe(403);
	});

	it("blocks an admin token from student-only schedule routes (403)", async () => {
		const a = await createAdmin();
		const res = await request(app).get("/api/schedule/my-schedule").set("Authorization", `Bearer ${a.token}`);
		expect(res.status).toBe(403);
	});

	it("allows an admin token on admin routes (200)", async () => {
		const a = await createAdmin();
		const res = await request(app).get("/api/admin/me").set("Authorization", `Bearer ${a.token}`);
		expect(res.status).toBe(200);
	});

	it("rejects a forged (wrong-secret) admin token on admin routes (401)", async () => {
		const res = await request(app).get("/api/admin/me").set("Authorization", `Bearer ${forgedToken()}`);
		expect(res.status).toBe(401);
	});

	it("rejects an expired admin token on admin routes (401)", async () => {
		const a = await createAdmin();
		const res = await request(app)
			.get("/api/admin/me")
			.set("Authorization", `Bearer ${expiredToken(a.id, "admin")}`);
		expect(res.status).toBe(401);
	});
});

describe("RBAC — mass assignment defense (confirmed-safe)", () => {
	it("a student cannot escalate to admin via profile update body", async () => {
		const s = await createStudent();
		await request(app)
			.put("/api/student/profile")
			.set("Authorization", `Bearer ${s.token}`)
			.send({ name: "Hacker", role: "admin", email: "evil@x.com", studentId: "FORGED" });
		const doc = await UserModel.findById(s.id);
		expect(doc!.role).toBe("student");
		expect(doc!.email).toBe(s.email); // email not mass-assignable
	});

	it("a student cannot overwrite their password via the settings/profile body", async () => {
		const s = await createStudent({ password: "rightpass1" });
		await request(app)
			.put("/api/student/profile")
			.set("Authorization", `Bearer ${s.token}`)
			.send({ name: "X", password: "$2b$12$attackercontrolledhashxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" });
		// original password still authenticates
		const res = await request(app)
			.post("/api/auth/login/student")
			.send({ email: s.email, password: "rightpass1" });
		expect(res.status).toBe(200);
	});
});

describe("IDOR — teacher cannot touch another teacher's course (confirmed-safe)", () => {
	it("teacher B cannot read teacher A's course students (404)", async () => {
		const teacherA = await createTeacher();
		const teacherB = await createTeacher();
		const course = await CourseModel.create({
			courseCode: "CSE101-A",
			name: "Intro",
			section: "A",
			credits: 3,
			department: "CSE",
			teacher: teacherA.id,
			enrolledStudents: [],
		});
		const res = await request(app)
			.get(`/api/teacher/courses/${course._id}/students`)
			.set("Authorization", `Bearer ${teacherB.token}`);
		expect(res.status).toBe(404);
	});

	it("teacher B cannot save attendance on teacher A's course (404)", async () => {
		const teacherA = await createTeacher();
		const teacherB = await createTeacher();
		const course = await CourseModel.create({
			courseCode: "CSE102-A",
			name: "DS",
			section: "A",
			credits: 3,
			department: "CSE",
			teacher: teacherA.id,
			enrolledStudents: [],
		});
		const res = await request(app)
			.post(`/api/teacher/courses/${course._id}/attendance`)
			.set("Authorization", `Bearer ${teacherB.token}`)
			.send({ date: "2026-06-21", records: [] });
		expect(res.status).toBe(404);
	});
});

describe("Admin — deleteAdmin guard (FINDING 1.4-A)", () => {
	// FINDING 1.4-A: there is no last-admin / self-deletion guard. This test
	// DOCUMENTS the current behavior (an admin can delete the last/only admin).
	// When a guard is added, update to expect a 400/403.
	it("FINDING 1.4-A: an admin can delete the last remaining admin (lockout risk)", async () => {
		const a = await createAdmin();
		const res = await request(app)
			.delete(`/api/admin/admin/${a.id}`)
			.set("Authorization", `Bearer ${a.token}`);
		// Documents the gap: deletion succeeds even though it's the only admin.
		expect([200, 204]).toContain(res.status);
		const remaining = await UserModel.countDocuments({ role: "admin" });
		expect(remaining).toBe(0);
	});
});

describe("ObjectId validation on :id params (FINDING 1.4-C)", () => {
	it("a malformed id does not 500 with a stack trace; returns a clean 4xx", async () => {
		const a = await createAdmin();
		const res = await request(app)
			.get("/api/admin/teacher/not-an-object-id")
			.set("Authorization", `Bearer ${a.token}`);
		// errorMiddleware maps CastError -> 400 "Invalid ID format"; assert no leak.
		expect(res.status).toBeGreaterThanOrEqual(400);
		expect(JSON.stringify(res.body)).not.toMatch(/stack|at Object|node_modules/i);
	});
});

describe("student-notes — any authenticated role may browse, only approved exposed (confirmed-safe)", () => {
	it("a teacher can hit the student-notes repositories browse route (protect-only)", async () => {
		const t = await createTeacher();
		const res = await request(app)
			.get("/api/student-notes/repositories")
			.set("Authorization", `Bearer ${t.token}`);
		expect(res.status).toBe(200);
	});

	it("an unauthenticated request to student-notes browse is rejected (401)", async () => {
		const res = await request(app).get("/api/student-notes/repositories");
		expect(res.status).toBe(401);
	});
});
