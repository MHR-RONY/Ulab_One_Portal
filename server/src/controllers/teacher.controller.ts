import { RequestHandler } from "express";
import { TeacherModel } from "../models/Teacher.model";
import { CourseModel } from "../models/Course.model";
import { StudentModel } from "../models/Student.model";
import { AttendanceModel } from "../models/Attendance.model";
import { ChatGroupModel } from "../models/ChatGroup.model";
import { TAttendanceStatus } from "../types";
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

		// Auto-create chat group for this class
		await ChatGroupModel.create({
			name: `${courseCode} - Section ${section}`,
			type: "class",
			course: course._id,
			createdBy: req.user?.id,
			members: [req.user?.id],
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

		// Auto-add student to the course chat group
		await ChatGroupModel.findOneAndUpdate(
			{ course: id, type: "class" },
			{ $addToSet: { members: studentMongoId } }
		);

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

		// Auto-remove student from the course chat group
		await ChatGroupModel.findOneAndUpdate(
			{ course: id, type: "class" },
			{ $pull: { members: studentMongoId } }
		);

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

export const getAttendanceForDate: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { date } = req.query;

		if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			sendResponse(res, 400, false, "date query param is required (YYYY-MM-DD)");
			return;
		}

		const course = await CourseModel.findOne({ _id: id, teacher: req.user?.id }).populate(
			"enrolledStudents",
			"name studentId email department semester role"
		);

		if (!course) {
			sendResponse(res, 404, false, "Course not found");
			return;
		}

		const enrolledStudents = course.enrolledStudents as unknown as Array<{
			_id: { toString(): string };
			name: string;
			studentId: string;
			email: string;
			department: string;
			semester: number;
		}>;

		const [dateRecords, allRecords] = await Promise.all([
			AttendanceModel.find({ course: id, date }),
			AttendanceModel.find({ course: id }),
		]);

		const dateMap = new Map<string, TAttendanceStatus>();
		dateRecords.forEach((r) => {
			dateMap.set(r.student.toString(), r.status as TAttendanceStatus);
		});

		const statsMap = new Map<string, { attended: number; total: number }>();
		allRecords.forEach((r) => {
			const sid = r.student.toString();
			const prev = statsMap.get(sid) ?? { attended: 0, total: 0 };
			prev.total++;
			if (r.status === "present") prev.attended++;
			statsMap.set(sid, prev);
		});

		const students = enrolledStudents.map((s) => {
			const sid = s._id.toString();
			const stats = statsMap.get(sid);
			return {
				_id: sid,
				name: s.name,
				studentId: s.studentId,
				email: s.email,
				department: s.department,
				semester: s.semester,
				status: dateMap.get(sid) ?? "not-marked",
				attended: stats?.attended ?? 0,
				total: stats?.total ?? 0,
				percentage: stats && stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : null,
			};
		});

		sendResponse(res, 200, true, "Attendance fetched successfully", {
			course: {
				_id: course._id,
				name: course.name,
				courseCode: course.courseCode,
				section: course.section,
			},
			date,
			students,
		});
	} catch (error) {
		next(error);
	}
};

export const saveAttendance: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { date, records } = req.body as {
			date: string;
			records: Array<{ student: string; status: TAttendanceStatus }>;
		};

		if (!date || !Array.isArray(records)) {
			sendResponse(res, 400, false, "date and records array are required");
			return;
		}

		if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
			sendResponse(res, 400, false, "date must be in YYYY-MM-DD format");
			return;
		}

		const course = await CourseModel.findOne({ _id: id, teacher: req.user?.id });
		if (!course) {
			sendResponse(res, 404, false, "Course not found");
			return;
		}

		if (records.length === 0) {
			sendResponse(res, 200, true, "No records to save");
			return;
		}

		const ops = records.map(({ student, status }) => ({
			updateOne: {
				filter: { student, course: id, date },
				update: { $set: { student, course: id, date, status } },
				upsert: true,
			},
		}));

		await AttendanceModel.bulkWrite(ops);

		sendResponse(res, 200, true, "Attendance saved successfully");
	} catch (error) {
		next(error);
	}
};

export const updateTeacherSettings: RequestHandler = async (req, res, next) => {
	try {
		const { accentColorIndex } = req.body;

		if (typeof accentColorIndex !== "number" || accentColorIndex < 0 || accentColorIndex > 10) {
			sendResponse(res, 400, false, "Invalid accentColorIndex");
			return;
		}

		const teacher = await TeacherModel.findByIdAndUpdate(
			req.user?.id,
			{ accentColorIndex },
			{ new: true, runValidators: true }
		).select("-password");

		if (!teacher) {
			sendResponse(res, 404, false, "Teacher not found");
			return;
		}

		sendResponse(res, 200, true, "Settings updated successfully", { accentColorIndex: teacher.accentColorIndex });
	} catch (error) {
		next(error);
	}
};
