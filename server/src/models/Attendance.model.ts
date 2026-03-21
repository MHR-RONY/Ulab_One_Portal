import mongoose, { Schema, Document, Model } from "mongoose";
import { IAttendance } from "../types";

export interface IAttendanceDocument extends Omit<IAttendance, "_id">, Document {}

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
		attendedClasses: {
			type: Number,
			default: 0,
			min: 0,
		},
		totalClasses: {
			type: Number,
			default: 0,
			min: 0,
		},
	},
	{ timestamps: true }
);

attendanceSchema.index({ student: 1, course: 1 }, { unique: true });

export const AttendanceModel: Model<IAttendanceDocument> =
	mongoose.model<IAttendanceDocument>("Attendance", attendanceSchema);
