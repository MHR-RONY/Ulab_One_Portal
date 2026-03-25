import { RequestHandler } from "express";
import { StudentModel } from "../models/Student.model";
import { AttendanceModel } from "../models/Attendance.model";
import { ICourseDocument } from "../models/Course.model";
import { UserModel } from "../models/User.model";
import { sendResponse } from "../utils/apiResponse";
import {
	IDashboardClass,
	IDashboardData,
	IAttendanceSummary,
	IProfileData,
	IProfileCourse,
	IStudentSettings,
} from "../types";

export const getStudentProfile: RequestHandler = async (req, res, next) => {
	try {
		const student = await StudentModel.findById(req.user?.id)
			.select("-password")
			.populate<{ enrolledCourses: (ICourseDocument & { teacher: { name: string } | null })[] }>({
				path: "enrolledCourses",
				populate: { path: "teacher", select: "name" },
			});

		if (!student) {
			sendResponse(res, 404, false, "Student not found");
			return;
		}

		const enrolledIds = student.enrolledCourses.map((c) => c._id);
		const attendanceRecords = await AttendanceModel.find({
			student: req.user?.id,
			course: { $in: enrolledIds },
		});

		const attendanceMap = new Map<string, { attended: number; total: number }>();
		for (const record of attendanceRecords) {
			const courseId = String(record.course);
			const prev = attendanceMap.get(courseId) ?? { attended: 0, total: 0 };
			prev.total++;
			if (record.status === "present") prev.attended++;
			attendanceMap.set(courseId, prev);
		}

		let totalAttended = 0;
		let totalClasses = 0;
		let totalCredits = 0;

		const courses: IProfileCourse[] = student.enrolledCourses.map((course) => {
			const att = attendanceMap.get(String(course._id)) ?? { attended: 0, total: 0 };
			const pct = att.total > 0 ? Math.round((att.attended / att.total) * 100) : 0;
			totalAttended += att.attended;
			totalClasses += att.total;
			totalCredits += course.credits ?? 0;
			return {
				courseCode: course.courseCode,
				courseName: course.name,
				credits: course.credits,
				teacher: course.teacher?.name ?? "",
				attendedClasses: att.attended,
				totalClasses: att.total,
				attendancePercentage: pct,
			};
		});

		const overallAttendancePercentage =
			totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

		const profileData: IProfileData = {
			name: student.name,
			studentId: student.studentId,
			department: student.department,
			semester: student.semester,
			email: student.email,
			phone: student.phone ?? "",
			enrolledCourses: courses,
			overallAttendancePercentage,
			totalCredits,
		};

		sendResponse(res, 200, true, "Student profile fetched successfully", profileData);
	} catch (error) {
		next(error);
	}
};

