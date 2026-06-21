// Security tests — Chat & Group Access (Phase 1.3)
// Socket events (group:join-room IDOR H1, dm:read injection M9) are tested at the
// socket-handler level is out of scope for Supertest; these cover the REST surface
// where membership/ownership is enforced, which is what guards message *history*.

import request from "supertest";
import mongoose from "mongoose";
import { buildTestApp } from "./helpers/testApp";
import { createStudent, createTeacher } from "./helpers/fixtures";
import { ChatGroupModel } from "../src/models/ChatGroup.model";
import { MessageModel } from "../src/models/Message.model";

const app = buildTestApp();

describe("Chat — group history is membership-gated (confirmed-safe)", () => {
	it("a non-member cannot read a group's messages (404)", async () => {
		const owner = await createTeacher();
		const outsider = await createStudent();
		const group = await ChatGroupModel.create({
			name: "CSE101 - A",
			type: "class",
			createdBy: owner.id,
			members: [owner.id],
		});
		await MessageModel.create({
			chatGroup: group._id,
			sender: owner.id,
			content: "secret group message",
			isGroupMessage: true,
			readBy: [owner.id],
		});

		const res = await request(app)
			.get(`/api/chat/groups/${group._id}/messages`)
			.set("Authorization", `Bearer ${outsider.token}`);
		expect(res.status).toBe(404);
	});

	it("a member can read the group's messages (200)", async () => {
		const owner = await createTeacher();
		const member = await createStudent();
		const group = await ChatGroupModel.create({
			name: "CSE101 - B",
			type: "class",
			createdBy: owner.id,
			members: [owner.id, member.id],
		});
		await MessageModel.create({
			chatGroup: group._id,
			sender: owner.id,
			content: "hello members",
			isGroupMessage: true,
			readBy: [owner.id],
		});

		const res = await request(app)
			.get(`/api/chat/groups/${group._id}/messages`)
			.set("Authorization", `Bearer ${member.token}`);
		expect(res.status).toBe(200);
		expect(res.body.data.messages).toHaveLength(1);
	});

	it("a non-member cannot read group metadata or members (404)", async () => {
		const owner = await createTeacher();
		const outsider = await createStudent();
		const group = await ChatGroupModel.create({
			name: "Private",
			type: "custom",
			createdBy: owner.id,
			members: [owner.id],
		});
		const meta = await request(app)
			.get(`/api/chat/groups/${group._id}`)
			.set("Authorization", `Bearer ${outsider.token}`);
		expect(meta.status).toBe(404);
		const members = await request(app)
			.get(`/api/chat/groups/${group._id}/members`)
			.set("Authorization", `Bearer ${outsider.token}`);
		expect(members.status).toBe(404);
	});
});

describe("Chat — DM threads are participant-scoped (confirmed-safe IDOR)", () => {
	it("user A cannot read the DM thread between B and C by guessing C's id", async () => {
		const a = await createStudent();
		const b = await createStudent();
		const c = await createStudent();
		// A private B<->C conversation
		await MessageModel.create({
			sender: b.id,
			receiver: c.id,
			content: "private B to C",
			isGroupMessage: false,
			readBy: [b.id],
		});

		// A asks for messages "with" C — should only ever return A<->C messages (none)
		const res = await request(app)
			.get(`/api/chat/conversations/${c.id}/messages`)
			.set("Authorization", `Bearer ${a.token}`);
		expect(res.status).toBe(200);
		expect(res.body.data.messages).toHaveLength(0);
		expect(JSON.stringify(res.body)).not.toContain("private B to C");
	});
});

describe("Chat — group member mutation is creator-only (confirmed-safe)", () => {
	it("a non-creator member cannot add another member (404 not authorized)", async () => {
		const creator = await createTeacher();
		const member = await createStudent();
		const stranger = await createStudent();
		const group = await ChatGroupModel.create({
			name: "Owned",
			type: "custom",
			createdBy: creator.id,
			members: [creator.id, member.id],
		});
		const res = await request(app)
			.post(`/api/chat/groups/${group._id}/members`)
			.set("Authorization", `Bearer ${member.token}`)
			.send({ memberId: stranger.id });
		expect(res.status).toBe(404);
	});

	// FINDING L10: the creator CAN add any arbitrary user with no course-relationship
	// check. Documents the over-broad capability (bounded by creator/teacher trust).
	it("FINDING L10: the creator can add an unrelated user to the group", async () => {
		const creator = await createTeacher();
		const unrelated = await createStudent();
		const group = await ChatGroupModel.create({
			name: "Owned2",
			type: "custom",
			createdBy: creator.id,
			members: [creator.id],
		});
		const res = await request(app)
			.post(`/api/chat/groups/${group._id}/members`)
			.set("Authorization", `Bearer ${creator.token}`)
			.send({ memberId: unrelated.id });
		expect(res.status).toBe(200);
		const updated = await ChatGroupModel.findById(group._id);
		expect(updated!.members.map((m) => m.toString())).toContain(unrelated.id);
	});
});

describe("Chat — sync-course-groups is restricted to admin/teacher", () => {
	it("a student cannot trigger sync-course-groups (403)", async () => {
		const s = await createStudent();
		const res = await request(app)
			.post("/api/chat/sync-course-groups")
			.set("Authorization", `Bearer ${s.token}`);
		expect(res.status).toBe(403);
	});

	it("an unauthenticated sync request is rejected (401)", async () => {
		const res = await request(app).post("/api/chat/sync-course-groups");
		expect(res.status).toBe(401);
	});
});
