// Test fixtures — create users directly via the real models and mint tokens
// the same way the production code does (generateToken util), so tests exercise
// the genuine auth path.

import jwt from "jsonwebtoken";
import { StudentModel } from "../../src/models/Student.model";
import { TeacherModel } from "../../src/models/Teacher.model";
import { AdminModel } from "../../src/models/Admin.model";
import { generateAccessToken } from "../../src/utils/generateToken";
import type { IJwtPayload, TRole } from "../../src/types";

let counter = 0;
const uniq = () => `${Date.now()}-${counter++}`;

export interface SeededUser {
	id: string;
	email: string;
	password: string;
	role: TRole;
	token: string;
	doc: any;
}

const bearer = (id: string, role: TRole, email: string): string =>
	generateAccessToken({ id, role, email } as IJwtPayload);

export const createStudent = async (
	overrides: Partial<{ email: string; password: string; studentId: string; department: string; name: string }> = {}
): Promise<SeededUser> => {
	const password = overrides.password ?? "secret123";
	const email = overrides.email ?? `student-${uniq()}@ulab.edu.bd`;
	const doc = await StudentModel.create({
		name: overrides.name ?? "Test Student",
		email,
		password,
		studentId: overrides.studentId ?? `S-${uniq()}`,
		department: overrides.department ?? "CSE",
		semester: 1,
	});
	const id = doc._id.toString();
	return { id, email, password, role: "student", token: bearer(id, "student", email), doc };
};

export const createTeacher = async (
	overrides: Partial<{ email: string; password: string; teacherId: string; department: string; name: string }> = {}
): Promise<SeededUser> => {
	const password = overrides.password ?? "secret123";
	const email = overrides.email ?? `teacher-${uniq()}@ulab.edu.bd`;
	const doc = await TeacherModel.create({
		name: overrides.name ?? "Test Teacher",
		email,
		password,
		teacherId: overrides.teacherId ?? `T-${uniq()}`,
		department: overrides.department ?? "CSE",
	});
	const id = doc._id.toString();
	return { id, email, password, role: "teacher", token: bearer(id, "teacher", email), doc };
};

export const createAdmin = async (
	overrides: Partial<{ email: string; password: string; name: string }> = {}
): Promise<SeededUser> => {
	const password = overrides.password ?? "secret123";
	const email = overrides.email ?? `admin-${uniq()}@ulab.edu.bd`;
	const doc = await AdminModel.create({
		name: overrides.name ?? "Test Admin",
		email,
		password,
		permissions: ["all"],
	});
	const id = doc._id.toString();
	return { id, email, password, role: "admin", token: bearer(id, "admin", email), doc };
};

// Mint a token for an id that does not exist / is arbitrary (forged-but-signed).
export const tokenFor = (id: string, role: TRole, email = "x@ulab.edu.bd"): string =>
	bearer(id, role, email);

// A structurally valid JWT signed with the WRONG secret (forgery attempt).
export const forgedToken = (payload: Partial<IJwtPayload> = {}): string =>
	jwt.sign(
		{ id: "000000000000000000000000", role: "admin", email: "evil@x.com", ...payload },
		"the-wrong-secret"
	);

// An already-expired but correctly-signed token.
export const expiredToken = (id: string, role: TRole, email = "x@ulab.edu.bd"): string =>
	jwt.sign({ id, role, email }, process.env.JWT_SECRET as string, { expiresIn: "-10s" });
