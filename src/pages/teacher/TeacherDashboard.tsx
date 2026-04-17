import { motion } from "framer-motion";
import {
	Users, BookOpen, HelpCircle, Zap, TrendingUp,
	Download, Plus, Trophy, AlertTriangle, GraduationCap, BarChart3
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import { useTeacherDashboard } from "@/hooks/useTeacherDashboard";
import {
	Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip,
	Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import TeacherHeader from "@/components/teacher/TeacherHeader";
import MobileTeacherDashboard from "@/components/teacher/MobileTeacherDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

// Static engagement radar data (kept representative until a proper API exists)
const engagementData = [
	{ subject: "Quizzes", A: 85 },
	{ subject: "Submission", A: 90 },
	{ subject: "Participation", A: 65 },
	{ subject: "Forum Activity", A: 70 },
];

// Attendance trend placeholder (kept as illustrative until attendance API supports aggregation)
const attendanceData = [
	{ week: "WK 01", value: 75 },
	{ week: "WK 04", value: 80 },
	{ week: "WK 06", value: 78 },
	{ week: "WK 08", value: 82 },
	{ week: "WK 10", value: 81 },
	{ week: "WK 12", value: 88 },
	{ week: "WK 14", value: 85 },
	{ week: "WK 16", value: 90 },
];

const TeacherDashboard = () => {
	const isMobile = useIsMobile();
	const { profile, loading: profileLoading } = useTeacherProfile();
	const { stats, loading: statsLoading } = useTeacherDashboard();
	const loading = profileLoading || statsLoading;

	// Build stat cards from live data
	const buildStats = () => {
		if (!stats) return [];
		return [
			{
				icon: Users,
				label: "Total Students",
				value: stats.totalStudents.toLocaleString(),
				change: `${stats.totalCourses} course${stats.totalCourses !== 1 ? "s" : ""}`,
				positive: true,
				colorClass: "text-primary bg-primary/10",
			},
			{
				icon: BookOpen,
				label: "Active Courses",
				value: String(stats.totalCourses),
				change: "Active this semester",
				positive: true,
				colorClass: "text-stat-blue bg-stat-blue/10",
			},
			{
				icon: HelpCircle,
				label: "Avg. Students/Course",
				value: String(stats.avgStudentsPerCourse),
				change: "Per class section",
				positive: true,
				colorClass: "text-stat-amber bg-stat-amber/10",
			},
			{
				icon: Zap,
				label: "Largest Class",
				value: stats.largestCourse
					? `${stats.largestCourse.enrolledStudents.length}`
					: "—",
				change: stats.largestCourse
					? `${stats.largestCourse.courseCode}`
					: "No courses yet",
				positive: stats.largestCourse !== null,
				colorClass: "text-stat-purple bg-stat-purple/10",
			},
		];
	};

	const statCards = buildStats();

	const mainContent = (
		<div className="p-4 md:p-8 space-y-8">
			{/* Academic Overview Header */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="flex flex-col md:flex-row md:items-center justify-between gap-4"
			>
				<div>
					<h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Academic Overview</h2>
					<p className="text-muted-foreground text-sm mt-0.5">
						Spring Semester 2024 • {profile?.department ?? "Department"}
					</p>
				</div>
				<div className="flex gap-2">
					<button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-all">
						<Download className="w-4 h-4" /> Export Report
					</button>
					<button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] transition-all">
						<Plus className="w-4 h-4" /> New Announcement
					</button>
				</div>
			</motion.div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
				{statCards.length > 0 ? statCards.map((stat, i) => (
					<motion.div
						key={stat.label}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: i * 0.06, duration: 0.4 }}
						className="glass-card bg-card p-6 rounded-2xl border border-border"
					>
						<div className="flex justify-between items-start mb-4">
							<div className={`p-2.5 rounded-xl ${stat.colorClass}`}>
								<stat.icon className="w-5 h-5" />
							</div>
							<span className={`text-xs font-bold ${stat.positive ? "text-stat-emerald" : "text-destructive"}`}>
								{stat.change}
							</span>
						</div>
						<p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
						<h3 className="text-2xl font-extrabold text-foreground mt-1">{stat.value}</h3>
					</motion.div>
				)) : (
					// Empty state when no courses
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="col-span-4 text-center py-12 text-muted-foreground"
					>
						<GraduationCap className="w-12 h-12 mx-auto mb-3 text-primary/30" />
						<p className="font-semibold text-foreground">No courses yet</p>
						<p className="text-sm mt-1">Create your first course in <Link to="/teacher/classes" className="text-primary font-medium hover:underline">My Classes</Link>.</p>
					</motion.div>
				)}
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Attendance Trends */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3, duration: 0.4 }}
					className="lg:col-span-2 glass-card bg-card p-6 rounded-2xl border border-border"
				>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h4 className="font-bold text-lg text-foreground">Class Attendance Trends</h4>
							<p className="text-muted-foreground text-sm">Weekly percentage over current semester</p>
						</div>
						<select className="bg-secondary border-none rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-none">
							<option>Last 6 Months</option>
							<option>Last 3 Months</option>
						</select>
					</div>
					<div className="h-[240px]">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart data={attendanceData}>
								<defs>
									<linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
										<stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
										<stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
									</linearGradient>
								</defs>
								<XAxis
									dataKey="week"
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
								/>
								<YAxis hide domain={[60, 100]} />
								<Tooltip
									contentStyle={{
										background: "hsl(var(--card))",
										border: "1px solid hsl(var(--border))",
										borderRadius: "12px",
										fontSize: "12px",
										fontWeight: 700,
									}}
								/>
								<Area
									type="monotone"
									dataKey="value"
									stroke="hsl(var(--primary))"
									strokeWidth={3}
									fill="url(#attendanceGrad)"
									dot={{ fill: "hsl(var(--card))", stroke: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
									activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
								/>
							</AreaChart>
						</ResponsiveContainer>
					</div>
				</motion.div>

				{/* Student Engagement Radar */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4, duration: 0.4 }}
					className="glass-card bg-card p-6 rounded-2xl border border-border flex flex-col"
				>
					<h4 className="font-bold text-lg text-foreground">Student Engagement</h4>
					<p className="text-muted-foreground text-sm mb-4">Metrics comparison</p>
					<div className="flex-1 flex items-center justify-center">
						<ResponsiveContainer width="100%" height={200}>
							<RadarChart data={engagementData} cx="50%" cy="50%" outerRadius="70%">
								<PolarGrid stroke="hsl(var(--border))" />
								<PolarAngleAxis
									dataKey="subject"
									tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
								/>
								<PolarRadiusAxis hide />
								<Radar
									dataKey="A"
									stroke="hsl(var(--primary))"
									fill="hsl(var(--primary))"
									fillOpacity={0.25}
									strokeWidth={2}
								/>
							</RadarChart>
						</ResponsiveContainer>
					</div>
					<div className="space-y-2 mt-2">
						<div className="flex justify-between items-center text-sm">
							<span className="text-muted-foreground">Avg. Score</span>
							<span className="font-bold text-foreground">78%</span>
						</div>
						<div className="flex justify-between items-center text-sm">
							<span className="text-muted-foreground">Completion</span>
							<span className="font-bold text-foreground">94%</span>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Performance Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Section Performance - Live */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 0.4 }}
					className="glass-card bg-card p-6 rounded-2xl border border-border"
				>
					<div className="flex items-center gap-2 mb-1">
						<BarChart3 className="w-5 h-5 text-primary" />
						<h4 className="font-bold text-lg text-foreground">Section Performance</h4>
					</div>
					<p className="text-muted-foreground text-sm mb-6">Student enrollment by course section</p>

					{stats && stats.sections.length > 0 ? (
						<div className="space-y-5">
							{stats.sections.map((section, i) => (
								<div key={section.name} className="space-y-2">
									<div className="flex justify-between text-xs font-bold">
										<span className="text-foreground truncate max-w-[65%]">{section.name}</span>
										<span className="text-foreground">{section.studentCount} students</span>
									</div>
									<div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
										<motion.div
											initial={{ width: 0 }}
											animate={{ width: `${section.percent}%` }}
											transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: "easeOut" }}
											className={`h-full rounded-full ${section.color}`}
										/>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
							<GraduationCap className="w-10 h-10 text-primary/25 mb-2" />
							<p className="text-sm">No course sections yet.</p>
							<Link to="/teacher/classes" className="text-xs text-primary font-semibold mt-1 hover:underline">
								Go to My Classes →
							</Link>
						</div>
					)}
				</motion.div>

				{/* Top Performers & At Risk */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Enrolled Students */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.55, duration: 0.4 }}
						className="glass-card bg-card p-6 rounded-2xl border border-border"
					>
						<div className="flex items-center gap-2 mb-5">
							<Trophy className="w-5 h-5 text-stat-amber" />
							<h4 className="font-bold text-foreground">Recent Students</h4>
						</div>
						<div className="space-y-4">
							{stats && stats.recentStudents.length > 0 ? (
								stats.recentStudents.map((s) => (
									<div key={s.name + s.course} className="flex items-center justify-between gap-2">
										<div className="flex items-center gap-2.5 min-w-0">
											<div className="w-8 h-8 rounded-full bg-primary/15 flex-shrink-0 flex items-center justify-center text-primary text-[10px] font-bold ring-2 ring-primary/10">
												{s.initials}
											</div>
											<div className="min-w-0">
												<p className="text-sm font-medium text-foreground truncate">{s.name}</p>
												<p className="text-[10px] text-muted-foreground truncate">{s.course}</p>
											</div>
										</div>
									</div>
								))
							) : (
								<p className="text-sm text-muted-foreground text-center py-4">No students enrolled yet.</p>
							)}
						</div>
					</motion.div>

					{/* Quick Actions */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6, duration: 0.4 }}
						className="glass-card bg-card p-6 rounded-2xl border border-border"
					>
						<div className="flex items-center gap-2 mb-5">
							<AlertTriangle className="w-5 h-5 text-stat-amber" />
							<h4 className="font-bold text-foreground">Quick Actions</h4>
						</div>
						<div className="space-y-3">
							{[
								{ label: "Take Attendance", href: "/teacher/attendance", color: "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground" },
								{ label: "View Classes", href: "/teacher/classes", color: "bg-stat-blue/10 text-stat-blue hover:bg-stat-blue hover:text-white" },
								{ label: "Analytics", href: "/teacher/analytics", color: "bg-stat-purple/10 text-stat-purple hover:bg-stat-purple hover:text-white" },
								{ label: "Messages", href: "/teacher/chat", color: "bg-stat-emerald/10 text-stat-emerald hover:bg-stat-emerald hover:text-white" },
							].map((action) => (
								<Link
									key={action.label}
									to={action.href}
									className={`flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${action.color}`}
								>
									{action.label}
								</Link>
							))}
						</div>
					</motion.div>
				</div>
			</div>
		</div>
	);

	const skeletonContent = (
		<div className="p-4 md:p-8 space-y-8 animate-pulse">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="space-y-2">
					<div className="h-8 w-60 bg-muted rounded-lg" />
					<div className="h-4 w-44 bg-muted/60 rounded" />
				</div>
				<div className="flex gap-2">
					<div className="h-10 w-32 bg-muted rounded-xl" />
					<div className="h-10 w-36 bg-muted rounded-xl" />
				</div>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="bg-card p-6 rounded-2xl border border-border space-y-4">
						<div className="flex justify-between">
							<div className="w-10 h-10 rounded-xl bg-muted" />
							<div className="h-4 w-16 bg-muted rounded" />
						</div>
						<div className="h-3 w-24 bg-muted/70 rounded" />
						<div className="h-7 w-20 bg-muted rounded-lg" />
					</div>
				))}
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 bg-card rounded-2xl border border-border h-64" />
				<div className="bg-card rounded-2xl border border-border h-64" />
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-card rounded-2xl border border-border p-6 space-y-4">
					<div className="h-5 w-40 bg-muted rounded" />
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="space-y-1.5">
							<div className="flex justify-between">
								<div className="h-3 w-40 bg-muted/70 rounded" />
								<div className="h-3 w-16 bg-muted/70 rounded" />
							</div>
							<div className="h-2 bg-muted rounded-full" />
						</div>
					))}
				</div>
				<div className="grid grid-cols-2 gap-6">
					<div className="bg-card rounded-2xl border border-border h-48" />
					<div className="bg-card rounded-2xl border border-border h-48" />
				</div>
			</div>
		</div>
	);

	if (isMobile) {
		return <MobileTeacherDashboard teacherName={profile?.name ?? ""} />;
	}

	return (
		<div className="flex h-screen overflow-hidden premium-bg teacher-theme">
			<div className="hidden md:block">
				<TeacherSidebar activePage="Dashboard" />
			</div>
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<TeacherHeader />
				<main className="flex-1 overflow-y-auto">{loading ? skeletonContent : mainContent}</main>
			</div>
		</div>
	);
};

export default TeacherDashboard;
