import {
	LayoutDashboard, Users, GraduationCap, BookOpen, Grid3X3,
	CalendarDays, FileText, MessageSquare, BarChart3, Settings,
	Wrench, LogOut, School, Shield, Server
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api, { setAccessToken } from "@/lib/api";

const navSections = [
	{
		label: "Main Menu",
		items: [
			{ icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
		],
	},
	{
		label: "User Management",
		items: [
			{ icon: Users, label: "Students", href: "/admin/students" },
			{ icon: GraduationCap, label: "Teachers", href: "/admin/teachers" },
		],
	},
	{
		label: "Academic",
		items: [
			{ icon: BookOpen, label: "Subjects", href: "/admin/subjects" },
			{ icon: Grid3X3, label: "Sections", href: "/admin/sections" },
			{ icon: CalendarDays, label: "Schedules", href: "/admin/schedules" },
		],
	},
	{
		label: "Content",
		items: [
			{ icon: FileText, label: "Notes & Resources", href: "/admin/resources" },
			{ icon: MessageSquare, label: "Messenger", href: "/admin/messenger" },
		],
	},
	{
		label: "System",
		items: [
			{ icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
			{ icon: Shield, label: "Admin Roles", href: "/admin/management" },
			{ icon: Settings, label: "Settings", href: "/admin/settings" },
			{ icon: Wrench, label: "Maintenance", href: "/admin/maintenance" },
			{ icon: Server, label: "Infrastructure", href: "/admin/infrastructure" },
		],
	},
];

interface AdminSidebarProps {
	activePage?: string;
}

const AdminSidebar = ({ activePage = "Dashboard" }: AdminSidebarProps) => {
	const navigate = useNavigate();

	return (
		<aside className="w-72 h-screen flex-shrink-0 border-r border-border bg-card/80 backdrop-blur-xl flex flex-col sticky top-0">
			<div className="p-6 flex items-center gap-3">
				<div className="bg-primary rounded-xl p-2 text-primary-foreground shadow-lg shadow-primary/20">
					<School className="w-6 h-6" />
				</div>
				<div>
					<h1 className="text-lg font-extrabold tracking-tight text-foreground">ULAB One</h1>
					<p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Admin Portal</p>
				</div>
			</div>

			<nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
				{navSections.map((section, si) => (
					<div key={section.label}>
						<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 pb-2 mt-4">
							{section.label}
						</p>
						{section.items.map((item, i) => (
							<motion.div
								key={item.label}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: (si * 3 + i) * 0.03, duration: 0.3 }}
							>
								<Link
									to={item.href}
									className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${activePage === item.label
											? "bg-primary/10 text-primary font-semibold"
											: "text-muted-foreground hover:bg-secondary hover:text-foreground"
										}`}
								>
									<item.icon className="w-5 h-5" />
									<span>{item.label}</span>
								</Link>
							</motion.div>
						))}
					</div>
				))}
			</nav>

			<div className="p-4 border-t border-border space-y-3">
				<div className="flex items-center gap-3 px-2">
					<div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-primary/10">
						AR
					</div>
					<div className="flex flex-col min-w-0">
						<span className="text-sm font-bold text-foreground truncate">Alex Rivera</span>
						<span className="text-xs text-muted-foreground">Super Admin</span>
					</div>
				</div>
				<button
					onClick={async () => {
						try { await api.post("/auth/logout"); } catch { /* ignore */ }
						setAccessToken(null);
						navigate("/admin/login");
					}}
					className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 text-sm font-semibold"
				>
					<LogOut className="w-4 h-4" />
					<span>Logout</span>
				</button>
			</div>
		</aside>
	);
};

export default AdminSidebar;
