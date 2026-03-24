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
	phone?: string;
	emailAlerts: boolean;
	pushNotifications: boolean;
	language: string;
	twoFactorEnabled: boolean;
	enrolledCourses: string[];
}

export interface IStudentSettings {
	name: string;
	email: string;
	studentId: string;
	department: string;
	semester: number;
	emailAlerts: boolean;
	pushNotifications: boolean;
	language: string;
	twoFactorEnabled: boolean;
}

export interface IProfileCourse {
	courseCode: string;
	courseName: string;
	credits: number;
	teacher: string;
	attendedClasses: number;
	totalClasses: number;
	attendancePercentage: number;
}

export interface IProfileData {
	name: string;
	studentId: string;
	department: string;
	semester: number;
	email: string;
	phone: string;
	enrolledCourses: IProfileCourse[];
	overallAttendancePercentage: number;
	totalCredits: number;
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
	section: string;
	credits: number;
	department: string;
	teacher: string;
	scheduleSlots: IScheduleSlot[];
	enrolledStudents: string[];
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

export interface IAttendance {
	_id: string;
	student: string;
	course: string;
	attendedClasses: number;
	totalClasses: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface IDashboardClass {
	courseCode: string;
	courseName: string;
	startTime: string;
	endTime: string;
	room: string;
	teacher: string;
	status: "COMPLETED" | "NOW" | "UPCOMING";
}

export interface IDashboardStats {
	upcomingClassesCount: number;
	nextClass: { code: string; time: string } | null;
	totalSessionsToday: number;
	completedSessionsToday: number;
}

export interface IAttendanceSummary {
	courseCode: string;
	courseName: string;
	attendedClasses: number;
	totalClasses: number;
	percentage: number;
}

export interface IDashboardData {
	student: {
		name: string;
		studentId: string;
		department: string;
		semester: number;
	};
	todaysClasses: IDashboardClass[];
	stats: IDashboardStats;
	attendance: IAttendanceSummary[];
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
