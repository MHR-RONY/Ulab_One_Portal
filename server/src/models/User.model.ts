import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, TRole } from "../types";

export interface IUserDocument extends Omit<IUser, "_id">, Document {
	comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: [true, "Password is required"],
			minlength: [6, "Password must be at least 6 characters"],
			select: false,
		},
		refreshToken: {
			type: String,
			default: null,
			select: false,
		},
		role: {
			type: String,
			enum: ["student", "teacher", "admin"] as TRole[],
			required: [true, "Role is required"],
		},
		blockedUsers: {
			type: [Schema.Types.ObjectId],
			ref: "User",
			default: [],
		},
	},
	{
		timestamps: true,
		discriminatorKey: "role",
		toJSON: {
			transform(_doc, ret) {
				const { password: _pw, ...rest } = ret;
				return rest;
			},
		},
	}
);

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next();
	// Skip rehashing if password is already a bcrypt hash (pre-hashed in OTP flow)
	if (this.password.startsWith("$2b$") || this.password.startsWith("$2a$")) return next();
	const salt = await bcrypt.genSalt(12);
	this.password = await bcrypt.hash(this.password, salt);
	next();
});

userSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	return bcrypt.compare(candidatePassword, this.password);
};

export const UserModel: Model<IUserDocument> = mongoose.model<IUserDocument>(
	"User",
	userSchema
);
