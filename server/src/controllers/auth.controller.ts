import { RequestHandler } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { StudentModel } from "../models/Student.model";
import { TeacherModel } from "../models/Teacher.model";
import { AdminModel } from "../models/Admin.model";
import { UserModel } from "../models/User.model";
import { IJwtPayload } from "../types";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";
import { sendResponse } from "../utils/apiResponse";
import {
	generateOtp,
	storePendingRegistration,
	getPendingRegistration,
	deletePendingRegistration,
	incrementOtpAttempts,
} from "../utils/otp";
import { sendOtpEmail } from "../utils/emailService";

const hashToken = (token: string): string =>
	crypto.createHash("sha256").update(token).digest("hex");

// ─── Admin Setup ──────────────────────────────────────────────

export const checkAdminSetup: RequestHandler = async (_req, res, next) => {
	try {
		const adminCount = await AdminModel.countDocuments();
		sendResponse(res, 200, true, "Admin setup status", {
			isSetup: adminCount > 0,
		});
	} catch (error) {
		next(error);
	}
};

export const setupAdmin: RequestHandler = async (req, res, next) => {
	try {
		const adminCount = await AdminModel.countDocuments();
		if (adminCount > 0) {
			sendResponse(res, 403, false, "Admin account already exists. Please login.");
			return;
		}

		const { name, email, password } = req.body;

		if (!name || !email || !password) {
			sendResponse(res, 400, false, "Name, email, and password are required");
			return;
		}

		if (password.length < 6) {
			sendResponse(res, 400, false, "Password must be at least 6 characters");
			return;
		}

		const admin = await AdminModel.create({
			name,
			email,
			password,
			role: "admin",
			permissions: ["all"],
		});

		const payload: IJwtPayload = {
			id: admin._id.toString(),
			role: "admin",
			email: admin.email,
		};

		const accessToken = generateAccessToken(payload);
		const newRefreshToken = generateRefreshToken(payload);

		await UserModel.findByIdAndUpdate(admin._id, { refreshToken: hashToken(newRefreshToken) });

		res.cookie("refreshToken", newRefreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		sendResponse(res, 201, true, "Admin account created successfully", {
			accessToken,
			admin: admin.toJSON(),
		});
	} catch (error) {
		next(error);
	}
};

// ─── Student Registration ─────────────────────────────────────

export const sendStudentOtp: RequestHandler = async (req, res, next) => {
	try {
		const { name, email, password, studentId, department } = req.body;

		if (!name || !email || !password || !studentId || !department) {
			sendResponse(res, 400, false, "All fields are required");
			return;
		}

		if (!email.endsWith("@ulab.edu.bd")) {
			sendResponse(res, 400, false, "Email must end with @ulab.edu.bd");
			return;
		}

		if (password.length < 6) {
			sendResponse(res, 400, false, "Password must be at least 6 characters");
			return;
		}

		const existingUser = await StudentModel.findOne({ email });
		if (existingUser) {
			sendResponse(res, 409, false, "Email already registered");
			return;
		}

		const existingStudentId = await StudentModel.findOne({ studentId });
		if (existingStudentId) {
			sendResponse(res, 409, false, "Student ID already registered");
			return;
		}

		const otp = generateOtp();

		await storePendingRegistration(email, {
			type: "student",
			name,
			email,
			password,
			studentId,
			department,
			otp,
		});

		await sendOtpEmail(email, name, otp);

		sendResponse(res, 200, true, "OTP sent to your email");
	} catch (error) {
		next(error);
	}
};

export const verifyStudentOtp: RequestHandler = async (req, res, next) => {
	try {
		const { email, otp } = req.body;

		if (!email || !otp) {
			sendResponse(res, 400, false, "Email and OTP are required");
			return;
		}

		const pending = getPendingRegistration(email);
		if (!pending) {
			sendResponse(res, 400, false, "OTP expired or no pending registration. Please try again.");
			return;
		}

		if (pending.type !== "student") {
			sendResponse(res, 400, false, "Invalid registration type");
			return;
		}

		if (pending.otp !== otp) {
			const stillValid = incrementOtpAttempts(email);
			if (!stillValid) {
				sendResponse(res, 429, false, "Too many failed attempts. Please request a new OTP.");
			} else {
				sendResponse(res, 400, false, "Invalid OTP");
			}
			return;
		}

		// Double-check uniqueness before creating
		const existingUser = await StudentModel.findOne({ email });
		if (existingUser) {
			deletePendingRegistration(email);
			sendResponse(res, 409, false, "Email already registered");
			return;
		}

		const student = await StudentModel.create({
			name: pending.name,
			email: pending.email,
			password: pending.hashedPassword,
			studentId: pending.studentId,
			department: pending.department,
			semester: pending.semester || 1,
		});

		deletePendingRegistration(email);

		const payload: IJwtPayload = {
			id: student._id.toString(),
			role: "student",
			email: student.email,
		};

		const accessToken = generateAccessToken(payload);
		const newRefreshToken = generateRefreshToken(payload);

		await UserModel.findByIdAndUpdate(student._id, { refreshToken: hashToken(newRefreshToken) });

		res.cookie("refreshToken", newRefreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		sendResponse(res, 201, true, "Student registered successfully", {
			accessToken,
			student: student.toJSON(),
		});
	} catch (error) {
		next(error);
	}
};

// ─── Login ────────────────────────────────────────────────────

export const loginStudent: RequestHandler = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			sendResponse(res, 400, false, "Email and password are required");
			return;
		}

		const student = await StudentModel.findOne({ email }).select("+password");
		if (!student) {
			sendResponse(res, 401, false, "Invalid email or password");
			return;
		}

		const isMatch = await student.comparePassword(password);
		if (!isMatch) {
			sendResponse(res, 401, false, "Invalid email or password");
			return;
		}

		const payload: IJwtPayload = {
			id: student._id.toString(),
			role: "student",
			email: student.email,
		};

		const accessToken = generateAccessToken(payload);
		const newRefreshToken = generateRefreshToken(payload);

		await UserModel.findByIdAndUpdate(student._id, { refreshToken: hashToken(newRefreshToken) });

		res.cookie("refreshToken", newRefreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		sendResponse(res, 200, true, "Student logged in successfully", {
			accessToken,
			student: student.toJSON(),
		});
	} catch (error) {
		next(error);
	}
};

