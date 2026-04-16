import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
	Computer, Briefcase, Zap, Landmark, Upload, Plus, FileText,
	CheckCircle, XCircle, Eye, PlusCircle, Loader2, X, Download,
	MessageSquare, ZoomIn, AlertCircle,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
	useAdminDepartmentStats,
	usePendingNotes,
	useCreateRepository,
	type PendingNote,
} from "@/hooks/useAdminResources";

const SERVER_URL = import.meta.env.VITE_API_URL
	? import.meta.env.VITE_API_URL.replace("/api", "")
	: "http://localhost:5003";

const deptMeta: Record<string, { icon: React.ElementType; iconBg: string; iconColor: string }> = {
	CSE: { icon: Computer, iconBg: "bg-blue-50 dark:bg-blue-900/20", iconColor: "text-blue-500" },
	BBA: { icon: Briefcase, iconBg: "bg-orange-50 dark:bg-orange-900/20", iconColor: "text-orange-500" },
	EEE: { icon: Zap, iconBg: "bg-amber-50 dark:bg-amber-900/20", iconColor: "text-amber-500" },
	MSJ: { icon: Landmark, iconBg: "bg-purple-50 dark:bg-purple-900/20", iconColor: "text-purple-500" },
};

const deptRouteMap: Record<string, string> = {
	CSE: "cse",
	BBA: "bba",
	EEE: "eee",
	MSJ: "msj",
};

const deptBadgeColor: Record<string, string> = {
	CSE: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
	BBA: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
	EEE: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
	MSJ: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
};

/* ─────────────────────────────────────────────────────────────
   Document Preview Modal
───────────────────────────────────────────────────────────── */
interface PreviewModalProps {
	note: PendingNote;
	onClose: () => void;
	onApprove: (id: string, feedback: string) => Promise<void>;
	onReject: (id: string, feedback: string) => Promise<void>;
}

