import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";

// ---------- Shared types ----------

export interface NotePreview {
	_id: string;
	title: string;
	fileType: string;
	upvotes: number;
}

export interface NoteRepository {
	_id: string;
	courseName: string;
	courseCode: string;
	department: string;
	description?: string;
	noteCount: number;
	topNotes: NotePreview[];
	createdAt: string;
	updatedAt: string;
}

export interface NoteItem {
	_id: string;
	title: string;
	description: string;
	repository: string;
	courseCode: string;
	department: string;
	fileType: string;
	fileSize: string;
	fileUrl: string;
	uploadedBy: string;
	uploaderName: string;
	status: string;
	upvotes: number;
	userVote: 0 | 1 | -1; // current authenticated user's vote (from server)
	week?: string;
	createdAt: string;
	updatedAt: string;
}

// ---------- Hook: fetch all repositories ----------

export function useNoteRepositories(department?: string) {
	const [repos, setRepos] = useState<NoteRepository[]>([]);
	const [loading, setLoading] = useState(true);

	const fetch = useCallback(async () => {
		setLoading(true);
		try {
			const params = department && department !== "All Departments" ? { department } : {};
			const { data } = await api.get("/student-notes/repositories", { params });
			setRepos(data.data ?? []);
		} catch {
			setRepos([]);
		} finally {
			setLoading(false);
		}
	}, [department]);

	useEffect(() => {
		fetch();
	}, [fetch]);

	return { repos, loading, refetch: fetch };
}

// ---------- Hook: fetch single repository ----------

export function useRepositoryDetail(repoId: string | undefined) {
	const [repo, setRepo] = useState<NoteRepository | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!repoId) {
			setLoading(false);
			return;
		}
		let cancelled = false;
		(async () => {
			setLoading(true);
			try {
				const { data } = await api.get(`/student-notes/repository/${repoId}`);
				if (!cancelled) setRepo(data.data ?? null);
			} catch {
				if (!cancelled) setRepo(null);
			} finally {
				if (!cancelled) setLoading(false);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [repoId]);

	return { repo, loading };
}

// ---------- Hook: fetch notes for a repository ----------

export function useRepositoryNotes(repoId: string | undefined) {
	const [notes, setNotes] = useState<NoteItem[]>([]);
	const [loading, setLoading] = useState(true);

	const fetch = useCallback(async () => {
		if (!repoId) {
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const { data } = await api.get(`/student-notes/repository/${repoId}/notes`);
			setNotes(data.data ?? []);
		} catch {
			setNotes([]);
		} finally {
			setLoading(false);
		}
	}, [repoId]);

	useEffect(() => {
		fetch();
	}, [fetch]);

	return { notes, setNotes, loading, refetch: fetch };
}

// ---------- Hook: upvote a note ----------

export function useUpvoteNote() {
	const [loading, setLoading] = useState(false);

	const upvote = useCallback(async (noteId: string, delta: number) => {
		setLoading(true);
		try {
			const { data } = await api.put(`/student-notes/notes/${noteId}/upvote`, { delta });
			// Server returns { upvotes, userVote }
			return data.data as { upvotes: number; userVote: number } | undefined;
		} catch {
			return undefined;
		} finally {
			setLoading(false);
		}
	}, []);

	return { upvote, loading };
}

// ---------- Hook: submit a note with PDF upload ----------

export function useSubmitNote() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const submit = useCallback(async (repoId: string, payload: {
		title: string;
		description?: string;
		week?: string;
		file: File;
	}) => {
		setLoading(true);
		setError(null);
		try {
			const formData = new FormData();
			formData.append("title", payload.title);
			if (payload.description) formData.append("description", payload.description);
			if (payload.week) formData.append("week", payload.week);
			formData.append("file", payload.file);

			const { data } = await api.post(`/student-notes/repository/${repoId}/submit`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});
			return data.data as NoteItem;
		} catch (err: unknown) {
			const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Failed to submit note";
			setError(msg);
			return null;
		} finally {
			setLoading(false);
		}
	}, []);

	return { submit, loading, error };
}
