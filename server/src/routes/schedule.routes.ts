import { Router } from "express";
import {
	buildSchedule,
	getMySchedule,
} from "../controllers/schedule.controller";
import { protect, authorizeRole } from "../middleware/auth.middleware";

const router = Router();

router.use(protect, authorizeRole("student"));

router.post("/build", buildSchedule);
router.get("/my-schedule", getMySchedule);

export default router;
