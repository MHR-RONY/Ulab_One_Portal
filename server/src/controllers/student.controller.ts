import { RequestHandler } from "express";
import { StudentModel } from "../models/Student.model";
import { sendResponse } from "../utils/apiResponse";

export const getStudentProfile: RequestHandler = async (req, res, next) => {
	try {
		const student = await StudentModel.findById(req.user?.id)
			.select("-password")
			.populate("enrolledCourses");

		if (!student) {
			sendResponse(res, 404, false, "Student not found");
			return;
		}

		sendResponse(res, 200, true, "Student profile fetched successfully", student);
	} catch (error) {
		next(error);
	}
};

export const updateStudentProfile: RequestHandler = async (req, res, next) => {
	try {
		const { name, department, semester } = req.body;

		const student = await StudentModel.findByIdAndUpdate(
			req.user?.id,
			{ name, department, semester },
			{ new: true, runValidators: true }
		).select("-password");

		if (!student) {
			sendResponse(res, 404, false, "Student not found");
			return;
		}

		sendResponse(res, 200, true, "Student profile updated successfully", student);
	} catch (error) {
		next(error);
	}
};
