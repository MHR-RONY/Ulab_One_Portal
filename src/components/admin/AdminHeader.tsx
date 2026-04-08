import { Search, Bell } from "lucide-react";
import { motion } from "framer-motion";

const AdminHeader = () => {
	return (
		<motion.header
			initial={{ opacity: 0, y: -8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35 }}
			className="admin-theme h-16 bg-card/85 backdrop-blur-xl border-b border-white/8 flex items-center justify-between px-8 flex-shrink-0 sticky top-0 z-10 shadow-sm shadow-primary/5"
		>
			<div className="flex items-center gap-4 flex-1">
				<div className="relative w-full max-w-sm group">
					<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
					<input
						className="w-full bg-secondary/60 border border-border/40 rounded-xl py-2.5 pl-10 pr-12 text-sm focus:ring-2 focus:ring-primary/25 focus:border-primary/40 focus:bg-card transition-all duration-200 outline-none placeholder:text-muted-foreground/60"
						placeholder="Quick search..."
						type="text"
					/>
					<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-40">
						<kbd className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground">⌘K</kbd>
					</div>
				</div>
			</div>
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
