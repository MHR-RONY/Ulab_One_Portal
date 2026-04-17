import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface IDashboardCourse {
	_id: string;
	courseCode: string;
	name: string;
	section: string;
	credits: number;
	department: string;
	enrolledStudents: Array<{ _id: string; name: string; studentId: string; email: string; department: string }>;
	createdAt: string;
}

export interface IDashboardStats {
	totalStudents: number;
	totalCourses: number;
	avgStudentsPerCourse: number;
	largestCourse: IDashboardCourse | null;
	sections: Array<{
		name: string;
		studentCount: number;
		percent: number;
		color: string;
	}>;
	recentStudents: Array<{ name: string; initials: string; course: string }>;
	courses: IDashboardCourse[];
}

const getInitials = (name: string) => {
	const parts = name.trim().split(" ");
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const SECTION_COLORS = ["bg-primary", "bg-primary/70", "bg-stat-blue", "bg-stat-purple", "bg-stat-amber", "bg-stat-emerald"];

export const useTeacherDashboard = () => {
	const [stats, setStats] = useState<IDashboardStats | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchDashboard = useCallback(async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/teacher/courses");
			const courses: IDashboardCourse[] = data.data ?? [];

			const totalStudents = courses.reduce((sum, c) => sum + c.enrolledStudents.length, 0);
			const totalCourses = courses.length;
			const avgStudentsPerCourse = totalCourses > 0 ? Math.round(totalStudents / totalCourses) : 0;
			const largestCourse = courses.reduce<IDashboardCourse | null>(
				(best, c) => (!best || c.enrolledStudents.length > best.enrolledStudents.length ? c : best),
				null
			);

			const maxStudents = courses.reduce((max, c) => Math.max(max, c.enrolledStudents.length), 1);

			const sections = courses.map((c, i) => ({
				name: `${c.section} (${c.courseCode})`,
				studentCount: c.enrolledStudents.length,
				percent: Math.round((c.enrolledStudents.length / Math.max(maxStudents, 1)) * 100),
				color: SECTION_COLORS[i % SECTION_COLORS.length],
			}));

			// Gather recent students across all courses (deduplicated by _id)
			const seen = new Set<string>();
			const recentStudents: Array<{ name: string; initials: string; course: string }> = [];
			for (const course of courses) {
				for (const s of course.enrolledStudents) {
					if (!seen.has(s._id) && recentStudents.length < 5) {
						seen.add(s._id);
						recentStudents.push({
							name: s.name,
							initials: getInitials(s.name),
							course: `${course.courseCode} - ${course.section}`,
						});
					}
				}
			}

			setStats({
				totalStudents,
				totalCourses,
				avgStudentsPerCourse,
				largestCourse,
				sections,
				recentStudents,
				courses,
			});
		} catch {
			setStats(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDashboard();
	}, [fetchDashboard]);

	return { stats, loading, refetch: fetchDashboard };
};
