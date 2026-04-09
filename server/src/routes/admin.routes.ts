import { Router } from "express";
import {
	createTeacher,
	getAllStudents,
	getAllTeachers,
	deleteStudent,
	getTeacherById,
	updateTeacher,
	deleteTeacher,
	getAdminProfile,
} from "../controllers/admin.controller";
import { protect, authorizeRole } from "../middleware/auth.middleware";

const router = Router();

router.use(protect, authorizeRole("admin"));

router.get("/me", getAdminProfile);
router.post("/teacher", createTeacher);
router.get("/teachers", getAllTeachers);
router.get("/teacher/:id", getTeacherById);
router.put("/teacher/:id", updateTeacher);
router.delete("/teacher/:id", deleteTeacher);
router.get("/students", getAllStudents);
router.delete("/student/:id", deleteStudent);

export default router;
