import { RequestHandler } from "express";
import { CourseModel } from "../models/Course.model";
import { ScheduleModel } from "../models/Schedule.model";
import { OfferedCourseModel } from "../models/OfferedCourse.model";
import { TeacherModel } from "../models/Teacher.model";
import { buildOptimalSchedule } from "../utils/scheduleBuilder";
import { generateScheduleVariations } from "../utils/scheduleGenerator";
import { sendResponse } from "../utils/apiResponse";
import { ICourse, IGenerateScheduleBody, TScheduleMode } from "../types";

export const buildSchedule: RequestHandler = async (req, res, next) => {
	try {
		const { courseIds, semester } = req.body;

		if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
			sendResponse(res, 400, false, "courseIds array is required");
			return;
		}

		if (!semester) {
			sendResponse(res, 400, false, "semester is required");
			return;
		}

		const courses = await CourseModel.find({ _id: { $in: courseIds } });

		if (courses.length === 0) {
			sendResponse(res, 404, false, "No courses found for given IDs");
			return;
		}

		const optimized = buildOptimalSchedule(courses as unknown as ICourse[]);

		const schedule = await ScheduleModel.create({
			student: req.user?.id,
			courses: courseIds,
			semester,
			isConflictFree: optimized.length > 0,
		});

		const populated = await ScheduleModel.findById(schedule._id).populate("courses");

		sendResponse(res, 201, true, "Schedule built successfully", populated);
	} catch (error) {
		next(error);
	}
};

export const getMySchedule: RequestHandler = async (req, res, next) => {
	try {
		const schedule = await ScheduleModel.find({ student: req.user?.id })
			.populate("courses")
			.sort({ createdAt: -1 });

		sendResponse(res, 200, true, "Schedule fetched successfully", schedule);
	} catch (error) {
		next(error);
	}
};

export const getStudentOfferedCourses: RequestHandler = async (req, res, next) => {
	try {
		const semester = (req.query.semester as string)?.trim() || "Summer 2026";

		const courses = await OfferedCourseModel.find({ semester })
			.select("courseCode unicode title section room teacherInitials teacherFullName teacherTBA isLab days startTime endTime semester seats totalSeats")
			.sort({ courseCode: 1, section: 1 })
			.lean();

		// Collect unique teacher names and look up their profiles
		const teacherNames = [...new Set(
			courses
				.filter((c) => !c.teacherTBA && c.teacherFullName)
				.map((c) => c.teacherFullName)
		)];

		const teachers = await TeacherModel.find({ name: { $in: teacherNames } })
			.select("name avatar department bio")
			.lean();

		const teacherMap = new Map<string, { avatar: string; department: string; bio: string }>();
		for (const t of teachers) {
			teacherMap.set(t.name, {
				avatar: (t as { avatar?: string }).avatar || "",
				department: (t as { department?: string }).department || "",
				bio: (t as { bio?: string }).bio || "",
			});
		}

		const enrichedCourses = courses.map((c) => {
			const info = c.teacherFullName ? teacherMap.get(c.teacherFullName) : undefined;
			return {
				...c,
				teacherAvatar: info?.avatar || "",
				teacherDepartment: info?.department || "",
				teacherBio: info?.bio || "",
			};
		});

		sendResponse(res, 200, true, "Offered courses fetched", { courses: enrichedCourses });
	} catch (error) {
		next(error);
	}
};

export const saveScheduleSections: RequestHandler = async (req, res, next) => {
	try {
		const { sectionIds, semester } = req.body;
		const studentId = req.user?.id;

		if (!sectionIds || !Array.isArray(sectionIds) || sectionIds.length === 0) {
			sendResponse(res, 400, false, "sectionIds array is required");
			return;
		}

		if (!semester || typeof semester !== "string") {
			sendResponse(res, 400, false, "semester is required");
			return;
		}

		// Prevent double-save: check if student already saved a schedule this semester
		const existing = await ScheduleModel.findOne({ student: studentId, semester: semester.trim() });
		if (existing) {
			sendResponse(res, 409, false, "You have already saved a schedule for this semester");
			return;
		}

		// Atomically decrement seats only if seats > 0
		const results = await Promise.all(
			sectionIds.map((id: string) =>
				OfferedCourseModel.findOneAndUpdate(
					{ _id: id, seats: { $gt: 0 } },
					{ $inc: { seats: -1 } },
					{ new: true }
				)
			)
		);

		const failedIndexes = results
			.map((r, i) => (r ? null : i))
			.filter((i) => i !== null) as number[];

		if (failedIndexes.length > 0) {
			// Rollback: restore seats for sections that succeeded before the failure
			const succeededIds = sectionIds.filter((_: string, i: number) => !failedIndexes.includes(i));
			if (succeededIds.length > 0) {
				await Promise.all(
					succeededIds.map((id: string) =>
						OfferedCourseModel.findByIdAndUpdate(id, { $inc: { seats: 1 } })
					)
				);
			}
			sendResponse(res, 409, false, `${failedIndexes.length} section(s) are full or not found. No seats were reserved.`);
			return;
		}

		// Record the saved schedule linked to the student
		await ScheduleModel.create({
			student: studentId,
			courses: sectionIds,
			semester: semester.trim(),
			isConflictFree: true,
		});

		sendResponse(res, 200, true, "Schedule saved, seats updated", { updated: results.length });
	} catch (error) {
		next(error);
	}
};

export const generateSchedule: RequestHandler = async (req, res, next) => {
	try {
		const { courseUnicodes, preferredSections, modes, semester } =
			req.body as IGenerateScheduleBody;

		if (
			!courseUnicodes ||
			!Array.isArray(courseUnicodes) ||
			courseUnicodes.length === 0
		) {
			sendResponse(res, 400, false, "courseUnicodes array is required");
			return;
		}

		if (!semester || typeof semester !== "string") {
			sendResponse(res, 400, false, "semester is required");
			return;
		}

		const validModes: TScheduleMode[] = ["teacher", "gap", "days"];
		const safeModes: TScheduleMode[] = Array.isArray(modes)
			? modes.filter((m): m is TScheduleMode => validModes.includes(m as TScheduleMode))
			: ["teacher", "gap", "days"];

		if (safeModes.length === 0) {
			sendResponse(res, 400, false, "At least one valid mode is required (teacher, gap, days)");
			return;
		}

		const allSections = await OfferedCourseModel.find({
			semester: semester.trim(),
			$or: [
				{ unicode: { $in: courseUnicodes } },
				{ courseCode: { $in: courseUnicodes } },
			],
		}).lean();

		if (allSections.length === 0) {
			sendResponse(res, 404, false, "No sections found for the given courses and semester");
			return;
		}

		const result = generateScheduleVariations({
			courseUnicodes,
			preferredSections: preferredSections ?? {},
			modes: safeModes,
			allSections: allSections as unknown as import("../types").IOfferedCourse[],
		});

		sendResponse(res, 200, true, "Schedule variations generated", result);
	} catch (error) {
		next(error);
	}
};
