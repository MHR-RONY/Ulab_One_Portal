import { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
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

// Wrapper so multer errors return a clean JSON 400 instead of crashing
const handlePdfUpload = (req: Request, res: Response, next: NextFunction) => {
	uploadNotePdf(req, res, (err) => {
		if (err instanceof multer.MulterError) {
			// e.g. file too large
			res.status(400).json({ success: false, message: err.message });
			return;
		}
		if (err) {
			// e.g. wrong file type from fileFilter
			res.status(400).json({ success: false, message: (err as Error).message ?? "File upload failed" });
			return;
		}
		next();
	});
};

// Dashboard widget: 3 most recently approved notes
router.get("/recent-notes", protect, getRecentNotes);

// Public-ish: any logged-in user can browse repositories and notes
router.get("/repositories", protect, getRepositories);
router.get("/repository/:repoId", protect, getRepositoryById);
router.get("/repository/:repoId/notes", protect, getNotesByRepository);

// Student-only: upvote and submit
router.put("/notes/:id/upvote", protect, authorizeRole("student"), upvoteNote);
router.post("/repository/:repoId/submit", protect, authorizeRole("student"), handlePdfUpload, submitNote);

export default router;
