import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.resolve(__dirname, "../../uploads/teacher-photos");

// Ensure directory exists on startup
if (!fs.existsSync(UPLOAD_DIR)) {
	fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (_req, _file, cb) => {
		cb(null, UPLOAD_DIR);
	},
	filename: (req, _file, cb) => {
		// Use teacher's MongoDB _id so the filename is always stable
		const teacherId = req.user?.id ?? "unknown";
		cb(null, `${teacherId}.jpg`);
	},
});

const fileFilter = (
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
	storage,
	fileFilter,
	limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
}).single("avatar");
