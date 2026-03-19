import { RequestHandler } from "express";
import { CourseModel } from "../models/Course.model";
import { ScheduleModel } from "../models/Schedule.model";
import { buildOptimalSchedule } from "../utils/scheduleBuilder";
import { sendResponse } from "../utils/apiResponse";
import { ICourse } from "../types";

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
