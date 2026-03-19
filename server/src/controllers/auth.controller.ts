import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { StudentModel } from "../models/Student.model";
import { TeacherModel } from "../models/Teacher.model";
import { AdminModel } from "../models/Admin.model";
import { IJwtPayload } from "../types";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken";
import { sendResponse } from "../utils/apiResponse";

export const registerStudent: RequestHandler = async (req, res, next) => {
	try {
		const { name, email, password, studentId, department, semester } = req.body;

		if (!name || !email || !password || !studentId || !department) {
			sendResponse(res, 400, false, "All fields are required");
			return;
		}

		const existingUser = await StudentModel.findOne({ email });
		if (existingUser) {
			sendResponse(res, 409, false, "Email already registered");
			return;
		}

		const student = await StudentModel.create({
			name,
			email,
			password,
			studentId,
			department,
			semester: semester || 1,
		});

		const payload: IJwtPayload = {
			id: student._id.toString(),
			role: "student",
			email: student.email,
		};

		const accessToken = generateAccessToken(payload);
		const refreshToken = generateRefreshToken(payload);

		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		sendResponse(res, 201, true, "Student registered successfully", {
			accessToken,
			student: student.toJSON(),
		});
	} catch (error) {
		next(error);
	}
};

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
		const refreshToken = generateRefreshToken(payload);

		res.cookie("refreshToken", refreshToken, {
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
		const refreshToken = generateRefreshToken(payload);

		res.cookie("refreshToken", refreshToken, {
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
		const refreshToken = generateRefreshToken(payload);

		res.cookie("refreshToken", refreshToken, {
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

export const logout: RequestHandler = async (_req, res, next) => {
	try {
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
