import { Router } from "express";
import {
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

router.post("/register/student/send-otp", sendStudentOtp);
router.post("/register/student/verify-otp", verifyStudentOtp);
router.post("/login/student", loginStudent);
router.post("/login/teacher", loginTeacher);
router.post("/login/admin", loginAdmin);
router.post("/refresh-token", refreshToken);
router.post("/logout", protect, logout);

export default router;
