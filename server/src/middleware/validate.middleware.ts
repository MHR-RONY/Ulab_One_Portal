import { RequestHandler } from "express";
import { validationResult } from "express-validator";
import { sendResponse } from "../utils/apiResponse";

export const validate: RequestHandler = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const messages = errors.array().map((e) => e.msg as string);
		sendResponse(res, 400, false, messages.join(", "));
		return;
	}

	next();
};
