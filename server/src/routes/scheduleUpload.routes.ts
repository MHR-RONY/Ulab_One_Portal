import { Router } from "express";
import {
	upload,
	uploadSchedule,
	parsePreview,
	confirmSave,
	getOfferedCourses,
	deleteOfferedCoursesBySemester,
	getUploadLogs,
	clearUploadLogs,
	getScheduleStats,
	updateOfferedCourse,
	deleteOfferedCourse,
} from "../controllers/scheduleUpload.controller";
import { protect, authorizeRole } from "../middleware/auth.middleware";

const router = Router();

router.use(protect, authorizeRole("admin"));

router.post("/upload-schedule", upload.single("file"), uploadSchedule);
router.post("/parse-preview", upload.single("file"), parsePreview);
router.post("/confirm-save", confirmSave);
router.get("/offered-courses", getOfferedCourses);
router.patch("/offered-courses/:id", updateOfferedCourse);
router.delete("/offered-courses/single/:id", deleteOfferedCourse);
router.delete("/offered-courses/:semester", deleteOfferedCoursesBySemester);
router.get("/upload-logs", getUploadLogs);
router.delete("/upload-logs", clearUploadLogs);
router.get("/schedule-stats", getScheduleStats);

export default router;
