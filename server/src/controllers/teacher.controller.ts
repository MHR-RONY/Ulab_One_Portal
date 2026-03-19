import { RequestHandler } from "express";
import { TeacherModel } from "../models/Teacher.model";
import { sendResponse } from "../utils/apiResponse";

export const getTeacherProfile: RequestHandler = async (req, res, next) => {
	try {
		const teacher = await TeacherModel.findById(req.user?.id)
			.select("-password")
			.populate("assignedCourses");

		if (!teacher) {
			sendResponse(res, 404, false, "Teacher not found");
			return;
		}

		sendResponse(res, 200, true, "Teacher profile fetched successfully", teacher);
	} catch (error) {
		next(error);
	}
};

export const updateTeacherProfile: RequestHandler = async (req, res, next) => {
	try {
		const { name, department } = req.body;

		const teacher = await TeacherModel.findByIdAndUpdate(
			req.user?.id,
			{ name, department },
			{ new: true, runValidators: true }
		).select("-password");

		if (!teacher) {
			sendResponse(res, 404, false, "Teacher not found");
			return;
		}

		sendResponse(res, 200, true, "Teacher profile updated successfully", teacher);
	} catch (error) {
		next(error);
	}
};
