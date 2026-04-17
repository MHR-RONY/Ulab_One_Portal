import { motion } from "framer-motion";
import { ClipboardList, Clock, Sparkles } from "lucide-react";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import TeacherHeader from "@/components/teacher/TeacherHeader";
import { useIsMobile } from "@/hooks/use-mobile";

const TeacherAssignments = () => {
	const isMobile = useIsMobile();

	const content = (
		<div className="flex-1 flex items-center justify-center p-8">
			<motion.div
				initial={{ opacity: 0, scale: 0.9, y: 20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
				className="text-center max-w-md w-full"
			>
				{/* Animated icon container */}
				<motion.div
					className="relative mx-auto mb-8 w-32 h-32"
					animate={{ y: [0, -8, 0] }}
					transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
				>
					{/* Glow ring */}
					<motion.div
						className="absolute inset-0 rounded-full bg-primary/20"
						animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
						transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
					/>
					<div className="absolute inset-3 rounded-full bg-primary/10 flex items-center justify-center">
						<div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center">
							<ClipboardList className="w-10 h-10 text-primary" />
						</div>
					</div>

					{/* Orbiting sparkles */}
					{[0, 120, 240].map((deg, i) => (
						<motion.div
							key={i}
							className="absolute top-0 left-1/2 -translate-x-1/2"
							style={{ originY: "64px" }}
							animate={{ rotate: [deg, deg + 360] }}
							transition={{ duration: 4 + i, repeat: Infinity, ease: "linear" }}
						>
							<Sparkles className="w-4 h-4 text-primary/60 -mt-2" />
						</motion.div>
					))}
				</motion.div>

				{/* Text content */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.4 }}
				>
					<h2 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight">
						Coming Soon
					</h2>
					<p className="text-muted-foreground text-base leading-relaxed mb-8">
						The <span className="font-semibold text-primary">Assignments</span> module is currently
						under development. Stay tuned — it will include assignment creation, grading,
						submission tracking, and more.
					</p>
				</motion.div>

				{/* Progress indicator */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.35, duration: 0.4 }}
					className="bg-card border border-border rounded-2xl p-6 glass-card"
				>
					<div className="flex items-center gap-3 mb-4">
						<div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
							<Clock className="w-4 h-4 text-primary" />
						</div>
						<div className="text-left">
							<p className="text-sm font-semibold text-foreground">In Development</p>
							<p className="text-xs text-muted-foreground">Expected in next release</p>
						</div>
					</div>
					<div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
						<motion.div
							initial={{ width: 0 }}
							animate={{ width: "65%" }}
							transition={{ delay: 0.5, duration: 1.2, ease: "easeOut" }}
							className="h-full bg-primary rounded-full"
						/>
					</div>
					<p className="text-xs text-muted-foreground mt-2 text-right font-semibold">65% complete</p>
				</motion.div>

				{/* Feature list */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5, duration: 0.4 }}
					className="mt-6 grid grid-cols-1 gap-2"
				>
					{[
						"Create & manage assignments",
						"Track student submissions",
						"Grade and provide feedback",
						"Due date management",
					].map((feature, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
							className="flex items-center gap-3 bg-card/60 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-muted-foreground"
						>
							<span>{feature}</span>
						</motion.div>
					))}
				</motion.div>
			</motion.div>
		</div>
	);

	if (isMobile) {
		return (
			<div className="flex flex-col min-h-screen premium-bg teacher-theme">
				<TeacherHeader />
				{content}
			</div>
		);
	}

	return (
		<div className="flex h-screen overflow-hidden premium-bg teacher-theme">
			<div className="hidden md:block">
				<TeacherSidebar activePage="Assignments" />
			</div>
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<TeacherHeader />
				<main className="flex-1 overflow-y-auto flex flex-col">
					{content}
				</main>
			</div>
		</div>
	);
};

export default TeacherAssignments;
