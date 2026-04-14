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
	refreshToken?: string | null;
	blockedUsers?: string[];
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
	accentColorIndex: number;
	avatar?: string;
	bio?: string;
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

export type TAttendanceStatus = "present" | "absent";

export interface IAttendanceRecord {
	_id: string;
	student: string;
	course: string;
	date: string;
	status: TAttendanceStatus;
	time?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface IHoliday {
	_id: string;
	course: string;
	date: string;
	markedBy: string;
	createdAt: Date;
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

export type TChatGroupType = "class" | "custom";

export interface IChatGroup {
	_id: string;
	name: string;
	type: TChatGroupType;
	course?: string;
	createdBy: string;
	members: string[];
	createdAt: Date;
	updatedAt: Date;
}

export interface IMessage {
	_id: string;
	chatGroup?: string;
	sender: string;
	receiver?: string;
	content: string;
	isGroupMessage: boolean;
	readBy: string[];
	createdAt: Date;
	updatedAt: Date;
}

export interface IAttendanceSubjectProgress {
	courseCode: string;
	courseName: string;
	section: string;
	attended: number;
	total: number;
	percentage: number;
}

export interface IAttendanceActivity {
	date: string;
	courseCode: string;
	section: string;
	status: TAttendanceStatus;
	time: string | null;
}

export interface IAttendanceOverallStats {
	percentage: number;
	attended: number;
	total: number;
	coursesAtRisk: number;
}

export interface IAttendanceCalendarData {
	month: number;
	year: number;
	presentDates: string[];
	absentDates: string[];
}

export interface IStudentAttendanceData {
	overallStats: IAttendanceOverallStats;
	subjectProgress: IAttendanceSubjectProgress[];
	recentActivity: IAttendanceActivity[];
	calendarData: IAttendanceCalendarData;
}

export interface IAttendanceDayRecord {
	courseCode: string;
	courseName: string;
	section: string;
	status: TAttendanceStatus | "not-marked";
	time: string | null;
}

export interface IStudentAttendanceDayData {
	date: string;
	records: IAttendanceDayRecord[];
	presentCount: number;
	absentCount: number;
	notMarkedCount: number;
}

export interface IScheduleUploadEntry {
	courseCode: string;
	unicode: string;
	section: string;
	room: string;
	teacher: string;
	teacherTBA: boolean;
	isLab: boolean;
	daySuffix: string;
	days: string[];
	blockedDays: string[];
	startTime: string;
	endTime: string;
	hasConflict: boolean;
	conflictReason: string;
}

export interface ITeacherDirectoryEntry {
	initials: string;
	fullName: string;
}

export interface IRawScheduleData {
	semester: string;
	totalEntries: number;
	tbaCount: number;
	entries: IScheduleUploadEntry[];
	teacherDirectory: ITeacherDirectoryEntry[];
	errors: string[];
	conflictCount: number;
}

export interface IOfferedCourse {
	_id: string;
	courseCode: string;
	unicode: string;
	title: string;
	section: string;
	room: string;
	teacherInitials: string;
	teacherFullName: string;
	teacherTBA: boolean;
	isLab: boolean;
	daySuffix: string;
	days: string[];
	blockedDays: string[];
	startTime: string;
	endTime: string;
	semester: string;
	hasConflict: boolean;
	conflictReason: string;
	seats: number;
	totalSeats: number;
	createdAt: Date;
	updatedAt: Date;
}

export interface ITeacherDirectory {
	_id: string;
	initials: string;
	fullName: string;
	semester: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface IUploadLog {
	_id: string;
	fileName: string;
	fileSize: number;
	semester: string;
	totalEntries: number;
	errorCount: number;
	uploadedBy: string;
	createdAt: Date;
}

export interface IApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data?: T;
}

export interface INoteRepository {
	_id: string;
	courseName: string;
	courseCode: string;
	department: "CSE" | "BBA" | "EEE" | "MSJ";
	description?: string;
	noteCount: number;
	createdAt: Date;
	updatedAt: Date;
}

export type TNoteStatus = "pending" | "approved" | "rejected";
export type TNoteFileType = "pdf" | "docx" | "pptx" | "other";

export interface INote {
	_id: string;
	title: string;
	description?: string;
	repository: string;
	courseCode: string;
	department: "CSE" | "BBA" | "EEE" | "MSJ";
	fileType: TNoteFileType;
	fileSize: string;
	fileUrl?: string;
	uploadedBy: string;
	uploaderName: string;
	status: TNoteStatus;
	upvotes: number;
	week?: string;
	createdAt: Date;
	updatedAt: Date;
}

// ---- Schedule Generation Types ----

export type TScheduleMode = "teacher" | "gap" | "days";

export interface IGenerateScheduleBody {
	courseUnicodes: string[];
	preferredSections: Record<string, string>;
	modes: TScheduleMode[];
	semester: string;
}

export interface IGeneratedSection {
	sectionId: string;
	courseCode: string;
	unicode: string;
	title: string;
	section: string;
	teacher: string;
	days: string[];
	startTime: string;
	endTime: string;
	room: string;
	isLab: boolean;
	isPreferredTeacher: boolean;
}

export interface IScheduleConflict {
	course1: string;
	course2: string;
	day: string;
	overlap: string;
}

export interface IScheduleVariation {
	label: string;
	isBest: boolean;
	score: number;
	totalDays: number;
	daysUsed: string[];
	avgGapMinutes: number;
	teacherMatchCount: number;
	totalCourses: number;
	conflicts: IScheduleConflict[];
	sections: IGeneratedSection[];
}

export interface IGenerateScheduleResponse {
	variations: IScheduleVariation[];
	hasConflicts: boolean;
	conflictMessages: string[];
}

declare global {
	namespace Express {
		interface Request {
			user?: IJwtPayload;
		}
	}
}
