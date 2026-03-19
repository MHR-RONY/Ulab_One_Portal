import { Schema } from "mongoose";
import { UserModel, IUserDocument } from "./User.model";

export interface ITeacherDocument extends IUserDocument {
	teacherId: string;
	department: string;
	assignedCourses: Schema.Types.ObjectId[];
}

const teacherSchema = new Schema<ITeacherDocument>({
	teacherId: {
		type: String,
		required: [true, "Teacher ID is required"],
		unique: true,
		trim: true,
	},
	department: {
		type: String,
		required: [true, "Department is required"],
		trim: true,
	},
	assignedCourses: [
		{
			type: Schema.Types.ObjectId,
			ref: "Course",
		},
	],
});

export const TeacherModel = UserModel.discriminator<ITeacherDocument>(
	"teacher",
	teacherSchema
);
