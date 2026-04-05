import { RequestHandler } from "express";
import { ChatGroupModel } from "../models/ChatGroup.model";
import { MessageModel } from "../models/Message.model";
import { CourseModel } from "../models/Course.model";
import { UserModel } from "../models/User.model";
import { StudentModel } from "../models/Student.model";
import { sendResponse } from "../utils/apiResponse";

// ---- Chat Groups ----

export const getMyGroups: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user?.id;

		const groups = await ChatGroupModel.find({ members: userId })
			.populate("course", "courseCode name section")
			.populate("members", "name email role")
			.populate("createdBy", "name email")
			.sort({ updatedAt: -1 });

		const groupsWithUnread = await Promise.all(
			groups.map(async (group) => {
				const unreadCount = await MessageModel.countDocuments({
					chatGroup: group._id,
					isGroupMessage: true,
					sender: { $ne: userId },
					readBy: { $nin: [userId] },
				});
				return { ...group.toJSON(), unreadCount };
			})
		);

		sendResponse(res, 200, true, "Groups fetched successfully", groupsWithUnread);
	} catch (error) {
		next(error);
	}
};

export const getGroupById: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user?.id;
		const { groupId } = req.params;

		const group = await ChatGroupModel.findOne({
			_id: groupId,
			members: userId,
		})
			.populate("course", "courseCode name section")
			.populate("members", "name email role")
			.populate("createdBy", "name email");

		if (!group) {
			sendResponse(res, 404, false, "Group not found or access denied");
			return;
		}

		sendResponse(res, 200, true, "Group fetched successfully", group);
	} catch (error) {
		next(error);
	}
};

export const addMemberToGroup: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user?.id;
		const { groupId } = req.params;
		const { memberId } = req.body;

		if (!memberId) {
			sendResponse(res, 400, false, "memberId is required");
			return;
		}

		const group = await ChatGroupModel.findOne({
			_id: groupId,
			createdBy: userId,
		});

		if (!group) {
			sendResponse(res, 404, false, "Group not found or not authorized");
			return;
		}

		const user = await UserModel.findById(memberId);
		if (!user) {
			sendResponse(res, 404, false, "User not found");
			return;
		}

		const alreadyMember = group.members.some(
			(m) => m.toString() === memberId
		);
		if (alreadyMember) {
			sendResponse(res, 409, false, "User is already a member of this group");
			return;
		}

		await ChatGroupModel.findByIdAndUpdate(groupId, {
			$addToSet: { members: memberId },
		});

		const updatedGroup = await ChatGroupModel.findById(groupId)
			.populate("members", "name email role")
			.populate("createdBy", "name email");

		sendResponse(res, 200, true, "Member added successfully", updatedGroup);
	} catch (error) {
		next(error);
	}
};

export const removeMemberFromGroup: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user?.id;
		const { groupId, memberId } = req.params;

		const group = await ChatGroupModel.findOne({
			_id: groupId,
			createdBy: userId,
		});

		if (!group) {
			sendResponse(res, 404, false, "Group not found or not authorized");
			return;
		}

		if (memberId === userId) {
			sendResponse(res, 400, false, "Cannot remove yourself from the group");
			return;
		}

		await ChatGroupModel.findByIdAndUpdate(groupId, {
			$pull: { members: memberId },
		});

		sendResponse(res, 200, true, "Member removed successfully");
	} catch (error) {
		next(error);
	}
};

export const getGroupMembers: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user?.id;
		const { groupId } = req.params;

		const group = await ChatGroupModel.findOne({
			_id: groupId,
			members: userId,
		}).populate("members", "name email role");

		if (!group) {
			sendResponse(res, 404, false, "Group not found or access denied");
			return;
		}

		const memberDetails = await Promise.all(
			(group.members as unknown as Array<{ _id: { toString(): string }; name: string; email: string; role: string }>).map(async (member) => {
				const student = await StudentModel.findById(member._id).select("studentId department semester");
				return {
					_id: member._id,
					name: member.name,
					email: member.email,
					role: member.role,
					studentId: student?.studentId,
					department: student?.department,
				};
			})
		);

		sendResponse(res, 200, true, "Members fetched successfully", memberDetails);
	} catch (error) {
		next(error);
	}
};

