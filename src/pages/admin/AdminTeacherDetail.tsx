import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
	ArrowLeft, MessageSquare, Briefcase,
	Clock, User, TrendingUp, Settings, Mail,
	AlertTriangle, Users, Loader2
} from "lucide-react";
import api from "@/lib/api";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import TeacherOverviewTab from "@/components/admin/TeacherOverviewTab";
import TeacherPerformanceTab from "@/components/admin/TeacherPerformanceTab";
import TeacherAccountTab from "@/components/admin/TeacherAccountTab";
import TeacherSettingsTab from "@/components/admin/TeacherSettingsTab";

interface TeacherData {
	name: string; email: string; id: string; department: string;
	status: string; avatar: string; avatarColor: string;
	title: string; joinedDate: string; phone: string;
	office: string; expertise: string[]; education: string;
	totalStudents: number; coursesThisSemester: number;
	avgRating: number; researchPapers: number;
}

const AVATAR_COLORS = [
	"bg-primary/15 text-primary",
	"bg-chart-2/15 text-chart-2",
	"bg-chart-3/15 text-chart-3",
	"bg-chart-4/15 text-chart-4",
	"bg-destructive/15 text-destructive",
];

const getInitials = (name: string) => {
	const parts = name.trim().split(" ");
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const tabs = [
	{ id: "overview", label: "Overview", icon: User },
	{ id: "performance", label: "Student Performance", icon: TrendingUp },
	{ id: "account", label: "Account", icon: Users },
	{ id: "settings", label: "Settings", icon: Settings },
];

const AdminTeacherDetail = () => {
	const { teacherId } = useParams();
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("overview");
	const [teacher, setTeacher] = useState<TeacherData | null>(null);
	const [loading, setLoading] = useState(true);
	const [loadError, setLoadError] = useState("");

	useEffect(() => {
		const fetchTeacher = async () => {
			if (!teacherId) {
				setLoadError("Invalid teacher ID.");
				setLoading(false);
				return;
			}
			try {
				const { data } = await api.get(`/admin/teacher/${teacherId}`);
				const raw = data.data as {
					_id: string; name: string; email: string; teacherId: string;
					department: string; createdAt: string;
				};
				const joined = new Date(raw.createdAt).toLocaleDateString("en-US", {
					month: "short", year: "numeric",
				});
				setTeacher({
					name: raw.name,
					email: raw.email,
					id: raw.teacherId,
					department: raw.department,
					status: "Active",
					avatar: getInitials(raw.name),
					avatarColor: AVATAR_COLORS[raw.name.charCodeAt(0) % AVATAR_COLORS.length],
					title: "Faculty Member",
					joinedDate: joined,
					phone: "N/A",
					office: "N/A",
					expertise: [],
					education: "N/A",
					totalStudents: 0,
					coursesThisSemester: 0,
					avgRating: 0,
					researchPapers: 0,
				});
			} catch {
				setLoadError("Teacher not found or failed to load.");
			} finally {
				setLoading(false);
			}
		};
		fetchTeacher();
	}, [teacherId]);

	if (loading) {
		return (
			<div className="flex h-screen overflow-hidden bg-background">
				<div className="hidden md:block"><AdminSidebar activePage="Teachers" /></div>
				<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
					<AdminHeader />
					<main className="flex-1 flex items-center justify-center">
						<Loader2 className="w-8 h-8 animate-spin text-primary" />
					</main>
				</div>
			</div>
		);
	}

	if (loadError || !teacher) {
		return (
			<div className="flex h-screen overflow-hidden bg-background">
				<div className="hidden md:block"><AdminSidebar activePage="Teachers" /></div>
				<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
					<AdminHeader />
					<main className="flex-1 flex items-center justify-center">
						<div className="text-center">
							<AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
							<h2 className="text-2xl font-extrabold text-foreground mb-2">Teacher Not Found</h2>
							<p className="text-muted-foreground mb-6">{loadError || "The teacher does not exist in our records."}</p>
							<button onClick={() => navigate("/admin/teachers")}
								className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
								Back to Directory
							</button>
						</div>
					</main>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen overflow-hidden bg-background admin-theme">
			<div className="hidden md:block"><AdminSidebar activePage="Teachers" /></div>
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<AdminHeader />
				<main className="flex-1 overflow-y-auto">
					<div className="max-w-[1200px] mx-auto w-full px-4 md:px-10 py-8">

						<button onClick={() => navigate("/admin/teachers")}
							className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold mb-6">
							<ArrowLeft className="w-4 h-4" /> Back to Teacher Directory
						</button>

						{/* Profile Header */}
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
							className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6">
							<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
								<div className="flex items-center gap-6">
									<div className="relative">
										<div className={`w-24 h-24 rounded-2xl ${teacher.avatarColor} flex items-center justify-center font-extrabold text-2xl border-4 border-secondary shadow-lg flex-shrink-0`}>
											{teacher.avatar}
										</div>
										{teacher.status === "Active" && (
											<span className="absolute -bottom-1 -right-1 border-4 border-card rounded-full w-6 h-6 bg-green-500" />
										)}
									</div>
									<div>
										<div className="flex items-center gap-3 flex-wrap">
											<h1 className="text-2xl font-bold text-foreground">{teacher.name}</h1>
											<span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${teacher.status === "Active" ? "bg-primary/10 text-primary" : "bg-chart-4/10 text-chart-4"
												}`}>{teacher.status}</span>
										</div>
										<p className="text-muted-foreground text-base mt-1">{teacher.title} · Department of {teacher.department}</p>
										<div className="flex items-center gap-4 mt-2 flex-wrap">
											<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
												<Briefcase className="w-3.5 h-3.5" /> ID: {teacher.id}
											</span>
											<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
												<Mail className="w-3.5 h-3.5" /> {teacher.email}
											</span>
											<span className="flex items-center gap-1.5 text-sm text-muted-foreground">
												<Clock className="w-3.5 h-3.5" /> Joined: {teacher.joinedDate}
											</span>
										</div>
									</div>
								</div>
								<div className="flex gap-3 w-full md:w-auto">
									<button className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-secondary transition-colors">
										Edit Records
									</button>
									<button className="flex-1 md:flex-none flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
										<MessageSquare className="w-4 h-4" /> Message
									</button>
								</div>
							</div>
						</motion.div>

						{/* Tabs */}
						<div className="flex border-b border-border mb-8 overflow-x-auto">
							{tabs.map((tab) => (
								<button key={tab.id} onClick={() => setActiveTab(tab.id)}
									className={`flex items-center gap-2 px-6 py-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
											? "border-primary text-primary font-bold"
											: "border-transparent text-muted-foreground hover:text-foreground"
										}`}>
									<tab.icon className="w-4 h-4" />
									{tab.label}
								</button>
							))}
						</div>

						{/* Tab Content */}
						{activeTab === "overview" && <TeacherOverviewTab teacher={teacher} />}
						{activeTab === "performance" && <TeacherPerformanceTab />}
						{activeTab === "account" && <TeacherAccountTab teacher={teacher} />}
						{activeTab === "settings" && <TeacherSettingsTab />}

					</div>
				</main>
			</div>
		</div>
	);
};

export default AdminTeacherDetail;
