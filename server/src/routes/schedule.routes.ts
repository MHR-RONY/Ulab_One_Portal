import { Router } from "express";
import {
	buildSchedule,
	getMySchedule,
	getStudentOfferedCourses,
	saveScheduleSections,
	generateSchedule,
} from "../controllers/schedule.controller";
import { protect, authorizeRole } from "../middleware/auth.middleware";

const router = Router();

router.use(protect, authorizeRole("student"));

router.post("/build", buildSchedule);
router.post("/generate", generateSchedule);
router.post("/save-sections", saveScheduleSections);
router.get("/my-schedule", getMySchedule);
router.get("/offered-courses", getStudentOfferedCourses);

export default router;
