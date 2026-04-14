import { RequestHandler } from "express";
import { NoteRepositoryModel } from "../models/NoteRepository.model";
import { NoteModel } from "../models/Note.model";
import { sendResponse } from "../utils/apiResponse";

const DEPARTMENTS = ["CSE", "BBA", "EEE", "MSJ"] as const;

export const getDepartmentStats: RequestHandler = async (_req, res, next) => {
	try {
		const [repoCounts, noteCounts] = await Promise.all([
			NoteRepositoryModel.aggregate([
				{ $group: { _id: "$department", count: { $sum: 1 } } },
			]),
			NoteModel.aggregate([
				{ $match: { status: "approved" } },
				{ $group: { _id: "$department", count: { $sum: 1 } } },
			]),
		]);

		const repoMap: Record<string, number> = {};
		const noteMap: Record<string, number> = {};

		for (const r of repoCounts) repoMap[r._id as string] = r.count as number;
		for (const n of noteCounts) noteMap[n._id as string] = n.count as number;

		const stats = DEPARTMENTS.map((dept) => ({
			name: dept,
			courses: repoMap[dept] ?? 0,
			notes: noteMap[dept] ?? 0,
		}));

		sendResponse(res, 200, true, "Department stats fetched", stats);
	} catch (error) {
		next(error);
	}
};

export const createRepository: RequestHandler = async (req, res, next) => {
	try {
		const { courseName, courseCode, department, description } = req.body as {
			courseName: string;
			courseCode: string;
			department: string;
			description?: string;
		};

		if (!courseName || !courseCode || !department) {
			sendResponse(res, 400, false, "courseName, courseCode, and department are required");
			return;
		}

		if (!DEPARTMENTS.includes(department as (typeof DEPARTMENTS)[number])) {
			sendResponse(res, 400, false, "Invalid department");
			return;
		}

		const existing = await NoteRepositoryModel.findOne({ courseCode: courseCode.trim().toUpperCase() });
		if (existing) {
			sendResponse(res, 409, false, "A repository with this course code already exists");
			return;
		}

		const repo = await NoteRepositoryModel.create({
			courseName: courseName.trim(),
			courseCode: courseCode.trim().toUpperCase(),
			department,
			description: description?.trim(),
		});

		sendResponse(res, 201, true, "Repository created successfully", repo);
	} catch (error) {
		next(error);
	}
};

export const getRepositories: RequestHandler = async (req, res, next) => {
	try {
		const { department } = req.query as { department?: string };

		const filter = department ? { department } : {};
		const repos = await NoteRepositoryModel.find(filter).sort({ department: 1, courseName: 1 }).lean();

		// Fetch top 5 approved notes (by upvotes) for each repository
		const repoIds = repos.map((r) => r._id);
		const topNotes = await NoteModel.aggregate([
			{ $match: { repository: { $in: repoIds }, status: "approved" } },
			{ $sort: { upvotes: -1, createdAt: -1 } },
			{
				$group: {
					_id: "$repository",
					notes: { $push: { _id: "$_id", title: "$title", fileType: "$fileType", upvotes: "$upvotes" } },
				},
			},
			{ $project: { _id: 1, notes: { $slice: ["$notes", 5] } } },
		]);

		const noteMap = new Map<string, { _id: string; title: string; fileType: string; upvotes: number }[]>();
		for (const entry of topNotes) {
			noteMap.set(String(entry._id), entry.notes as { _id: string; title: string; fileType: string; upvotes: number }[]);
		}

		const result = repos.map((repo) => ({
			...repo,
			topNotes: noteMap.get(String(repo._id)) ?? [],
		}));

		sendResponse(res, 200, true, "Repositories fetched", result);
	} catch (error) {
		next(error);
	}
};

export const getPendingNotes: RequestHandler = async (req, res, next) => {
	try {
		const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
		const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "10"), 10)));
		const skip = (page - 1) * limit;

		const [notes, total] = await Promise.all([
			NoteModel.find({ status: "pending" })
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit),
			NoteModel.countDocuments({ status: "pending" }),
		]);

		sendResponse(res, 200, true, "Pending notes fetched", {
			notes,
			total,
			page,
			pages: Math.ceil(total / limit),
		});
	} catch (error) {
		next(error);
	}
};

export const approveNote: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		const note = await NoteModel.findByIdAndUpdate(
			id,
			{ status: "approved" },
			{ new: true }
		);
		if (!note) {
			sendResponse(res, 404, false, "Note not found");
			return;
		}
		// Increment noteCount on the repository
		await NoteRepositoryModel.findByIdAndUpdate(note.repository, { $inc: { noteCount: 1 } });
		sendResponse(res, 200, true, "Note approved", note);
	} catch (error) {
		next(error);
	}
};

export const rejectNote: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		const note = await NoteModel.findByIdAndUpdate(
			id,
			{ status: "rejected" },
			{ new: true }
		);
		if (!note) {
			sendResponse(res, 404, false, "Note not found");
			return;
		}
		sendResponse(res, 200, true, "Note rejected", note);
	} catch (error) {
		next(error);
	}
};

