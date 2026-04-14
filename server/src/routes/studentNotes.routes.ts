import { Router } from "express";
import {
	getRepositories,
	getRepositoryById,
	getNotesByRepository,
	upvoteNote,
	submitNote,
} from "../controllers/resources.controller";
import { protect, authorizeRole } from "../middleware/auth.middleware";
import { uploadNotePdf } from "../middleware/upload.middleware";

const router = Router();

// Public-ish: any logged-in user can browse repositories and notes
router.get("/repositories", protect, getRepositories);
router.get("/repository/:repoId", protect, getRepositoryById);
router.get("/repository/:repoId/notes", protect, getNotesByRepository);

// Student-only: upvote and submit
router.put("/notes/:id/upvote", protect, authorizeRole("student"), upvoteNote);
router.post("/repository/:repoId/submit", protect, authorizeRole("student"), uploadNotePdf, submitNote);

export default router;
