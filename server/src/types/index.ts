export type TRole = "student" | "teacher" | "admin";

export interface IScheduleSlot {
	day: "Saturday" | "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday";
	startTime: string;
	endTime: string;
	room: string;
}

export interface IUser {
	_id: string;
	name: string;
	email: string;
	password: string;
	role: TRole;
	comparePassword(candidatePassword: string): Promise<boolean>;
	createdAt: Date;
	updatedAt: Date;
}

export interface IStudent extends IUser {
	studentId: string;
	department: string;
	semester: number;
	enrolledCourses: string[];
}

export interface ITeacher extends IUser {
	teacherId: string;
	department: string;
	assignedCourses: string[];
}

export interface IAdmin extends IUser {
	permissions: string[];
}

export interface ICourse {
	_id: string;
	courseCode: string;
	name: string;
	credits: number;
	department: string;
	teacher: string;
	scheduleSlots: IScheduleSlot[];
	createdAt: Date;
	updatedAt: Date;
}

export interface ISchedule {
	_id: string;
	student: string;
	courses: string[];
	semester: string;
	isConflictFree: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface IJwtPayload {
	id: string;
	role: TRole;
	email: string;
}

export interface IApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data?: T;
}

declare global {
	namespace Express {
		interface Request {
			user?: IJwtPayload;
		}
	}
}
