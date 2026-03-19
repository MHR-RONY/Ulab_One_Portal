import jwt from "jsonwebtoken";
import { IJwtPayload } from "../types";

export const generateAccessToken = (payload: IJwtPayload): string => {
	return jwt.sign(payload, process.env.JWT_SECRET as string, {
		expiresIn: process.env.JWT_EXPIRES_IN || "15m",
	});
};

export const generateRefreshToken = (payload: IJwtPayload): string => {
	return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
		expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
	});
};
