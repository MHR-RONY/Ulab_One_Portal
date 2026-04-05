import {
	LayoutDashboard, Users, GraduationCap, BookOpen, Grid3X3,
	CalendarDays, FileText, MessageSquare, BarChart3, Settings,
	Wrench, LogOut, School, Shield, Server, HardDriveUpload, ChevronRight
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
			{ icon: HardDriveUpload, label: "Schedule Builder", href: "/admin/schedule-builder" },
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
		<aside className="admin-theme admin-sidebar-glossy w-72 h-screen flex-shrink-0 border-r border-white/10 flex flex-col sticky top-0 overflow-hidden">
			{/* Logo */}
			<motion.div
				initial={{ opacity: 0, y: -8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="p-6 flex items-center gap-3 border-b border-white/8"
			>
				<div className="relative">
					<div className="bg-primary rounded-xl p-2 text-primary-foreground shadow-lg shadow-primary/30 animate-admin-glow-pulse">
						<School className="w-6 h-6" />
					</div>
				</div>
				<div>
					<h1 className="text-lg font-extrabold tracking-tight text-foreground">ULAB One</h1>
					<p className="text-[10px] text-primary/70 font-semibold uppercase tracking-widest">Admin Portal</p>
				</div>
			</motion.div>

			<nav className="flex-1 px-4 py-3 space-y-0.5 overflow-y-auto scrollbar-none">
				{navSections.map((section, si) => (
					<div key={section.label}>
						<p className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-widest px-3 pb-1.5 mt-5 first:mt-2">
							{section.label}
						</p>
						{section.items.map((item, i) => {
							const isActive = activePage === item.label;
							return (
								<motion.div
									key={item.label}
									initial={{ opacity: 0, x: -14 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: (si * 3 + i) * 0.025, duration: 0.32, ease: "easeOut" }}
									whileHover={{ x: 3 }}
								>
									<Link
										to={item.href}
										className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm group ${
											isActive
												? "admin-nav-active text-primary font-semibold"
												: "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
										}`}
									>
										{isActive && (
											<span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full shadow-sm shadow-primary/50" />
										)}
										<item.icon className={`w-4 h-4 transition-all duration-200 ${isActive ? "text-primary" : "group-hover:text-primary/70"}`} />
										<span className="flex-1">{item.label}</span>
										{isActive && <ChevronRight className="w-3 h-3 text-primary/60" />}
									</Link>
								</motion.div>
							);
						})}
					</div>
				))}
			</nav>

			<div className="p-4 border-t border-white/8 space-y-3">
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
					className="flex items-center gap-3 px-2 py-1"
				>
					<div className="admin-avatar-glow w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs">
						AR
					</div>
					<div className="flex flex-col min-w-0">
						<span className="text-sm font-bold text-foreground truncate">Alex Rivera</span>
						<span className="text-xs text-primary/60 font-medium">Super Admin</span>
					</div>
				</motion.div>
				<button
					onClick={async () => {
						try { await api.post("/auth/logout"); } catch { /* ignore */ }
						setAccessToken(null);
						navigate("/admin/login");
					}}
					className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/8 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 text-sm font-semibold"
				>
					<LogOut className="w-4 h-4" />
					<span>Logout</span>
				</button>
			</div>
		</aside>
	);
};

export default AdminSidebar;
