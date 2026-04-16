import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

export interface DeptStat {
	name: string;
	courses: number;
	notes: number;
}

export interface PendingNote {
	_id: string;
	title: string;
	courseCode: string;
	department: string;
	fileType: string;
	fileSize: string;
	fileUrl: string;
	uploaderName: string;
	status: "pending" | "approved" | "rejected";
	createdAt: string;
}

export interface NoteRepository {
	_id: string;
	courseName: string;
	courseCode: string;
	department: string;
	description?: string;
	noteCount: number;
}

export interface DeptCourse {
	_id: string;
	code: string;
	title: string;
	notes: number;
	upvotes: number;
}

export interface DeptDetail {
	dept: string;
	courses: DeptCourse[];
	totalNotes: number;
	pendingCount: number;
}

export interface RepoNote {
	_id: string;
	title: string;
	courseCode: string;
	fileType: string;
	fileSize: string;
	uploaderName: string;
	upvotes: number;
	week?: string;
	createdAt: string;
}

export function useAdminDepartmentStats() {
	const [stats, setStats] = useState<DeptStat[]>([]);
	const [loading, setLoading] = useState(true);

	const fetchStats = useCallback(async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/resources/stats");
			setStats(data.data as DeptStat[]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStats();
	}, [fetchStats]);

	return { stats, loading, refetch: fetchStats };
}

export function usePendingNotes() {
	const [notes, setNotes] = useState<PendingNote[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);

	const fetchNotes = useCallback(async (p = 1) => {
		setLoading(true);
		try {
			const { data } = await api.get(`/resources/notes/pending?page=${p}&limit=10`);
			setNotes(data.data.notes as PendingNote[]);
			setTotal(data.data.total as number);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchNotes(page);
	}, [fetchNotes, page]);

	const approveNote = async (id: string, feedback?: string) => {
		await api.put(`/resources/notes/${id}/approve`, { feedback: feedback ?? "" });
		await fetchNotes(page);
	};

	const rejectNote = async (id: string, feedback?: string) => {
		await api.put(`/resources/notes/${id}/reject`, { feedback: feedback ?? "" });
		await fetchNotes(page);
	};

	return { notes, total, loading, page, setPage, approveNote, rejectNote, refetch: fetchNotes };
}

export function useCreateRepository() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const createRepository = async (payload: {
		courseName: string;
		courseCode: string;
		department: string;
		description?: string;
	}): Promise<boolean> => {
		setLoading(true);
		setError(null);
		try {
			await api.post("/resources/repository", payload);
			return true;
		} catch (err: unknown) {
			const msg =
				(err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
				"Failed to create repository";
			setError(msg);
			return false;
		} finally {
			setLoading(false);
		}
	};

	return { createRepository, loading, error };
}

export function useDepartmentDetail(deptId: string) {
	const [detail, setDetail] = useState<DeptDetail | null>(null);
	const [loading, setLoading] = useState(true);

	const fetchDetail = useCallback(async () => {
		setLoading(true);
		try {
			const { data } = await api.get(`/resources/department/${deptId}`);
			setDetail(data.data as DeptDetail);
		} finally {
			setLoading(false);
		}
	}, [deptId]);

	useEffect(() => {
		fetchDetail();
	}, [fetchDetail]);

	return { detail, loading, refetch: fetchDetail };
}

export function useRepositoryNotes(repoId: string | null) {
	const [notes, setNotes] = useState<RepoNote[]>([]);
	const [loading, setLoading] = useState(false);

	const fetchNotes = useCallback(async () => {
		if (!repoId) return;
		setLoading(true);
		try {
			const { data } = await api.get(`/resources/repository/${repoId}/notes`);
			setNotes(data.data as RepoNote[]);
		} finally {
			setLoading(false);
		}
	}, [repoId]);

	useEffect(() => {
		fetchNotes();
	}, [fetchNotes]);

	return { notes, loading, refetch: fetchNotes };
}

export function useUpdateRepository() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const updateRepository = async (
		id: string,
		payload: { courseName?: string; courseCode?: string; description?: string }
	): Promise<boolean> => {
		setLoading(true);
		setError(null);
		try {
			await api.put(`/resources/repository/${id}`, payload);
			return true;
		} catch (err: unknown) {
			const msg =
				(err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
				"Failed to update repository";
			setError(msg);
			return false;
		} finally {
			setLoading(false);
		}
	};

	return { updateRepository, loading, error };
}

export function useDeleteRepository() {
	const [loading, setLoading] = useState(false);

	const deleteRepository = async (id: string): Promise<boolean> => {
		setLoading(true);
		try {
			await api.delete(`/resources/repository/${id}`);
			return true;
		} catch {
			return false;
		} finally {
			setLoading(false);
		}
	};

	return { deleteRepository, loading };
}
