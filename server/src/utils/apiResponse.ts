import { Response } from "express";
import { IApiResponse } from "../types";

export const sendResponse = <T>(
	res: Response,
	statusCode: number,
	success: boolean,
	message: string,
	data?: T
): void => {
	const response: IApiResponse<T> = { success, message };
	if (data !== undefined) response.data = data;
	res.status(statusCode).json(response);
};
