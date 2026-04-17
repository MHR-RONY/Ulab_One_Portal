import { useState, useEffect, useCallback } from "react";

export interface Task {
	id: string;
	text: string;
	done: boolean;
	createdAt: number;
}

const STORAGE_KEY = "student-quick-tasks";

const DEFAULT_TASKS: Task[] = [
	{ id: "1", text: "Submit DBMS Project", done: true, createdAt: Date.now() - 3 },
	{ id: "2", text: "Prep for Calculus Quiz", done: true, createdAt: Date.now() - 2 },
	{ id: "3", text: "Email Prof regarding Lab 5", done: false, createdAt: Date.now() - 1 },
];

const load = (): Task[] => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw) return JSON.parse(raw) as Task[];
	} catch { /* ignore */ }
	return DEFAULT_TASKS;
};

const save = (tasks: Task[]) => {
	try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch { /* ignore */ }
};

export const useQuickTasks = () => {
	const [tasks, setTasks] = useState<Task[]>(load);

	// Persist on every change
	useEffect(() => { save(tasks); }, [tasks]);

	const toggle = useCallback((id: string) => {
		setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
	}, []);

	const addTask = useCallback((text: string) => {
		const trimmed = text.trim();
		if (!trimmed) return;
		setTasks((prev) => [
			...prev,
			{ id: crypto.randomUUID(), text: trimmed, done: false, createdAt: Date.now() },
		]);
	}, []);

	const deleteTask = useCallback((id: string) => {
		setTasks((prev) => prev.filter((t) => t.id !== id));
	}, []);

	const clearDone = useCallback(() => {
		setTasks((prev) => prev.filter((t) => !t.done));
	}, []);

	const doneCount = tasks.filter((t) => t.done).length;
	const totalCount = tasks.length;

	return { tasks, toggle, addTask, deleteTask, clearDone, doneCount, totalCount };
};
