import { Router } from "express";
import {
	getStudentProfile,
	updateStudentProfile,
	getDashboardData,
	getStudentSettings,
	updateStudentSettings,
	changePassword,
} from "../controllers/student.controller";
import { protect, authorizeRole } from "../middleware/auth.middleware";

const router = Router();

router.use(protect, authorizeRole("student"));

router.get("/dashboard", getDashboardData);
router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);
router.get("/settings", getStudentSettings);
router.put("/settings", updateStudentSettings);
router.post("/change-password", changePassword);

export default router;
