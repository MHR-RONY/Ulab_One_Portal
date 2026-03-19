import { Router } from "express";
import {
	getTeacherProfile,
	updateTeacherProfile,
} from "../controllers/teacher.controller";
import { protect, authorizeRole } from "../middleware/auth.middleware";

const router = Router();

router.use(protect, authorizeRole("teacher"));

router.get("/profile", getTeacherProfile);
router.put("/profile", updateTeacherProfile);

export default router;
