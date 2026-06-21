// Faithful Express app harness for Supertest.
//
// We cannot import src/server.ts directly: it calls connectDB(), app.listen(),
// initSocketServer(), and process.exit(1) at import time. This harness rebuilds
// the SAME middleware order and route mounts as server.ts (verified against
// server.ts lines 40-155) so tests exercise the real controllers, routes,
// middleware, helmet, CORS, and error handler — only the bootstrapping differs.
//
// If server.ts's middleware order or mounts change, update this to match.

import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import authRoutes from "../../src/routes/auth.routes";
import studentRoutes from "../../src/routes/student.routes";
import teacherRoutes from "../../src/routes/teacher.routes";
import adminRoutes from "../../src/routes/admin.routes";
import scheduleRoutes from "../../src/routes/schedule.routes";
import chatRoutes from "../../src/routes/chat.routes";
import scheduleUploadRoutes from "../../src/routes/scheduleUpload.routes";
import resourcesRoutes from "../../src/routes/resources.routes";
import studentNotesRoutes from "../../src/routes/studentNotes.routes";
import { errorMiddleware } from "../../src/middleware/error.middleware";

export const buildTestApp = (): express.Express => {
	const app = express();

	// Test-only: trust ONE proxy hop so tests can control req.ip via the leftmost
	// X-Forwarded-For value (used to isolate rate-limit buckets per test). Using a
	// specific hop count (not `true`) avoids express-rate-limit's permissive-proxy
	// warning. Production server.ts does NOT set this — see FINDING F1 in the audit.
	app.set("trust proxy", 1);

	const allowedOrigins = (process.env.CLIENT_URL as string)
		.split(",")
		.map((o) => o.trim());

	const UPLOADS_DIR = path.resolve(__dirname, "../uploads");

	// ── /uploads/* served BEFORE helmet (mirrors server.ts:47-105) ──
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

	app.get("/uploads/*", (req, res) => {
		const relativePath = req.params[0];
		if (!relativePath) {
			res.status(400).json({ success: false, message: "No file path specified" });
			return;
		}
		const safePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
		const absolutePath = path.join(UPLOADS_DIR, safePath);
		if (!absolutePath.startsWith(UPLOADS_DIR)) {
			res.status(403).json({ success: false, message: "Access denied" });
			return;
		}
		const origin = req.headers.origin;
		if (origin && allowedOrigins.includes(origin)) {
			res.setHeader("Access-Control-Allow-Origin", origin);
			res.setHeader("Access-Control-Allow-Credentials", "true");
		}
		res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
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
				res.status(404).json({ success: false, message: "File not found" });
			}
		});
	});

	app.use(helmet());
	app.use(
		cors({
			origin: (origin, callback) => {
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

	app.use("/api/auth", authRoutes);
	app.use("/api/student", studentRoutes);
	app.use("/api/teacher", teacherRoutes);
	app.use("/api/admin", adminRoutes);
	app.use("/api/schedule", scheduleRoutes);
	app.use("/api/chat", chatRoutes);
	app.use("/api/admin/schedule", scheduleUploadRoutes);
	app.use("/api/resources", resourcesRoutes);
	app.use("/api/student-notes", studentNotesRoutes);

	app.get("/api/health", (_req, res) => {
		res.status(200).json({ success: true, message: "Server is running" });
	});

	app.use((_req, res) => {
		res.status(404).json({ success: false, message: "Route not found" });
	});

	app.use(errorMiddleware);

	return app;
};
