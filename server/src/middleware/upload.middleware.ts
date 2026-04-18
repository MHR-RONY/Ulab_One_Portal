import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const TEACHER_PHOTO_DIR = path.resolve(__dirname, "../../uploads/teacher-photos");
const NOTES_DIR = path.resolve(__dirname, "../../uploads/notes");

// Ensure directories exist on startup
if (!fs.existsSync(TEACHER_PHOTO_DIR)) {
	fs.mkdirSync(TEACHER_PHOTO_DIR, { recursive: true });
}
if (!fs.existsSync(NOTES_DIR)) {
	fs.mkdirSync(NOTES_DIR, { recursive: true });
}

// ---------- Teacher Photo Upload ----------

const teacherPhotoStorage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, TEACHER_PHOTO_DIR);
	},
	filename: (req, _file, cb) => {
		const teacherId = req.user?.id ?? "unknown";
		cb(null, `${teacherId}.jpg`);
	},
});

const photoFilter = (
	_req: Express.Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
	if (allowed.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error("Only JPEG, PNG, WEBP, and GIF images are allowed"));
	}
};

export const uploadTeacherPhoto = multer({
	storage: teacherPhotoStorage,
	fileFilter: photoFilter,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
}).single("avatar");

// ---------- Notes PDF Upload (memory storage → uploaded to R2 by controller) ----------

const pdfFilter = (
	_req: Express.Request,
	file: Express.Multer.File,
	cb: multer.FileFilterCallback
) => {
	if (file.mimetype === "application/pdf") {
		cb(null, true);
	} else {
		cb(new Error("Only PDF files are allowed"));
	}
};

export const uploadNotePdf = multer({
	storage: multer.memoryStorage(),
	fileFilter: pdfFilter,
	limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
}).single("file");
