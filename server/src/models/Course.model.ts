import mongoose, { Schema, Document, Model } from "mongoose";
import { ICourse, IScheduleSlot } from "../types";

export interface ICourseDocument extends Omit<ICourse, "_id">, Document { }

const scheduleSlotSchema = new Schema<IScheduleSlot>(
	{
		day: {
			type: String,
			enum: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
			required: true,
		},
		startTime: {
			type: String,
			required: true,
		},
		endTime: {
			type: String,
			required: true,
		},
		room: {
			type: String,
			required: true,
		},
	},
	{ _id: false }
);

const courseSchema = new Schema<ICourseDocument>(
	{
		courseCode: {
			type: String,
			required: [true, "Course code is required"],
			unique: true,
			trim: true,
		},
		name: {
			type: String,
			required: [true, "Course name is required"],
			trim: true,
		},
		credits: {
			type: Number,
			required: [true, "Credits are required"],
		},
		department: {
			type: String,
			required: [true, "Department is required"],
			trim: true,
		},
		teacher: {
			type: Schema.Types.ObjectId,
			ref: "User",
		} as unknown as string,
		scheduleSlots: [scheduleSlotSchema],
	},
	{ timestamps: true }
);

export const CourseModel: Model<ICourseDocument> =
	mongoose.model<ICourseDocument>("Course", courseSchema);
