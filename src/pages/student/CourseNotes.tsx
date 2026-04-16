import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronUp, ChevronDown, Eye, Download, FileText, Upload, Trophy, X, AlertCircle, CheckCircle2, Clock, Loader2, ZoomIn } from "lucide-react";
import Sidebar from "@/components/student/Sidebar";
import Header from "@/components/student/Header";
import BottomNav from "@/components/student/BottomNav";
import MobileHeader from "@/components/student/MobileHeader";
import { useRepositoryDetail, useRepositoryNotes, useUpvoteNote, useSubmitNote, type NoteItem } from "@/hooks/useStudentNotes";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SERVER_URL = import.meta.env.VITE_API_URL
	? import.meta.env.VITE_API_URL.replace("/api", "")
	: "http://localhost:5003";

/* ─────────────────────────────────────────────────────────
   PDF Preview Modal (blob-URL approach — no CSP issues)
───────────────────────────────────────────────────────── */
const PdfPreviewModal = ({ note, onClose }: { note: NoteItem; onClose: () => void }) => {
	const [blobUrl, setBlobUrl] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const blobRef = useRef<string | null>(null);

	// Build absolute download URL (also used as fallback link)
	const fileUrl = note.fileUrl
		? `${SERVER_URL}${note.fileUrl.startsWith("/") ? "" : "/"}${note.fileUrl}`
		: null;

	useEffect(() => {
		if (!note.fileUrl) { setLoading(false); return; }
		let cancelled = false;
		setLoading(true);
		setError(false);

		fetch(`${SERVER_URL}${note.fileUrl.startsWith("/") ? "" : "/"}${note.fileUrl}`, {
			credentials: "include",
		})
			.then((res) => { if (!res.ok) throw new Error(); return res.blob(); })
			.then((blob) => {
				if (cancelled) return;
				const url = URL.createObjectURL(blob);
				blobRef.current = url;
				setBlobUrl(url);
				setLoading(false);
			})
			.catch(() => { if (!cancelled) { setError(true); setLoading(false); } });

		return () => {
			cancelled = true;
			if (blobRef.current) { URL.revokeObjectURL(blobRef.current); blobRef.current = null; }
		};
	}, [note.fileUrl]);

	return (
		<div
			className="fixed inset-0 z-50 flex flex-col"
			style={{ backgroundColor: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)" }}
		>
			{/* Header bar */}
			<div className="flex items-center justify-between px-5 py-3 bg-card border-b border-border/60 shrink-0 shadow-md">
				<div className="flex items-center gap-3 min-w-0">
					<div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
						<ZoomIn className="w-4 h-4 text-primary" />
					</div>
					<div className="min-w-0">
						<p className="text-sm font-bold text-foreground truncate">{note.title}</p>
						<p className="text-[11px] text-muted-foreground">
							{note.courseCode} &bull; {note.fileType.toUpperCase()} &bull; {note.fileSize} &bull; by {note.uploaderName}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-2 shrink-0 ml-4">
					{fileUrl && (
						<a
							href={fileUrl}
							download
							className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 text-xs font-semibold transition-colors"
							title="Download PDF"
						>
							<Download className="w-3.5 h-3.5" /> Download
						</a>
					)}
					<button
						onClick={onClose}
						className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
						title="Close preview"
					>
						<X className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* Body */}
			<div className="flex-1 relative overflow-hidden">
				{/* Loading spinner */}
				{loading && (
					<div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card/10">
						<div className="relative">
							<div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
							<FileText className="w-6 h-6 text-primary absolute inset-0 m-auto" />
						</div>
						<p className="text-white/80 text-sm font-medium">Loading document...</p>
						<p className="text-white/40 text-xs">Large files may take a moment</p>
					</div>
				)}

				{/* Error state */}
				{!loading && error && (
					<div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white/70">
						<AlertCircle className="w-12 h-12 text-amber-400" />
						<p className="text-base font-semibold">Could not load preview</p>
						{fileUrl && (
							<a href={fileUrl} target="_blank" rel="noopener noreferrer"
								className="text-sm text-primary font-bold hover:underline">
								Open in new tab ↗
							</a>
						)}
					</div>
				)}

				{/* PDF iframe */}
				{!loading && !error && blobUrl && (
					<iframe
						src={`${blobUrl}#toolbar=1&navpanes=0`}
						className="w-full h-full border-0"
						title={`Preview: ${note.title}`}
					/>
				)}
			</div>
		</div>
	);
};

