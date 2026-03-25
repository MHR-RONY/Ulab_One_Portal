import mongoose, { Schema, Document, Model } from "mongoose";
import { IAttendanceRecord } from "../types";

export interface IAttendanceDocument extends Omit<IAttendanceRecord, "_id">, Document { }

const attendanceSchema = new Schema<IAttendanceDocument>(
	{
		student: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		} as unknown as string,
		course: {
			type: Schema.Types.ObjectId,
			ref: "Course",
			required: true,
		} as unknown as string,
		date: {
			type: String,
			required: true,
			match: /^\d{4}-\d{2}-\d{2}$/,
		},
		status: {
			type: String,
			enum: ["present", "absent"],
			required: true,
		},
	},
	{ timestamps: true }
);

attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

export const AttendanceModel: Model<IAttendanceDocument> =
	mongoose.model<IAttendanceDocument>("Attendance", attendanceSchema);
