import { Router } from "express";
import {
	getTeacherProfile,
	updateTeacherProfile,
	updateTeacherSettings,
	createCourse,
	getTeacherCourses,
	getCourseStudents,
	addStudentToCourse,
	removeStudentFromCourse,
	searchStudents,
	getAttendanceForDate,
	saveAttendance,
} from "../controllers/teacher.controller";
import { protect, authorizeRole } from "../middleware/auth.middleware";

const router = Router();

router.use(protect, authorizeRole("teacher"));

router.get("/profile", getTeacherProfile);
router.put("/profile", updateTeacherProfile);
router.patch("/settings", updateTeacherSettings);

router.get("/courses", getTeacherCourses);
router.post("/courses", createCourse);
router.get("/courses/:id/students", getCourseStudents);
router.post("/courses/:id/students", addStudentToCourse);
router.delete("/courses/:id/students/:studentMongoId", removeStudentFromCourse);
router.get("/students/search", searchStudents);

router.get("/courses/:id/attendance", getAttendanceForDate);
router.post("/courses/:id/attendance", saveAttendance);

export default router;
