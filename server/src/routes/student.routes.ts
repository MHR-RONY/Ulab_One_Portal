import { Router } from "express";
import {
	getStudentProfile,
	updateStudentProfile,
} from "../controllers/student.controller";
import { protect, authorizeRole } from "../middleware/auth.middleware";

const router = Router();

router.use(protect, authorizeRole("student"));

router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);

export default router;