export const updateStudentProfile: RequestHandler = async (req, res, next) => {
	try {
		const { name, department, semester, phone } = req.body;

		const student = await StudentModel.findByIdAndUpdate(
			req.user?.id,
			{ name, department, semester, phone },
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

const timeToMinutes = (time: string): number => {
	const [h, m] = time.split(":").map(Number);
	return h * 60 + m;
};

export const getDashboardData: RequestHandler = async (req, res, next) => {
	try {
		const student = await StudentModel.findById(req.user?.id)
			.select("-password")
			.populate<{ enrolledCourses: (ICourseDocument & { teacher: { name: string } | null })[] }>({
				path: "enrolledCourses",
				populate: { path: "teacher", select: "name" },
			});

		if (!student) {
			sendResponse(res, 404, false, "Student not found");
			return;
		}

		const now = new Date();
		const jsDayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
		const todayName = jsDayNames[now.getDay()];
		const currentMinutes = now.getHours() * 60 + now.getMinutes();

		const todaysClasses: IDashboardClass[] = [];

		for (const course of student.enrolledCourses) {
			for (const slot of course.scheduleSlots) {
				if (slot.day === todayName) {
					const startMin = timeToMinutes(slot.startTime);
					const endMin = timeToMinutes(slot.endTime);

					let status: "COMPLETED" | "NOW" | "UPCOMING";
					if (currentMinutes > endMin) {
						status = "COMPLETED";
					} else if (currentMinutes >= startMin) {
						status = "NOW";
					} else {
						status = "UPCOMING";
					}

					const teacherName = course.teacher?.name ?? "";

					todaysClasses.push({
						courseCode: course.courseCode,
						courseName: course.name,
						startTime: slot.startTime,
						endTime: slot.endTime,
						room: slot.room,
						teacher: teacherName,
						status,
					});
				}
			}
		}

		todaysClasses.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

		const upcomingClasses = todaysClasses.filter((c) => c.status === "UPCOMING");
		const completedCount = todaysClasses.filter((c) => c.status === "COMPLETED").length;
		const nextClass =
			upcomingClasses.length > 0
				? { code: upcomingClasses[0].courseCode, time: upcomingClasses[0].startTime }
				: null;

		const enrolledIds = student.enrolledCourses.map((c) => c._id);
		const attendanceRecords = await AttendanceModel.find({
			student: req.user?.id,
			course: { $in: enrolledIds },
		});

		const statsMap = new Map<string, { attended: number; total: number }>();
		for (const record of attendanceRecords) {
			const courseId = String(record.course);
			const prev = statsMap.get(courseId) ?? { attended: 0, total: 0 };
			prev.total++;
			if (record.status === "present") prev.attended++;
			statsMap.set(courseId, prev);
		}

		const attendance: IAttendanceSummary[] = student.enrolledCourses.map((course) => {
			const stats = statsMap.get(String(course._id)) ?? { attended: 0, total: 0 };
			const percentage =
				stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0;
			return {
				courseCode: course.courseCode,
				courseName: course.name,
				attendedClasses: stats.attended,
				totalClasses: stats.total,
				percentage,
			};
		});

		const dashboardData: IDashboardData = {
			student: {
				name: student.name,
				studentId: student.studentId,
				department: student.department,
				semester: student.semester,
			},
			todaysClasses,
			stats: {
				upcomingClassesCount: upcomingClasses.length,
				nextClass,
				totalSessionsToday: todaysClasses.length,
				completedSessionsToday: completedCount,
			},
			attendance,
		};

		sendResponse(res, 200, true, "Dashboard data fetched successfully", dashboardData);
	} catch (error) {
		next(error);
	}
};

export const getStudentSettings: RequestHandler = async (req, res, next) => {
	try {
		const student = await StudentModel.findById(req.user?.id).select("-password");

		if (!student) {
			sendResponse(res, 404, false, "Student not found");
			return;
		}

		const settings: IStudentSettings = {
			name: student.name,
			email: student.email,
			studentId: student.studentId,
			department: student.department,
			semester: student.semester,
			emailAlerts: student.emailAlerts,
			pushNotifications: student.pushNotifications,
			language: student.language,
			twoFactorEnabled: student.twoFactorEnabled,
		};

		sendResponse(res, 200, true, "Settings fetched successfully", settings);
	} catch (error) {
		next(error);
	}
};

export const updateStudentSettings: RequestHandler = async (req, res, next) => {
	try {
		const { name, emailAlerts, pushNotifications, language, twoFactorEnabled } = req.body;

		const student = await StudentModel.findByIdAndUpdate(
			req.user?.id,
			{ name, emailAlerts, pushNotifications, language, twoFactorEnabled },
			{ new: true, runValidators: true }
		).select("-password");

		if (!student) {
			sendResponse(res, 404, false, "Student not found");
			return;
		}

		const settings: IStudentSettings = {
			name: student.name,
			email: student.email,
			studentId: student.studentId,
			department: student.department,
			semester: student.semester,
			emailAlerts: student.emailAlerts,
			pushNotifications: student.pushNotifications,
			language: student.language,
			twoFactorEnabled: student.twoFactorEnabled,
		};

		sendResponse(res, 200, true, "Settings updated successfully", settings);
	} catch (error) {
		next(error);
	}
};

export const changePassword: RequestHandler = async (req, res, next) => {
	try {
		const { currentPassword, newPassword } = req.body;

		if (!currentPassword || !newPassword) {
			sendResponse(res, 400, false, "Current password and new password are required");
			return;
		}

		if (newPassword.length < 6) {
			sendResponse(res, 400, false, "New password must be at least 6 characters");
			return;
		}

		const student = await StudentModel.findById(req.user?.id);

		if (!student) {
			sendResponse(res, 404, false, "Student not found");
			return;
		}

		const isMatch = await student.comparePassword(currentPassword);
		if (!isMatch) {
			sendResponse(res, 401, false, "Current password is incorrect");
			return;
		}

		student.password = newPassword;
		await student.save();

		sendResponse(res, 200, true, "Password changed successfully");
	} catch (error) {
		next(error);
	}
};
