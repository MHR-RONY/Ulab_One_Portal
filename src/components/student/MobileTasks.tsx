import { ClipboardList } from "lucide-react";
import { motion } from "framer-motion";

const MobileTasks = () => {
	return (
		<section className="md:hidden px-4 pt-8 pb-28">
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-foreground text-lg font-extrabold tracking-tight">Upcoming Tasks</h3>
			</div>
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2, duration: 0.35 }}
				className="flex flex-col items-center justify-center py-10 glass-card bg-card rounded-2xl border border-border"
			>
				<div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-3">
					<ClipboardList className="w-6 h-6 text-muted-foreground" />
				</div>
				<p className="text-sm font-bold text-foreground">Coming Soon</p>
				<p className="text-xs text-muted-foreground mt-1">Task management is on the way</p>
			</motion.div>
		</section>
	);
};

export default MobileTasks;
