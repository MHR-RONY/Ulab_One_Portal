import mongoose, { Schema, Document, Model } from "mongoose";
import { ITeacherDirectory } from "../types";

export interface ITeacherDirectoryDocument
	extends Omit<ITeacherDirectory, "_id">,
	Document { }

const teacherDirectorySchema = new Schema<ITeacherDirectoryDocument>(
	{
		initials: {
			type: String,
			required: [true, "Teacher initials are required"],
			trim: true,
		},
		fullName: {
			type: String,
			required: [true, "Teacher full name is required"],
			trim: true,
		},
		semester: {
			type: String,
			required: [true, "Semester is required"],
			trim: true,
		},
	},
	{ timestamps: true }
);

teacherDirectorySchema.index({ initials: 1, semester: 1 }, { unique: true });
teacherDirectorySchema.index({ semester: 1 });

export const TeacherDirectoryModel: Model<ITeacherDirectoryDocument> =
	mongoose.model<ITeacherDirectoryDocument>(
		"TeacherDirectory",
		teacherDirectorySchema
	);