export const getDepartmentDetail: RequestHandler = async (req, res, next) => {
	try {
		const { deptId } = req.params;

		const deptMap: Record<string, string> = {
			cse: "CSE",
			bba: "BBA",
			eee: "EEE",
			msj: "MSJ",
		};

		const dept = deptMap[deptId.toLowerCase()];
		if (!dept) {
			sendResponse(res, 404, false, "Department not found");
			return;
		}

		const repos = await NoteRepositoryModel.find({ department: dept }).sort({ courseName: 1 });

		const noteCounts = await NoteModel.aggregate([
			{ $match: { department: dept, status: "approved" } },
			{ $group: { _id: "$courseCode", count: { $sum: 1 }, upvotes: { $sum: "$upvotes" } } },
		]);

		const noteCountMap: Record<string, { count: number; upvotes: number }> = {};
		for (const n of noteCounts) {
			noteCountMap[n._id as string] = { count: n.count as number, upvotes: n.upvotes as number };
		}

		const courses = repos.map((r) => ({
			_id: r._id,
			code: r.courseCode,
			title: r.courseName,
			notes: noteCountMap[r.courseCode]?.count ?? 0,
			upvotes: noteCountMap[r.courseCode]?.upvotes ?? 0,
		}));

		const totalNotes = courses.reduce((acc, c) => acc + c.notes, 0);
		const pendingCount = await NoteModel.countDocuments({ department: dept, status: "pending" });

		sendResponse(res, 200, true, "Department detail fetched", {
			dept,
			courses,
			totalNotes,
			pendingCount,
		});
	} catch (error) {
		next(error);
	}
};

export const getNotesByRepository: RequestHandler = async (req, res, next) => {
	try {
		const { repoId } = req.params;
		const notes = await NoteModel.find({ repository: repoId, status: "approved" })
			.sort({ upvotes: -1, createdAt: -1 });
		sendResponse(res, 200, true, "Notes fetched", notes);
	} catch (error) {
		next(error);
	}
};

export const updateRepository: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { courseName, courseCode, description } = req.body as {
			courseName?: string;
			courseCode?: string;
			description?: string;
		};

		const updates: Record<string, string> = {};
		if (courseName) updates.courseName = courseName.trim();
		if (courseCode) updates.courseCode = courseCode.trim().toUpperCase();
		if (description !== undefined) updates.description = description.trim();

		if (Object.keys(updates).length === 0) {
			sendResponse(res, 400, false, "No fields to update");
			return;
		}

		// If courseCode is being changed, check for duplicates
		if (updates.courseCode) {
			const existing = await NoteRepositoryModel.findOne({
				courseCode: updates.courseCode,
				_id: { $ne: id },
			});
			if (existing) {
				sendResponse(res, 409, false, "A repository with this course code already exists");
				return;
			}
		}

		const repo = await NoteRepositoryModel.findByIdAndUpdate(id, updates, { new: true });
		if (!repo) {
			sendResponse(res, 404, false, "Repository not found");
			return;
		}

		// Sync courseCode on related notes if it changed
		if (updates.courseCode) {
			await NoteModel.updateMany({ repository: id }, { courseCode: updates.courseCode });
		}

		sendResponse(res, 200, true, "Repository updated", repo);
	} catch (error) {
		next(error);
	}
};

export const deleteRepository: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		const repo = await NoteRepositoryModel.findByIdAndDelete(id);
		if (!repo) {
			sendResponse(res, 404, false, "Repository not found");
			return;
		}
		// Remove all notes associated with this repository
		await NoteModel.deleteMany({ repository: id });
		sendResponse(res, 200, true, "Repository and its notes deleted");
	} catch (error) {
		next(error);
	}
};

export const getRepositoryById: RequestHandler = async (req, res, next) => {
	try {
		const { repoId } = req.params;
		const repo = await NoteRepositoryModel.findById(repoId);
		if (!repo) {
			sendResponse(res, 404, false, "Repository not found");
			return;
		}
		sendResponse(res, 200, true, "Repository fetched", repo);
	} catch (error) {
		next(error);
	}
};

export const upvoteNote: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { delta } = req.body as { delta: number };

		if (delta !== 1 && delta !== -1) {
			sendResponse(res, 400, false, "delta must be 1 or -1");
			return;
		}

		const note = await NoteModel.findByIdAndUpdate(
			id,
			{ $inc: { upvotes: delta } },
			{ new: true }
		);
		if (!note) {
			sendResponse(res, 404, false, "Note not found");
			return;
		}
		sendResponse(res, 200, true, "Vote recorded", { upvotes: note.upvotes });
	} catch (error) {
		next(error);
	}
};

export const submitNote: RequestHandler = async (req, res, next) => {
	try {
		const { repoId } = req.params;
		const { title, description, week } = req.body as {
			title: string;
			description?: string;
			week?: string;
		};

		if (!title) {
			sendResponse(res, 400, false, "title is required");
			return;
		}

		// File is required — must be a PDF (enforced by multer middleware)
		const file = req.file;
		if (!file) {
			sendResponse(res, 400, false, "A PDF file is required");
			return;
		}

		const repo = await NoteRepositoryModel.findById(repoId);
		if (!repo) {
			sendResponse(res, 404, false, "Repository not found");
			return;
		}

		// req.user is attached by protect middleware
		const userId = req.user?.id;

		// Look up the user name for display
		let uploaderName = "Anonymous";
		if (userId) {
			const { UserModel } = await import("../models/User.model");
			const user = await UserModel.findById(userId).select("name email").lean();
			if (user) {
				uploaderName = user.name || user.email;
			}
		}

		// Build file URL (relative to server uploads)
		const fileUrl = `/uploads/notes/${file.filename}`;
		const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";

		const note = await NoteModel.create({
			title: title.trim(),
			description: description?.trim() ?? "",
			repository: repoId,
			courseCode: repo.courseCode,
			department: repo.department,
			fileType: "pdf",
			fileSize: fileSizeMB,
			fileUrl,
			uploadedBy: userId ?? null,
			uploaderName,
			week: week?.trim() ?? "",
			status: "pending",
		});

		sendResponse(res, 201, true, "Note submitted for review", note);
	} catch (error) {
		next(error);
	}
};
