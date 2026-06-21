// Security tests — File Uploads & Access (Phase 1.2)

import request from "supertest";
import { buildTestApp } from "./helpers/testApp";
import { createStudent } from "./helpers/fixtures";
import { NoteRepositoryModel } from "../src/models/NoteRepository.model";
import { NoteModel } from "../src/models/Note.model";

const app = buildTestApp();

const seedRepo = () =>
	NoteRepositoryModel.create({
		courseName: "Intro to CS",
		courseCode: "CSE101",
		department: "CSE",
	});

const PDF_BYTES = Buffer.from("%PDF-1.4\n1 0 obj\n<<>>\nendobj\n");

describe("Note upload — type & size enforcement", () => {
	it("rejects a non-PDF mimetype (400)", async () => {
		const student = await createStudent();
		const repo = await seedRepo();
		const res = await request(app)
			.post(`/api/student-notes/repository/${repo._id}/submit`)
			.set("Authorization", `Bearer ${student.token}`)
			.field("title", "My Notes")
			.attach("file", Buffer.from("not a pdf"), { filename: "x.txt", contentType: "text/plain" });
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/only pdf/i);
	});

	it("accepts a declared application/pdf upload (happy path, R2 mocked)", async () => {
		const student = await createStudent();
		const repo = await seedRepo();
		const res = await request(app)
			.post(`/api/student-notes/repository/${repo._id}/submit`)
			.set("Authorization", `Bearer ${student.token}`)
			.field("title", "Week 1 Notes")
			.attach("file", PDF_BYTES, { filename: "notes.pdf", contentType: "application/pdf" });
		expect(res.status).toBe(201);
		// stored as pending
		const note = await NoteModel.findOne({ title: "Week 1 Notes" });
		expect(note!.status).toBe("pending");
	});

	// FINDING M6/1.2.1: mimetype is client-reported; a non-PDF body with a spoofed
	// application/pdf content-type passes the filter (no magic-byte check).
	it("FINDING M6: a spoofed application/pdf mimetype on non-PDF bytes is accepted", async () => {
		const student = await createStudent();
		const repo = await seedRepo();
		const res = await request(app)
			.post(`/api/student-notes/repository/${repo._id}/submit`)
			.set("Authorization", `Bearer ${student.token}`)
			.field("title", "Spoofed")
			.attach("file", Buffer.from("<html><script>alert(1)</script></html>"), {
				filename: "evil.pdf",
				contentType: "application/pdf",
			});
		// Documents the gap: accepted despite non-PDF content.
		expect(res.status).toBe(201);
	});

	it("requires a file — submitting without one returns 400", async () => {
		const student = await createStudent();
		const repo = await seedRepo();
		const res = await request(app)
			.post(`/api/student-notes/repository/${repo._id}/submit`)
			.set("Authorization", `Bearer ${student.token}`)
			.field("title", "No file");
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/pdf file is required/i);
	});

	it("requires a title — submitting without one returns 400", async () => {
		const student = await createStudent();
		const repo = await seedRepo();
		const res = await request(app)
			.post(`/api/student-notes/repository/${repo._id}/submit`)
			.set("Authorization", `Bearer ${student.token}`)
			.attach("file", PDF_BYTES, { filename: "n.pdf", contentType: "application/pdf" });
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/title is required/i);
	});

	it("a teacher cannot submit a note (student-only route, 403)", async () => {
		const { createTeacher } = await import("./helpers/fixtures");
		const teacher = await createTeacher();
		const repo = await seedRepo();
		const res = await request(app)
			.post(`/api/student-notes/repository/${repo._id}/submit`)
			.set("Authorization", `Bearer ${teacher.token}`)
			.field("title", "T")
			.attach("file", PDF_BYTES, { filename: "n.pdf", contentType: "application/pdf" });
		expect(res.status).toBe(403);
	});
});

describe("File access — /uploads/* is unauthenticated (FINDING M5)", () => {
	// FINDING M5: /uploads/* has no auth; anyone can request a path. We assert the
	// route is reachable without a token (returns 404 for a missing file, NOT 401).
	it("FINDING M5: /uploads/* serves without authentication (no 401)", async () => {
		const res = await request(app).get("/uploads/teacher-photos/anyid.jpg");
		expect(res.status).not.toBe(401);
		expect([404, 200]).toContain(res.status);
	});
});

describe("Notes browse — only approved notes are exposed (confirmed-safe)", () => {
	it("getRecentNotes never returns pending notes", async () => {
		const student = await createStudent();
		const repo = await seedRepo();
		await NoteModel.create({
			title: "Pending Secret",
			repository: repo._id,
			courseCode: "CSE101",
			department: "CSE",
			fileType: "pdf",
			status: "pending",
			uploadedBy: student.id,
			uploaderName: "x",
		});
		const res = await request(app)
			.get("/api/student-notes/recent-notes")
			.set("Authorization", `Bearer ${student.token}`);
		expect(res.status).toBe(200);
		expect(JSON.stringify(res.body)).not.toContain("Pending Secret");
	});
});
