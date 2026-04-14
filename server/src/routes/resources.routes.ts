import { Router } from "express";
import {
	getDepartmentStats,
	createRepository,
	getRepositories,
	getPendingNotes,
	approveNote,
	rejectNote,
	getDepartmentDetail,
	getNotesByRepository,
	updateRepository,
	deleteRepository,
} from "../controllers/resources.controller";
import { protect, authorizeRole } from "../middleware/auth.middleware";

const router = Router();

router.use(protect, authorizeRole("admin"));

router.get("/stats", getDepartmentStats);
router.get("/repositories", getRepositories);
router.post("/repository", createRepository);
router.get("/notes/pending", getPendingNotes);
router.put("/notes/:id/approve", approveNote);
router.put("/notes/:id/reject", rejectNote);
router.get("/department/:deptId", getDepartmentDetail);
router.get("/repository/:repoId/notes", getNotesByRepository);
router.put("/repository/:id", updateRepository);
router.delete("/repository/:id", deleteRepository);

export default router;
