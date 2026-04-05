import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface AttendanceSubjectProgress {
	courseCode: string;
	courseName: string;
	section: string;
	attended: number;
	total: number;
	percentage: number;
}

export interface AttendanceActivity {
	date: string;
	courseCode: string;
	section: string;
	status: "present" | "absent";
	time: string | null;
}

export interface AttendanceOverallStats {
	percentage: number;
	attended: number;
	total: number;
	coursesAtRisk: number;
}

export interface AttendanceCalendarData {
	month: number;
	year: number;
	presentDates: string[];
	absentDates: string[];
}

export interface StudentAttendanceData {
	overallStats: AttendanceOverallStats;
	subjectProgress: AttendanceSubjectProgress[];
	recentActivity: AttendanceActivity[];
	calendarData: AttendanceCalendarData;
}

export interface AttendanceDayRecord {
	courseCode: string;
	courseName: string;
	section: string;
	status: "present" | "absent" | "not-marked";
	time: string | null;
}

export interface StudentAttendanceDayData {
	date: string;
	records: AttendanceDayRecord[];
	presentCount: number;
	absentCount: number;
	notMarkedCount: number;
}

export const useStudentAttendance = (month: number, year: number) => {
	const [data, setData] = useState<StudentAttendanceData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchAttendance = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.get<{ success: boolean; data: StudentAttendanceData }>(
				`/student/attendance?month=${month}&year=${year}`
			);
			setData(res.data.data);
		} catch {
			setError("Failed to load attendance data");
		} finally {
			setLoading(false);
		}
	}, [month, year]);

	useEffect(() => {
		fetchAttendance();
	}, [fetchAttendance]);

	return { data, loading, error, refetch: fetchAttendance };
};

export const useStudentAttendanceDay = (date: string | null) => {
	const [data, setData] = useState<StudentAttendanceDayData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!date) {
			setData(null);
			return;
		}
		setLoading(true);
		setError(null);
		api
			.get<{ success: boolean; data: StudentAttendanceDayData }>(`/student/attendance/day?date=${date}`)
			.then((res) => setData(res.data.data))
			.catch(() => setError("Failed to load day data"))
			.finally(() => setLoading(false));
	}, [date]);

	return { data, loading, error };
};

