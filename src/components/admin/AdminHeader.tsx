import { Bell, Menu, School } from "lucide-react";
import { motion } from "framer-motion";
import { useAdminMobileMenu } from "@/contexts/AdminMobileMenuContext";

const AdminHeader = () => {
	const { toggle } = useAdminMobileMenu();

	return (
		<motion.header
			initial={{ opacity: 0, y: -8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35 }}
			className="admin-theme h-16 bg-card/85 backdrop-blur-xl border-b border-white/8 flex items-center justify-between px-4 md:px-8 flex-shrink-0 sticky top-0 z-10 shadow-sm shadow-primary/5"
		>
			{/* Mobile — logo + hamburger */}
			<div className="flex items-center gap-3 md:hidden">
				<motion.button
					whileTap={{ scale: 0.92 }}
					onClick={toggle}
					className="p-2.5 text-muted-foreground hover:bg-primary/8 hover:text-primary rounded-xl transition-all duration-200"
					aria-label="Open navigation menu"
				>
					<Menu className="w-5 h-5" />
				</motion.button>
				<div className="flex items-center gap-2">
					<div className="bg-primary rounded-xl p-1.5 text-primary-foreground shadow shadow-primary/30">
						<School className="w-4 h-4" />
					</div>
					<span className="text-sm font-extrabold tracking-tight text-foreground">ULAB One</span>
				</div>
			</div>

			{/* Desktop — push bell to the right */}
			<div className="hidden md:block" />

			{/* Bell — always visible */}
			<div className="flex items-center gap-2">
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className="p-2.5 text-muted-foreground hover:bg-primary/8 hover:text-primary rounded-xl relative transition-all duration-200"
					aria-label="Notifications"
				>
					<Bell className="w-5 h-5" />
					<span className="admin-pulse-ring absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
				</motion.button>
			</div>
		</motion.header>
	);
};

export default AdminHeader;
