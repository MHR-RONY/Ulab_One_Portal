import { RequestHandler } from "express";
import { StudentModel } from "../models/Student.model";
import { TeacherModel } from "../models/Teacher.model";
import { sendResponse } from "../utils/apiResponse";

export const getAllStudents: RequestHandler = async (_req, res, next) => {
	try {
		const students = await StudentModel.find().select("-password");
		sendResponse(res, 200, true, "All students fetched successfully", students);
	} catch (error) {
		next(error);
	}
};

export const getAllTeachers: RequestHandler = async (_req, res, next) => {
	try {
		const teachers = await TeacherModel.find().select("-password");
		sendResponse(res, 200, true, "All teachers fetched successfully", teachers);
	} catch (error) {
		next(error);
	}
};

export const deleteStudent: RequestHandler = async (req, res, next) => {
	try {
		const student = await StudentModel.findByIdAndDelete(req.params.id);

		if (!student) {
			sendResponse(res, 404, false, "Student not found");
			return;
		}

		sendResponse(res, 200, true, "Student deleted successfully");
	} catch (error) {
		next(error);
	}
};
