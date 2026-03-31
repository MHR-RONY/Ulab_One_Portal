import { ErrorRequestHandler } from "express";
import { sendResponse } from "../utils/apiResponse";

export const errorMiddleware: ErrorRequestHandler = (err, _req, res, _next) => {
	let statusCode = 500;
	let message = "Internal server error";

	// Mongoose CastError (invalid ObjectId)
	if (err.name === "CastError") {
		statusCode = 400;
		message = "Invalid ID format";
	}

	// Mongoose ValidationError
	if (err.name === "ValidationError") {
		statusCode = 400;
		const messages = Object.values(err.errors as Record<string, { message: string }>).map(
			(e) => e.message
		);
		message = messages.join(", ");
	}

	// JWT errors
	if (err.name === "JsonWebTokenError") {
		statusCode = 401;
		message = "Invalid token";
	}

	if (err.name === "TokenExpiredError") {
		statusCode = 401;
		message = "Token expired";
	}

	// MongoDB duplicate key (code 11000)
	if (err.code === 11000) {
		statusCode = 409;
		message = "A record with the provided details already exists";
	}

	sendResponse(res, statusCode, false, message);
};
