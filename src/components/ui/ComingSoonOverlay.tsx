import { motion } from "framer-motion";
import { Clock, Sparkles } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface ComingSoonOverlayProps {
	/** Lucide icon to display in the centre */
	icon: LucideIcon;
	/** Page/module name shown in the message */
	moduleName: string;
	/** Short description shown below the title */
	description?: string;
	/** Progress percentage (0-100) */
	progress?: number;
	/** Feature chips to render at the bottom */
	features?: string[];
	/**
	 * Sidebar width offset class (e.g. "md:left-64").
	 * Defaults to "md:left-64" which matches both admin and teacher sidebars.
	 */
	sidebarOffset?: string;
}

const ComingSoonOverlay = ({
	icon: Icon,
	moduleName,
	description,
	progress = 65,
	features = [],
	sidebarOffset = "md:left-64",
}: ComingSoonOverlayProps) => (
	<div className={`fixed inset-0 ${sidebarOffset} z-50 flex items-center justify-center`}>
		{/* Backdrop */}
		<div className="absolute inset-0 bg-background/60 backdrop-blur-[6px]" />

		{/* Card */}
		<motion.div
			initial={{ opacity: 0, scale: 0.85, y: 24 }}
			animate={{ opacity: 1, scale: 1, y: 0 }}
			transition={{ duration: 0.5, type: "spring", stiffness: 120 }}
			className="relative z-10 flex flex-col items-center text-center px-10 py-10 rounded-3xl border border-border bg-card/90 shadow-2xl shadow-primary/10 max-w-sm w-full mx-4"
		>
			{/* Floating icon */}
			<motion.div
				className="relative mb-6 w-24 h-24"
				animate={{ y: [0, -6, 0] }}
				transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
			>
				{/* Pulse ring */}
				<motion.div
					className="absolute inset-0 rounded-full bg-primary/20"
					animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.15, 0.5] }}
					transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
				/>
				<div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
					<div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
						<Icon className="w-8 h-8 text-primary" />
					</div>
				</div>
				{/* Orbiting sparkles */}
				{[0, 120, 240].map((deg, i) => (
					<motion.div
						key={i}
						className="absolute top-0 left-1/2 -translate-x-1/2"
						style={{ originY: "48px" }}
						animate={{ rotate: [deg, deg + 360] }}
						transition={{ duration: 4 + i, repeat: Infinity, ease: "linear" }}
					>
						<Sparkles className="w-3.5 h-3.5 text-primary/50 -mt-1.5" />
					</motion.div>
				))}
			</motion.div>

			{/* Text */}
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2, duration: 0.4 }}
			>
				<h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-2">Coming Soon</h2>
				<p className="text-sm text-muted-foreground leading-relaxed">
					{description ?? (
						<>
							The <span className="font-semibold text-primary">{moduleName}</span> module is
							currently under development. Stay tuned!
						</>
					)}
				</p>
			</motion.div>

			{/* Progress bar */}
			<motion.div
				initial={{ opacity: 0, y: 8 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.35, duration: 0.4 }}
				className="w-full mt-6"
			>
				<div className="flex items-center gap-2 mb-2">
					<Clock className="w-3.5 h-3.5 text-primary" />
					<span className="text-xs font-semibold text-muted-foreground">In Development</span>
					<span className="ml-auto text-xs font-black text-primary">{progress}%</span>
				</div>
				<div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
					<motion.div
						initial={{ width: 0 }}
						animate={{ width: `${progress}%` }}
						transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
						className="h-full bg-primary rounded-full"
					/>
				</div>
			</motion.div>

			{/* Feature chips */}
			{features.length > 0 && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.55, duration: 0.4 }}
					className="flex flex-wrap gap-2 justify-center mt-5"
				>
					{features.map((f) => (
						<span key={f} className="text-[11px] font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
							{f}
						</span>
					))}
				</motion.div>
			)}
		</motion.div>
	</div>
);

export default ComingSoonOverlay;
