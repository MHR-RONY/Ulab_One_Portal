import mongoose, { Schema, Document, Model } from "mongoose";
import { INote, TNoteStatus, TNoteFileType } from "../types";

export interface INoteDocument extends Omit<INote, "_id">, Document { }

const noteSchema = new Schema<INoteDocument>(
	{
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
		},
		description: {
			type: String,
			default: "",
		},
		repository: {
			type: Schema.Types.ObjectId,
			ref: "NoteRepository",
			required: [true, "Repository reference is required"],
		} as unknown as string,
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
		fileType: {
			type: String,
			enum: ["pdf", "docx", "pptx", "other"],
			default: "other",
		} as unknown as TNoteFileType,
		fileSize: {
			type: String,
			default: "",
		},
		fileUrl: {
			type: String,
			default: "",
		},
		uploadedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		} as unknown as string,
		uploaderName: {
			type: String,
			default: "",
		},
		status: {
			type: String,
			enum: ["pending", "approved", "rejected"],
			default: "pending",
		} as unknown as TNoteStatus,
		upvotes: {
			type: Number,
			default: 0,
		},
		week: {
			type: String,
		},
		adminFeedback: {
			type: String,
			default: "",
		},
		// Maps userId (string) → vote direction: 1 = upvote, -1 = downvote
		voters: {
			type: Map,
			of: Number,
			default: {},
		},
	},
	{ timestamps: true }
);

export const NoteModel: Model<INoteDocument> = mongoose.model<INoteDocument>("Note", noteSchema);
