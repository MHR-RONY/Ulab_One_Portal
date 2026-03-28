import mongoose, { Schema, Document, Model } from "mongoose";
import { IChatGroup } from "../types";

export interface IChatGroupDocument extends Omit<IChatGroup, "_id">, Document { }

const chatGroupSchema = new Schema<IChatGroupDocument>(
	{
		name: {
			type: String,
			required: [true, "Group name is required"],
			trim: true,
		},
		type: {
			type: String,
			enum: ["class", "custom"],
			default: "class",
		},
		course: {
			type: Schema.Types.ObjectId,
			ref: "Course",
			default: null,
		} as unknown as string,
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		} as unknown as string,
		members: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
	},
	{ timestamps: true }
);

chatGroupSchema.index({ course: 1 }, { sparse: true });
chatGroupSchema.index({ members: 1 });
chatGroupSchema.index({ createdBy: 1 });

export const ChatGroupModel: Model<IChatGroupDocument> =
	mongoose.model<IChatGroupDocument>("ChatGroup", chatGroupSchema);
