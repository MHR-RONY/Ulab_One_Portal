import mongoose from "mongoose";
import { OfferedCourseModel } from "../models/OfferedCourse.model";

export const connectDB = async (): Promise<void> => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI as string);
		console.log(` MongoDB connected: ${conn.connection.host}`);

		// Migration: initialize seats for any OfferedCourse docs missing the field
		const migrated = await OfferedCourseModel.updateMany(
			{ $or: [{ seats: { $exists: false } }, { seats: null }] },
			{ $set: { seats: 45, totalSeats: 45 } }
		);
		if (migrated.modifiedCount > 0) {
			console.log(`Seats migration: initialized seats for ${migrated.modifiedCount} offered course(s)`);
		}
	} catch (error) {
		console.error(" MongoDB connection failed:", error);
		process.exit(1);
	}
};
