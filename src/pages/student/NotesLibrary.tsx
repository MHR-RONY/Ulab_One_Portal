import { useState, useRef } from "react";
import { Search, Filter, PlusCircle, FileText, Plus, TrendingUp, Upload, X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/student/Sidebar";
import Header from "@/components/student/Header";
import BottomNav from "@/components/student/BottomNav";
import MobileNotesLibrary from "@/components/notes/MobileNotesLibrary";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNoteRepositories, useSubmitNote } from "@/hooks/useStudentNotes";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
import { AnimatedFolder, type Project } from "@/components/ui/3d-folder";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import courseCs from "@/assets/course-cs.jpg";
import courseBus from "@/assets/course-bus.jpg";
import courseEee from "@/assets/course-eee.jpg";
import courseEng from "@/assets/course-eng.jpg";

const departmentSubjects = ["All Departments", "CSE", "BBA", "EEE", "MSJ"] as const;

const deptImageMap: Record<string, string> = {
	CSE: courseCs,
	BBA: courseBus,
	EEE: courseEee,
	MSJ: courseEng,
};

const deptGradientMap: Record<string, string> = {
	CSE: "linear-gradient(135deg, #e73827, #f85032)",
	BBA: "linear-gradient(to right, #f7b733, #fc4a1a)",
	EEE: "linear-gradient(135deg, #8e2de2, #4a00e0)",
	MSJ: "linear-gradient(135deg, #00c6ff, #0072ff)",
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

const NotesLibrary = () => {
	const [activeSubject, setActiveSubject] = useState<string>("All Departments");
	const [searchQuery, setSearchQuery] = useState("");
	const navigate = useNavigate();
	const isMobile = useIsMobile();

	const deptParam = activeSubject === "All Departments" ? undefined : activeSubject;
	const { repos, loading, refetch } = useNoteRepositories(deptParam);
	const { data: dashboardData } = useStudentDashboard();

	// Upload dialog state
	const [uploadOpen, setUploadOpen] = useState(false);
	const [uploadRepoId, setUploadRepoId] = useState("");
	const [uploadTitle, setUploadTitle] = useState("");
	const [uploadDesc, setUploadDesc] = useState("");
	const [uploadWeek, setUploadWeek] = useState("");
	const [uploadFile, setUploadFile] = useState<File | null>(null);
	const [fileError, setFileError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { submit: submitNote, loading: submitting, error: submitError } = useSubmitNote();

	const resetUploadForm = () => {
		setUploadRepoId("");
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
		if (!uploadRepoId || !uploadTitle.trim() || !uploadFile) return;
		const result = await submitNote(uploadRepoId, {
			title: uploadTitle.trim(),
			description: uploadDesc.trim() || undefined,
			week: uploadWeek.trim() || undefined,
			file: uploadFile,
		});
		if (result) {
			setUploadOpen(false);
			resetUploadForm();
			refetch();
		}
	};

	if (isMobile) {
		return (
			<>
				<MobileNotesLibrary />
				<BottomNav />
			</>
		);
	}

	const filteredCourses = repos.filter((repo) => {
		if (searchQuery === "") return true;
		const q = searchQuery.toLowerCase();
		return repo.courseName.toLowerCase().includes(q) || repo.courseCode.toLowerCase().includes(q);
	});

	return (
		<div className="flex h-screen overflow-hidden">
			<div className="hidden md:block">
				<Sidebar activePage="Notes Library" />
			</div>

			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<div className="hidden md:block">
					<Header student={dashboardData?.student ?? null} />
				</div>


				<main className="flex-1 overflow-y-auto bg-secondary/30">
					<div className="p-4 md:p-8 lg:p-10 max-w-6xl mx-auto flex flex-col gap-6 md:gap-8">
						{/* Hero Header */}
						<motion.div
							initial={{ opacity: 0, y: -12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2"
						>
							<div className="space-y-2">
								<div className="flex items-center gap-2">

									<span className="text-xs font-bold uppercase tracking-widest text-stat-amber">Peer-powered learning</span>
								</div>
								<h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground">
									University Notes Library
								</h1>
								<p className="text-muted-foreground max-w-lg">
									Access curated academic resources shared by top students and faculty. Vote for the best notes.
								</p>
							</div>
							<div className="flex gap-2 shrink-0">
								<button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-all hover:shadow-sm">
									<Filter className="w-4 h-4" />
									Filter
								</button>
								<button className="group flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.03] active:scale-95 transition-all" onClick={() => setUploadOpen(true)}>
									<Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
									<span>Upload New Notes</span>
								</button>
							</div>
						</motion.div>

						{/* Search Bar */}
						<motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.15, duration: 0.4 }}
							className="relative"
						>
							<div className="flex h-12 items-center rounded-2xl bg-card border border-border px-4 shadow-sm focus-within:shadow-md focus-within:border-primary/30 transition-all">
								<Search className="w-5 h-5 text-muted-foreground shrink-0" />
								<input
									className="flex-1 border-none bg-transparent text-base focus:ring-0 focus:outline-none placeholder:text-muted-foreground ml-3"
									placeholder="Search by course name or code..."
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
						</motion.div>

						{/* Subject Tags */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.25, duration: 0.4 }}
							className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
						>
							{departmentSubjects.map((subject) => (
								<button
									key={subject}
									onClick={() => setActiveSubject(subject)}
									className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeSubject === subject
											? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
											: "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:shadow-sm"
										}`}
								>
									{subject}
								</button>
							))}
						</motion.div>

						{/* Stats Bar */}
						<motion.div
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3, duration: 0.4 }}
							className="flex items-center gap-6 px-1"
						>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<TrendingUp className="w-4 h-4 text-stat-emerald" />
								<span><strong className="text-foreground">{filteredCourses.length}</strong> courses available</span>
							</div>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<FileText className="w-4 h-4 text-stat-blue" />
								<span><strong className="text-foreground">{filteredCourses.reduce((s, c) => s + c.noteCount, 0)}</strong> total notes</span>
							</div>
						</motion.div>

						{/* Course Folder Grid */}
						<AnimatePresence mode="wait">
							<motion.div
								key={activeSubject}
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.2 }}
								className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center"
							>
								{filteredCourses.map((course, index) => {
									const image = deptImageMap[course.department] ?? courseCs;
									const gradient = deptGradientMap[course.department] ?? "linear-gradient(135deg, #e73827, #f85032)";

									// Use real top-ranked notes when available, fallback to placeholder
									const folderProjects: Project[] = course.topNotes && course.topNotes.length > 0
										? course.topNotes.map((note) => ({
											id: note._id,
											title: note.title,
											fileType: note.fileType,
										}))
										: Array.from({ length: Math.min(course.noteCount, 5) }, (_, i) => ({
											id: `${course._id}-${i}`,
											image,
											title: i === 0 ? course.courseName : `Note ${i + 1}`,
										}));

									return (
										<motion.div
											key={course._id}
											initial={{ opacity: 0, y: 24 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.08, duration: 0.5 }}
											className="w-full cursor-pointer"
											onClick={() => navigate(`/notes/${course._id}`)}
										>
											<AnimatedFolder
												title={`${course.courseName} (${course.courseCode})`}
												projects={folderProjects}
												gradient={gradient}
												className="w-full"
											/>
										</motion.div>
									);
								})}

								{/* Request a Course Card */}
								<motion.div
									initial={{ opacity: 0, y: 24 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: filteredCourses.length * 0.08, duration: 0.5 }}
									className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-8 text-center hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 cursor-pointer w-full"
									style={{ minHeight: "320px" }}
								>
									<div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
										<PlusCircle className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
									</div>
									<h3 className="font-bold text-foreground text-lg">Request a Course</h3>
									<p className="text-sm text-muted-foreground mt-1 max-w-[200px]">Don't see your course? Let us know!</p>
								</motion.div>
							</motion.div>
						</AnimatePresence>

						{loading && (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 justify-items-center">
								{Array.from({ length: 6 }).map((_, i) => (
									<div key={i} className="rounded-2xl bg-card border border-border overflow-hidden animate-pulse w-full" style={{ minHeight: "320px" }}>
										<div className="flex items-center justify-center pt-10 pb-4">
											<div className="w-32 h-24 rounded-lg bg-secondary" />
										</div>
										<div className="p-5 space-y-3 text-center">
											<div className="h-5 w-2/3 bg-secondary rounded mx-auto" />
											<div className="h-3 w-1/3 bg-secondary rounded mx-auto" />
										</div>
									</div>
								))}
							</div>
						)}

						{!loading && filteredCourses.length === 0 && (
							<motion.div
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								className="text-center py-20 text-muted-foreground"
							>
								<FileText className="w-14 h-14 mx-auto mb-4 opacity-30" />
								<p className="font-bold text-lg text-foreground">No courses found</p>
								<p className="text-sm mt-1">Try a different search or department filter.</p>
							</motion.div>
						)}
					</div>
				</main>
			</div>

			<BottomNav />

			{/* Upload Notes Dialog */}
			<Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open) resetUploadForm(); }}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Upload Notes (PDF only)</DialogTitle>
					</DialogHeader>
					<div className="flex flex-col gap-4 pt-2">
						{/* Select Course */}
						<div>
							<label className="text-sm font-medium text-foreground mb-1.5 block">Course</label>
							<select
								value={uploadRepoId}
								onChange={(e) => setUploadRepoId(e.target.value)}
								className="w-full h-10 rounded-lg border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
							>
								<option value="">Select a course...</option>
								{repos.map((r) => (
									<option key={r._id} value={r._id}>{r.courseName} ({r.courseCode})</option>
								))}
							</select>
						</div>

						{/* Title */}
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

						{/* Description */}
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

						{/* Week */}
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

						{/* PDF File */}
						<div>
							<label className="text-sm font-medium text-foreground mb-1.5 block">PDF File <span className="text-muted-foreground">(max 50 MB)</span></label>
							<input
								ref={fileInputRef}
								type="file"
								accept="application/pdf,.pdf"
								onChange={handleFileSelect}
								className="hidden"
							/>
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
							disabled={!uploadRepoId || !uploadTitle.trim() || !uploadFile || submitting}
							onClick={handleUploadSubmit}
							className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
						>
							{submitting ? "Uploading..." : "Submit for Review"}
						</button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default NotesLibrary;
