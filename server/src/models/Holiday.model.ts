import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHolidayDocument extends Document {
	course: mongoose.Types.ObjectId;
	date: string;
	markedBy: mongoose.Types.ObjectId;
	createdAt: Date;
}

const holidaySchema = new Schema<IHolidayDocument>(
	{
		course: { type: Schema.Types.ObjectId, ref: "Course", required: true },
		date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
		markedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
	},
	{ timestamps: true }
);

holidaySchema.index({ course: 1, date: 1 }, { unique: true });

export const HolidayModel: Model<IHolidayDocument> = mongoose.model("Holiday", holidaySchema);
