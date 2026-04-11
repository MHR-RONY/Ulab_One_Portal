import mongoose, { Schema, Document, Model } from "mongoose";
import { ISchedule } from "../types";

export interface IScheduleDocument extends Omit<ISchedule, "_id">, Document { }

const scheduleSchema = new Schema<IScheduleDocument>(
	{
		student: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Student is required"],
		} as unknown as string,
		courses: [
			{
				type: Schema.Types.ObjectId,
				ref: "OfferedCourse",
			},
		],
		semester: {
			type: String,
			required: [true, "Semester is required"],
		},
		isConflictFree: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

export const ScheduleModel: Model<IScheduleDocument> =
	mongoose.model<IScheduleDocument>("Schedule", scheduleSchema);
