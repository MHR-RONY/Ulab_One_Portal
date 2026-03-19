import { Schema } from "mongoose";
import { UserModel, IUserDocument } from "./User.model";

export interface IAdminDocument extends IUserDocument {
	permissions: string[];
}

const adminSchema = new Schema<IAdminDocument>({
	permissions: {
		type: [String],
		default: [],
	},
});

export const AdminModel = UserModel.discriminator<IAdminDocument>(
	"admin",
	adminSchema
);
