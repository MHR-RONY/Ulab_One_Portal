import { useState, useEffect, useCallback, useMemo } from "react";
import {
	ArrowLeft, Search, CheckCheck, Save, Users, UserX,
	CalendarDays, Check, BookOpen, ChevronRight, Ban,
} from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

// ─── Types ──────────────────────────────────────────────────────────────────

type TAttendanceStatus = "present" | "absent" | "not-marked";

interface ICourseOption {
	_id: string;
	courseCode: string;
	name: string;
	section: string;
	department: string;
	credits: number;
	enrolledStudents: Array<{ _id: string }> | string[];
}

interface IAttendanceStudent {
	_id: string;
	name: string;
	studentId: string;
	department: string;
	semester: number;
	status: TAttendanceStatus;
	attended: number;
	total: number;
	percentage: number | null;
}

// ─── Utils ───────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
	"bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-purple-500",
	"bg-rose-500", "bg-cyan-500", "bg-indigo-500", "bg-teal-500",
	"bg-orange-500", "bg-pink-500",
];

const getAvatarColor = (index: number) => AVATAR_COLORS[index % AVATAR_COLORS.length];

const getInitials = (name: string) => {
	const parts = name.trim().split(" ");
	if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
	return name.slice(0, 2).toUpperCase();
};

const todayString = () => new Date().toISOString().slice(0, 10);

