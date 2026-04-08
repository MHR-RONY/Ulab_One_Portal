import mongoose, { Schema, Document, Model } from "mongoose";
import { IUploadLog } from "../types";

export interface IUploadLogDocument extends Omit<IUploadLog, "_id">, Document { }

const uploadLogSchema = new Schema<IUploadLogDocument>(
	{
		fileName: {
			type: String,
			required: [true, "File name is required"],
			trim: true,
		},
		fileSize: {
			type: Number,
			required: [true, "File size is required"],
		},
		semester: {
			type: String,
			required: [true, "Semester is required"],
			trim: true,
		},
		totalEntries: {
			type: Number,
			required: true,
			default: 0,
		},
		errorCount: {
			type: Number,
			default: 0,
		},
		uploadedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Uploaded by is required"],
		} as unknown as string,
	},
	{ timestamps: true }
);

uploadLogSchema.index({ createdAt: -1 });

export const UploadLogModel: Model<IUploadLogDocument> =
	mongoose.model<IUploadLogDocument>("UploadLog", uploadLogSchema);