export const loginTeacher: RequestHandler = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			sendResponse(res, 400, false, "Email and password are required");
			return;
		}

		const teacher = await TeacherModel.findOne({ email }).select("+password");
		if (!teacher) {
			sendResponse(res, 401, false, "Invalid email or password");
			return;
		}

		const isMatch = await teacher.comparePassword(password);
		if (!isMatch) {
			sendResponse(res, 401, false, "Invalid email or password");
			return;
		}

		const payload: IJwtPayload = {
			id: teacher._id.toString(),
			role: "teacher",
			email: teacher.email,
		};

		const accessToken = generateAccessToken(payload);
		const newRefreshToken = generateRefreshToken(payload);

		await UserModel.findByIdAndUpdate(teacher._id, { refreshToken: hashToken(newRefreshToken) });

		res.cookie("refreshToken", newRefreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		sendResponse(res, 200, true, "Teacher logged in successfully", {
			accessToken,
			teacher: teacher.toJSON(),
		});
	} catch (error) {
		next(error);
	}
};

export const loginAdmin: RequestHandler = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			sendResponse(res, 400, false, "Email and password are required");
			return;
		}

		const admin = await AdminModel.findOne({ email }).select("+password");
		if (!admin) {
			sendResponse(res, 401, false, "Invalid email or password");
			return;
		}

		const isMatch = await admin.comparePassword(password);
		if (!isMatch) {
			sendResponse(res, 401, false, "Invalid email or password");
			return;
		}

		const payload: IJwtPayload = {
			id: admin._id.toString(),
			role: "admin",
			email: admin.email,
		};

		const accessToken = generateAccessToken(payload);
		const newRefreshToken = generateRefreshToken(payload);

		await UserModel.findByIdAndUpdate(admin._id, { refreshToken: hashToken(newRefreshToken) });

		res.cookie("refreshToken", newRefreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});

		sendResponse(res, 200, true, "Admin logged in successfully", {
			accessToken,
			admin: admin.toJSON(),
		});
	} catch (error) {
		next(error);
	}
};

export const refreshToken: RequestHandler = async (req, res, next) => {
	try {
		const token = req.cookies?.refreshToken;

		if (!token) {
			sendResponse(res, 401, false, "No refresh token provided");
			return;
		}

		const decoded = jwt.verify(
			token,
			process.env.JWT_REFRESH_SECRET as string
		) as IJwtPayload;

		// Verify the token matches what is stored in the database
		const user = await UserModel.findById(decoded.id).select("+refreshToken");
		if (!user || user.refreshToken !== hashToken(token)) {
			sendResponse(res, 401, false, "Invalid or expired refresh token");
			return;
		}

		const payload: IJwtPayload = {
			id: decoded.id,
			role: decoded.role,
			email: decoded.email,
		};

		const accessToken = generateAccessToken(payload);

		sendResponse(res, 200, true, "Token refreshed successfully", {
			accessToken,
		});
	} catch (error) {
		next(error);
	}
};

export const logout: RequestHandler = async (req, res, next) => {
	try {
		await UserModel.findByIdAndUpdate(req.user?.id, { refreshToken: null });

		res.clearCookie("refreshToken", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		});

		sendResponse(res, 200, true, "Logged out successfully");
	} catch (error) {
		next(error);
	}
};
