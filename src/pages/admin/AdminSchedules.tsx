import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Search, Download, Plus, Edit2, MapPin, User, Clock,
	ChevronLeft, ChevronRight, LayoutGrid, List, Loader2, AlertCircle,
	BookOpen, Users,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────
interface OfferedCourse {
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
	days: string[];
	startTime: string;
	endTime: string;
	semester: string;
	hasConflict: boolean;
	seats?: number;
	totalSeats?: number;
}

// ─── Constants ─────────────────────────────────────────────────────────────
const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const DAY_SHORT: Record<string, string> = {
	Sunday: "SUN", Monday: "MON", Tuesday: "TUE",
	Wednesday: "WED", Thursday: "THU",
	Sun: "SUN", Mon: "MON", Tue: "TUE", Wed: "WED", Thu: "THU",
};

// Colour palette cycling for course cards
const CARD_COLOURS = [
	{ bg: "bg-primary/10 dark:bg-primary/20", border: "border-primary", text: "text-primary" },
	{ bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-400", text: "text-blue-600 dark:text-blue-400" },
	{ bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-400", text: "text-green-600 dark:text-green-400" },
	{ bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-400", text: "text-purple-600 dark:text-purple-400" },
	{ bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-400", text: "text-amber-600 dark:text-amber-400" },
	{ bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-400", text: "text-rose-600 dark:text-rose-400" },
];

const colourForCode = (code: string) =>
	CARD_COLOURS[Math.abs([...code].reduce((a, c) => a + c.charCodeAt(0), 0)) % CARD_COLOURS.length];

// ─── Helpers ────────────────────────────────────────────────────────────────
function normaliseDay(d: string): string {
	// Accepts "Sun", "Sunday", "SUN" etc. → "Sunday"
	const map: Record<string, string> = {
		sun: "Sunday", mon: "Monday", tue: "Tuesday",
		wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday",
	};
	return map[d.toLowerCase().slice(0, 3)] ?? d;
}

function todayName(): string {
	return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
}

function getInitials(name: string): string {
	if (!name) return "?";
	return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Sub-components ─────────────────────────────────────────────────────────
const ClassCard = ({ course }: { course: OfferedCourse }) => {
	const col = colourForCode(course.courseCode);
	const teacher = course.teacherTBA ? "TBA" : (course.teacherFullName || course.teacherInitials || "TBA");
	return (
		<div className={`${col.bg} border-l-[3px] ${col.border} rounded-lg p-2.5 h-full`}>
			<p className={`text-[11px] font-bold ${col.text}`}>{course.courseCode} · {course.section}</p>
			<p className="text-xs font-semibold text-foreground mt-0.5 leading-tight line-clamp-2">{course.title}</p>
			<div className="mt-1.5 space-y-0.5">
				<p className="text-[10px] text-muted-foreground flex items-center gap-1">
					<MapPin className="w-3 h-3 shrink-0" /> {course.room || "—"}
				</p>
				<p className="text-[10px] text-muted-foreground flex items-center gap-1">
					<User className="w-3 h-3 shrink-0" /> {teacher}
				</p>
				<p className="text-[10px] text-muted-foreground flex items-center gap-1">
					<Clock className="w-3 h-3 shrink-0" /> {course.startTime} – {course.endTime}
				</p>
			</div>
		</div>
	);
};

// ─── Main Page ────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 15;

const AdminSchedules = () => {
	const [courses, setCourses] = useState<OfferedCourse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [semesters, setSemesters] = useState<string[]>([]);

	const [semester, setSemester] = useState("all");
	const [department, setDepartment] = useState("all");
	const [search, setSearch] = useState("");
	const [view, setView] = useState<"grid" | "list">("grid");
	const [mobileDay, setMobileDay] = useState(() => {
		const idx = WEEK_DAYS.indexOf(todayName());
		return idx >= 0 ? idx : 0;
	});
	const [page, setPage] = useState(1);

	// Fetch all offered courses (up to 5000 — timetable needs full data)
	const fetchCourses = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const params: Record<string, string> = { limit: "5000", page: "1" };
			if (semester !== "all") params.semester = semester;
			const { data } = await api.get("/admin/schedule/offered-courses", { params });
			const list: OfferedCourse[] = data.data?.courses ?? [];
			setCourses(list);

			// Build semester list
			const semSet = new Set<string>(list.map((c) => c.semester).filter(Boolean));
			setSemesters([...semSet].sort().reverse());
		} catch {
			setError("Failed to load schedule data. Please try again.");
		} finally {
			setLoading(false);
		}
	}, [semester]);

	useEffect(() => { fetchCourses(); }, [fetchCourses]);
	useEffect(() => { setPage(1); }, [search, department, semester]);

	// ─── Filtered list ────────────────────────────────────────────────────
	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return courses.filter((c) => {
			if (department !== "all") {
				// Try to infer department from courseCode prefix
				const prefix = c.courseCode?.split(/[-\d]/)[0]?.toUpperCase();
				if (prefix !== department.toUpperCase()) return false;
			}
			if (!q) return true;
			return (
				c.courseCode?.toLowerCase().includes(q) ||
				c.title?.toLowerCase().includes(q) ||
				(c.teacherFullName || c.teacherInitials || "").toLowerCase().includes(q) ||
				c.room?.toLowerCase().includes(q) ||
				c.section?.toLowerCase().includes(q)
			);
		});
	}, [courses, department, search]);

	const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
	const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

	// ─── Timetable grid data ──────────────────────────────────────────────
	const { timeSlots, timetable } = useMemo(() => {
		// Collect all unique time slots
		const slotSet = new Set<string>();
		const grid: Record<string, Record<string, OfferedCourse[]>> = {};

		for (const c of filtered) {
			if (!c.startTime) continue;
			const slot = c.startTime;
			slotSet.add(slot);
			if (!grid[slot]) grid[slot] = {};
			for (const rawDay of (c.days ?? [])) {
				const day = normaliseDay(rawDay);
				if (!WEEK_DAYS.includes(day)) continue;
				if (!grid[slot][day]) grid[slot][day] = [];
				grid[slot][day].push(c);
			}
		}

		// Sort time slots chronologically
		const sortSlot = (s: string) => {
			const [time, ampm] = s.split(" ");
			const [h, m] = time.split(":").map(Number);
			return (ampm === "PM" && h !== 12 ? h + 12 : ampm === "AM" && h === 12 ? 0 : h) * 60 + m;
		};
		const slots = [...slotSet].sort((a, b) => sortSlot(a) - sortSlot(b));
		return { timeSlots: slots, timetable: grid };
	}, [filtered]);

	// Today's classes (for "Today" highlight)
	const today = todayName();
	const todayCourses = useMemo(
		() => filtered.filter((c) => c.days?.some((d) => normaliseDay(d) === today)),
		[filtered, today]
	);

	// ─── Unique dept prefixes ─────────────────────────────────────────────
	const deptPrefixes = useMemo(() => {
		const s = new Set<string>();
		for (const c of courses) {
			const p = c.courseCode?.split(/[-\d]/)[0]?.toUpperCase();
			if (p && p.length >= 2 && p.length <= 5) s.add(p);
		}
		return [...s].sort();
	}, [courses]);

	// ─── Mobile day view ─────────────────────────────────────────────────
	const mobileDayName = WEEK_DAYS[mobileDay];
	const mobileDayEntries = useMemo(() => {
		const map: Record<string, OfferedCourse[]> = {};
		for (const c of filtered) {
			if (!c.days?.some((d) => normaliseDay(d) === mobileDayName)) continue;
			const key = c.startTime || "—";
			if (!map[key]) map[key] = [];
			map[key].push(c);
		}
		return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
	}, [filtered, mobileDayName]);

	// ─── Render ───────────────────────────────────────────────────────────
	return (
		<div className="flex min-h-screen bg-background admin-theme">
			<div className="hidden lg:block">
				<AdminSidebar activePage="Schedules" />
			</div>
			<div className="flex-1 flex flex-col min-w-0">
				<AdminHeader />
				<main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-20 lg:pb-8">

					{/* ── Page Header ── */}
					<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
							<div>
								<h1 className="text-xl md:text-2xl font-bold text-foreground">Academic Schedules</h1>
								<p className="text-muted-foreground text-xs md:text-sm mt-1">
									{loading ? "Loading…" : `${filtered.length} sections across ${semesters.length} semester${semesters.length !== 1 ? "s" : ""}`}
								</p>
							</div>
							<div className="flex gap-2">
								<Button variant="outline" className="rounded-xl gap-2 text-xs md:text-sm">
									<Download className="w-4 h-4" /> Export
								</Button>
								<Button className="rounded-xl gap-2 text-xs md:text-sm">
									<Plus className="w-4 h-4" /> Add New Schedule
								</Button>
							</div>
						</div>
					</motion.div>

					{/* ── Today Summary Banner ── */}
					{!loading && todayCourses.length > 0 && (
						<motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
							<div className="flex items-center gap-3 px-4 py-3 bg-primary/8 border border-primary/20 rounded-xl">
								<div className="p-2 bg-primary/10 rounded-lg shrink-0">
									<BookOpen className="w-4 h-4 text-primary" />
								</div>
								<div>
									<p className="text-sm font-semibold text-foreground">
										{todayCourses.length} class{todayCourses.length !== 1 ? "es" : ""} scheduled today ({today})
									</p>
									<p className="text-xs text-muted-foreground">
										{todayCourses.slice(0, 3).map((c) => `${c.courseCode} § ${c.section}`).join(" · ")}
										{todayCourses.length > 3 ? ` · +${todayCourses.length - 3} more` : ""}
									</p>
								</div>
							</div>
						</motion.div>
					)}

					{/* ── Filters ── */}
					<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
						<Card className="mb-6">
							<CardContent className="p-3 md:p-4">
								<div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
									<div className="relative flex-1">
										<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input
											placeholder="Search by course code, teacher, room, or section…"
											className="pl-9 rounded-xl"
											value={search}
											onChange={(e) => setSearch(e.target.value)}
										/>
									</div>
									<div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 flex-wrap">
										{/* Semester */}
										<Select value={semester} onValueChange={setSemester}>
											<SelectTrigger className="rounded-xl w-[160px] shrink-0 text-xs md:text-sm">
												<SelectValue placeholder="Semester" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Semesters</SelectItem>
												{semesters.map((s) => (
													<SelectItem key={s} value={s}>{s}</SelectItem>
												))}
											</SelectContent>
										</Select>

										{/* Department */}
										<Select value={department} onValueChange={setDepartment}>
											<SelectTrigger className="rounded-xl w-[160px] shrink-0 text-xs md:text-sm">
												<SelectValue placeholder="Department" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="all">All Departments</SelectItem>
												{deptPrefixes.map((d) => (
													<SelectItem key={d} value={d}>{d}</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									{/* View toggle */}
									<div className="hidden md:flex border border-border rounded-xl overflow-hidden shrink-0">
										<button
											onClick={() => setView("grid")}
											className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
										>
											<LayoutGrid className="w-4 h-4" /> Grid
										</button>
										<button
											onClick={() => setView("list")}
											className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
										>
											<List className="w-4 h-4" /> List
										</button>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* ── Loading / Error states ── */}
					{loading && (
						<div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
							<Loader2 className="w-10 h-10 animate-spin text-primary" />
							<p className="text-sm font-medium">Loading schedule data…</p>
						</div>
					)}
					{!loading && error && (
						<div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
							<AlertCircle className="w-10 h-10 text-amber-400" />
							<p className="text-sm font-semibold">{error}</p>
							<Button variant="outline" className="rounded-xl text-xs" onClick={fetchCourses}>Retry</Button>
						</div>
					)}
					{!loading && !error && filtered.length === 0 && (
						<div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
							<BookOpen className="w-12 h-12 opacity-30" />
							<p className="text-base font-semibold text-foreground">No schedules found</p>
							<p className="text-sm">
								{courses.length === 0
									? "No schedule data in the database. Upload a schedule from the Schedule Builder."
									: "Try adjusting your search or filters."}
							</p>
						</div>
					)}

					{/* ── Timetable / List ── */}
					{!loading && !error && filtered.length > 0 && (
						<AnimatePresence mode="wait">
							{view === "grid" && (
								<motion.div
									key="grid"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ delay: 0.05 }}
									className="mb-6"
								>
									{/* === Desktop Timetable === */}
									<Card className="hidden md:block overflow-hidden">
										<div className="overflow-x-auto">
											<table className="w-full border-collapse" style={{ minWidth: 700 }}>
												<thead>
													<tr>
														<th className="w-28 p-3 border-b border-r border-border bg-secondary/50 text-left">
															<Clock className="w-4 h-4 text-muted-foreground mx-auto" />
														</th>
														{WEEK_DAYS.map((d) => (
															<th
																key={d}
																className={`p-3 border-b border-r border-border bg-secondary/50 text-[11px] font-bold uppercase tracking-wider text-center last:border-r-0 ${d === today ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}
															>
																{d === today ? `★ ${d.toUpperCase()}` : d.toUpperCase()}
															</th>
														))}
													</tr>
												</thead>
												<tbody>
													{timeSlots.map((slot) => (
														<tr key={slot}>
															<td className="p-3 border-r border-b border-border text-xs text-muted-foreground font-semibold whitespace-nowrap align-top bg-secondary/20">
																{slot}
															</td>
															{WEEK_DAYS.map((day) => {
																const cells = timetable[slot]?.[day] ?? [];
																return (
																	<td
																		key={day}
																		className={`p-2 border-r border-b border-border align-top last:border-r-0 min-h-[90px] ${day === today ? "bg-primary/[0.02]" : ""}`}
																		style={{ verticalAlign: "top", minWidth: 120 }}
																	>
																		{cells.length > 0 && (
																			<div className="flex flex-col gap-1.5">
																				{cells.map((c) => (
																					<ClassCard key={c._id} course={c} />
																				))}
																			</div>
																		)}
																	</td>
																);
															})}
														</tr>
													))}
													{timeSlots.length === 0 && (
														<tr>
															<td colSpan={6} className="py-16 text-center text-muted-foreground text-sm">
																No classes match the current filters.
															</td>
														</tr>
													)}
												</tbody>
											</table>
										</div>
									</Card>

									{/* === Mobile Day Swiper === */}
									<div className="md:hidden">
										<div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
											{WEEK_DAYS.map((d, i) => (
												<button
													key={d}
													onClick={() => setMobileDay(i)}
													className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${i === mobileDay
															? "bg-primary text-primary-foreground"
															: d === today
																? "bg-primary/15 text-primary border border-primary/30"
																: "bg-secondary text-muted-foreground"
														}`}
												>
													{d.slice(0, 3).toUpperCase()}
													{d === today ? " ★" : ""}
												</button>
											))}
										</div>

										<div className="flex items-center justify-between mb-4">
											<button
												onClick={() => setMobileDay((p) => Math.max(0, p - 1))}
												disabled={mobileDay === 0}
												className="p-2 rounded-xl bg-secondary text-muted-foreground disabled:opacity-30"
											>
												<ChevronLeft className="w-4 h-4" />
											</button>
											<h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
												{mobileDayName}{mobileDayName === today ? " (Today)" : ""}
											</h3>
											<button
												onClick={() => setMobileDay((p) => Math.min(WEEK_DAYS.length - 1, p + 1))}
												disabled={mobileDay === WEEK_DAYS.length - 1}
												className="p-2 rounded-xl bg-secondary text-muted-foreground disabled:opacity-30"
											>
												<ChevronRight className="w-4 h-4" />
											</button>
										</div>

										<div className="space-y-3">
											{mobileDayEntries.length > 0 ? mobileDayEntries.map(([time, cells]) => (
												<div key={time} className="flex gap-3">
													<div className="w-16 shrink-0 text-xs text-muted-foreground font-semibold pt-2 text-right">
														{time}
													</div>
													<div className="flex-1 flex flex-col gap-2">
														{cells.map((c) => {
															const col = colourForCode(c.courseCode);
															const teacher = c.teacherTBA ? "TBA" : (c.teacherFullName || c.teacherInitials);
															return (
																<div key={c._id} className={`${col.bg} border-l-[3px] ${col.border} rounded-xl p-3`}>
																	<div className="flex items-center justify-between mb-1">
																		<span className={`text-[11px] font-bold ${col.text}`}>{c.courseCode} · {c.section}</span>
																		<span className="text-[10px] text-muted-foreground">{c.startTime} – {c.endTime}</span>
																	</div>
																	<p className="text-sm font-semibold text-foreground">{c.title}</p>
																	<div className="flex items-center gap-3 mt-2">
																		<p className="text-[11px] text-muted-foreground flex items-center gap-1">
																			<MapPin className="w-3 h-3" /> {c.room || "—"}
																		</p>
																		<p className="text-[11px] text-muted-foreground flex items-center gap-1">
																			<User className="w-3 h-3" /> {teacher || "—"}
																		</p>
																	</div>
																</div>
															);
														})}
													</div>
												</div>
											)) : (
												<Card>
													<CardContent className="p-8 text-center">
														<Clock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
														<p className="text-sm text-muted-foreground">No classes on {mobileDayName}</p>
													</CardContent>
												</Card>
											)}
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					)}

					{/* ── Active Schedule List ── */}
					{!loading && !error && filtered.length > 0 && (
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
							<Card>
								<CardContent className="p-4 md:p-6">
									<div className="flex items-center justify-between mb-5">
										<h2 className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
											<Users className="w-4 h-4 text-primary" />
											Schedule List
										</h2>
										<span className="text-xs text-primary font-medium">
											{filtered.length} total · showing {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}
										</span>
									</div>

									{/* Desktop */}
									<div className="hidden md:block overflow-x-auto">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead className="text-[10px] font-bold uppercase tracking-wider">Course & Section</TableHead>
													<TableHead className="text-[10px] font-bold uppercase tracking-wider">Teacher</TableHead>
													<TableHead className="text-[10px] font-bold uppercase tracking-wider">Days & Time</TableHead>
													<TableHead className="text-[10px] font-bold uppercase tracking-wider">Room</TableHead>
													<TableHead className="text-[10px] font-bold uppercase tracking-wider">Semester</TableHead>
													<TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Actions</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{paginated.map((s) => {
													const teacher = s.teacherTBA ? "TBA" : (s.teacherFullName || s.teacherInitials || "—");
													const initials = s.teacherTBA ? "TBA" : getInitials(s.teacherFullName || s.teacherInitials || "?");
													const col = colourForCode(s.courseCode);
													const daysStr = (s.days ?? []).map((d) => (DAY_SHORT[d] || DAY_SHORT[normaliseDay(d)] || d.slice(0, 3).toUpperCase())).join(", ");
													return (
														<TableRow key={s._id} className="hover:bg-secondary/30">
															<TableCell>
																<p className="font-semibold text-foreground text-sm">{s.courseCode}: {s.title}</p>
																<p className="text-xs text-muted-foreground">{s.section}{s.isLab ? " · Lab" : ""}</p>
															</TableCell>
															<TableCell>
																<div className="flex items-center gap-2">
																	<span className={`w-7 h-7 ${col.bg} ${col.text} border ${col.border} rounded-full flex items-center justify-center text-[10px] font-bold shrink-0`}>
																		{initials.slice(0, 2)}
																	</span>
																	<span className="text-sm text-foreground">{teacher}</span>
																</div>
															</TableCell>
															<TableCell>
																<div className="flex items-center gap-2 flex-wrap">
																	{daysStr && (
																		<span className="bg-secondary text-[10px] font-bold text-foreground px-2 py-0.5 rounded uppercase tracking-wider">
																			{daysStr}
																		</span>
																	)}
																	<span className="text-sm text-muted-foreground">{s.startTime} – {s.endTime}</span>
																</div>
															</TableCell>
															<TableCell className="text-sm text-foreground">{s.room || "—"}</TableCell>
															<TableCell>
																<span className="text-xs px-2 py-1 bg-secondary rounded-lg text-muted-foreground font-medium">{s.semester}</span>
															</TableCell>
															<TableCell className="text-right">
																<button className="text-primary text-sm font-semibold hover:underline flex items-center gap-1 ml-auto">
																	<Edit2 className="w-3.5 h-3.5" /> Edit
																</button>
															</TableCell>
														</TableRow>
													);
												})}
											</TableBody>
										</Table>
									</div>

									{/* Mobile cards */}
									<div className="md:hidden space-y-3">
										{paginated.map((s) => {
											const teacher = s.teacherTBA ? "TBA" : (s.teacherFullName || s.teacherInitials || "—");
											const col = colourForCode(s.courseCode);
											const daysStr = (s.days ?? []).map((d) => (DAY_SHORT[d] || DAY_SHORT[normaliseDay(d)] || d.slice(0, 3).toUpperCase())).join(", ");
											return (
												<div key={s._id} className="border border-border rounded-xl p-3.5">
													<div className="flex items-start justify-between mb-2">
														<div>
															<p className="font-semibold text-foreground text-sm">{s.courseCode}: {s.title}</p>
															<p className="text-[11px] text-muted-foreground">{s.section}{s.isLab ? " · Lab" : ""}</p>
														</div>
														<button className="text-primary text-xs font-semibold">
															<Edit2 className="w-3.5 h-3.5" />
														</button>
													</div>
													<div className="flex items-center gap-2 mb-2">
														<span className={`w-6 h-6 ${col.bg} ${col.text} border ${col.border} rounded-full flex items-center justify-center text-[9px] font-bold`}>
															{getInitials(s.teacherFullName || s.teacherInitials || "?").slice(0, 2)}
														</span>
														<span className="text-xs text-foreground">{teacher}</span>
													</div>
													<div className="flex items-center justify-between text-[11px] text-muted-foreground">
														<span className="flex items-center gap-1">
															<Clock className="w-3 h-3" />
															{daysStr && <span className="bg-secondary px-1.5 py-0.5 rounded font-bold text-[10px] uppercase text-foreground">{daysStr}</span>}
															{s.startTime} – {s.endTime}
														</span>
														<span className="flex items-center gap-1">
															<MapPin className="w-3 h-3" /> {s.room || "—"}
														</span>
													</div>
												</div>
											);
										})}
									</div>

									{/* Pagination */}
									<div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
										<p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
										<div className="flex gap-1.5">
											<Button variant="outline" size="sm" className="rounded-lg text-xs h-8" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
											<Button variant="outline" size="sm" className="rounded-lg text-xs h-8" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}

					{/* Footer */}
					<div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-border text-xs text-muted-foreground gap-2">
						<div className="flex items-center gap-4">
							<span className="flex items-center gap-1.5">
								<span className="w-2 h-2 rounded-full bg-green-500" /> System Online
							</span>
							<span className="flex items-center gap-1.5">
								<Clock className="w-3 h-3" /> Data from OfferedCourse collection
							</span>
						</div>
						<span>© {new Date().getFullYear()} ULAB One Portal · Admin Dashboard</span>
					</div>
				</main>
			</div>
		</div>
	);
};

export default AdminSchedules;
