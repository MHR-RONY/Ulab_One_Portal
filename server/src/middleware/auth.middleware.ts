import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { IJwtPayload, TRole } from "../types";
import { sendResponse } from "../utils/apiResponse";

export const protect: RequestHandler = (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			sendResponse(res, 401, false, "Not authorized — no token provided");
			return;
		}

		const token = authHeader.split(" ")[1];
		const decoded = jwt.verify(
			token,
			process.env.JWT_SECRET as string
		) as IJwtPayload;

		req.user = decoded;
		next();
	} catch (error) {
		sendResponse(res, 401, false, "Not authorized — invalid token");
		return;
	}
};

export const authorizeRole = (...roles: TRole[]): RequestHandler => {
	return (req, res, next) => {
		if (!req.user || !roles.includes(req.user.role)) {
			sendResponse(
				res,
				403,
				false,
				"Forbidden — you do not have permission to access this resource"
			);
			return;
		}
		next();
	};
};
