import { Router } from "express";
import {
	getTeacherProfile,
	updateTeacherProfile,
	createCourse,
	getTeacherCourses,
	getCourseStudents,
	addStudentToCourse,
	removeStudentFromCourse,
	searchStudents,
} from "../controllers/teacher.controller";
import { protect, authorizeRole } from "../middleware/auth.middleware";

const router = Router();

router.use(protect, authorizeRole("teacher"));

router.get("/profile", getTeacherProfile);
router.put("/profile", updateTeacherProfile);

router.get("/courses", getTeacherCourses);
router.post("/courses", createCourse);
router.get("/courses/:id/students", getCourseStudents);
router.post("/courses/:id/students", addStudentToCourse);
router.delete("/courses/:id/students/:studentMongoId", removeStudentFromCourse);
router.get("/students/search", searchStudents);

export default router;