const formatDate = (dateStr: string) => {
	const d = new Date(dateStr + "T12:00:00");
	return d.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

const formatDayLabel = (dateStr: string, todayStr: string) => {
	const d = new Date(dateStr + "T12:00:00");
	const month = d.toLocaleDateString("en-US", { month: "short" });
	const day = d.getDate();
	const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
	const isToday = dateStr === todayStr;
	const tomorrowDate = new Date(todayStr + "T12:00:00");
	tomorrowDate.setDate(tomorrowDate.getDate() + 1);
	const isTomorrow = dateStr === tomorrowDate.toISOString().slice(0, 10);
	return { month, day, weekday, isToday, isTomorrow };
};

const enrolledCount = (c: ICourseOption) =>
	Array.isArray(c.enrolledStudents) ? c.enrolledStudents.length : 0;

// ─── Component ───────────────────────────────────────────────────────────────

const PER_PAGE = 8;

const TeacherAttendance = () => {
	const isMobile = useIsMobile();
	const navigate = useNavigate();

	const [courses, setCourses] = useState<ICourseOption[]>([]);
	const [selectedCourse, setSelectedCourse] = useState<ICourseOption | null>(null);
	// Mobile: single-day state
	const [selectedDate, setSelectedDate] = useState<string>(todayString());
	const [students, setStudents] = useState<IAttendanceStudent[]>([]);
	const [loadingStudents, setLoadingStudents] = useState(false);
	const [saving, setSaving] = useState(false);
	// Desktop: multi-day state
	const [baseStudents, setBaseStudents] = useState<IAttendanceStudent[]>([]);
	const [dayStatuses, setDayStatuses] = useState<Record<string, Record<string, TAttendanceStatus>>>({});
	const [loadingDays, setLoadingDays] = useState(false);
	const [savingAll, setSavingAll] = useState(false);
	const [loadingCourses, setLoadingCourses] = useState(true);
	const [search, setSearch] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [holidayDates, setHolidayDates] = useState<Set<string>>(new Set());
	const [isDateHoliday, setIsDateHoliday] = useState(false);
	const [togglingHoliday, setTogglingHoliday] = useState<string | null>(null);
	const [viewDate, setViewDate] = useState<string>(todayString());
	// 5-day window: viewDate-4 ... viewDate (no tomorrow)
	const dayWindow = useMemo(() => {
		return Array.from({ length: 5 }, (_, i) => {
			const base = new Date(viewDate + "T12:00:00");
			base.setDate(base.getDate() - (4 - i));
			return base.toISOString().slice(0, 10);
		});
	}, [viewDate]);

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				setLoadingCourses(true);
				const { data } = await api.get("/teacher/courses");
				setCourses(data.data);
			} catch {
				toast({ title: "Failed to load courses", variant: "destructive" });
			} finally {
				setLoadingCourses(false);
			}
		};
		fetchCourses();
	}, []);

	const fetchAttendance = useCallback(async (course: ICourseOption, date: string) => {
		try {
			setLoadingStudents(true);
			const { data } = await api.get(`/teacher/courses/${course._id}/attendance?date=${date}`);
			const today = todayString();
			const rawStudents: IAttendanceStudent[] = data.data.students;
			const mapped = rawStudents.map((s) => ({
				...s,
				status: (s.status === "not-marked" && date === today)
					? ("absent" as TAttendanceStatus)
					: s.status,
			}));
			setStudents(mapped);
			setIsDateHoliday(data.data.isHoliday === true);
		} catch {
			toast({ title: "Failed to load attendance", variant: "destructive" });
		} finally {
			setLoadingStudents(false);
		}
	}, []);

	const fetchMultiDay = useCallback(async (course: ICourseOption) => {
		setLoadingDays(true);
		try {
			const results = await Promise.all(
				dayWindow.map((date) => api.get(`/teacher/courses/${course._id}/attendance?date=${date}`))
			);
			setBaseStudents(results[4].data.data.students);
			const newDayStatuses: Record<string, Record<string, TAttendanceStatus>> = {};
			// Use allHolidayDates from any response (all calls return the same list)
			const allHolidayDates: string[] = results[0].data.data.allHolidayDates ?? [];
			const newHolidayDates = new Set<string>(allHolidayDates);
			dayWindow.forEach((date, i) => {
				const responseData = results[i].data.data;
				if (responseData.isHoliday) newHolidayDates.add(date);
				const sts: IAttendanceStudent[] = responseData.students;
				const map: Record<string, TAttendanceStatus> = {};
				sts.forEach((s) => {
					const effectiveStatus =
						s.status === "not-marked" && date === viewDate && !responseData.isHoliday
							? ("absent" as TAttendanceStatus)
							: s.status;
					map[s._id] = effectiveStatus;
				});
				newDayStatuses[date] = map;
			});
			setDayStatuses(newDayStatuses);
			setHolidayDates(newHolidayDates);
		} catch {
			toast({ title: "Failed to load attendance", variant: "destructive" });
		} finally {
			setLoadingDays(false);
		}
	}, [dayWindow]);

	// Mobile: re-fetch when date changes
	useEffect(() => {
		if (selectedCourse && isMobile) {
			fetchAttendance(selectedCourse, selectedDate);
		}
	}, [selectedCourse, selectedDate, isMobile, fetchAttendance]);

	// Desktop: fetch 5-day window on course select
	useEffect(() => {
		if (selectedCourse && !isMobile) {
			fetchMultiDay(selectedCourse);
		}
	}, [selectedCourse, isMobile, fetchMultiDay]);

	const toggleStatus = (studentId: string) => {
		setStudents((prev) =>
			prev.map((s) => {
				if (s._id !== studentId) return s;
				if (s.status === "not-marked" || s.status === "absent") return { ...s, status: "present" as TAttendanceStatus };
				return { ...s, status: "absent" as TAttendanceStatus };
			})
		);
	};

	const toggleCell = (date: string, studentId: string) => {
		if (holidayDates.has(date)) return;
		setDayStatuses((prev) => {
			const dateMap = { ...(prev[date] ?? {}) };
			const current = dateMap[studentId] ?? "not-marked";
			dateMap[studentId] = current === "present" ? "absent" : "present";
			return { ...prev, [date]: dateMap };
		});
	};

	const markAllPresent = () => {
		if (isMobile) {
			if (isDateHoliday) return;
			setStudents((prev) => prev.map((s) => ({ ...s, status: "present" as TAttendanceStatus })));
		} else {
			if (holidayDates.has(viewDate)) return;
			setDayStatuses((prev) => {
				const dateMap = { ...(prev[viewDate] ?? {}) };
				baseStudents.forEach((s) => { dateMap[s._id] = "present"; });
				return { ...prev, [viewDate]: dateMap };
			});
		}
	};

	const markAllAbsent = () => {
		if (isMobile) {
			if (isDateHoliday) return;
			setStudents((prev) => prev.map((s) => ({ ...s, status: "absent" as TAttendanceStatus })));
		} else {
			if (holidayDates.has(viewDate)) return;
			setDayStatuses((prev) => {
				const dateMap = { ...(prev[viewDate] ?? {}) };
				baseStudents.forEach((s) => { dateMap[s._id] = "absent"; });
				return { ...prev, [viewDate]: dateMap };
			});
		}
	};

	const handleSave = async () => {
		if (!selectedCourse || isDateHoliday) return;
		try {
			setSaving(true);
			const records = students.map((s) => ({
				student: s._id,
				status: s.status === "present" ? "present" : "absent",
			}));
			await api.post(`/teacher/courses/${selectedCourse._id}/attendance`, {
				date: selectedDate,
				records,
			});
			await fetchAttendance(selectedCourse, selectedDate);
			toast({ title: "Attendance saved successfully" });
		} catch {
			toast({ title: "Failed to save attendance", variant: "destructive" });
		} finally {
			setSaving(false);
		}
	};

	const handleSaveAll = async () => {
		if (!selectedCourse) return;
		if (holidayDates.has(viewDate)) {
			toast({ title: "Selected date is a holiday. No attendance to save.", variant: "destructive" });
			return;
		}
		try {
			setSavingAll(true);
			const statuses = dayStatuses[viewDate] ?? {};
			const records = baseStudents.map((s) => ({
				student: s._id,
				status: statuses[s._id] === "present" ? "present" : "absent",
			}));
			await api.post(`/teacher/courses/${selectedCourse._id}/attendance`, { date: viewDate, records });
			await fetchMultiDay(selectedCourse);
			toast({ title: "Attendance saved successfully" });
		} catch {
			toast({ title: "Failed to save attendance", variant: "destructive" });
		} finally {
			setSavingAll(false);
		}
	};

	const handleBack = () => {
		setSelectedCourse(null);
		setStudents([]);
		setBaseStudents([]);
		setDayStatuses({});
		setHolidayDates(new Set());
		setIsDateHoliday(false);
		setSearch("");
		setCurrentPage(1);
	};

	const toggleHoliday = async (date: string) => {
		if (!selectedCourse) return;
		const isHoliday = isMobile ? isDateHoliday : holidayDates.has(date);
		try {
			setTogglingHoliday(date);
			if (isHoliday) {
				await api.delete(`/teacher/courses/${selectedCourse._id}/holiday/${date}`);
			} else {
				await api.post(`/teacher/courses/${selectedCourse._id}/holiday`, { date });
			}
			if (isMobile) {
				await fetchAttendance(selectedCourse, date);
			} else {
				await fetchMultiDay(selectedCourse);
			}
			toast({ title: isHoliday ? "Holiday removed" : "Day marked as holiday" });
		} catch {
			toast({ title: "Failed to update holiday status", variant: "destructive" });
		} finally {
			setTogglingHoliday(null);
		}
	};

	const todayStr = todayString();
	const viewDateSts = dayStatuses[viewDate] ?? {};
	const viewDateIsHoliday = holidayDates.has(viewDate);
	const presentCount = isMobile
		? (isDateHoliday ? 0 : students.filter((s) => s.status === "present").length)
		: (viewDateIsHoliday ? 0 : baseStudents.filter((s) => viewDateSts[s._id] === "present").length);
	const absentCount = isMobile
		? (isDateHoliday ? 0 : students.filter((s) => s.status !== "present").length)
		: (viewDateIsHoliday ? 0 : baseStudents.filter((s) => viewDateSts[s._id] !== "present").length);
	const totalStudents = isMobile ? students.length : baseStudents.length;

	const activeStudents = isMobile ? students : baseStudents;
	const validPctStudents = activeStudents.filter((s) => s.percentage !== null);
	const avgPercent =
		validPctStudents.length > 0
			? Math.round(validPctStudents.reduce((sum, s) => sum + (s.percentage ?? 0), 0) / validPctStudents.length)
			: 0;

	const filteredStudents = activeStudents.filter(
		(s) =>
			s.name.toLowerCase().includes(search.toLowerCase()) ||
			s.studentId.includes(search)
	);

	const totalPages = Math.ceil(filteredStudents.length / PER_PAGE);
	const paginatedStudents = filteredStudents.slice(
		(currentPage - 1) * PER_PAGE,
		currentPage * PER_PAGE
	);

	const getPctColor = (pct: number | null) => {
		if (pct === null) return "text-muted-foreground bg-muted";
		if (pct >= 90) return "text-emerald-600 bg-emerald-500/10";
		if (pct >= 75) return "text-primary bg-primary/10";
		return "text-destructive bg-destructive/10";
	};

	// ═══════════════════════════════════════════════════════════
	// STEP 1 — COURSE SELECTION
	// ═══════════════════════════════════════════════════════════

	if (!selectedCourse) {
		if (isMobile) {
			return (
				<div className="min-h-screen bg-background flex flex-col teacher-theme">
					<div className="sticky top-0 z-20 bg-card border-b border-border px-4 py-4">
						<div className="flex items-center gap-3">
							<button
								onClick={() => navigate(-1)}
								className="text-muted-foreground hover:text-foreground p-1 rounded-full"
							>
								<ArrowLeft className="w-5 h-5" />
							</button>
							<div>
								<h1 className="text-base font-bold text-foreground">Attendance Manager</h1>
								<p className="text-xs text-primary font-semibold">Select a class to continue</p>
							</div>
						</div>
					</div>

					<div className="flex-1 px-4 pt-4 pb-8 space-y-3">
						{loadingCourses ? (
							Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
							))
						) : courses.length === 0 ? (
							<div className="text-center py-16 text-muted-foreground text-sm">
								No courses assigned yet.
							</div>
						) : (
							courses.map((c, i) => (
								<motion.button
									key={c._id}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.05 }}
									onClick={() => setSelectedCourse(c)}
									className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all text-left"
								>
									<div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
										<BookOpen className="w-5 h-5 text-primary" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-semibold text-foreground text-sm truncate">{c.name}</p>
										<p className="text-xs text-muted-foreground">
											{c.courseCode} · Section {c.section}
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											{enrolledCount(c)} students enrolled
										</p>
									</div>
									<ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
								</motion.button>
							))
						)}
					</div>
				</div>
			);
		}

		// Desktop course selection
		return (
			<div className="flex min-h-screen bg-background teacher-theme">
				<TeacherSidebar activePage="Attendance" />
				<div className="flex-1 p-8">
					<div className="mb-8">
						<h1 className="text-2xl font-bold text-foreground">Attendance Manager</h1>
						<p className="text-muted-foreground mt-1">Select a course to manage attendance</p>
					</div>

					{loadingCourses ? (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
							{Array.from({ length: 6 }).map((_, i) => (
								<div key={i} className="h-36 rounded-2xl bg-muted animate-pulse" />
							))}
						</div>
					) : courses.length === 0 ? (
						<div className="text-center py-20 text-muted-foreground">
							No courses assigned yet. Create a course first.
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
							{courses.map((c, i) => (
								<motion.button
									key={c._id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.05 }}
									onClick={() => setSelectedCourse(c)}
									className="flex flex-col gap-3 p-6 rounded-2xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all text-left group"
								>
									<div className="flex items-start justify-between">
										<div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
											<BookOpen className="w-5 h-5 text-primary" />
										</div>
										<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
											{c.credits} cr
										</span>
									</div>
									<div>
										<p className="font-bold text-foreground">{c.name}</p>
										<p className="text-sm text-muted-foreground mt-0.5">
											{c.courseCode} · Section {c.section}
										</p>
										<p className="text-sm text-muted-foreground">{c.department}</p>
									</div>
									<div className="flex items-center justify-between pt-2 border-t border-border">
										<div className="flex items-center gap-1.5 text-sm text-muted-foreground">
											<Users className="w-4 h-4" />
											<span>{enrolledCount(c)} students</span>
										</div>
										<span className="text-xs font-semibold text-primary group-hover:underline">
											Take Attendance
										</span>
									</div>
								</motion.button>
							))}
						</div>
					)}
				</div>
			</div>
		);
	}

	// ═══════════════════════════════════════════════════════════
	// STEP 2 — ATTENDANCE SHEET (MOBILE)
	// ═══════════════════════════════════════════════════════════

	if (isMobile) {
		return (
			<div className="min-h-screen bg-background flex flex-col teacher-theme">
				{/* Header */}
				<div className="sticky top-0 z-20 bg-card border-b border-border">
					<div className="flex items-center justify-between px-4 py-3.5">
						<div className="flex items-center gap-3">
							<button
								onClick={handleBack}
								className="text-muted-foreground hover:text-foreground p-1 rounded-full"
							>
								<ArrowLeft className="w-5 h-5" />
							</button>
							<div>
								<h1 className="text-base font-bold text-foreground leading-tight">
									{selectedCourse.name}
								</h1>
								<p className="text-xs text-muted-foreground">
									{selectedCourse.courseCode} · Sec {selectedCourse.section}
								</p>
							</div>
						</div>
					</div>

					{/* Date picker row */}
					<div className="flex items-center justify-between px-4 py-2.5 bg-secondary/40 border-t border-border/50">
						<div className="flex items-center gap-2">
							<CalendarDays className="w-4 h-4 text-muted-foreground" />
							<span className="text-xs font-semibold text-foreground">{formatDate(selectedDate)}</span>
						</div>
						<div className="flex items-center gap-2">
							<button
								onClick={() => toggleHoliday(selectedDate)}
								disabled={togglingHoliday === selectedDate}
								className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${isDateHoliday
										? "border-amber-400/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
										: "border-border text-muted-foreground hover:text-foreground"
									}`}
							>
								{isDateHoliday ? "Holiday ✓" : "Mark Holiday"}
							</button>
							<input
								type="date"
								value={selectedDate}
								onChange={(e) => {
									setSelectedDate(e.target.value);
									setCurrentPage(1);
								}}
								className="text-xs h-8 px-2 rounded-lg border border-border bg-background text-foreground cursor-pointer"
							/>
						</div>
					</div>
				</div>

				{/* Search + mark all */}
				<div className="flex items-center gap-2 px-4 pt-3 pb-2">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<Input
							placeholder="Search student..."
							className="pl-9 h-9 text-sm"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setCurrentPage(1);
							}}
						/>
					</div>
					<Button
						variant="outline"
						size="sm"
						onClick={markAllPresent}
						className="gap-1 text-xs h-9 px-3 flex-shrink-0"
					>
						<CheckCheck className="w-3.5 h-3.5" /> All Present
					</Button>
				</div>

				{/* Holiday banner */}
				{isDateHoliday && (
					<div className="mx-4 mt-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
						<Ban className="w-4 h-4 flex-shrink-0" />
						<span>This day is a holiday. Attendance not required.</span>
					</div>
				)}
				{/* Student list */}
				<div className="flex-1 px-4 pb-28 space-y-2.5">
					{loadingStudents ? (
						Array.from({ length: 5 }).map((_, i) => (
							<div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
						))
					) : filteredStudents.length === 0 ? (
						<div className="text-center py-12 text-muted-foreground text-sm">
							{students.length === 0 ? "No students enrolled." : "No students match your search."}
						</div>
					) : (
						filteredStudents.map((student, idx) => {
							const isPresent = student.status === "present";
							return (
								<motion.button
									key={student._id}
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: idx * 0.03 }}
									onClick={() => !isDateHoliday && toggleStatus(student._id)}
									className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-all duration-200 ${isPresent
										? "bg-card border-primary/20 shadow-sm"
										: "bg-card border-border"
										}`}
								>
									<Avatar className="h-10 w-10 flex-shrink-0">
										<AvatarFallback className={`${getAvatarColor(idx)} text-white text-xs font-bold`}>
											{getInitials(student.name)}
										</AvatarFallback>
									</Avatar>
									<div className="flex-1 text-left min-w-0">
										<p className="font-semibold text-foreground text-sm truncate">{student.name}</p>
										<p className="text-xs text-muted-foreground">ID: {student.studentId}</p>
									</div>
									{student.percentage !== null && (
										<span
											className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${getPctColor(student.percentage)}`}
										>
											{student.percentage}%
										</span>
									)}
									<div
										className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${isPresent
											? "bg-primary border-primary text-primary-foreground"
											: "border-muted-foreground/30 bg-transparent"
											}`}
									>
										{isPresent && <Check className="w-4 h-4" />}
									</div>
								</motion.button>
							);
						})
					)}
				</div>

				{/* Fixed bottom save bar */}
				<div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-3 z-30">
					<div className="flex items-center gap-3">
						<div className="flex-shrink-0">
							<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Present</p>
							<p className="text-foreground">
								<span className="text-xl font-bold text-primary">{presentCount}</span>
								<span className="text-sm text-muted-foreground"> / {totalStudents}</span>
							</p>
						</div>
						<Button
							className="flex-1 h-11 rounded-full gap-2 font-semibold"
							onClick={handleSave}
							disabled={saving || loadingStudents || isDateHoliday}
						>
							<Save className="w-4 h-4" />
							{saving ? "Saving..." : isDateHoliday ? "Holiday  No Save" : "Save Attendance"}
						</Button>
					</div>
				</div>
			</div>
		);
	}

	// ═══════════════════════════════════════════════════════════
	// STEP 2 — ATTENDANCE SHEET (DESKTOP)
	// ═══════════════════════════════════════════════════════════

	return (
		<div className="flex min-h-screen bg-background teacher-theme">
			<TeacherSidebar activePage="Attendance" />
			<div className="flex-1">
				{/* Sticky header */}
				<div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
					<div className="px-8 py-4 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<button
								onClick={handleBack}
								className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
							>
								<ArrowLeft className="w-4 h-4" /> All Courses
							</button>
							<ChevronRight className="w-4 h-4 text-muted-foreground" />
							<span className="text-sm font-semibold text-foreground">
								{selectedCourse.name} ({selectedCourse.courseCode} · Sec {selectedCourse.section})
							</span>
						</div>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
							<Input
								placeholder="Search student..."
								className="pl-9 w-64 h-9"
								value={search}
								onChange={(e) => {
									setSearch(e.target.value);
									setCurrentPage(1);
								}}
							/>
						</div>
					</div>
				</div>

				<div className="p-8 space-y-6">
					{/* Control bar */}
					<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
						<Card>
							<CardContent className="p-6">
								<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
									<div>
										<h2 className="text-xl font-bold text-foreground">Attendance Sheet</h2>
										<p className="text-sm text-muted-foreground mt-0.5">
											{selectedCourse.courseCode} · {selectedCourse.name} · Section {selectedCourse.section}
										</p>
										<p className="text-xs text-muted-foreground mt-1">Showing {viewDate} and 4 previous days</p>
									</div>
									<div className="flex items-center gap-3 flex-wrap">
										<Button variant="outline" onClick={markAllPresent} disabled={viewDateIsHoliday} className="gap-2">
											<CheckCheck className="w-4 h-4" /> All Present Today
										</Button>
										<Button variant="outline" onClick={markAllAbsent} disabled={viewDateIsHoliday} className="gap-2">
											<UserX className="w-4 h-4" /> All Absent Today
										</Button>
										<Button onClick={handleSaveAll} disabled={savingAll || loadingDays || viewDateIsHoliday} className="gap-2">
											<Save className="w-4 h-4" />
											{savingAll ? "Saving..." : "Save Attendance"}
										</Button>
										<div className="w-px h-8 bg-border" />
										<div className="flex items-center gap-2">
											<input
												type="date"
												value={viewDate}
												onChange={(e) => setViewDate(e.target.value)}
												className="text-sm h-9 px-3 rounded-lg border border-border bg-background text-foreground cursor-pointer"
											/>
											<Button
												variant="outline"
												onClick={() => toggleHoliday(viewDate)}
												disabled={togglingHoliday === viewDate}
												className={`gap-2 ${holidayDates.has(viewDate)
														? "border-amber-400/60 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20"
														: ""
													}`}
											>
												<Ban className="w-4 h-4" />
												{holidayDates.has(viewDate) ? "Remove Holiday" : "Mark Holiday"}
											</Button>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* Stats */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.05 }}
						className="grid grid-cols-3 gap-4"
					>
						<Card>
							<CardContent className="p-5 flex items-center gap-4">
								<div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
									<Users className="w-6 h-6 text-emerald-600" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground font-medium">Present Today</p>
									<p className="text-2xl font-bold text-foreground">
										{presentCount} / {totalStudents}
									</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-5 flex items-center gap-4">
								<div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
									<UserX className="w-6 h-6 text-destructive" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground font-medium">Absent Today</p>
									<p className="text-2xl font-bold text-foreground">{absentCount}</p>
								</div>
							</CardContent>
						</Card>
						<Card>
							<CardContent className="p-5 flex items-center gap-4">
								<div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
									<CalendarDays className="w-6 h-6 text-primary" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground font-medium">Overall Avg</p>
									<p className="text-2xl font-bold text-foreground">
										{validPctStudents.length > 0 ? `${avgPercent}%` : "—"}
									</p>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* Today is holiday banner */}
					{viewDateIsHoliday && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.08 }}
							className="px-5 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400"
						>
							<Ban className="w-4 h-4 flex-shrink-0" />
							<span>{viewDate} is marked as a holiday. No attendance required.</span>
						</motion.div>
					)}

					{/* Table */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
					>
						<Card>
							{loadingDays ? (
								<div className="py-16 text-center text-muted-foreground text-sm">
									Loading attendance...
								</div>
							) : filteredStudents.length === 0 ? (
								<div className="py-16 text-center text-muted-foreground text-sm">
									{baseStudents.length === 0
										? "No students enrolled in this course."
										: "No students match your search."}
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-border">
												<th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
													Student
												</th>
												{dayWindow.map((date) => {
													const { month, day, weekday, isToday } = formatDayLabel(date, viewDate);
													return (
														<th
															key={date}
															className={`text-center px-3 py-4 text-xs font-semibold uppercase tracking-wider ${isToday
																	? "text-primary bg-primary/5 border-l border-r border-primary/20"
																	: "text-muted-foreground"
																}`}
														>
															<span className="block">{month} {day}</span>
															<span className="block font-normal normal-case opacity-70">{weekday}</span>
															{isToday && (
																<span className="block text-[10px] font-bold text-primary">
																	Today
																</span>
															)}
														</th>
													);
												})}
												<th className="text-center px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
													Classes Attended
												</th>
												<th className="text-center px-4 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
													Overall %
												</th>
											</tr>
										</thead>
										<tbody>
											{paginatedStudents.map((student, idx) => {
												const globalIdx = (currentPage - 1) * PER_PAGE + idx;
												return (
													<motion.tr
														key={student._id}
														initial={{ opacity: 0, x: -10 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{ delay: idx * 0.04 }}
														className="border-b border-border/50 hover:bg-muted/30 transition-colors"
													>
														<td className="px-6 py-4">
															<div className="flex items-center gap-3">
																<Avatar className="h-9 w-9">
																	<AvatarFallback
																		className={`${getAvatarColor(globalIdx)} text-white text-xs font-bold`}
																	>
																		{getInitials(student.name)}
																	</AvatarFallback>
																</Avatar>
																<div>
																	<p className="font-semibold text-foreground text-sm">{student.name}</p>
																	<p className="text-xs text-muted-foreground">
																		ID: {student.studentId} · Sem {student.semester}
																	</p>
																</div>
															</div>
														</td>
														{dayWindow.map((date) => {
															const isHolidayCol = holidayDates.has(date);
															const isReadOnly = isHolidayCol;
															const status = dayStatuses[date]?.[student._id] ?? "not-marked";
															const isPresent = status === "present";
															const isAbsent = status === "absent";
															const isTodayCol = date === viewDate;
															return (
																<td key={date} className={`text-center px-3 py-4 ${isHolidayCol ? "bg-amber-500/5"
																		: isTodayCol ? "bg-primary/5 border-l border-r border-primary/20"
																			: ""
																	}`}>
																	{isHolidayCol ? (
																		<div className="w-7 h-7 rounded-full border-2 border-amber-300/30 bg-amber-100/20 flex items-center justify-center mx-auto">
																			<Ban className="w-3 h-3 text-amber-400/60" />
																		</div>
																	) : (
																		<button
																			onClick={() => toggleCell(date, student._id)}
																			disabled={isReadOnly}
																			title={`${date}: Mark ${isPresent ? "absent" : "present"}`}
																			className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-200 ${isReadOnly
																					? "border-muted-foreground/20 bg-transparent cursor-default opacity-40"
																					: isPresent
																						? "bg-primary border-primary text-primary-foreground"
																						: isAbsent
																							? "bg-destructive/10 border-destructive/50 text-destructive"
																							: "border-muted-foreground/30 bg-transparent hover:border-muted-foreground/60"
																				}`}
																		>
																			{!isReadOnly && isPresent ? (
																				<Check className="w-3 h-3" />
																			) : !isReadOnly && isAbsent ? (
																				<span className="text-[10px] font-bold leading-none">✕</span>
																			) : null}
																		</button>
																	)}
																</td>
															);
														})}
														<td className="text-center px-4 py-4 text-sm text-muted-foreground">
															{student.total > 0 ? `${student.attended} / ${student.total}` : "—"}
														</td>
														<td className="text-center px-4 py-4">
															<span
																className={`text-xs font-bold px-2.5 py-1 rounded-full ${getPctColor(student.percentage)}`}
															>
																{student.percentage !== null ? `${student.percentage}%` : "—"}
															</span>
														</td>
													</motion.tr>
												);
											})}
										</tbody>
									</table>
								</div>
							)}

							{/* Pagination */}
							{filteredStudents.length > PER_PAGE && (
								<div className="flex items-center justify-between px-6 py-4 border-t border-border">
									<p className="text-xs text-muted-foreground">
										Showing {(currentPage - 1) * PER_PAGE + 1}–
										{Math.min(currentPage * PER_PAGE, filteredStudents.length)} of{" "}
										{filteredStudents.length} students
									</p>
									<div className="flex items-center gap-1">
										<button
											onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
											disabled={currentPage === 1}
											className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 text-sm"
										>
											‹
										</button>
										{Array.from({ length: totalPages }, (_, i) => (
											<button
												key={i}
												onClick={() => setCurrentPage(i + 1)}
												className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${currentPage === i + 1
													? "bg-primary text-primary-foreground"
													: "hover:bg-secondary text-muted-foreground"
													}`}
											>
												{i + 1}
											</button>
										))}
										<button
											onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
											disabled={currentPage === totalPages}
											className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30 text-sm"
										>
											›
										</button>
									</div>
								</div>
							)}
						</Card>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default TeacherAttendance;
