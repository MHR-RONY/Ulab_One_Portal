import dotenv from "dotenv";
dotenv.config();

// Validate required environment variables before anything else
const requiredEnvVars = ["JWT_SECRET", "JWT_REFRESH_SECRET", "MONGO_URI", "CLIENT_URL"];
for (const key of requiredEnvVars) {
	if (!process.env[key]) {
		console.error(`Missing required environment variable: ${key}`);
		process.exit(1);
	}
}

import express from "express";
import path from "path";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
import studentRoutes from "./routes/student.routes";
import teacherRoutes from "./routes/teacher.routes";
import adminRoutes from "./routes/admin.routes";
import scheduleRoutes from "./routes/schedule.routes";
import chatRoutes from "./routes/chat.routes";
import scheduleUploadRoutes from "./routes/scheduleUpload.routes";
import resourcesRoutes from "./routes/resources.routes";
import studentNotesRoutes from "./routes/studentNotes.routes";
import { errorMiddleware } from "./middleware/error.middleware";
import { initSocketServer } from "./socket/chat.socket";

const app = express();
const httpServer = createServer(app);

// Parse comma-separated allowed origins (supports multiple domains for production)
const allowedOrigins = (process.env.CLIENT_URL as string)
	.split(",")
	.map((o) => o.trim());

// ── Uploaded file serving (BEFORE helmet — no security headers on static assets) ──
// Using explicit res.sendFile() instead of express.static() so we have full
// control over the resolved path and response headers in production.
const UPLOADS_DIR = path.resolve(__dirname, "../uploads");
console.log(`[uploads] Serving files from: ${UPLOADS_DIR}`);

// Handle CORS preflight for /uploads
app.options("/uploads/*", (req, res) => {
	const origin = req.headers.origin;
	if (origin && allowedOrigins.includes(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
		res.setHeader("Access-Control-Allow-Credentials", "true");
		res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
		res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	}
	res.status(204).end();
});

// Serve any file under /uploads (notes, teacher-photos, etc.)
app.get("/uploads/*", (req, res) => {
	// Extract the relative path after /uploads/
	const relativePath = req.params[0]; // e.g. "notes/abc123.pdf"
	if (!relativePath) {
		res.status(400).json({ success: false, message: "No file path specified" });
		return;
	}

	// Prevent path traversal attacks
	const safePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
	const absolutePath = path.join(UPLOADS_DIR, safePath);

	// Make sure resolved path is still inside UPLOADS_DIR
	if (!absolutePath.startsWith(UPLOADS_DIR)) {
		res.status(403).json({ success: false, message: "Access denied" });
		return;
	}

	// Set CORS headers
	const origin = req.headers.origin;
	if (origin && allowedOrigins.includes(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
		res.setHeader("Access-Control-Allow-Credentials", "true");
	}
	res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

	// Determine Content-Type
	const ext = path.extname(safePath).toLowerCase();
	const mimeTypes: Record<string, string> = {
		".pdf": "application/pdf",
		".jpg": "image/jpeg",
		".jpeg": "image/jpeg",
		".png": "image/png",
		".webp": "image/webp",
		".gif": "image/gif",
	};
	if (mimeTypes[ext]) {
		res.setHeader("Content-Type", mimeTypes[ext]);
	}

	res.sendFile(absolutePath, (err) => {
		if (err) {
			console.error(`[uploads] File not found: ${absolutePath}`);
			res.status(404).json({ success: false, message: "File not found" });
		}
	});
});

// Middleware
app.use(helmet());
app.use(
	cors({
		origin: (origin, callback) => {
			// Allow server-to-server requests (no origin) and whitelisted origins
			if (!origin || allowedOrigins.includes(origin)) {
				callback(null, origin || true);
			} else {
				callback(new Error(`CORS: origin '${origin}' is not allowed`));
			}
		},
		credentials: true,
	})
);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Connect to database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin/schedule", scheduleUploadRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/student-notes", studentNotesRoutes);

// Health check
app.get("/api/health", (_req, res) => {
	res.status(200).json({ success: true, message: "Server is running" });
});

// Root — confirms API is reachable (nginx health checks / browser visits)
app.get("/", (_req, res) => {
	res.status(200).json({ success: true, message: "ULAB One Portal API" });
});

// 404 handler — all unmatched routes return JSON, never HTML
app.use((_req, res) => {
	res.status(404).json({ success: false, message: "Route not found" });
});

// Error middleware (must be last)
app.use(errorMiddleware);

// Initialize WebSocket
initSocketServer(httpServer);

const PORT = process.env.PORT || 5003;

httpServer.listen(PORT, () => {
	console.log("Server running on port " + PORT);
});
