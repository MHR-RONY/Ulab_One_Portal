import { RequestHandler } from "express";
import { TeacherModel } from "../models/Teacher.model";
import { CourseModel } from "../models/Course.model";
import { StudentModel } from "../models/Student.model";
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

export const createCourse: RequestHandler = async (req, res, next) => {
	try {
		const { courseCode, name, section, credits, department, scheduleSlots } = req.body;

		if (!courseCode || !name || !section || !credits || !department) {
			sendResponse(res, 400, false, "courseCode, name, section, credits, and department are required");
			return;
		}

		const course = await CourseModel.create({
			courseCode,
			name,
			section,
			credits,
			department,
			teacher: req.user?.id,
			scheduleSlots: scheduleSlots ?? [],
			enrolledStudents: [],
		});

		await TeacherModel.findByIdAndUpdate(req.user?.id, {
			$addToSet: { assignedCourses: course._id },
		});

		sendResponse(res, 201, true, "Course created successfully", course);
	} catch (error) {
		next(error);
	}
};

export const getTeacherCourses: RequestHandler = async (req, res, next) => {
	try {
		const courses = await CourseModel.find({ teacher: req.user?.id })
			.populate("enrolledStudents", "name studentId email department")
			.sort({ createdAt: -1 });

		sendResponse(res, 200, true, "Courses fetched successfully", courses);
	} catch (error) {
		next(error);
	}
};

export const getCourseStudents: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;

		const course = await CourseModel.findOne({ _id: id, teacher: req.user?.id }).populate(
			"enrolledStudents",
			"name studentId email department semester"
		);

		if (!course) {
			sendResponse(res, 404, false, "Course not found");
			return;
		}

		sendResponse(res, 200, true, "Students fetched successfully", course.enrolledStudents);
	} catch (error) {
		next(error);
	}
};

export const addStudentToCourse: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { studentMongoId } = req.body;

		if (!studentMongoId) {
			sendResponse(res, 400, false, "studentMongoId is required");
			return;
		}

		const course = await CourseModel.findOne({ _id: id, teacher: req.user?.id });
		if (!course) {
			sendResponse(res, 404, false, "Course not found");
			return;
		}

		const student = await StudentModel.findById(studentMongoId);
		if (!student) {
			sendResponse(res, 404, false, "Student not found");
			return;
		}

		const alreadyEnrolled = course.enrolledStudents.some(
			(s) => s.toString() === studentMongoId
		);
		if (alreadyEnrolled) {
			sendResponse(res, 409, false, "Student is already enrolled in this course");
			return;
		}

		await CourseModel.findByIdAndUpdate(id, {
			$addToSet: { enrolledStudents: studentMongoId },
		});

		await StudentModel.findByIdAndUpdate(studentMongoId, {
			$addToSet: { enrolledCourses: id },
		});

		sendResponse(res, 200, true, "Student added to course successfully");
	} catch (error) {
		next(error);
	}
};

export const removeStudentFromCourse: RequestHandler = async (req, res, next) => {
	try {
		const { id, studentMongoId } = req.params;

		const course = await CourseModel.findOne({ _id: id, teacher: req.user?.id });
		if (!course) {
			sendResponse(res, 404, false, "Course not found");
			return;
		}

		await CourseModel.findByIdAndUpdate(id, {
			$pull: { enrolledStudents: studentMongoId },
		});

		await StudentModel.findByIdAndUpdate(studentMongoId, {
			$pull: { enrolledCourses: id },
		});

		sendResponse(res, 200, true, "Student removed from course successfully");
	} catch (error) {
		next(error);
	}
};

export const searchStudents: RequestHandler = async (req, res, next) => {
	try {
		const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

		if (!q || q.length < 2) {
			sendResponse(res, 200, true, "Students fetched", []);
			return;
		}

		const regex = new RegExp(q, "i");
		const students = await StudentModel.find({
			$or: [{ name: regex }, { studentId: regex }, { email: regex }],
		})
			.select("name studentId email department semester")
			.limit(20);

		sendResponse(res, 200, true, "Students fetched successfully", students);
	} catch (error) {
		next(error);
	}
};
