import { Router } from "express";
import {
	checkAdminSetup,
	setupAdmin,
	sendStudentOtp,
	verifyStudentOtp,
	loginStudent,
	loginTeacher,
	loginAdmin,
	refreshToken,
	logout,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Admin setup (first-time only)
router.get("/admin/check-setup", checkAdminSetup);
router.post("/admin/setup", setupAdmin);

// Student registration
router.post("/register/student/send-otp", sendStudentOtp);
router.post("/register/student/verify-otp", verifyStudentOtp);

// Login (each role has its own endpoint)
router.post("/login/student", loginStudent);
router.post("/login/teacher", loginTeacher);
router.post("/login/admin", loginAdmin);

// Token management
router.post("/refresh-token", refreshToken);
router.post("/logout", protect, logout);

export default router;
