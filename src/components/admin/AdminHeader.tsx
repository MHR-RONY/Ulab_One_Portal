import { Bell } from "lucide-react";
import { motion } from "framer-motion";

const AdminHeader = () => {
	return (
		<motion.header
			initial={{ opacity: 0, y: -8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35 }}
			className="admin-theme h-16 bg-card/85 backdrop-blur-xl border-b border-white/8 flex items-center justify-end px-8 flex-shrink-0 sticky top-0 z-10 shadow-sm shadow-primary/5"
		>
			<div className="flex items-center gap-2">
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					className="p-2.5 text-muted-foreground hover:bg-primary/8 hover:text-primary rounded-xl relative transition-all duration-200"
				>
					<Bell className="w-5 h-5" />
					<span className="admin-pulse-ring absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card" />
				</motion.button>
			</div>
		</motion.header>
	);
};

export default AdminHeader;