const PreviewModal = ({ note, onClose, onApprove, onReject }: PreviewModalProps) => {
	const [feedback, setFeedback] = useState("");
	const [actionLoading, setActionLoading] = useState<"approve" | "reject" | null>(null);
	const [blobUrl, setBlobUrl] = useState<string | null>(null);
	const [pdfLoading, setPdfLoading] = useState(true);
	const [pdfError, setPdfError] = useState(false);
	const blobRef = useRef<string | null>(null);

	// Absolute URL for the download link
	const fileUrl = note.fileUrl
		? `${SERVER_URL}${note.fileUrl.startsWith("/") ? "" : "/"}${note.fileUrl}`
		: null;

	// Fetch the PDF as a Blob so the browser treats it as same-origin (no CSP/CORP block)
	useEffect(() => {
		if (!note.fileUrl) {
			setPdfLoading(false);
			return;
		}
		let cancelled = false;
		setPdfLoading(true);
		setPdfError(false);

		// Use native fetch — static files don't require the /api prefix
		fetch(`${SERVER_URL}${note.fileUrl.startsWith("/") ? "" : "/"}${note.fileUrl}`, {
			credentials: "include",
		})
			.then((res) => {
				if (!res.ok) throw new Error("Failed to load PDF");
				return res.blob();
			})
			.then((blob) => {
				if (cancelled) return;
				const url = URL.createObjectURL(blob);
				blobRef.current = url;
				setBlobUrl(url);
				setPdfLoading(false);
			})
			.catch(() => {
				if (cancelled) return;
				setPdfError(true);
				setPdfLoading(false);
			});

		return () => {
			cancelled = true;
			// Clean up blob URL to free memory
			if (blobRef.current) {
				URL.revokeObjectURL(blobRef.current);
				blobRef.current = null;
			}
		};
	}, [note.fileUrl]);

	const handleApprove = async () => {
		setActionLoading("approve");
		try {
			await onApprove(note._id, feedback);
			onClose();
		} finally {
			setActionLoading(null);
		}
	};

	const handleReject = async () => {
		if (!feedback.trim()) {
			alert("Please provide feedback before rejecting a document.");
			return;
		}
		setActionLoading("reject");
		try {
			await onReject(note._id, feedback);
			onClose();
		} finally {
			setActionLoading(null);
		}
	};

	return (
		/* Backdrop */
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4"
			style={{ backgroundColor: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
			onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
		>
			{/* Modal */}
			<div className="bg-card border border-border/60 rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden"
				style={{ maxHeight: "92vh" }}>

				{/* ── Header ── */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
					<div className="flex items-center gap-3 min-w-0">
						<div className="p-2 bg-primary/10 rounded-lg shrink-0">
							<FileText className="w-5 h-5 text-primary" />
						</div>
						<div className="min-w-0">
							<h2 className="font-bold text-foreground text-base truncate">{note.title}</h2>
							<p className="text-[11px] text-muted-foreground">
								{note.courseCode} &bull; {note.fileType.toUpperCase()} &bull; {note.fileSize} &bull; by{" "}
								<span className="font-semibold text-foreground">{note.uploaderName}</span>
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2 shrink-0 ml-4">
						{fileUrl && (
							<a
								href={fileUrl}
								target="_blank"
								rel="noopener noreferrer"
								download
								className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
								title="Download document"
							>
								<Download className="w-4 h-4" />
							</a>
						)}
						<button
							onClick={onClose}
							className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
							title="Close"
						>
							<X className="w-4 h-4" />
						</button>
					</div>
				</div>

				{/* ── Body: Preview + Feedback ── */}
				<div className="flex flex-1 overflow-hidden min-h-0">

					{/* Left: Document Preview */}
					<div className="flex-1 bg-secondary/20 flex flex-col overflow-hidden">
						{/* Preview toolbar */}
						<div className="flex items-center gap-2 px-4 py-2 border-b border-border/40 bg-card/80 shrink-0">
							<ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
							<span className="text-[11px] text-muted-foreground font-medium">Document Preview</span>
							<span className="ml-auto text-[10px] text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
								{note.fileType.toUpperCase()}
							</span>
						</div>

						{/* iframe or fallback — uses blob URL to bypass CSP/CORP cross-origin restrictions */}
						<div className="flex-1 overflow-hidden relative">
							{/* Loading state */}
							{pdfLoading && (
								<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground bg-secondary/20 z-10">
									<Loader2 className="w-8 h-8 animate-spin text-primary" />
									<p className="text-sm font-medium">Loading preview...</p>
								</div>
							)}

							{!pdfLoading && pdfError && (
								<div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-muted-foreground">
									<AlertCircle className="w-10 h-10 text-amber-400" />
									<p className="text-sm font-medium">Preview could not be loaded.</p>
									{fileUrl && (
										<a
											href={fileUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-xs text-primary hover:underline font-semibold"
										>
											Open in new tab ↗
										</a>
									)}
								</div>
							)}

							{!pdfLoading && !pdfError && blobUrl && (
								<iframe
									src={`${blobUrl}#toolbar=1&navpanes=0`}
									className="w-full h-full border-0"
									title={`Preview: ${note.title}`}
								/>
							)}

							{!pdfLoading && !pdfError && !blobUrl && !note.fileUrl && (
								<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
									<FileText className="w-12 h-12 opacity-30" />
									<p className="text-sm font-medium">No file URL available</p>
								</div>
							)}
						</div>
					</div>

					{/* Right: Review Panel */}
					<div className="w-80 shrink-0 flex flex-col border-l border-border/50 bg-card overflow-y-auto">

						{/* Status badge */}
						<div className="px-5 pt-5 pb-4 border-b border-border/40">
							<p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
								Current Status
							</p>
							<span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full">
								<span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
								Pending Review
							</span>
						</div>

						{/* Document Info */}
						<div className="px-5 py-4 border-b border-border/40 space-y-3">
							<p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
								Document Info
							</p>
							<div className="space-y-2">
								{[
									{ label: "Uploader", value: note.uploaderName },
									{ label: "Department", value: note.department },
									{ label: "Course Code", value: note.courseCode },
									{ label: "File Type", value: note.fileType.toUpperCase() },
									{ label: "File Size", value: note.fileSize },
								].map(({ label, value }) => (
									<div key={label} className="flex justify-between text-xs">
										<span className="text-muted-foreground">{label}</span>
										<span className="font-semibold text-foreground text-right max-w-[130px] truncate">{value}</span>
									</div>
								))}
							</div>
						</div>

						{/* Feedback */}
						<div className="px-5 py-4 flex-1">
							<div className="flex items-center gap-1.5 mb-2">
								<MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
								<p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
									Admin Feedback
								</p>
							</div>
							<Textarea
								id={`feedback-${note._id}`}
								placeholder="Add feedback for the uploader (required for rejection)..."
								value={feedback}
								onChange={(e) => setFeedback(e.target.value)}
								rows={5}
								className="w-full text-sm resize-none"
							/>
							<p className="text-[10px] text-muted-foreground mt-1.5">
								Feedback is optional for approval, required for rejection.
							</p>
						</div>

						{/* Action Buttons */}
						<div className="px-5 pb-5 pt-2 flex flex-col gap-2.5 shrink-0">
							<button
								id={`approve-btn-${note._id}`}
								onClick={handleApprove}
								disabled={actionLoading !== null}
								className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-lg shadow-green-600/20 hover:shadow-green-600/30"
							>
								{actionLoading === "approve"
									? <Loader2 className="w-4 h-4 animate-spin" />
									: <CheckCircle className="w-4 h-4" />}
								Accept Document
							</button>
							<button
								id={`reject-btn-${note._id}`}
								onClick={handleReject}
								disabled={actionLoading !== null}
								className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/30"
							>
								{actionLoading === "reject"
									? <Loader2 className="w-4 h-4 animate-spin" />
									: <XCircle className="w-4 h-4" />}
								Decline Document
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

/* ─────────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────────── */
const AdminResources = () => {
	const navigate = useNavigate();
	const [courseName, setCourseName] = useState("");
	const [courseCode, setCourseCode] = useState("");
	const [department, setDepartment] = useState("");
	const [description, setDescription] = useState("");
	const [formSuccess, setFormSuccess] = useState(false);

	// Preview modal state
	const [previewNote, setPreviewNote] = useState<PendingNote | null>(null);

	const { stats, loading: statsLoading, refetch: refetchStats } = useAdminDepartmentStats();
	const { notes: pendingNotes, total: pendingTotal, loading: notesLoading, approveNote, rejectNote, setPage, page } = usePendingNotes();
	const { createRepository, loading: createLoading, error: createError } = useCreateRepository();

	const handleCreateRepo = async () => {
		if (!courseName || !courseCode || !department) return;
		const success = await createRepository({ courseName, courseCode, department, description });
		if (success) {
			setCourseName("");
			setCourseCode("");
			setDepartment("");
			setDescription("");
			setFormSuccess(true);
			refetchStats();
			setTimeout(() => setFormSuccess(false), 3000);
		}
	};

	return (
		<div className="flex min-h-screen bg-background admin-theme">
			<AdminSidebar activePage="Notes & Resources" />
			<div className="flex-1 flex flex-col">
				<AdminHeader />
				<main className="flex-1 p-8 overflow-y-auto">
					{/* Page Title */}
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
						<div>
							<h2 className="text-2xl font-extrabold tracking-tight text-foreground">Departmental Overview</h2>
							<p className="text-muted-foreground text-sm">Central repository management for academic resources.</p>
						</div>
						<div className="flex gap-3">
							<Button variant="outline" className="gap-2">
								<Upload className="w-4 h-4" />
								Bulk Upload
							</Button>
							<Button className="gap-2 shadow-lg shadow-primary/20">
								<Plus className="w-4 h-4" />
								Add Department
							</Button>
						</div>
					</div>

					{/* Department Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
						{statsLoading
							? Array.from({ length: 4 }).map((_, i) => (
								<div key={i} className="bg-card p-5 rounded-xl border border-border/50 animate-pulse h-36" />
							))
							: stats.map((dept) => {
								const meta = deptMeta[dept.name];
								const Icon = meta?.icon ?? Computer;
								return (
									<div
										key={dept.name}
										onClick={() => navigate(`/admin/resources/${deptRouteMap[dept.name]}`)}
										className="bg-card p-5 rounded-xl border border-border/50 hover:border-primary/20 transition-all shadow-sm hover:shadow-md group cursor-pointer"
									>
										<div className="flex justify-between items-start mb-4">
											<div className={`p-3 ${meta?.iconBg} ${meta?.iconColor} rounded-xl group-hover:scale-110 transition-transform`}>
												<Icon className="w-5 h-5" />
											</div>
											<span className="text-[10px] font-bold px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full uppercase tracking-tighter">
												{dept.courses} Repos
											</span>
										</div>
										<h3 className="font-bold text-lg mb-4 text-foreground">{dept.name}</h3>
										<div className="space-y-2">
											<div className="flex justify-between text-xs">
												<span className="text-muted-foreground">Total Courses</span>
												<span className="font-bold text-foreground">{dept.courses}</span>
											</div>
											<div className="flex justify-between text-xs">
												<span className="text-muted-foreground">Total Notes</span>
												<span className="font-bold text-foreground">{dept.notes}</span>
											</div>
										</div>
									</div>
								);
							})}
					</div>

					{/* Create Repository Card */}
					<div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm mb-8">
						<div className="p-6 border-b border-border/50 flex items-center gap-2">
							<PlusCircle className="w-5 h-5 text-primary" />
							<h3 className="font-bold text-lg text-foreground">Create Repository Card</h3>
						</div>
						<div className="p-6">
							{formSuccess && (
								<div className="mb-4 px-4 py-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold flex items-center gap-2">
									<CheckCircle className="w-4 h-4" /> Repository created successfully.
								</div>
							)}
							{createError && (
								<div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold">
									{createError}
								</div>
							)}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="space-y-1.5">
									<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Course Name</label>
									<Input placeholder="e.g. Data Structures" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
								</div>
								<div className="space-y-1.5">
									<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Course Code</label>
									<Input placeholder="e.g. CSE 201" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
								</div>
								<div className="space-y-1.5">
									<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Department</label>
									<Select value={department} onValueChange={setDepartment}>
										<SelectTrigger>
											<SelectValue placeholder="Select Department" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="CSE">CSE</SelectItem>
											<SelectItem value="BBA">BBA</SelectItem>
											<SelectItem value="EEE">EEE</SelectItem>
											<SelectItem value="MSJ">MSJ</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="md:col-span-3 space-y-1.5">
									<label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
									<Textarea
										placeholder="Briefly describe the course content for this repository..."
										rows={3}
										value={description}
										onChange={(e) => setDescription(e.target.value)}
									/>
								</div>
								<div className="md:col-span-3 flex justify-end">
									<Button
										className="gap-2 shadow-lg shadow-primary/20"
										onClick={handleCreateRepo}
										disabled={createLoading || !courseName || !courseCode || !department}
									>
										{createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
										Create Repository Card
									</Button>
								</div>
							</div>
						</div>
					</div>

					{/* Pending Approvals */}
					<div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
						<div className="p-6 border-b border-border/50 flex items-center justify-between">
							<h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
								<FileText className="w-5 h-5 text-primary" />
								Pending Approvals
								{pendingTotal > 0 && (
									<Badge className="ml-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] px-2 py-0.5">
										{pendingTotal}
									</Badge>
								)}
							</h3>
						</div>
						<Table>
							<TableHeader>
								<TableRow className="bg-secondary/50">
									<TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Note Title</TableHead>
									<TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Uploader</TableHead>
									<TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Department</TableHead>
									<TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
									<TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{notesLoading ? (
									<TableRow>
										<TableCell colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
											<Loader2 className="w-5 h-5 animate-spin mx-auto" />
										</TableCell>
									</TableRow>
								) : pendingNotes.length === 0 ? (
									<TableRow>
										<TableCell colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
											No pending approvals
										</TableCell>
									</TableRow>
								) : (
									pendingNotes.map((item) => (
										<TableRow key={item._id} className="hover:bg-secondary/30">
											<TableCell>
												<div className="flex items-center gap-3">
													<FileText className="w-5 h-5 text-orange-400 shrink-0" />
													<div>
														<p className="text-sm font-bold text-foreground">{item.title}</p>
														<p className="text-[10px] text-muted-foreground">
															{item.courseCode} • {item.fileType.toUpperCase()} • {item.fileSize}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
														{item.uploaderName.charAt(0).toUpperCase()}
													</div>
													<span className="text-xs font-medium text-foreground">{item.uploaderName}</span>
												</div>
											</TableCell>
											<TableCell>
												<span className={`text-xs px-2 py-1 rounded-lg font-bold ${deptBadgeColor[item.department] ?? ""}`}>
													{item.department}
												</span>
											</TableCell>
											<TableCell>
												<span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
													<span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
													Pending
												</span>
											</TableCell>
											<TableCell className="text-right">
												<div className="flex justify-end gap-1">
													{/* Quick approve (no feedback) */}
													<button
														id={`quick-approve-${item._id}`}
														onClick={() => approveNote(item._id, "")}
														className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded-lg transition-colors"
														title="Quick Approve"
													>
														<CheckCircle className="w-4 h-4" />
													</button>
													{/* Quick reject (no feedback) */}
													<button
														id={`quick-reject-${item._id}`}
														onClick={() => rejectNote(item._id, "")}
														className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
														title="Quick Reject"
													>
														<XCircle className="w-4 h-4" />
													</button>
													{/* Preview + detailed review */}
													<button
														id={`preview-${item._id}`}
														onClick={() => setPreviewNote(item)}
														className="p-1.5 hover:bg-primary/10 text-primary rounded-lg transition-colors"
														title="Preview & Review"
													>
														<Eye className="w-4 h-4" />
													</button>
												</div>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
						{pendingTotal > 10 && (
							<div className="p-4 bg-secondary/30 border-t border-border/50 flex justify-center gap-4">
								<button
									disabled={page === 1}
									onClick={() => setPage((p) => p - 1)}
									className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
								>
									Previous
								</button>
								<span className="text-xs text-muted-foreground">Page {page}</span>
								<button
									disabled={page * 10 >= pendingTotal}
									onClick={() => setPage((p) => p + 1)}
									className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
								>
									Next
								</button>
							</div>
						)}
					</div>
				</main>
			</div>

			{/* Document Preview Modal */}
			{previewNote && (
				<PreviewModal
					note={previewNote}
					onClose={() => setPreviewNote(null)}
					onApprove={approveNote}
					onReject={rejectNote}
				/>
			)}
		</div>
	);
};

export default AdminResources;
