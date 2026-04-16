import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
	Users, GraduationCap, BookOpen, LayoutGrid,
	FileText, CheckCircle2, Clock, RefreshCw,
	ChevronRight, Award, Layers, ArrowRight, AlertCircle,
} from "lucide-react";
import {
	BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell,
} from "recharts";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import api from "@/lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────
interface DashboardStats {
	totalStudents: number;
	totalTeachers: number;
	totalAdmins: number;
	pendingNotes: number;
	approvedNotes: number;
	totalSections: number;
	recentPendingNotes: Array<{
		_id: string;
		title: string;
		uploaderName: string;
		courseCode: string;
		department: string;
		createdAt: string;
	}>;
	studentsByDept: Array<{ _id: string; count: number }>;
	notesByDept: Array<{ _id: string; count: number }>;
	sectionsBySemester: Array<{ _id: string; count: number }>;
	fetchedAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(iso: string): string {
	const diff = Date.now() - new Date(iso).getTime();
	const m = Math.floor(diff / 60_000);
	if (m < 1) return "just now";
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	return `${Math.floor(h / 24)}d ago`;
}

function useLiveClock() {
	const [now, setNow] = useState(new Date());
	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);
	return now;
}

// Colour palette for bars / accents
const DEPT_COLOURS = ["#f45c25", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6", "#ec4899"];

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skel = ({ className = "" }: { className?: string }) => (
	<div className={`bg-secondary animate-pulse rounded-xl ${className}`} />
);

// ─── Main ─────────────────────────────────────────────────────────────────────
const AdminDashboard = () => {
	const navigate = useNavigate();
	const now = useLiveClock();

	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

	const fetchStats = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const { data } = await api.get("/admin/dashboard-stats");
			setStats(data.data);
			setLastRefresh(new Date());
		} catch {
			setError("Failed to load dashboard data.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => { fetchStats(); }, [fetchStats]);

	// ── Stat cards config ─────────────────────────────────────────────────
	const statCards = stats ? [
		{
			icon: Users,
			label: "Total Students",
			value: stats.totalStudents.toLocaleString(),
			sub: `${stats.studentsByDept.length} departments`,
			color: "text-primary bg-primary/10",
			href: "/admin/students",
		},
		{
			icon: GraduationCap,
			label: "Total Teachers",
			value: stats.totalTeachers.toLocaleString(),
			sub: `+ ${stats.totalAdmins} admin${stats.totalAdmins !== 1 ? "s" : ""}`,
			color: "text-violet-500 bg-violet-500/10",
			href: "/admin/teachers",
		},
		{
			icon: FileText,
			label: "Pending Notes",
			value: stats.pendingNotes.toLocaleString(),
			sub: `${stats.approvedNotes} approved`,
			color: "text-amber-500 bg-amber-500/10",
			href: "/admin/resources",
			urgent: stats.pendingNotes > 0,
		},
		{
			icon: LayoutGrid,
			label: "Schedule Sections",
			value: stats.totalSections.toLocaleString(),
			sub: `${stats.sectionsBySemester.length} semester${stats.sectionsBySemester.length !== 1 ? "s" : ""}`,
			color: "text-emerald-500 bg-emerald-500/10",
			href: "/admin/schedules",
		},
	] : [];

	// ── Department bars ───────────────────────────────────────────────────
	const deptMax = stats ? Math.max(...stats.studentsByDept.map((d) => d.count), 1) : 1;

	// ── Semester chart data ───────────────────────────────────────────────
	const semChart = stats
		? [...stats.sectionsBySemester].reverse().map((s) => ({
			name: s._id.replace(/20\d\d/, (y) => `'${y.slice(2)}`),
			sections: s.count,
		}))
		: [];

	return (
		<div className="flex h-screen overflow-hidden premium-bg admin-theme">
			{/* Sidebar */}
			<div className="hidden md:block">
				<AdminSidebar activePage="Dashboard" />
			</div>

			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<AdminHeader />

				<main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6 pb-20 md:pb-8">

					{/* ── Page Header ── */}
					<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
						<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
							<div>
								<h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
									Dashboard Overview
								</h1>
								<p className="text-muted-foreground text-sm mt-0.5">
									{now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
									{" · "}
									<span className="font-mono">{now.toLocaleTimeString()}</span>
								</p>
							</div>
							<button
								onClick={fetchStats}
								disabled={loading}
								className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 text-xs font-semibold transition-colors disabled:opacity-50 self-start sm:self-auto"
							>
								<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
								{lastRefresh ? `Refreshed ${timeAgo(lastRefresh.toISOString())}` : "Refresh"}
							</button>
						</div>
					</motion.div>

					{/* ── Error banner ── */}
					{error && (
						<div className="flex items-center gap-3 px-4 py-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm">
							<AlertCircle className="w-4 h-4 shrink-0" />
							{error}
							<button onClick={fetchStats} className="ml-auto underline text-xs">Retry</button>
						</div>
					)}

					{/* ── Stat Cards ── */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
						{loading
							? Array.from({ length: 4 }).map((_, i) => (
								<Skel key={i} className="h-[130px]" />
							))
							: statCards.map((card, i) => (
								<motion.div
									key={card.label}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.06 }}
									onClick={() => navigate(card.href)}
									className="relative bg-card p-5 rounded-2xl border border-border cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group overflow-hidden"
								>
									{/* urgent pulse ring */}
									{card.urgent && (
										<span className="absolute top-3 right-3 flex h-2.5 w-2.5">
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
											<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
										</span>
									)}
									<div className="flex items-start justify-between mb-4">
										<div className={`p-2.5 rounded-xl ${card.color}`}>
											<card.icon className="w-5 h-5" />
										</div>
										<ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
									</div>
									<p className="text-muted-foreground text-sm font-medium">{card.label}</p>
									<h3 className="text-2xl font-extrabold text-foreground mt-0.5">{card.value}</h3>
									<p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
								</motion.div>
							))}
					</div>

					{/* ── Middle Row: chart + dept breakdown ── */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

						{/* Sections by Semester bar chart */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.28 }}
							className="lg:col-span-2 bg-card rounded-2xl border border-border p-5"
						>
							<div className="flex items-center justify-between mb-5">
								<div>
									<h4 className="font-bold text-base text-foreground">Schedule Sections by Semester</h4>
									<p className="text-xs text-muted-foreground mt-0.5">Total offered course sections per semester</p>
								</div>
								<button
									onClick={() => navigate("/admin/schedules")}
									className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
								>
									View <ArrowRight className="w-3.5 h-3.5" />
								</button>
							</div>

							{loading ? (
								<div className="h-[200px] flex items-center justify-center">
									<Skel className="w-full h-full" />
								</div>
							) : semChart.length === 0 ? (
								<div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground gap-2">
									<Layers className="w-8 h-8 opacity-30" />
									<p className="text-sm">No schedule data uploaded yet</p>
									<button onClick={() => navigate("/admin/schedule-builder")} className="text-xs text-primary hover:underline">
										Upload a schedule →
									</button>
								</div>
							) : (
								<div className="h-[200px]">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={semChart} barSize={28}>
											<XAxis
												dataKey="name"
												axisLine={false}
												tickLine={false}
												tick={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
											/>
											<YAxis hide />
											<Tooltip
												contentStyle={{
													background: "hsl(var(--card))",
													border: "1px solid hsl(var(--border))",
													borderRadius: "12px",
													fontSize: "12px",
													fontWeight: 700,
												}}
												cursor={{ fill: "hsl(var(--secondary))" }}
											/>
											<Bar dataKey="sections" radius={[6, 6, 0, 0]}>
												{semChart.map((_, i) => (
													<Cell key={i} fill={DEPT_COLOURS[i % DEPT_COLOURS.length]} />
												))}
											</Bar>
										</BarChart>
									</ResponsiveContainer>
								</div>
							)}
						</motion.div>

						{/* Students by Department */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.34 }}
							className="bg-primary rounded-2xl p-5 text-primary-foreground flex flex-col"
						>
							<div className="flex items-center justify-between mb-4">
								<h4 className="font-bold text-base opacity-90">Students by Department</h4>
								<Award className="w-5 h-5 opacity-60" />
							</div>

							{loading ? (
								<div className="flex-1 space-y-3 mt-2">
									{Array.from({ length: 3 }).map((_, i) => (
										<Skel key={i} className="h-8 bg-primary-foreground/20" />
									))}
								</div>
							) : stats && stats.studentsByDept.length === 0 ? (
								<div className="flex-1 flex items-center justify-center text-primary-foreground/60 text-sm">
									No student data yet
								</div>
							) : (
								<div className="flex-1 space-y-3 mt-1">
									{(stats?.studentsByDept ?? []).slice(0, 5).map((d, i) => {
										const pct = Math.round((d.count / deptMax) * 100);
										return (
											<div key={d._id ?? i}>
												<div className="flex justify-between text-sm font-semibold mb-1 opacity-90">
													<span>{d._id || "Unknown"}</span>
													<span>{d.count.toLocaleString()}</span>
												</div>
												<div className="w-full bg-primary-foreground/20 h-2 rounded-full overflow-hidden">
													<motion.div
														initial={{ width: 0 }}
														animate={{ width: `${pct}%` }}
														transition={{ delay: 0.5 + i * 0.1, duration: 0.7, ease: "easeOut" }}
														className="h-full rounded-full bg-primary-foreground"
													/>
												</div>
											</div>
										);
									})}
								</div>
							)}

							<div className="mt-4 pt-4 border-t border-primary-foreground/20 flex items-center justify-between">
								<span className="text-sm font-bold opacity-80">Total Enrolled</span>
								<span className="text-xl font-extrabold">
									{loading ? "—" : stats?.totalStudents.toLocaleString()}
								</span>
							</div>
						</motion.div>
					</div>

					{/* ── Bottom Row: Pending Notes + Notes by Dept ── */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

						{/* Pending Notes quick-action */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
							className="lg:col-span-2 bg-card rounded-2xl border border-border p-5"
						>
							<div className="flex items-center justify-between mb-5">
								<h4 className="font-bold text-base text-foreground flex items-center gap-2">
									<FileText className="w-4 h-4 text-amber-500" />
									Pending Document Approvals
									{stats && stats.pendingNotes > 0 && (
										<span className="ml-1 text-xs font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full">
											{stats.pendingNotes}
										</span>
									)}
								</h4>
								<button
									onClick={() => navigate("/admin/resources")}
									className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
								>
									View all <ArrowRight className="w-3.5 h-3.5" />
								</button>
							</div>

							{loading ? (
								<div className="space-y-3">
									{Array.from({ length: 3 }).map((_, i) => <Skel key={i} className="h-16" />)}
								</div>
							) : !stats || stats.recentPendingNotes.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
									<CheckCircle2 className="w-10 h-10 text-emerald-400" />
									<p className="text-sm font-semibold text-foreground">All caught up!</p>
									<p className="text-xs">No documents waiting for approval.</p>
								</div>
							) : (
								<div className="space-y-2">
									{stats.recentPendingNotes.map((note) => (
										<div
											key={note._id}
											onClick={() => navigate("/admin/resources")}
											className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/60 transition-colors cursor-pointer group"
										>
											<div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
												<FileText className="w-4 h-4" />
											</div>
											<div className="flex-1 min-w-0">
												<p className="text-sm font-semibold text-foreground truncate">{note.title}</p>
												<p className="text-xs text-muted-foreground">
													{note.uploaderName} · {note.courseCode} · {note.department}
												</p>
											</div>
											<div className="flex items-center gap-3 shrink-0">
												<span className="text-[11px] text-muted-foreground flex items-center gap-1">
													<Clock className="w-3 h-3" />
													{timeAgo(note.createdAt)}
												</span>
												<ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
											</div>
										</div>
									))}
								</div>
							)}
						</motion.div>

						{/* Notes by Department */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.46 }}
							className="bg-card rounded-2xl border border-border p-5 flex flex-col"
						>
							<div className="flex items-center justify-between mb-5">
								<h4 className="font-bold text-base text-foreground flex items-center gap-2">
									<BookOpen className="w-4 h-4 text-primary" />
									Approved Notes
								</h4>
								<span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
									{loading ? "—" : stats?.approvedNotes}
								</span>
							</div>

							{loading ? (
								<div className="space-y-3 flex-1">
									{Array.from({ length: 4 }).map((_, i) => <Skel key={i} className="h-8" />)}
								</div>
							) : !stats || stats.notesByDept.length === 0 ? (
								<div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2">
									<BookOpen className="w-8 h-8 opacity-30" />
									<p className="text-sm">No approved notes yet</p>
								</div>
							) : (
								<div className="flex-1 space-y-3">
									{stats.notesByDept.slice(0, 6).map((d, i) => {
										const total = stats.notesByDept.reduce((a, b) => a + b.count, 0) || 1;
										const pct = Math.round((d.count / total) * 100);
										return (
											<div key={d._id ?? i}>
												<div className="flex justify-between text-xs font-semibold mb-1 text-foreground">
													<span>{d._id || "Other"}</span>
													<span className="text-muted-foreground">{d.count} · {pct}%</span>
												</div>
												<div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
													<motion.div
														initial={{ width: 0 }}
														animate={{ width: `${pct}%` }}
														transition={{ delay: 0.5 + i * 0.08, duration: 0.6, ease: "easeOut" }}
														className="h-full rounded-full"
														style={{ backgroundColor: DEPT_COLOURS[i % DEPT_COLOURS.length] }}
													/>
												</div>
											</div>
										);
									})}
								</div>
							)}

							<button
								onClick={() => navigate("/admin/resources")}
								className="mt-4 text-xs text-primary font-semibold hover:underline flex items-center gap-1"
							>
								Manage resources <ArrowRight className="w-3 h-3" />
							</button>
						</motion.div>
					</div>

					{/* Footer */}
					<div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-border text-xs text-muted-foreground gap-2">
						<div className="flex items-center gap-4">
							<span className="flex items-center gap-1.5">
								<span className="w-2 h-2 rounded-full bg-emerald-500" /> System Online
							</span>
							{lastRefresh && (
								<span className="flex items-center gap-1.5">
									<Clock className="w-3 h-3" /> Last refreshed {timeAgo(lastRefresh.toISOString())}
								</span>
							)}
						</div>
						<span>© {new Date().getFullYear()} ULAB One Portal · Admin Dashboard</span>
					</div>

				</main>
			</div>
		</div>
	);
};

export default AdminDashboard;
