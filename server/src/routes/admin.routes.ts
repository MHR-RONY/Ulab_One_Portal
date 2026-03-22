import { Router } from "express";
import {
	createTeacher,
	getAllStudents,
	getAllTeachers,
	deleteStudent,
} from "../controllers/admin.controller";
import { protect, authorizeRole } from "../middleware/auth.middleware";

const router = Router();

router.use(protect, authorizeRole("admin"));

router.post("/teacher", createTeacher);
router.get("/students", getAllStudents);
router.get("/teachers", getAllTeachers);
router.delete("/student/:id", deleteStudent);

export default router;
