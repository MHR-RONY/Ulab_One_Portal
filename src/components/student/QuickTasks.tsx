import { CheckCircle, Plus, X, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuickTasks } from "@/hooks/useQuickTasks";

const QuickTasks = () => {
	const { tasks, toggle, addTask, deleteTask, clearDone, doneCount, totalCount } = useQuickTasks();
	const [adding, setAdding] = useState(false);
	const [input, setInput] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const handleAdd = () => {
		if (input.trim()) {
			addTask(input);
			setInput("");
			setAdding(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") handleAdd();
		if (e.key === "Escape") { setAdding(false); setInput(""); }
	};

	const openAdding = () => {
		setAdding(true);
		setTimeout(() => inputRef.current?.focus(), 50);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.55, duration: 0.4 }}
			className="bg-primary rounded-2xl p-6 text-primary-foreground shadow-xl shadow-primary/15 relative overflow-hidden"
		>
			{/* Glossy overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none rounded-2xl" />

			{/* Header */}
			<div className="flex items-center justify-between mb-4 relative z-10">
				<h3 className="font-bold text-lg flex items-center gap-2">
					<CheckCircle className="w-5 h-5" />
					Quick Tasks
				</h3>
				<div className="flex items-center gap-2">
					{/* Progress badge */}
					<span className="text-xs font-bold bg-primary-foreground/15 px-2.5 py-1 rounded-full">
						{doneCount}/{totalCount}
					</span>
					{/* Clear done */}
					{doneCount > 0 && (
						<button
							onClick={clearDone}
							title="Clear completed"
							className="p-1.5 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all"
						>
							<Trash2 className="w-3.5 h-3.5" />
						</button>
					)}
				</div>
			</div>

			{/* Task list */}
			<div className="space-y-2.5 relative z-10 max-h-48 overflow-y-auto pr-0.5">
				<AnimatePresence initial={false}>
					{tasks.map((task) => (
						<motion.div
							key={task.id}
							initial={{ opacity: 0, height: 0, marginBottom: 0 }}
							animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2 }}
							className="group flex items-center gap-3"
						>
							{/* Custom checkbox */}
							<button
								onClick={() => toggle(task.id)}
								className="flex-shrink-0 w-5 h-5 rounded border-2 border-primary-foreground/40 bg-primary-foreground/10 flex items-center justify-center transition-all hover:border-primary-foreground"
								style={task.done ? { background: "rgba(255,255,255,0.85)", borderColor: "rgba(255,255,255,0.85)" } : {}}
							>
								{task.done && (
									<motion.svg
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="w-3 h-3 text-primary"
										fill="none"
										viewBox="0 0 12 12"
									>
										<polyline
											points="2,6 5,9 10,3"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</motion.svg>
								)}
							</button>

							<span
								className={`flex-1 text-sm font-medium transition-all cursor-pointer select-none ${
									task.done ? "line-through opacity-50" : "opacity-100"
								}`}
								onClick={() => toggle(task.id)}
							>
								{task.text}
							</span>

							{/* Delete */}
							<button
								onClick={() => deleteTask(task.id)}
								className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-primary-foreground/20 transition-all flex-shrink-0"
								title="Delete task"
							>
								<X className="w-3.5 h-3.5" />
							</button>
						</motion.div>
					))}
				</AnimatePresence>

				{tasks.length === 0 && (
					<p className="text-xs text-primary-foreground/50 text-center py-3">
						No tasks yet. Add one below!
					</p>
				)}
			</div>

			{/* Add input */}
			<AnimatePresence>
				{adding && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="relative z-10 mt-3 overflow-hidden"
					>
						<div className="flex gap-2">
							<input
								ref={inputRef}
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={handleKeyDown}
								placeholder="Type a task and press Enter…"
								maxLength={80}
								className="flex-1 bg-primary-foreground/10 border border-primary-foreground/20 rounded-xl px-3 py-2 text-sm placeholder:text-primary-foreground/40 text-primary-foreground focus:outline-none focus:border-primary-foreground/50 transition-all"
							/>
							<button
								onClick={handleAdd}
								disabled={!input.trim()}
								className="px-3 py-2 bg-primary-foreground/20 hover:bg-primary-foreground/30 disabled:opacity-40 rounded-xl transition-all"
							>
								<Plus className="w-4 h-4" />
							</button>
							<button
								onClick={() => { setAdding(false); setInput(""); }}
								className="px-3 py-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl transition-all"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* CTA button */}
			{!adding && (
				<button
					onClick={openAdding}
					className="relative z-10 w-full mt-5 py-2.5 px-4 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 backdrop-blur-sm flex items-center justify-center gap-2"
				>
					<Plus className="w-3.5 h-3.5" />
					Add New Task
				</button>
			)}
		</motion.div>
	);
};

export default QuickTasks;
