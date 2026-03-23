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

export const getTeacherById: RequestHandler = async (req, res, next) => {
	try {
		const teacher = await TeacherModel.findById(req.params.id).select("-password");

		if (!teacher) {
			sendResponse(res, 404, false, "Teacher not found");
			return;
		}

		sendResponse(res, 200, true, "Teacher fetched", teacher);
	} catch (error) {
		next(error);
	}
};

export const updateTeacher: RequestHandler = async (req, res, next) => {
	try {
		const { name, email, teacherId, department } = req.body;

		if (!name && !email && !teacherId && !department) {
			sendResponse(res, 400, false, "At least one field is required to update");
			return;
		}

		if (email) {
			const existing = await TeacherModel.findOne({ email, _id: { $ne: req.params.id } });
			if (existing) {
				sendResponse(res, 409, false, "Email already in use by another teacher");
				return;
			}
		}

		if (teacherId) {
			const existing = await TeacherModel.findOne({ teacherId, _id: { $ne: req.params.id } });
			if (existing) {
				sendResponse(res, 409, false, "Teacher ID already in use");
				return;
			}
		}

		const updated = await TeacherModel.findByIdAndUpdate(
			req.params.id,
			{
				...(name && { name }),
				...(email && { email }),
				...(teacherId && { teacherId }),
				...(department && { department }),
			},
			{ new: true, runValidators: true }
		).select("-password");

		if (!updated) {
			sendResponse(res, 404, false, "Teacher not found");
			return;
		}

		sendResponse(res, 200, true, "Teacher updated successfully", updated);
	} catch (error) {
		next(error);
	}
};

export const deleteTeacher: RequestHandler = async (req, res, next) => {
	try {
		const teacher = await TeacherModel.findByIdAndDelete(req.params.id);

		if (!teacher) {
			sendResponse(res, 404, false, "Teacher not found");
			return;
		}

		sendResponse(res, 200, true, "Teacher deleted successfully");
	} catch (error) {
		next(error);
	}
};
