import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
	ArrowLeft, Edit, Plus, MoreVertical, Users, Star, CalendarDays,
	CheckSquare, FileText, Film, Code, Download, Eye, Pencil, Upload,
	HelpCircle, ClipboardList, Settings as SettingsIcon, Bell
} from "lucide-react";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import TeacherHeader from "@/components/teacher/TeacherHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import TeacherBottomNav from "@/components/teacher/TeacherBottomNav";

const coursesMap: Record<string, {
	name: string;
	code: string;
	section: string;
	semester: string;
	schedule: string;
	students: number;
	avgGrade: string;
	gradeChange: string;
	attendance: string;
	attendanceChange: string;
	completion: string;
	completionStatus: string;
	studentList: { name: string; initials: string; id: string; grade: string; gradeColor: string; gradeBg: string; attendance: number }[];
	resources: { name: string; sub: string; icon: "pdf" | "video" | "code"; actionIcon: "download" | "eye" | "edit" }[];
	tasks: { title: string; sub: string; action?: string; progress?: { done: number; total: number } }[];
	attendanceTrend: number[];
	gradeDistribution: { label: string; count: number; percent: number; color: string }[];
}> = {
	"CSE-201": {
		name: "Data Structures", code: "CSE-201", section: "Section A", semester: "Spring 2024", schedule: "Mon & Wed, 10:00 AM",
		students: 45, avgGrade: "B+", gradeChange: "-1% this month", attendance: "88%", attendanceChange: "+5% vs Faculty avg", completion: "92%", completionStatus: "On track",
		attendanceTrend: [60, 75, 85, 70, 92, 80],
		gradeDistribution: [
			{ label: "A", count: 12, percent: 25, color: "bg-stat-emerald" },
			{ label: "B", count: 20, percent: 45, color: "bg-primary" },
			{ label: "C", count: 9, percent: 20, color: "bg-stat-amber" },
			{ label: "D/F", count: 4, percent: 10, color: "bg-destructive" },
		],
		studentList: [
			{ name: "Alex Smith", initials: "AS", id: "2021-1-60-001", grade: "A", gradeColor: "text-stat-emerald", gradeBg: "bg-stat-emerald/10", attendance: 95 },
			{ name: "Bella Tuan", initials: "BT", id: "2021-1-60-042", grade: "B-", gradeColor: "text-primary", gradeBg: "bg-primary/10", attendance: 82 },
			{ name: "Chris Rogers", initials: "CR", id: "2021-1-60-089", grade: "D", gradeColor: "text-destructive", gradeBg: "bg-destructive/10", attendance: 65 },
			{ name: "Diana Vance", initials: "DV", id: "2021-1-60-112", grade: "A-", gradeColor: "text-primary", gradeBg: "bg-primary/10", attendance: 90 },
		],
		resources: [
			{ name: "Lecture_05_BST.pdf", sub: "Shared with 45 students", icon: "pdf", actionIcon: "download" },
			{ name: "Sorting_Demo_Visuals.mp4", sub: "Last viewed 2h ago", icon: "video", actionIcon: "eye" },
			{ name: "Assignment_03_Starter.zip", sub: "Uploaded Jan 28", icon: "code", actionIcon: "edit" },
		],
		tasks: [
			{ title: "Quiz 2: Linked Lists", sub: "Tomorrow at 10:00 AM", action: "Manage Students" },
			{ title: "Grade Midterm Papers", sub: "Deadline: Friday 5:00 PM", progress: { done: 15, total: 45 } },
			{ title: "Publish Final Project Specs", sub: "Schedule: Mon, Feb 12" },
		],
	},
	"CSE-305": {
		name: "Algorithms", code: "CSE-305", section: "Section C", semester: "Spring 2024", schedule: "Tue & Thu, 2:00 PM",
		students: 42, avgGrade: "A-", gradeChange: "+2% this month", attendance: "88%", attendanceChange: "+3% vs Faculty avg", completion: "65%", completionStatus: "In progress",
		attendanceTrend: [75, 70, 85, 80, 90, 78],
		gradeDistribution: [
			{ label: "A", count: 15, percent: 35, color: "bg-stat-emerald" },
			{ label: "B", count: 18, percent: 42, color: "bg-primary" },
			{ label: "C", count: 6, percent: 14, color: "bg-stat-amber" },
			{ label: "D/F", count: 3, percent: 7, color: "bg-destructive" },
		],
		studentList: [
			{ name: "Rafiq Ahmed", initials: "RA", id: "2021-1-60-112", grade: "A-", gradeColor: "text-stat-emerald", gradeBg: "bg-stat-emerald/10", attendance: 90 },
			{ name: "Sadia Islam", initials: "SI", id: "2021-1-60-078", grade: "B", gradeColor: "text-primary", gradeBg: "bg-primary/10", attendance: 85 },
		],
		resources: [
			{ name: "Sorting_Notes.pdf", sub: "Shared with 42 students", icon: "pdf", actionIcon: "download" },
		],
		tasks: [
			{ title: "Graph Theory Assignment", sub: "Oct 18, 11:59 PM", action: "Manage Students" },
		],
	},
	"CSE-301": {
		name: "Operating Systems", code: "CSE-301", section: "Section B", semester: "Spring 2024", schedule: "Sun & Tue, 8:30 AM",
		students: 56, avgGrade: "B", gradeChange: "-0.5% this month", attendance: "92%", attendanceChange: "+7% vs Faculty avg", completion: "60%", completionStatus: "In progress",
		attendanceTrend: [85, 88, 75, 92, 80, 95],
		gradeDistribution: [
			{ label: "A", count: 10, percent: 18, color: "bg-stat-emerald" },
			{ label: "B", count: 25, percent: 45, color: "bg-primary" },
			{ label: "C", count: 14, percent: 25, color: "bg-stat-amber" },
			{ label: "D/F", count: 7, percent: 12, color: "bg-destructive" },
		],
		studentList: [
			{ name: "Karim Uddin", initials: "KU", id: "2021-1-60-056", grade: "B+", gradeColor: "text-primary", gradeBg: "bg-primary/10", attendance: 88 },
			{ name: "Fatema Akter", initials: "FA", id: "2021-1-60-091", grade: "A", gradeColor: "text-stat-emerald", gradeBg: "bg-stat-emerald/10", attendance: 96 },
			{ name: "Imran Hossain", initials: "IH", id: "2021-1-60-023", grade: "C+", gradeColor: "text-muted-foreground", gradeBg: "bg-secondary", attendance: 72 },
		],
		resources: [
			{ name: "Process_Mgmt.pdf", sub: "Shared with 56 students", icon: "pdf", actionIcon: "download" },
		],
		tasks: [
			{ title: "OS Lab Report Due", sub: "Oct 15, 5:00 PM", action: "Manage Students" },
		],
	},
};