// ---- Group Messages ----

export const getGroupMessages: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user?.id;
		const { groupId } = req.params;
		const page = parseInt(req.query.page as string) || 1;
		const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

		const group = await ChatGroupModel.findOne({
			_id: groupId,
			members: userId,
		});

		if (!group) {
			sendResponse(res, 404, false, "Group not found or access denied");
			return;
		}

		const skip = (page - 1) * limit;

		const messages = await MessageModel.find({
			chatGroup: groupId,
			isGroupMessage: true,
		})
			.populate("sender", "name email role")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await MessageModel.countDocuments({
			chatGroup: groupId,
			isGroupMessage: true,
		});

		// Mark messages as read
		await MessageModel.updateMany(
			{
				chatGroup: groupId,
				isGroupMessage: true,
				sender: { $ne: userId },
				readBy: { $nin: [userId] },
			},
			{ $addToSet: { readBy: userId } }
		);

		sendResponse(res, 200, true, "Messages fetched successfully", {
			messages: messages.reverse(),
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		next(error);
	}
};

// ---- Personal / Direct Messages ----

export const getConversations: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user?.id;

		// Find all users this person has exchanged messages with
		const sentMessages = await MessageModel.distinct("receiver", {
			sender: userId,
			isGroupMessage: false,
			receiver: { $ne: null },
		});

		const receivedMessages = await MessageModel.distinct("sender", {
			receiver: userId,
			isGroupMessage: false,
		});

		const contactIds = [...new Set([...sentMessages, ...receivedMessages].map(String))];

		const conversations = await Promise.all(
			contactIds.map(async (contactId) => {
				const lastMessage = await MessageModel.findOne({
					isGroupMessage: false,
					$or: [
						{ sender: userId, receiver: contactId },
						{ sender: contactId, receiver: userId },
					],
				})
					.sort({ createdAt: -1 })
					.select("content createdAt sender");

				const unreadCount = await MessageModel.countDocuments({
					sender: contactId,
					receiver: userId,
					isGroupMessage: false,
					readBy: { $nin: [userId] },
				});

				const contact = await UserModel.findById(contactId).select(
					"name email role"
				);

				if (!contact) return null;

				const student = await StudentModel.findById(contactId).select("studentId");

				return {
					contactId: contact._id,
					name: contact.name,
					email: contact.email,
					role: contact.role,
					studentId: student?.studentId,
					lastMessage: lastMessage?.content ?? "",
					lastMessageAt: lastMessage?.createdAt,
					lastMessageIsMine: lastMessage?.sender.toString() === userId,
					unreadCount,
				};
			})
		);

		const validConversations = conversations
			.filter(Boolean)
			.sort((a, b) => {
				const aTime = a?.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
				const bTime = b?.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
				return bTime - aTime;
			});

		sendResponse(res, 200, true, "Conversations fetched successfully", validConversations);
	} catch (error) {
		next(error);
	}
};

export const getDirectMessages: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user?.id;
		const { contactId } = req.params;
		const page = parseInt(req.query.page as string) || 1;
		const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

		const skip = (page - 1) * limit;

		const messages = await MessageModel.find({
			isGroupMessage: false,
			$or: [
				{ sender: userId, receiver: contactId },
				{ sender: contactId, receiver: userId },
			],
		})
			.populate("sender", "name email role")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit);

		const total = await MessageModel.countDocuments({
			isGroupMessage: false,
			$or: [
				{ sender: userId, receiver: contactId },
				{ sender: contactId, receiver: userId },
			],
		});

		// Mark messages as read
		await MessageModel.updateMany(
			{
				sender: contactId,
				receiver: userId,
				isGroupMessage: false,
				readBy: { $nin: [userId] },
			},
			{ $addToSet: { readBy: userId } }
		);

		sendResponse(res, 200, true, "Messages fetched successfully", {
			messages: messages.reverse(),
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit),
			},
		});
	} catch (error) {
		next(error);
	}
};

// ---- Search contacts for new DM ----

