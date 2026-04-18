import { Router } from "express";
import {
	getRepositories,
	getRepositoryById,
	getNotesByRepository,
	upvoteNote,
	submitNote,
	getRecentNotes,
} from "../controllers/resources.controller";
import { protect, authorizeRole } from "../middleware/auth.middleware";
import { uploadNotePdf } from "../middleware/upload.middleware";

const router = Router();

// Dashboard widget: 3 most recently approved notes
router.get("/recent-notes", protect, getRecentNotes);

// Public-ish: any logged-in user can browse repositories and notes
router.get("/repositories", protect, getRepositories);
router.get("/repository/:repoId", protect, getRepositoryById);
router.get("/repository/:repoId/notes", protect, getNotesByRepository);

// Student-only: upvote and submit
router.put("/notes/:id/upvote", protect, authorizeRole("student"), upvoteNote);
router.post("/repository/:repoId/submit", protect, authorizeRole("student"), uploadNotePdf, submitNote);

export default router;
