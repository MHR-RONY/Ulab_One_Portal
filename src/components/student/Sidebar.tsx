import { useState, useEffect, useCallback } from "react";
import { BookOpen, Calendar, FileText, MessageSquare, ClipboardCheck, User, Settings, LogOut, GraduationCap, ChevronDown, Users } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api, { setAccessToken } from "@/lib/api";

const navItems = [
	{ icon: BookOpen, label: "Dashboard", href: "/" },
	{ icon: Calendar, label: "Schedule Builder", href: "/schedule" },
	{ icon: FileText, label: "Notes Library", href: "/notes" },
	{ icon: ClipboardCheck, label: "Attendance Tracker", href: "/attendance" },
];

const messageSubItems = [
	{ icon: User, label: "Personal", href: "/chat?tab=personal" },
	{ icon: Users, label: "Groups", href: "/chat?tab=groups" },
];

const bottomItems = [
	{ icon: User, label: "My Profile", href: "/profile" },
	{ icon: Settings, label: "Settings", href: "/settings" },
];

interface SidebarProps {
	activePage?: string;
}

const Sidebar = ({ activePage = "Dashboard" }: SidebarProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [messagesOpen, setMessagesOpen] = useState(
		activePage === "Messages" || location.pathname === "/chat"
	);
	const [personalUnread, setPersonalUnread] = useState(0);
	const [groupUnread, setGroupUnread] = useState(0);

	const fetchUnreadCounts = useCallback(async () => {
		try {
			const [convRes, groupRes] = await Promise.all([
				api.get("/chat/conversations"),
				api.get("/chat/groups"),
			]);
			if (convRes.data.success) {
				const total = (convRes.data.data as Array<{ unreadCount: number }>).reduce(
					(sum, c) => sum + c.unreadCount, 0
				);
				setPersonalUnread(total);
			}
			if (groupRes.data.success) {
				const total = (groupRes.data.data as Array<{ unreadCount: number }>).reduce(
					(sum, g) => sum + g.unreadCount, 0
				);
				setGroupUnread(total);
			}
		} catch {
			// Silently fail
		}
	}, []);

	useEffect(() => {
		fetchUnreadCounts();
		const interval = setInterval(fetchUnreadCounts, 30000);
		return () => clearInterval(interval);
	}, [fetchUnreadCounts]);

	const handleLogout = async () => {
		try {
			await api.post("/auth/logout");
		} catch {
			// ignore errors — still clear local session
		}
		setAccessToken(null);
		navigate("/login");
	};

	return (
		<aside className="w-72 h-screen flex-shrink-0 border-r border-border bg-card/80 backdrop-blur-xl flex flex-col sticky top-0">
			<div className="p-6 flex items-center gap-3">
				<div className="bg-primary rounded-xl p-2 text-primary-foreground shadow-lg shadow-primary/20">
					<GraduationCap className="w-6 h-6" />
				</div>
				<div>
					<h1 className="text-xl font-extrabold tracking-tight text-primary">ULAB One</h1>
					<p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student Portal</p>
				</div>
			</div>

			<nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
				{navItems.map((item, i) => (
					<motion.div
						key={item.label}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: i * 0.04, duration: 0.3 }}
					>
						<Link
							to={item.href}
							className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${activePage === item.label
								? "bg-primary/10 text-primary font-semibold shadow-sm"
								: "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-0.5"
								}`}
						>
							<item.icon className="w-5 h-5" />
							<span>{item.label}</span>
						</Link>
					</motion.div>
				))}

				{/* Messages collapsible */}
				<motion.div
					initial={{ opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ delay: navItems.length * 0.04, duration: 0.3 }}
				>
					<button
						onClick={() => setMessagesOpen(!messagesOpen)}
						className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm w-full ${activePage === "Messages"
							? "bg-primary/10 text-primary font-semibold shadow-sm"
							: "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-0.5"
							}`}
					>
						<MessageSquare className="w-5 h-5" />
						<span>Messages</span>
						<div className="ml-auto flex items-center gap-1.5">
							{(personalUnread + groupUnread) > 0 && (
								<span className="flex items-center justify-center min-w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold px-1.5">
									{personalUnread + groupUnread}
								</span>
							)}
							<motion.div
								animate={{ rotate: messagesOpen ? 180 : 0 }}
								transition={{ duration: 0.2 }}
							>
								<ChevronDown className="w-4 h-4" />
							</motion.div>
						</div>
					</button>

					<AnimatePresence>
						{messagesOpen && (
							<motion.div
								initial={{ height: 0, opacity: 0 }}
								animate={{ height: "auto", opacity: 1 }}
								exit={{ height: 0, opacity: 0 }}
								transition={{ duration: 0.2 }}
								className="overflow-hidden"
							>
								<div className="ml-4 pl-3 border-l-2 border-primary/20 mt-1 space-y-0.5">
									{messageSubItems.map((sub) => {
										const isActive =
											location.pathname === "/chat" &&
											location.search.includes(`tab=${sub.label.toLowerCase()}`);
										return (
											<Link
												key={sub.label}
												to={sub.href}
												className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActive
													? "bg-primary/10 text-primary font-semibold"
													: "text-muted-foreground hover:bg-secondary hover:text-foreground"
													}`}
											>
												<sub.icon className="w-4 h-4" />
												<span>{sub.label}</span>
												{(() => {
													const count = sub.label === "Personal" ? personalUnread : groupUnread;
													return count > 0 ? (
														<span className="ml-auto flex items-center justify-center min-w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-1">
															{count}
														</span>
													) : null;
												})()}
											</Link>
										);
									})}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>

				<div className="pt-4 pb-2">
					<div className="h-px bg-border mx-4" />
				</div>

				{bottomItems.map((item, i) => (
					<motion.div
						key={item.label}
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.3 + i * 0.04, duration: 0.3 }}
					>
						<Link
							to={item.href}
							className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${activePage === item.label
								? "bg-primary/10 text-primary font-semibold shadow-sm"
								: "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-0.5"
								}`}
						>
							<item.icon className="w-5 h-5" />
							<span>{item.label}</span>
						</Link>
					</motion.div>
				))}
			</nav>

			<div className="p-4 border-t border-border space-y-2">
				<button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/5 transition-all duration-200 hover:translate-x-0.5" onClick={handleLogout}>
					<LogOut className="w-5 h-5" />
					<span className="text-sm font-medium">Logout</span>
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
