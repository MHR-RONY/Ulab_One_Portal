import mongoose, { Schema, Document, Model } from "mongoose";
import { INoteRepository } from "../types";

export interface INoteRepositoryDocument extends Omit<INoteRepository, "_id">, Document { }

const noteRepositorySchema = new Schema<INoteRepositoryDocument>(
	{
		courseName: {
			type: String,
			required: [true, "Course name is required"],
			trim: true,
		},
		courseCode: {
			type: String,
			required: [true, "Course code is required"],
			trim: true,
		},
		department: {
			type: String,
			required: [true, "Department is required"],
			enum: ["CSE", "BBA", "EEE", "MSJ"],
		},
		description: {
			type: String,
			trim: true,
		},
		noteCount: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

export const NoteRepositoryModel: Model<INoteRepositoryDocument> = mongoose.model<INoteRepositoryDocument>(
	"NoteRepository",
	noteRepositorySchema
);
