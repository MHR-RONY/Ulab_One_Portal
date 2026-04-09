import { RequestHandler } from "express";
import multer from "multer";
import path from "path";
import { parseScheduleXlsx } from "../utils/parseScheduleXlsx";
import { OfferedCourseModel } from "../models/OfferedCourse.model";
import { UploadLogModel } from "../models/UploadLog.model";
import { sendResponse } from "../utils/apiResponse";

// Multer config — store file in memory (not disk), max 50MB
const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
	const allowedExtensions = [".xlsx", ".xls", ".csv"];
	const ext = path.extname(file.originalname).toLowerCase();
	if (allowedExtensions.includes(ext)) {
		cb(null, true);
	} else {
		cb(new Error("Only .xlsx, .xls, and .csv files are allowed"));
	}
};

export const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/**
 * POST /api/admin/upload-schedule
 * Upload and parse an Excel schedule file, save to DB
 */
export const uploadSchedule: RequestHandler = async (req, res, next) => {
	try {
		if (!req.file) {
			sendResponse(res, 400, false, "No file uploaded");
			return;
		}

		const semester = req.body.semester;
		if (!semester || typeof semester !== "string" || semester.trim().length === 0) {
			sendResponse(res, 400, false, "Semester is required (e.g. 'Summer 2025')");
			return;
		}

		const trimmedSemester = semester.trim();
		const result = parseScheduleXlsx(req.file.buffer, trimmedSemester);

		if (result.entries.length === 0) {
			sendResponse(res, 400, false, "No schedule entries could be parsed from the file", {
				errors: result.errors,
			});
			return;
		}

		// Build teacher initials -> fullName map from parsed directory
		const teacherMap = new Map<string, string>();
		for (const td of result.teacherDirectory) {
			teacherMap.set(td.initials, td.fullName);
		}

		// Save entries to DB
		const docsToInsert = result.entries.map((entry) => ({
			courseCode: entry.courseCode,
			unicode: entry.unicode,
			section: entry.section,
			room: entry.room,
			teacherInitials: entry.teacher,
			teacherFullName: teacherMap.get(entry.teacher) || "",
			teacherTBA: entry.teacherTBA,
			isLab: entry.isLab,
			daySuffix: entry.daySuffix,
			days: entry.days,
			blockedDays: entry.blockedDays,
			startTime: entry.startTime,
			endTime: entry.endTime,
			semester: trimmedSemester,
			hasConflict: entry.hasConflict,
			conflictReason: entry.conflictReason,
		}));

		const inserted = await OfferedCourseModel.insertMany(docsToInsert, {
			ordered: false,
		});

		// Log the upload
		await UploadLogModel.create({
			fileName: req.file.originalname,
			fileSize: req.file.size,
			semester: trimmedSemester,
			totalEntries: inserted.length,
			errorCount: result.errors.length,
			uploadedBy: req.user?.id,
		});

		sendResponse(res, 201, true, "Schedule uploaded and parsed successfully", {
			totalParsed: result.totalParsed,
			totalSaved: inserted.length,
			tbaCount: result.tbaCount,
			conflictCount: result.conflictCount,
			teachersMatched: teacherMap.size,
			errors: result.errors,
			sampleEntries: result.entries.slice(0, 5),
		});
	} catch (error) {
		next(error);
	}
};

/**
 * POST /api/admin/parse-preview
 * Parse file only — do NOT save entries. Save teacher directory. Return parsed entries for preview.
 */