const CourseNotes = () => {
	const { courseId } = useParams();
	const navigate = useNavigate();
	const { repo, loading: repoLoading } = useRepositoryDetail(courseId);
	const { notes, setNotes, loading: notesLoading, refetch: refetchNotes } = useRepositoryNotes(courseId);
	const { data: dashboardData } = useStudentDashboard();
	const { upvote } = useUpvoteNote();

	// Vote state — initialized from server (persists across refreshes)
	const [userVotes, setUserVotes] = useState<Record<string, 0 | 1 | -1>>({});

	// Sync userVotes when notes load from server
	useEffect(() => {
		if (notes.length === 0) return;
		const initial: Record<string, 0 | 1 | -1> = {};
		for (const n of notes) {
			initial[n._id] = (n.userVote ?? 0) as 0 | 1 | -1;
		}
		setUserVotes(initial);
	}, [notes.length]); // only on initial load, not on every update

	// PDF preview state
	const [previewNote, setPreviewNote] = useState<NoteItem | null>(null);

	// Upload dialog state
	const MAX_FILE_SIZE = 50 * 1024 * 1024;
	const [uploadOpen, setUploadOpen] = useState(false);
	const [uploadTitle, setUploadTitle] = useState("");
	const [uploadDesc, setUploadDesc] = useState("");
	const [uploadWeek, setUploadWeek] = useState("");
	const [uploadFile, setUploadFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { submit: submitNote, loading: submitting, error: submitError } = useSubmitNote();

	// Success popup state
	const [showSuccess, setShowSuccess] = useState(false);
	const [submittedTitle, setSubmittedTitle] = useState("");
	useEffect(() => {
		if (!showSuccess) return;
		const t = setTimeout(() => setShowSuccess(false), 5000);
		return () => clearTimeout(t);
	}, [showSuccess]);

	const resetUploadForm = () => {
		setUploadTitle("");
		setUploadDesc("");
		setUploadWeek("");
		setUploadFile(null);
		setFileError(null);
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFileError(null);
		const file = e.target.files?.[0];
		if (!file) return;
		if (file.type !== "application/pdf") {
			setFileError("Only PDF files are allowed");
			e.target.value = "";
			return;
		}
		if (file.size > MAX_FILE_SIZE) {
			setFileError("File size must be less than 50 MB");
			e.target.value = "";
			return;
		}
		setUploadFile(file);
	};

	const handleUploadSubmit = async () => {
		if (!courseId || !uploadTitle.trim() || !uploadFile) return;
		const title = uploadTitle.trim();
		const result = await submitNote(courseId, {
			title,
			description: uploadDesc.trim() || undefined,
			week: uploadWeek.trim() || undefined,
			file: uploadFile,
		});
		if (result) {
			setSubmittedTitle(title);
			setUploadOpen(false);
			resetUploadForm();
			refetchNotes();
			setShowSuccess(true);
		}
	};

	if (repoLoading || notesLoading) {
		return (
			<div className="flex h-screen overflow-hidden">
				<div className="hidden md:block"><Sidebar activePage="Notes Library" /></div>
				<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
					<div className="hidden md:block"><Header student={dashboardData?.student ?? null} /></div>
					<MobileHeader />
					<main className="flex-1 overflow-y-auto bg-secondary/30">
						<div className="p-4 md:p-8 lg:p-10 max-w-4xl mx-auto space-y-4">
							<div className="h-6 w-32 bg-secondary rounded animate-pulse" />
							<div className="h-8 w-64 bg-secondary rounded animate-pulse" />
							{Array.from({ length: 3 }).map((_, i) => (
								<div key={i} className="h-28 bg-card border border-border rounded-xl animate-pulse" />
							))}
						</div>
					</main>
				</div>
				<BottomNav />
			</div>
		);
	}

	if (!repo) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-center">
					<p className="text-lg font-bold text-foreground">Course not found</p>
					<button onClick={() => navigate("/notes")} className="mt-4 text-sm text-primary font-medium hover:underline">
						&larr; Back to Notes Library
					</button>
				</div>
			</div>
		);
	}

	const sortedNotes = [...notes].sort((a, b) => b.upvotes - a.upvotes);

	const handleVote = async (noteId: string, direction: 1 | -1) => {
		const currentVote = userVotes[noteId] ?? 0;

		// Compute optimistic values locally (mirrors server logic)
		let optimisticDelta: number;
		let optimisticVote: 0 | 1 | -1;
		if (currentVote === direction) {
			optimisticDelta = -direction;
			optimisticVote = 0;
		} else if (currentVote === 0) {
			optimisticDelta = direction;
			optimisticVote = direction;
		} else {
			optimisticDelta = direction * 2;
			optimisticVote = direction;
		}

		// Optimistic UI update
		setNotes((prev) =>
			prev.map((n) =>
				n._id === noteId ? { ...n, upvotes: Math.max(0, n.upvotes + optimisticDelta) } : n
			)
		);
		setUserVotes((prev) => ({ ...prev, [noteId]: optimisticVote }));

		// Send direction to server (server resolves toggle/switch logic)
		const result = await upvote(noteId, direction);
		if (result) {
			// Sync both upvotes AND userVote from server truth
			setNotes((prev) =>
				prev.map((n) =>
					n._id === noteId ? { ...n, upvotes: result.upvotes } : n
				)
			);
			setUserVotes((prev) => ({ ...prev, [noteId]: result.userVote as 0 | 1 | -1 }));
		}
	};

	const getUserVote = (noteId: string) => userVotes[noteId] ?? 0;

	const formatDate = (dateStr: string) => {
		const diff = Date.now() - new Date(dateStr).getTime();
		const mins = Math.floor(diff / 60000);
		if (mins < 60) return `${mins}m ago`;
		const hours = Math.floor(mins / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d ago`;
		return new Date(dateStr).toLocaleDateString();
	};

	const getRankBadge = (index: number) => {
		if (index === 0) return <Trophy className="w-4 h-4 text-amber-500" />;
		if (index === 1) return <Trophy className="w-4 h-4 text-slate-400" />;
		if (index === 2) return <Trophy className="w-4 h-4 text-amber-700" />;
		return <span className="text-xs font-bold text-muted-foreground w-4 text-center">#{index + 1}</span>;
	};

	return (
		<div className="flex h-screen overflow-hidden">
			<div className="hidden md:block">
				<Sidebar activePage="Notes Library" />
			</div>

			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<div className="hidden md:block">
					<Header student={dashboardData?.student ?? null} />
				</div>
				<MobileHeader />

				<main className="flex-1 overflow-y-auto bg-secondary/30">
					<div className="p-4 md:p-8 lg:p-10 max-w-4xl mx-auto flex flex-col gap-6">
						{/* Back + Title */}
						<div>
							<button
								onClick={() => navigate("/notes")}
								className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
							>
								<ArrowLeft className="w-4 h-4" />
								Back to Notes Library
							</button>
							<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
								<div>
									<p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{repo.courseCode}</p>
									<h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">{repo.courseName}</h1>
									<p className="text-muted-foreground mt-1">{repo.noteCount} notes shared by students &bull; Vote for the best ones!</p>
								</div>
								<button onClick={() => setUploadOpen(true)} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all shrink-0">
									<Upload className="w-4 h-4" />
									<span>Upload Note</span>
								</button>
							</div>
						</div>

						{/* Notes List */}
						<div className="flex flex-col gap-3">
							{sortedNotes.map((note, index) => {
								const vote = getUserVote(note._id);
								return (
									<div
										key={note._id}
										className="flex gap-3 md:gap-4 rounded-xl bg-card border border-border p-4 shadow-sm hover:shadow-md transition-all"
									>
										{/* Vote Column */}
										<div className="flex flex-col items-center gap-0.5 shrink-0 pt-1">
											<button
												onClick={() => handleVote(note._id, 1)}
												className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${vote === 1
														? "bg-primary/15 text-primary"
														: "text-muted-foreground hover:bg-secondary hover:text-primary"
													}`}
											>
												<ChevronUp className="w-5 h-5" />
											</button>
											<span className={`text-sm font-bold tabular-nums ${vote === 1 ? "text-primary" : vote === -1 ? "text-destructive" : "text-foreground"}`}>
												{note.upvotes}
											</span>
											<button
												onClick={() => handleVote(note._id, -1)}
												className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${vote === -1
														? "bg-destructive/15 text-destructive"
														: "text-muted-foreground hover:bg-secondary hover:text-destructive"
													}`}
											>
												<ChevronDown className="w-5 h-5" />
											</button>
										</div>

										{/* Content */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2 mb-1">
												{getRankBadge(index)}
												<h3 className="font-bold text-foreground truncate">{note.title}</h3>
											</div>
											<p className="text-sm text-muted-foreground line-clamp-2 mb-3">{note.description}</p>
											<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
												<span className="font-medium">{note.uploaderName}</span>
												<span>{formatDate(note.createdAt)}</span>
												<span className="flex items-center gap-1">
													<FileText className="w-3 h-3" />
													{note.fileType.toUpperCase()}{note.fileSize ? ` \u2022 ${note.fileSize}` : ""}
												</span>
											</div>
										</div>

										{/* Actions */}
										<div className="flex flex-col gap-2 shrink-0">
											<button
												onClick={() => setPreviewNote(note)}
												className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
												title="Preview PDF"
											>
												<Eye className="w-4 h-4" />
											</button>
											<a
												href={`${SERVER_URL}${note.fileUrl?.startsWith("/") ? "" : "/"}${note.fileUrl}`}
												download
												className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
												title="Download"
											>
												<Download className="w-4 h-4" />
											</a>
										</div>
									</div>
								);
							})}
						</div>

						{sortedNotes.length === 0 && (
							<div className="text-center py-16 text-muted-foreground">
								<FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
								<p className="font-semibold">No notes yet for this course</p>
								<p className="text-sm mt-1">Be the first to upload!</p>
							</div>
						)}
					</div>
				</main>
			</div>

			<BottomNav />

			{/* Upload Note Dialog */}
			<Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) resetUploadForm(); }}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Upload Note — {repo?.courseName}</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-4 pt-2">
						<div>
							<label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
							<input
								type="text"
								value={uploadTitle}
								onChange={(e) => setUploadTitle(e.target.value)}
								placeholder="e.g. Midterm Review Notes"
								className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
							/>
						</div>
						<div>
							<label className="text-sm font-medium text-foreground mb-1.5 block">Description <span className="text-muted-foreground">(optional)</span></label>
							<textarea
								value={uploadDesc}
								onChange={(e) => setUploadDesc(e.target.value)}
								placeholder="Brief description of the notes..."
								rows={2}
								className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
							/>
						</div>
						<div>
							<label className="text-sm font-medium text-foreground mb-1.5 block">Week <span className="text-muted-foreground">(optional)</span></label>
							<input
								type="text"
								value={uploadWeek}
								onChange={(e) => setUploadWeek(e.target.value)}
								placeholder="e.g. Week 5"
								className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
							/>
						</div>
						<div>
							<label className="text-sm font-medium text-foreground mb-1.5 block">PDF File <span className="text-muted-foreground">(max 50 MB)</span></label>
							<input ref={fileInputRef} type="file" accept="application/pdf,.pdf" onChange={handleFileSelect} className="hidden" />
							<div
								onClick={() => fileInputRef.current?.click()}
								className="flex items-center justify-center gap-3 w-full rounded-xl border-2 border-dashed border-border p-6 cursor-pointer hover:border-primary/40 hover:bg-primary/[0.02] transition-all"
							>
								{uploadFile ? (
									<div className="flex items-center gap-3 w-full">
										<div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
											<FileText className="w-5 h-5 text-red-500" />
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium text-foreground truncate">{uploadFile.name}</p>
											<p className="text-xs text-muted-foreground">{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>
										</div>
										<button
											type="button"
											onClick={(e) => { e.stopPropagation(); setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
											className="w-8 h-8 rounded-full hover:bg-secondary flex items-center justify-center"
										>
											<X className="w-4 h-4 text-muted-foreground" />
										</button>
									</div>
								) : (
									<div className="flex flex-col items-center gap-2 text-center">
										<Upload className="w-8 h-8 text-muted-foreground" />
										<p className="text-sm font-medium text-foreground">Click to select a PDF file</p>
										<p className="text-xs text-muted-foreground">Only .pdf files, max 50 MB</p>
									</div>
								)}
							</div>
							{fileError && (
								<div className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
									<AlertCircle className="w-3.5 h-3.5" />
									<span>{fileError}</span>
								</div>
							)}
						</div>
						{submitError && (
							<div className="flex items-center gap-1.5 text-xs text-red-500">
								<AlertCircle className="w-3.5 h-3.5" />
								<span>{submitError}</span>
							</div>
						)}
						<button
							disabled={!uploadTitle.trim() || !uploadFile || submitting}
							onClick={handleUploadSubmit}
							className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
						>
							{submitting ? "Uploading..." : "Submit for Review"}
						</button>
					</div>
				</DialogContent>
			</Dialog>

			{/* PDF Preview Modal */}
			{previewNote && (
				<PdfPreviewModal
					note={previewNote}
					onClose={() => setPreviewNote(null)}
				/>
			)}

			{/* ── Upload Success Popup ── */}
			{showSuccess && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center p-4"
					style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
					onClick={() => setShowSuccess(false)}
				>
					<div
						className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-4"
						onClick={(e) => e.stopPropagation()}
						style={{ animation: "scaleIn 0.25s ease" }}
					>
						{/* Icon */}
						<div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
							<CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
						</div>

						{/* Title */}
						<div>
							<h2 className="text-xl font-extrabold text-foreground mb-1">Submitted Successfully!</h2>
							<p className="text-sm text-muted-foreground">
								<span className="font-semibold text-foreground">&ldquo;{submittedTitle}&rdquo;</span> has been submitted.
							</p>
						</div>

						{/* Review notice */}
						<div className="w-full flex items-start gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl px-4 py-3 text-left">
							<Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
							<p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
								Your document is currently <strong>under review</strong> by our admin team. Once approved, it will be published and visible to all students in this course.
							</p>
						</div>

						{/* Close button */}
						<button
							onClick={() => setShowSuccess(false)}
							className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
						>
							Got it, thanks!
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default CourseNotes;
