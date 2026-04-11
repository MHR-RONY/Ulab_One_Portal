import { Router } from "express";
import rateLimit from "express-rate-limit";
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
	forgotStudentPassword,
	verifyResetOtp,
	resetStudentPassword,
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { success: false, message: "Too many login attempts. Please try again after 15 minutes." },
});

const otpLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: { success: false, message: "Too many attempts. Please try again after 15 minutes." },
});

// Admin setup (first-time only)
router.get("/admin/check-setup", checkAdminSetup);
router.post("/admin/setup", loginLimiter, setupAdmin);

// Student registration
router.post("/register/student/send-otp", otpLimiter, sendStudentOtp);
router.post("/register/student/verify-otp", otpLimiter, verifyStudentOtp);

// Login (each role has its own endpoint)
router.post("/login/student", loginLimiter, loginStudent);
router.post("/login/teacher", loginLimiter, loginTeacher);
router.post("/login/admin", loginLimiter, loginAdmin);

// Student forgot password
router.post("/forgot-password/student/send-otp", otpLimiter, forgotStudentPassword);
router.post("/forgot-password/student/verify-otp", otpLimiter, verifyResetOtp);
router.post("/forgot-password/student/reset", otpLimiter, resetStudentPassword);

// Token management
router.post("/refresh-token", refreshToken);
router.post("/logout", protect, logout);

export default router;