export const parsePreview: RequestHandler = async (req, res, next) => {
	try {
		if (!req.file) {
			sendResponse(res, 400, false, "No file uploaded");
			return;
		}

		const semester = req.body.semester;
		if (!semester || typeof semester !== "string" || semester.trim().length === 0) {
			sendResponse(res, 400, false, "Semester is required (e.g. 'Summer 2025')");
			return;
		}

		const trimmedSemester = semester.trim();
		const result = parseScheduleXlsx(req.file.buffer, trimmedSemester);

		if (result.entries.length === 0) {
			sendResponse(res, 400, false, "No schedule entries could be parsed from the file", {
				errors: result.errors,
			});
			return;
		}

		sendResponse(res, 200, true, "File parsed successfully — review and save", {
			entries: result.entries,
			teacherDirectory: result.teacherDirectory,
			totalParsed: result.totalParsed,
			tbaCount: result.tbaCount,
			conflictCount: result.conflictCount,
			errors: result.errors,
			fileName: req.file.originalname,
			fileSize: req.file.size,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * POST /api/admin/confirm-save
 * Save previously-previewed entries to DB and log upload
 */
export const confirmSave: RequestHandler = async (req, res, next) => {
	try {
		const { entries, semester, fileName, fileSize, teacherDirectory } = req.body as {
			entries: unknown[];
			semester: string;
			fileName: string;
			fileSize: number;
			teacherDirectory?: { initials: string; fullName: string }[];
		};

		if (!semester || typeof semester !== "string" || semester.trim().length === 0) {
			sendResponse(res, 400, false, "Semester is required");
			return;
		}
		if (!Array.isArray(entries) || entries.length === 0) {
			sendResponse(res, 400, false, "No entries to save");
			return;
		}

		const trimmedSemester = semester.trim();

		type EntryBody = {
			courseCode?: string;
			unicode?: string;
			section?: string;
			room?: string;
			teacher?: string;
			teacherFullName?: string;
			teacherTBA?: boolean;
			isLab?: boolean;
			daySuffix?: string;
			days?: string[];
			blockedDays?: string[];
			startTime?: string;
			endTime?: string;
			hasConflict?: boolean;
			conflictReason?: string;
		};

		// Build teacher map from directory if provided
		const teacherMap = new Map<string, string>();
		if (Array.isArray(teacherDirectory)) {
			for (const td of teacherDirectory) {
				teacherMap.set(td.initials, td.fullName);
			}
		}

		const docsToInsert = (entries as EntryBody[]).map((e) => ({
			courseCode: e.courseCode ?? "",
			unicode: e.unicode ?? "",
			section: e.section ?? "",
			room: e.room ?? "",
			teacherInitials: e.teacher ?? "",
			teacherFullName: e.teacherFullName || teacherMap.get(e.teacher ?? "") || "",
			teacherTBA: e.teacherTBA ?? false,
			isLab: e.isLab ?? false,
			daySuffix: e.daySuffix ?? "",
			days: e.days ?? [],
			blockedDays: e.blockedDays ?? [],
			startTime: e.startTime ?? "",
			endTime: e.endTime ?? "",
			semester: trimmedSemester,
			hasConflict: e.hasConflict ?? false,
			conflictReason: e.conflictReason ?? "",
		}));

		const inserted = await OfferedCourseModel.insertMany(docsToInsert, { ordered: false });

		await UploadLogModel.create({
			fileName: fileName || "unknown",
			fileSize: fileSize || 0,
			semester: trimmedSemester,
			totalEntries: inserted.length,
			errorCount: 0,
			uploadedBy: req.user?.id,
		});

		sendResponse(res, 201, true, "Schedule saved successfully", {
			totalSaved: inserted.length,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * GET /api/admin/offered-courses?semester=X&page=1&limit=50
 * List all offered courses for a semester
 */
export const getOfferedCourses: RequestHandler = async (req, res, next) => {
	try {
		const semester = req.query.semester as string;
		const page = Math.max(1, parseInt(String(req.query.page ?? "1"), 10));
		const limit = Math.min(5000, Math.max(1, parseInt(String(req.query.limit ?? "50"), 10)));
		const skip = (page - 1) * limit;

		const filter = semester ? { semester: semester.trim() } : {};

		const [courses, total] = await Promise.all([
			OfferedCourseModel.find(filter).sort({ courseCode: 1, section: 1 }).skip(skip).limit(limit).lean(),
			OfferedCourseModel.countDocuments(filter),
		]);

		sendResponse(res, 200, true, "Offered courses fetched", {
			courses,
			total,
			page,
			totalPages: Math.ceil(total / limit),
		});
	} catch (error) {
		next(error);
	}
};

/**
 * DELETE /api/admin/offered-courses/:semester
 * Clear all offered courses for a semester
 */
export const deleteOfferedCoursesBySemester: RequestHandler = async (req, res, next) => {
	try {
		const semester = decodeURIComponent(req.params.semester);
		if (!semester) {
			sendResponse(res, 400, false, "Semester parameter is required");
			return;
		}

		const result = await OfferedCourseModel.deleteMany({ semester });

		sendResponse(res, 200, true, `Deleted ${result.deletedCount} offered courses for ${semester}`, {
			deletedCount: result.deletedCount,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * GET /api/admin/upload-logs
 * Get recent upload history
 */
export const getUploadLogs: RequestHandler = async (req, res, next) => {
	try {
		const logs = await UploadLogModel.find()
			.sort({ createdAt: -1 })
			.limit(10)
			.lean();

		sendResponse(res, 200, true, "Upload logs fetched", { logs });
	} catch (error) {
		next(error);
	}
};

/**
 * DELETE /api/admin/upload-logs
 * Clear upload history
 */
export const clearUploadLogs: RequestHandler = async (_req, res, next) => {
	try {
		await UploadLogModel.deleteMany({});
		sendResponse(res, 200, true, "Upload history cleared");
	} catch (error) {
		next(error);
	}
};

/**
 * GET /api/admin/schedule-stats
 * Quick stats for the schedule builder page
 */
export const getScheduleStats: RequestHandler = async (_req, res, next) => {
	try {
		const [allCourses, totalSections, tbaCount, conflictCount] = await Promise.all([
			OfferedCourseModel.find({}, { unicode: 1, courseCode: 1 }).lean(),
			OfferedCourseModel.countDocuments(),
			OfferedCourseModel.countDocuments({ teacherTBA: true }),
			OfferedCourseModel.countDocuments({ hasConflict: true }),
		]);

		// Count distinct courses by preferring unicode, fallback to courseCode
		const uniqueCourseIds = new Set<string>();
		allCourses.forEach((e) => {
			if (e.unicode) uniqueCourseIds.add(e.unicode);
			else if (e.courseCode) uniqueCourseIds.add(e.courseCode);
		});

		sendResponse(res, 200, true, "Schedule stats fetched", {
			totalCourses: uniqueCourseIds.size,
			totalSections,
			tbaCount,
			conflictCount,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * PATCH /api/admin/offered-courses/:id
 * Update a single offered course (inline edit)
 */
export const updateOfferedCourse: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!id) {
			sendResponse(res, 400, false, "Course ID is required");
			return;
		}

		const allowedFields = [
			"courseCode", "unicode", "section", "room",
			"teacherInitials", "teacherFullName", "teacherTBA", "isLab",
			"daySuffix", "days", "blockedDays",
			"startTime", "endTime", "hasConflict", "conflictReason",
		];

		const updates: Record<string, unknown> = {};
		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				updates[field] = req.body[field];
			}
		}

		if (Object.keys(updates).length === 0) {
			sendResponse(res, 400, false, "No valid fields to update");
			return;
		}

		const updated = await OfferedCourseModel.findByIdAndUpdate(
			id,
			{ $set: updates },
			{ new: true, runValidators: true }
		).lean();

		if (!updated) {
			sendResponse(res, 404, false, "Course not found");
			return;
		}

		sendResponse(res, 200, true, "Course updated", { course: updated });
	} catch (error) {
		next(error);
	}
};

/**
 * DELETE /api/admin/offered-courses/single/:id
 * Delete a single offered course
 */
export const deleteOfferedCourse: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!id) {
			sendResponse(res, 400, false, "Course ID is required");
			return;
		}

		const deleted = await OfferedCourseModel.findByIdAndDelete(id);
		if (!deleted) {
			sendResponse(res, 404, false, "Course not found");
			return;
		}

		sendResponse(res, 200, true, "Course deleted");
	} catch (error) {
		next(error);
	}
};
