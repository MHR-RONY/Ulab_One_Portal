import { Schema } from "mongoose";
import { UserModel, IUserDocument } from "./User.model";

export interface IStudentDocument extends IUserDocument {
	studentId: string;
	department: string;
	semester: number;
	phone?: string;
	emailAlerts: boolean;
	pushNotifications: boolean;
	language: string;
	twoFactorEnabled: boolean;
	enrolledCourses: Schema.Types.ObjectId[];
}

const studentSchema = new Schema<IStudentDocument>({
	studentId: {
		type: String,
		required: [true, "Student ID is required"],
		unique: true,
		trim: true,
	},
	department: {
		type: String,
		required: [true, "Department is required"],
		trim: true,
	},
	semester: {
		type: Number,
		default: 1,
	},
	phone: {
		type: String,
		trim: true,
		default: "",
	},
	emailAlerts: {
		type: Boolean,
		default: true,
	},
	pushNotifications: {
		type: Boolean,
		default: true,
	},
	language: {
		type: String,
		default: "English (US)",
	},
	twoFactorEnabled: {
		type: Boolean,
		default: false,
	},
	enrolledCourses: [
		{
			type: Schema.Types.ObjectId,
			ref: "Course",
		},
	],
});

export const StudentModel = UserModel.discriminator<IStudentDocument>(
	"student",
	studentSchema
);
