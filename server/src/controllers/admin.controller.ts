import { RequestHandler } from "express";
import { StudentModel } from "../models/Student.model";
import { TeacherModel } from "../models/Teacher.model";
import { sendResponse } from "../utils/apiResponse";

export const createTeacher: RequestHandler = async (req, res, next) => {
	try {
		const { name, email, password, teacherId, department } = req.body;

		if (!name || !email || !password || !teacherId || !department) {
			sendResponse(res, 400, false, "All fields are required");
			return;
		}

		if (password.length < 6) {
			sendResponse(res, 400, false, "Password must be at least 6 characters");
			return;
		}

		const existingEmail = await TeacherModel.findOne({ email });
		if (existingEmail) {
			sendResponse(res, 409, false, "Email already registered");
			return;
		}

		const existingTeacherId = await TeacherModel.findOne({ teacherId });
		if (existingTeacherId) {
			sendResponse(res, 409, false, "Teacher ID already registered");
			return;
		}

		const teacher = await TeacherModel.create({
			name,
			email,
			password,
			teacherId,
			department,
		});

		sendResponse(res, 201, true, "Teacher account created successfully", teacher.toJSON());
	} catch (error) {
		next(error);
	}
};

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
