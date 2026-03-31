import { Home, BookOpen, Calendar, User, MessageSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
	{ icon: Home, label: "Home", href: "/" },
	{ icon: BookOpen, label: "Courses", href: "/notes" },
	{ icon: MessageSquare, label: "Messages", href: "/chat" },
	{ icon: Calendar, label: "Schedule", href: "/schedule" },
	{ icon: User, label: "Profile", href: "/profile" },
];

const BottomNav = () => {
	const location = useLocation();

	return (
		<nav className="md:hidden fixed bottom-0 left-0 right-0 z-20">
			<div className="flex items-end border-t border-border/40 bg-card/90 backdrop-blur-2xl px-2 pb-safe pt-2 shadow-[0_-8px_30px_-4px_hsl(0_0%_0%/0.10)]">
				{navItems.map((item) => {
					const isActive = location.pathname === item.href;
					return (
						<Link
							key={item.label}
							to={item.href}
							className="flex flex-1 flex-col items-center justify-end gap-1 py-1 transition-all duration-200"
						>
							<div
								className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200 ${isActive
										? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110"
										: "text-muted-foreground hover:text-primary hover:bg-primary/8"
									}`}
							>
								<item.icon className="w-5 h-5" />
							</div>
							<p
								className={`text-[10px] font-semibold tracking-wide transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"
									}`}
							>
								{item.label}
							</p>
						</Link>
					);
				})}
			</div>
		</nav>
	);
};

export default BottomNav;