export const searchContacts: RequestHandler = async (req, res, next) => {
	try {
		const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

		if (!q || q.length < 2) {
			sendResponse(res, 200, true, "Contacts fetched", []);
			return;
		}

		const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

		// Find students whose studentId matches the query
		const matchedStudents = await StudentModel.find({ studentId: regex }).select("_id").limit(20);
		const matchedStudentIds = matchedStudents.map((s) => s._id);

		const users = await UserModel.find({
			_id: { $ne: req.user?.id },
			$or: [
				{ name: regex },
				{ email: regex },
				{ _id: { $in: matchedStudentIds } },
			],
		})
			.select("name email role")
			.limit(20);

		const contacts = await Promise.all(
			users.map(async (user) => {
				const student = await StudentModel.findById(user._id).select("studentId department");
				return {
					_id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
					studentId: student?.studentId,
					department: student?.department,
				};
			})
		);

		sendResponse(res, 200, true, "Contacts fetched successfully", contacts);
	} catch (error) {
		next(error);
	}
};

// ---- Sync course chat groups ----

export const syncCourseGroups: RequestHandler = async (_req, res, next) => {
	try {
		const courses = await CourseModel.find()
			.populate("teacher", "_id")
			.populate("enrolledStudents", "_id");

		let groupsCreated = 0;
		let membersAdded = 0;

		for (const course of courses) {
			// Check if a class group already exists for this course
			let group = await ChatGroupModel.findOne({ course: course._id, type: "class" });

			if (!group) {
				// Create missing group
				group = await ChatGroupModel.create({
					name: `${course.courseCode} - Section ${course.section}`,
					type: "class",
					course: course._id,
					createdBy: course.teacher,
					members: [course.teacher],
				});
				groupsCreated++;
			}

			// Build the expected member set: teacher + all enrolled students
			const expectedMembers = new Set<string>();

			if (course.teacher) {
				expectedMembers.add(course.teacher.toString());
			}

			for (const student of course.enrolledStudents) {
				expectedMembers.add(student.toString());
			}

			// Find members not yet in the group
			const currentMembers = new Set(group.members.map((m) => m.toString()));
			const toAdd: string[] = [];

			for (const memberId of expectedMembers) {
				if (!currentMembers.has(memberId)) {
					toAdd.push(memberId);
				}
			}

			if (toAdd.length > 0) {
				await ChatGroupModel.findByIdAndUpdate(group._id, {
					$addToSet: { members: { $each: toAdd } },
				});
				membersAdded += toAdd.length;
			}
		}

		sendResponse(res, 200, true, "Course chat groups synced successfully", {
			groupsCreated,
			membersAdded,
			totalCourses: courses.length,
		});
	} catch (error) {
		next(error);
	}
};

// ---- Block / Unblock ----

export const blockUser: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user?.id;
		const { targetId } = req.params;

		if (!targetId || targetId === userId) {
			sendResponse(res, 400, false, "Invalid target user");
			return;
		}

		const targetExists = await UserModel.exists({ _id: targetId });
		if (!targetExists) {
			sendResponse(res, 404, false, "User not found");
			return;
		}

		await UserModel.findByIdAndUpdate(userId, {
			$addToSet: { blockedUsers: targetId },
		});

		sendResponse(res, 200, true, "User blocked successfully");
	} catch (error) {
		next(error);
	}
};

export const unblockUser: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user?.id;
		const { targetId } = req.params;

		if (!targetId) {
			sendResponse(res, 400, false, "Invalid target user");
			return;
		}

		await UserModel.findByIdAndUpdate(userId, {
			$pull: { blockedUsers: targetId },
		});

		sendResponse(res, 200, true, "User unblocked successfully");
	} catch (error) {
		next(error);
	}
};

export const getBlockStatus: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.user?.id;
		const { targetId } = req.params;

		if (!targetId) {
			sendResponse(res, 400, false, "Invalid target user");
			return;
		}

		const [me, them] = await Promise.all([
			UserModel.findById(userId).select("blockedUsers"),
			UserModel.findById(targetId).select("blockedUsers"),
		]);

		const iBlockedThem = me?.blockedUsers?.some((id) => id.toString() === targetId) ?? false;
		const theyBlockedMe = them?.blockedUsers?.some((id) => id.toString() === userId) ?? false;

		sendResponse(res, 200, true, "Block status fetched", { iBlockedThem, theyBlockedMe });
	} catch (error) {
		next(error);
	}
};
