import mongoose, { Schema, Document, Model } from "mongoose";
import { IOfferedCourse } from "../types";

export interface IOfferedCourseDocument extends Omit<IOfferedCourse, "_id">, Document { }

const offeredCourseSchema = new Schema<IOfferedCourseDocument>(
	{
		courseCode: {
			type: String,
			trim: true,
			default: "",
		},
		unicode: {
			type: String,
			default: "",
			trim: true,
		},
		title: {
			type: String,
			default: "",
			trim: true,
		},
		section: {
			type: String,
			required: [true, "Section is required"],
			trim: true,
		},
		room: {
			type: String,
			required: [true, "Room is required"],
			trim: true,
		},
		teacherInitials: {
			type: String,
			default: "",
			trim: true,
		},
		teacherFullName: {
			type: String,
			default: "",
			trim: true,
		},
		teacherTBA: {
			type: Boolean,
			default: false,
		},
		isLab: {
			type: Boolean,
			default: false,
		},
		daySuffix: {
			type: String,
			default: "",
			trim: true,
		},
		days: {
			type: [String],
			required: [true, "Days are required"],
		},
		blockedDays: {
			type: [String],
			default: [],
		},
		startTime: {
			type: String,
			required: [true, "Start time is required"],
		},
		endTime: {
			type: String,
			required: [true, "End time is required"],
		},
		semester: {
			type: String,
			required: [true, "Semester is required"],
			trim: true,
		},
		hasConflict: {
			type: Boolean,
			default: false,
		},
		conflictReason: {
			type: String,
			default: "",
			trim: true,
		},
		seats: {
			type: Number,
			default: 45,
		},
		totalSeats: {
			type: Number,
			default: 45,
		},
	},
	{ timestamps: true }
);

offeredCourseSchema.index({ unicode: 1, section: 1, semester: 1 }, { sparse: true });
offeredCourseSchema.index({ courseCode: 1, section: 1, semester: 1 }, { sparse: true });
offeredCourseSchema.index({ semester: 1 });
offeredCourseSchema.index({ semester: 1, courseCode: 1, section: 1 });

export const OfferedCourseModel: Model<IOfferedCourseDocument> =
	mongoose.model<IOfferedCourseDocument>("OfferedCourse", offeredCourseSchema);
