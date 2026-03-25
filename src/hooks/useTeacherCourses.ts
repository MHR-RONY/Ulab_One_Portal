import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface IScheduleSlot {
	day: string;
	startTime: string;
	endTime: string;
	room: string;
}

export interface IEnrolledStudent {
	_id: string;
	name: string;
	studentId: string;
	email: string;
	department: string;
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
	enrolledStudents: IEnrolledStudent[];
	createdAt: string;
}

export const useTeacherCourses = () => {
	const [courses, setCourses] = useState<ICourse[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchCourses = useCallback(async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/teacher/courses");
			setCourses(data.data ?? []);
		} catch {
			setCourses([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchCourses();
	}, [fetchCourses]);

	return { courses, loading, refetch: fetchCourses };
};