const resourceIconMap = {
	pdf: { icon: FileText, bg: "bg-primary/10 text-primary" },
	video: { icon: Film, bg: "bg-primary/10 text-primary" },
	code: { icon: Code, bg: "bg-stat-emerald/10 text-stat-emerald" },
};

const actionIconMap = {
	download: Download,
	eye: Eye,
	edit: Pencil,
};

const weekLabels = ["W1", "W2", "W3", "W4", "W5", "W6"];

const TeacherCourseDetail = () => {
	const { courseCode } = useParams<{ courseCode: string }>();
	const navigate = useNavigate();
	const isMobile = useIsMobile();

	const course = coursesMap[courseCode || ""] || coursesMap["CSE-201"];

	const statsCards = [
		{ label: "Total Students", value: String(course.students), change: "+2% from prev. year", positive: true, barColor: "bg-primary", barPercent: 75 },
		{ label: "Avg. Grade", value: course.avgGrade, change: course.gradeChange, positive: false, barColor: "bg-primary", barPercent: 75 },
		{ label: "Avg. Attendance", value: course.attendance, change: course.attendanceChange, positive: true, barColor: "bg-stat-emerald", barPercent: parseInt(course.attendance) },
		{ label: "Completion Rate", value: course.completion, change: course.completionStatus, positive: true, barColor: "bg-primary", barPercent: parseInt(course.completion) },
	];

	// Mobile layout
	if (isMobile) {
		return (
			<div className="min-h-screen bg-background">
				<header className="sticky top-0 z-50 flex items-center bg-card px-4 py-3 border-b border-border justify-between">
					<div className="flex items-center gap-3">
						<button onClick={() => navigate("/teacher/classes")} className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground">
							<ArrowLeft className="w-5 h-5" />
						</button>
						<div>
							<h2 className="text-foreground text-base font-bold leading-tight">{course.name}</h2>
							<p className="text-muted-foreground text-xs">{course.code} • {course.section}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<button className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Bell className="w-5 h-5" /></button>
						<button className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground"><MoreVertical className="w-5 h-5" /></button>
					</div>
				</header>
				<main className="pb-24 p-4 space-y-6">
					{/* Stats */}
					<div className="grid grid-cols-2 gap-3">
						{statsCards.map((s, i) => (
							<motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
								className="bg-card rounded-xl p-4 border border-border shadow-sm">
								<p className="text-muted-foreground text-xs font-medium mb-1">{s.label}</p>
								<p className="text-foreground text-2xl font-bold">{s.value}</p>
								<p className={`text-[10px] font-bold mt-1 ${s.positive ? "text-stat-emerald" : "text-primary"}`}>{s.change}</p>
							</motion.div>
						))}
					</div>
					{/* Students */}
					<div className="space-y-3">
						<h3 className="font-bold text-foreground">Student Performance</h3>
						{course.studentList.map((s, i) => (
							<motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
								className="bg-card p-4 rounded-xl border border-border flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{s.initials}</div>
									<div>
										<p className="text-sm font-bold text-foreground">{s.name}</p>
										<p className="text-[10px] text-muted-foreground">{s.id}</p>
									</div>
								</div>
								<div className="text-right">
									<span className={`px-2 py-0.5 rounded text-xs font-bold ${s.gradeColor} ${s.gradeBg}`}>{s.grade}</span>
									<p className="text-[10px] text-muted-foreground mt-1">{s.attendance}% Att.</p>
								</div>
							</motion.div>
						))}
					</div>
					{/* Tasks */}
					<div className="space-y-3">
						<h3 className="font-bold text-foreground">Upcoming Tasks</h3>
						{course.tasks.map((t, i) => (
							<div key={i} className="bg-primary/5 p-3 rounded-xl border border-primary/20 flex items-center gap-3">
								<div className="size-10 rounded-xl bg-secondary flex items-center justify-center shrink-0"><HelpCircle className="w-5 h-5 text-muted-foreground" /></div>
								<div className="flex-1">
									<p className="text-sm font-bold text-foreground">{t.title}</p>
									<p className="text-[10px] text-muted-foreground">{t.sub}</p>
								</div>
							</div>
						))}
					</div>
				</main>
				<TeacherBottomNav />
			</div>
		);
	}

	// Desktop layout
	return (
		<div className="flex h-screen overflow-hidden premium-bg teacher-theme">
			<div className="hidden md:block">
				<TeacherSidebar activePage="My Classes" />
			</div>
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<TeacherHeader />
				<main className="flex-1 overflow-y-auto p-8 bg-background">
					{/* Page Header */}
					<div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
						<div>
							<button onClick={() => navigate("/teacher/classes")} className="flex items-center gap-2 text-primary font-bold text-sm mb-1 hover:underline">
								<ArrowLeft className="w-4 h-4" /> BACK TO ALL COURSES
							</button>
							<h1 className="text-3xl font-extrabold text-foreground mb-2">{course.name} ({course.code})</h1>
							<div className="flex items-center gap-4 text-muted-foreground text-sm">
								<span className="flex items-center gap-1"><Users className="w-4 h-4" /> {course.section}</span>
								<span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {course.semester}</span>
								<span className="flex items-center gap-1"><CheckSquare className="w-4 h-4" /> {course.schedule}</span>
							</div>
						</div>
						<div className="flex gap-3">
							<button className="flex items-center gap-2 bg-card border border-border px-4 py-2.5 rounded-xl font-bold text-sm text-foreground hover:shadow-sm transition-all">
								<Edit className="w-4 h-4" /> Edit Course
							</button>
							<button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
								<Plus className="w-4 h-4" /> New Assignment
							</button>
						</div>
					</div>

					{/* Stats Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						{statsCards.map((s, i) => (
							<motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
								className="bg-card p-6 rounded-2xl shadow-sm border border-border flex flex-col">
								<span className="text-muted-foreground text-sm font-medium mb-1">{s.label}</span>
								<div className="flex items-end gap-2">
									<span className="text-2xl font-extrabold text-foreground">{s.value}</span>
									<span className={`text-xs font-bold mb-1 ${s.positive ? "text-stat-emerald" : "text-primary"}`}>{s.change}</span>
								</div>
								<div className="mt-4 w-full bg-secondary h-1.5 rounded-full overflow-hidden">
									<div className={`${s.barColor} h-full rounded-full`} style={{ width: `${s.barPercent}%` }} />
								</div>
							</motion.div>
						))}
					</div>

					{/* Main Content: 2/3 + 1/3 */}
					<div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
						{/* Left 2/3 */}
						<div className="xl:col-span-2 space-y-8">
							{/* Student Performance Table */}
							<div className="bg-card rounded-2xl border border-border overflow-hidden">
								<div className="p-6 border-b border-border flex items-center justify-between">
									<h3 className="font-bold text-lg text-foreground">Student Performance</h3>
									<div className="flex items-center gap-4">
										<select className="bg-secondary border-none rounded-lg text-xs font-bold py-1.5 pl-3 pr-8 text-foreground focus:ring-2 focus:ring-primary/20 outline-none">
											<option>Sort by Grade</option>
											<option>Sort by Attendance</option>
											<option>Sort by Name</option>
										</select>
										<button className="text-primary text-sm font-bold">View All</button>
									</div>
								</div>
								<div className="overflow-x-auto">
									<table className="w-full text-left">
										<thead className="bg-secondary/50 text-muted-foreground text-xs font-bold uppercase tracking-wider">
											<tr>
												<th className="px-6 py-4">Student Name</th>
												<th className="px-6 py-4">ID</th>
												<th className="px-6 py-4">Attendance</th>
												<th className="px-6 py-4">Grade</th>
												<th className="px-6 py-4 text-right">Action</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border">
											{course.studentList.map((s, i) => (
												<motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }}
													className="hover:bg-secondary/30 transition-colors">
													<td className="px-6 py-4">
														<div className="flex items-center gap-3">
															<div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{s.initials}</div>
															<span className="text-sm font-semibold text-foreground">{s.name}</span>
														</div>
													</td>
													<td className="px-6 py-4 text-sm text-muted-foreground">{s.id}</td>
													<td className="px-6 py-4">
														<div className="flex items-center gap-2">
															<div className="flex-1 w-24 bg-secondary h-1.5 rounded-full overflow-hidden">
																<div className={`h-full rounded-full ${s.attendance >= 85 ? "bg-stat-emerald" : s.attendance >= 70 ? "bg-primary" : "bg-destructive"}`}
																	style={{ width: `${s.attendance}%` }} />
															</div>
															<span className="text-xs font-bold text-foreground">{s.attendance}%</span>
														</div>
													</td>
													<td className="px-6 py-4">
														<span className={`px-2 py-1 rounded text-xs font-bold ${s.gradeColor} ${s.gradeBg}`}>{s.grade}</span>
													</td>
													<td className="px-6 py-4 text-right">
														<button className="text-muted-foreground hover:text-primary transition-colors"><MoreVertical className="w-4 h-4" /></button>
													</td>
												</motion.tr>
											))}
										</tbody>
									</table>
								</div>
							</div>

							{/* Attendance Trend + Grade Distribution */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								{/* Attendance Trend */}
								<div className="bg-card p-6 rounded-2xl border border-border">
									<h3 className="font-bold text-lg text-foreground mb-6">Attendance Trend</h3>
									<div className="h-48 flex items-end justify-between gap-2 px-2">
										{course.attendanceTrend.map((val, i) => {
											const isHighest = i === course.attendanceTrend.indexOf(Math.max(...course.attendanceTrend));
											return (
												<div key={i} className="flex flex-col items-center gap-2 flex-1">
													<motion.div
														className={`w-full rounded-t-lg relative overflow-hidden ${isHighest ? "bg-primary" : "bg-primary/20"}`}
														initial={{ height: 0 }}
														animate={{ height: `${val}%` }}
														transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
													/>
													<span className={`text-[10px] font-bold ${isHighest ? "text-foreground" : "text-muted-foreground"}`}>{weekLabels[i]}</span>
												</div>
											);
										})}
									</div>
								</div>

								{/* Grade Distribution */}
								<div className="bg-card p-6 rounded-2xl border border-border">
									<h3 className="font-bold text-lg text-foreground mb-6">Grade Distribution</h3>
									<div className="space-y-4">
										{course.gradeDistribution.map((g) => (
											<div key={g.label} className="flex items-center gap-4">
												<span className="text-xs font-bold w-6 text-foreground">{g.label}</span>
												<div className="flex-1 bg-secondary h-4 rounded-full overflow-hidden">
													<motion.div className={`${g.color} h-full rounded-full`} initial={{ width: 0 }} animate={{ width: `${g.percent}%` }} transition={{ delay: 0.4, duration: 0.6 }} />
												</div>
												<span className="text-xs font-bold text-muted-foreground w-8">{g.count}</span>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>

						{/* Right 1/3: Tasks + Materials */}
						<div className="space-y-8">
							{/* Upcoming Tasks */}
							<div className="bg-card p-6 rounded-2xl border border-border">
								<h3 className="font-bold text-lg text-foreground mb-6 flex items-center justify-between">
									Upcoming Tasks
									<span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full uppercase font-bold">{course.tasks.length} New</span>
								</h3>
								<div className="space-y-4">
									{course.tasks.map((t, i) => (
										<div key={i} className="group flex gap-4">
											<div className="flex flex-col items-center">
												<div className="size-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
													<HelpCircle className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
												</div>
												{i < course.tasks.length - 1 && <div className="w-px h-full bg-border mt-2" />}
											</div>
											<div className="pb-6">
												<h4 className="text-sm font-bold text-foreground">{t.title}</h4>
												<p className="text-xs text-muted-foreground mb-2">{t.sub}</p>
												{t.action && <button className="text-xs font-bold text-primary">{t.action}</button>}
												{t.progress && (
													<div className="flex items-center gap-2">
														<div className="flex-1 w-20 bg-secondary h-1 rounded-full overflow-hidden">
															<div className="bg-primary h-full" style={{ width: `${(t.progress.done / t.progress.total) * 100}%` }} />
														</div>
														<span className="text-[10px] font-bold text-foreground">{t.progress.done}/{t.progress.total} done</span>
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Course Materials */}
							<div className="bg-card p-6 rounded-2xl border border-border">
								<h3 className="font-bold text-lg text-foreground mb-6 flex items-center justify-between">
									Course Materials
									<button className="text-muted-foreground hover:text-primary transition-colors"><SettingsIcon className="w-4 h-4" /></button>
								</h3>
								<div className="space-y-3">
									{course.resources.map((r, i) => {
										const rIcon = resourceIconMap[r.icon];
										const ActionIcon = actionIconMap[r.actionIcon];
										return (
											<a key={i} href="#" className="flex items-center p-3 rounded-xl hover:bg-secondary/50 border border-transparent hover:border-border transition-all group">
												<div className={`size-10 rounded-lg flex items-center justify-center mr-3 ${rIcon.bg}`}>
													<rIcon.icon className="w-5 h-5" />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-semibold text-foreground truncate">{r.name}</p>
													<p className="text-[10px] text-muted-foreground">{r.sub}</p>
												</div>
												<ActionIcon className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary" />
											</a>
										);
									})}
									<button className="w-full py-2.5 mt-4 border-2 border-dashed border-border rounded-xl text-muted-foreground text-xs font-bold hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2">
										<Upload className="w-4 h-4" /> Upload Material
									</button>
								</div>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
};

export default TeacherCourseDetail;
