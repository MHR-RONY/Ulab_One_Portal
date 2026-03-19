import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth.routes";
import studentRoutes from "./routes/student.routes";
import teacherRoutes from "./routes/teacher.routes";
import adminRoutes from "./routes/admin.routes";
import scheduleRoutes from "./routes/schedule.routes";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Connect to database
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/schedule", scheduleRoutes);

// Health check
app.get("/api/health", (_req, res) => {
	res.status(200).json({ success: true, message: "Server is running" });
});

// Error middleware (must be last)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
	console.log(` Server running on port ${PORT}`);
});
