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
import { errorMiddleware } from "./middleware/error.middleware";
import { initSocketServer } from "./socket/chat.socket";

const app = express();
const httpServer = createServer(app);

// Parse comma-separated allowed origins (supports multiple domains for production)
const allowedOrigins = (process.env.CLIENT_URL as string)
	.split(",")
	.map((o) => o.trim());

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
