import mongoose, { Schema, Document, Model } from "mongoose";
import { IMessage } from "../types";

export interface IMessageDocument extends Omit<IMessage, "_id">, Document {}

const messageSchema = new Schema<IMessageDocument>(
	{
		chatGroup: {
			type: Schema.Types.ObjectId,
			ref: "ChatGroup",
			default: null,
		} as unknown as string,
		sender: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		} as unknown as string,
		receiver: {
			type: Schema.Types.ObjectId,
			ref: "User",
			default: null,
		} as unknown as string,
		content: {
			type: String,
			required: [true, "Message content is required"],
			trim: true,
			maxlength: [5000, "Message cannot exceed 5000 characters"],
		},
		isGroupMessage: {
			type: Boolean,
			default: false,
		},
		readBy: [
			{
				type: Schema.Types.ObjectId,
				ref: "User",
			},
		],
	},
	{ timestamps: true }
);

messageSchema.index({ chatGroup: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, sender: 1, createdAt: -1 });

export const MessageModel: Model<IMessageDocument> =
	mongoose.model<IMessageDocument>("Message", messageSchema);
