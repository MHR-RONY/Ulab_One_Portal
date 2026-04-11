import { useState } from "react";
import { Link } from "react-router-dom";
import {
	Menu, X, Home, Calendar, FileText, MessageSquare,
	ClipboardCheck, User, Settings, GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
	{ icon: Home, label: "Dashboard", href: "/" },
	{ icon: Calendar, label: "Schedule Builder", href: "/schedule" },
	{ icon: FileText, label: "Notes Library", href: "/notes" },
	{ icon: MessageSquare, label: "Messages", href: "/chat" },
	{ icon: ClipboardCheck, label: "Attendance Tracker", href: "/attendance" },
	{ icon: User, label: "My Profile", href: "/profile" },
	{ icon: Settings, label: "Settings", href: "/settings" },
];

interface MobileMenuDrawerProps {
	activePage?: string;
}

const MobileMenuDrawer = ({ activePage }: MobileMenuDrawerProps) => {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setMenuOpen(true)}
				className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-secondary/70 transition-all duration-200"
			>
				<Menu className="w-5 h-5 text-muted-foreground" />
			</button>

			<AnimatePresence>
				{menuOpen && (
					<div className="fixed inset-0 z-50 flex justify-end">
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 bg-black/30 backdrop-blur-sm"
							onClick={() => setMenuOpen(false)}
						/>
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "spring", damping: 25, stiffness: 300 }}
							className="relative z-50 w-72 bg-card h-screen shadow-2xl flex flex-col border-l border-border/50"
						>
							<div className="p-5 flex items-center justify-between border-b border-border/50">
								<div className="flex items-center gap-2.5">
									<div className="bg-primary rounded-xl p-1.5 text-primary-foreground shadow-lg shadow-primary/20">
										<GraduationCap className="w-5 h-5" />
									</div>
									<span className="text-lg font-extrabold text-primary">ULAB One</span>
								</div>
								<button
									onClick={() => setMenuOpen(false)}
									className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-secondary/70 transition-all duration-200"
								>
									<X className="w-5 h-5 text-muted-foreground" />
								</button>
							</div>
							<nav className="flex-1 p-3 space-y-1 overflow-y-auto">
								{menuItems.map((item, i) => (
									<motion.div
										key={item.label}
										initial={{ opacity: 0, x: 20 }}
										animate={{ opacity: 1, x: 0 }}
										transition={{ delay: i * 0.04, duration: 0.25 }}
									>
										<Link
											to={item.href}
											onClick={() => setMenuOpen(false)}
											className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${activePage === item.label
													? "bg-primary/10 text-primary font-semibold shadow-sm"
													: "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
												}`}
										>
											<item.icon className="w-5 h-5" />
											<span>{item.label}</span>
										</Link>
									</motion.div>
								))}
							</nav>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
};

export default MobileMenuDrawer;
