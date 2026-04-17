import { CheckCircle, Plus, X, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuickTasks } from "@/hooks/useQuickTasks";

const MobileTasks = () => {
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
		<section className="md:hidden px-4 pt-8 pb-28">
			{/* Section heading */}
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-foreground text-lg font-extrabold tracking-tight flex items-center gap-2">
					<CheckCircle className="w-5 h-5 text-primary" />
					Quick Tasks
				</h3>
				<div className="flex items-center gap-2">
					<span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
						{doneCount}/{totalCount}
					</span>
					{doneCount > 0 && (
						<button
							onClick={clearDone}
							title="Clear completed"
							className="p-1.5 rounded-lg bg-secondary hover:bg-muted transition-all"
						>
							<Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
						</button>
					)}
				</div>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2, duration: 0.35 }}
				className="glass-card bg-card rounded-2xl border border-border p-5 space-y-3"
			>
				{/* Task list */}
				<AnimatePresence initial={false}>
					{tasks.map((task) => (
						<motion.div
							key={task.id}
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2 }}
							className="group flex items-center gap-3"
						>
							{/* Checkbox */}
							<button
								onClick={() => toggle(task.id)}
								className="flex-shrink-0 w-5 h-5 rounded border-2 border-border flex items-center justify-center transition-all"
								style={task.done ? { background: "hsl(var(--primary))", borderColor: "hsl(var(--primary))" } : {}}
							>
								{task.done && (
									<motion.svg
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="w-3 h-3 text-primary-foreground"
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
								className={`flex-1 text-sm font-medium cursor-pointer select-none transition-all ${
									task.done ? "line-through text-muted-foreground" : "text-foreground"
								}`}
								onClick={() => toggle(task.id)}
							>
								{task.text}
							</span>

							{/* Delete */}
							<button
								onClick={() => deleteTask(task.id)}
								className="opacity-0 group-hover:opacity-100 active:opacity-100 p-1.5 rounded-lg hover:bg-secondary transition-all flex-shrink-0"
							>
								<X className="w-3.5 h-3.5 text-muted-foreground" />
							</button>
						</motion.div>
					))}
				</AnimatePresence>

				{tasks.length === 0 && (
					<p className="text-xs text-muted-foreground text-center py-4">
						No tasks yet. Add one below!
					</p>
				)}

				{/* Add input */}
				<AnimatePresence>
					{adding && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="overflow-hidden"
						>
							<div className="flex gap-2 pt-1">
								<input
									ref={inputRef}
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="New task…"
									maxLength={80}
									className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-sm placeholder:text-muted-foreground text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
								/>
								<button
									onClick={handleAdd}
									disabled={!input.trim()}
									className="px-3 py-2 bg-primary text-primary-foreground disabled:opacity-40 rounded-xl transition-all"
								>
									<Plus className="w-4 h-4" />
								</button>
								<button
									onClick={() => { setAdding(false); setInput(""); }}
									className="px-3 py-2 bg-secondary hover:bg-muted rounded-xl transition-all"
								>
									<X className="w-4 h-4 text-muted-foreground" />
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Add button */}
				{!adding && (
					<button
						onClick={openAdding}
						className="w-full mt-1 py-2.5 rounded-xl border border-dashed border-border hover:border-primary hover:bg-primary/5 text-xs font-bold text-muted-foreground hover:text-primary flex items-center justify-center gap-2 transition-all duration-200"
					>
						<Plus className="w-3.5 h-3.5" />
						Add New Task
					</button>
				)}
			</motion.div>
		</section>
	);
};

export default MobileTasks;
