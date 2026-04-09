import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
	UploadCloud, CheckCircle2, FileText, FileEdit,
	Info, History, Pencil, Trash2, Save, X,
	BarChart3, Download, Upload, ChevronDown, Loader2, AlertCircle, CalendarDays,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
	Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import api from "@/lib/api";

// --- Types ---
type UploadLogEntry = {
	_id: string;
	fileName: string;
	fileSize: number;
	semester: string;
	totalEntries: number;
	errorCount: number;
	createdAt: string;
};

type ScheduleStats = {
	totalCourses: number;
	totalSections: number;
	tbaCount: number;
	conflictCount: number;
};

type UploadResult = {
	totalParsed: number;
	totalSaved: number;
	tbaCount: number;
	conflictCount: number;
	teachersSaved?: number;
	errors: string[];
};

type OfferedCourse = {
	_id: string;
	courseCode: string;
	unicode: string;
	section: string;
	room: string;
	teacherInitials: string;
	teacherTBA: boolean;
	isLab: boolean;
	daySuffix: string;
	days: string[];
	blockedDays: string[];
	startTime: string;
	endTime: string;
	semester: string;
	hasConflict: boolean;
	conflictReason: string;
};

// Pending course: parsed but not yet saved — uses _tempId instead of _id
type PendingCourse = {
	_tempId: string;
	courseCode: string;
	unicode: string;
	section: string;
	room: string;
	teacher: string;         // matches IScheduleUploadEntry field name
	teacherTBA: boolean;
	isLab: boolean;
	daySuffix: string;
	days: string[];
	blockedDays: string[];
	startTime: string;
	endTime: string;
	hasConflict: boolean;
	conflictReason: string;
};

type PendingMeta = {
	fileName: string;
	fileSize: number;
	totalParsed: number;
	tbaCount: number;
	conflictCount: number;
	errors: string[];
};

// --- Static Data ---
const dataGuidelines = [
	"Ensure Course Codes match the official registry.",
	"Rooms must be formatted as [Building] [Number].",
	"Times should be in 24-hour format or specify AM/PM.",
	"Duplicates will be automatically flagged for review.",
];

const DAY_MAP: Record<string, string[]> = {
	"Sun & Tue": ["Sunday", "Tuesday"],
	"Mon & Wed": ["Monday", "Wednesday"],
	"Thu & Sat": ["Thursday", "Saturday"],
	Sunday: ["Sunday"],
	Monday: ["Monday"],
	Tuesday: ["Tuesday"],
	Wednesday: ["Wednesday"],
	Thursday: ["Thursday"],
	Saturday: ["Saturday"],
};

const getDaysLabel = (days: string[]): string => {
	const sorted = [...days].sort();
	if (sorted.length === 2) {
		if (sorted.includes("Sunday") && sorted.includes("Tuesday")) return "Sun & Tue";
		if (sorted.includes("Monday") && sorted.includes("Wednesday")) return "Mon & Wed";
		if (sorted.includes("Thursday") && sorted.includes("Saturday")) return "Thu & Sat";
	}
	if (sorted.length === 1) return sorted[0];
	return days.join(", ");
};

// --- Sub-components ---
interface FloatingInputProps {
	id: string;
	label: string;
	type?: string;
	value: string;
	onChange: (val: string) => void;
}

const FloatingInput = ({ id, label, type = "text", value, onChange }: FloatingInputProps) => (
	<div className="relative">
		<input
			id={id}
			type={type}
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder={label}
			className="peer w-full px-4 py-3 bg-transparent border border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder-transparent text-sm text-foreground"
		/>
		<label
			htmlFor={id}
			className="pointer-events-none absolute left-4 -top-2.5 bg-card px-1 text-xs font-bold text-muted-foreground transition-all
        peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5
        peer-focus:-top-2.5 peer-focus:text-primary peer-focus:text-xs"
		>
			{label}
		</label>
	</div>
);

// --- Main Page ---
const AdminScheduleBuilder = () => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [uploading, setUploading] = useState(false);
	const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
	const [uploadError, setUploadError] = useState("");
	const [uploadLogs, setUploadLogs] = useState<UploadLogEntry[]>([]);
	const [stats, setStats] = useState<ScheduleStats>({ totalCourses: 0, totalSections: 0, tbaCount: 0, conflictCount: 0 });
	const [semester, setSemester] = useState("Summer 2026");
	const [saving, setSaving] = useState(false);

	// Pending state: parsed but not yet saved to DB
	const [pendingCourses, setPendingCourses] = useState<PendingCourse[]>([]);
	const [pendingMeta, setPendingMeta] = useState<PendingMeta | null>(null);

	// Offered courses state
	const [offeredCourses, setOfferedCourses] = useState<OfferedCourse[]>([]);
	const [activeDeptTab, setActiveDeptTab] = useState("All");
	const [activeDayTab, setActiveDayTab] = useState("All");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editForm, setEditForm] = useState<Partial<OfferedCourse & PendingCourse>>({});
	const [coursesLoading, setCoursesLoading] = useState(false);

	const [form, setForm] = useState({
		courseCode: "",
		unicode: "",
		section: "",
		room: "",
		teacherInitials: "",
		teacherFullName: "",
		days: "Sun & Tue" as string,
		startTime: "",
		endTime: "",
		daySuffix: "",
		isLab: false,
	});

	const fetchUploadLogs = useCallback(async () => {
		try {
			const res = await api.get("/admin/schedule/upload-logs");
			if (res.data.success) setUploadLogs(res.data.data.logs);
		} catch { /* silent */ }
	}, []);

	const fetchStats = useCallback(async () => {
		try {
			const res = await api.get("/admin/schedule/schedule-stats");
			if (res.data.success) setStats(res.data.data);
		} catch { /* silent */ }
	}, []);

	const fetchOfferedCourses = useCallback(async (sem: string) => {
		setCoursesLoading(true);
		try {
			const res = await api.get("/admin/schedule/offered-courses", {
				params: { semester: sem, limit: 5000 },
			});
			if (res.data.success) setOfferedCourses(res.data.data.courses);
		} catch { /* silent */ }
		finally { setCoursesLoading(false); }
	}, []);

	useEffect(() => {
		fetchUploadLogs();
		fetchStats();
		fetchOfferedCourses(semester);
	}, [fetchUploadLogs, fetchStats, fetchOfferedCourses, semester]);

	// Warn before navigating away if there are unsaved changes
	useEffect(() => {
		if (pendingCourses.length === 0) return;
		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			e.returnValue = "You have unsaved schedule changes. Leave without saving?";
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [pendingCourses.length]);

	const handleUploadFile = async (file: File) => {
		setUploadedFile(file);
		setUploadResult(null);
		setUploadError("");
		setUploading(true);

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("semester", semester);

			const res = await api.post("/admin/schedule/parse-preview", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			if (res.data.success) {
				const data = res.data.data;
				// Map parser entries to PendingCourse (add _tempId)
				const mapped: PendingCourse[] = (data.entries as PendingCourse[]).map((e, idx) => ({
					...e,
					_tempId: String(idx),
				}));
				setPendingCourses(mapped);
				setPendingMeta({
					fileName: data.fileName,
					fileSize: data.fileSize,
					totalParsed: data.totalParsed,
					tbaCount: data.tbaCount,
					conflictCount: data.conflictCount,
					errors: data.errors,
				});
				setActiveDeptTab("All");
			} else {
				setUploadError(res.data.message || "Upload failed");
			}
		} catch (err: unknown) {
			const axiosErr = err as { response?: { data?: { message?: string } } };
			setUploadError(axiosErr.response?.data?.message || "Upload failed");
		} finally {
			setUploading(false);
		}
	};

	const handleSaveAll = async () => {
		if (pendingCourses.length === 0) return;
		setSaving(true);
		try {
			const res = await api.post("/admin/schedule/confirm-save", {
				entries: pendingCourses,
				semester,
				fileName: pendingMeta?.fileName ?? "unknown",
				fileSize: pendingMeta?.fileSize ?? 0,
			});
			if (res.data.success) {
				setUploadResult({
					totalParsed: pendingMeta?.totalParsed ?? pendingCourses.length,
					totalSaved: res.data.data.totalSaved,
					tbaCount: pendingMeta?.tbaCount ?? 0,
					conflictCount: pendingMeta?.conflictCount ?? 0,
					errors: pendingMeta?.errors ?? [],
				});
				setPendingCourses([]);
				setPendingMeta(null);
				fetchUploadLogs();
				fetchStats();
				fetchOfferedCourses(semester);
			}
		} catch (err: unknown) {
			const axiosErr = err as { response?: { data?: { message?: string } } };
			setUploadError(axiosErr.response?.data?.message || "Failed to save entries");
		}
		finally { setSaving(false); }
	};

	const handleClearUploadHistory = async () => {
		try {
			await api.delete("/admin/schedule/upload-logs");
			setUploadLogs([]);
		} catch { /* silent */ }
	};

	const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
	const handleDragLeave = () => setIsDragging(false);
	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) handleUploadFile(file);
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) handleUploadFile(e.target.files[0]);
	};

	const handleFormChange = (field: keyof typeof form, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleReset = () => {
		setForm({ courseCode: "", unicode: "", section: "", room: "", teacherInitials: "", teacherFullName: "", days: "Sun & Tue", startTime: "", endTime: "", daySuffix: "", isLab: false });
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!form.section || !form.room || !form.startTime || !form.endTime) return;

		const days = DAY_MAP[form.days] ?? [form.days];
		const teacherTBA = !form.teacherInitials || form.teacherInitials.toUpperCase() === "TBA";
		const isLab = form.isLab || /\d+L$/i.test(form.section.trim());

		const newEntry: PendingCourse = {
			_tempId: `manual-${Date.now()}`,
			courseCode: form.courseCode.trim(),
			unicode: form.unicode.trim(),
			section: form.section.trim(),
			room: form.room.trim(),
			teacher: teacherTBA ? "TBA" : form.teacherInitials.trim(),
			teacherTBA,
			isLab,
			daySuffix: form.daySuffix,
			days,
			blockedDays: [],
			startTime: form.startTime,
			endTime: form.endTime,
			hasConflict: false,
			conflictReason: "",
		};

		setPendingCourses((prev) => [...prev, newEntry]);
		if (!pendingMeta) {
			setPendingMeta({
				fileName: "Manual Entry",
				fileSize: 0,
				totalParsed: 1,
				tbaCount: teacherTBA ? 1 : 0,
				conflictCount: 0,
				errors: [],
			});
		}
		handleReset();
	};

	// --- Offered Courses helpers ---
	// When pending courses exist, show them instead of saved courses
	const hasPending = pendingCourses.length > 0;

	const allDisplayCourses: (OfferedCourse | (PendingCourse & { _id?: undefined }))[] = hasPending
		? pendingCourses
		: offeredCourses;

	const departments = ["All", ...Array.from(new Set(allDisplayCourses.map((c) => {
		const match = c.courseCode.match(/^[A-Za-z]+/);
		return match ? match[0].toUpperCase() : "OTHER";
	}))).sort()];

	const deptFilteredCourses = activeDeptTab === "All"
		? allDisplayCourses
		: allDisplayCourses.filter((c) => c.courseCode.toUpperCase().startsWith(activeDeptTab));

	// Day filter options with counts
	const DAY_FILTER_OPTIONS = [
		"All", "Sun & Tue", "Mon & Wed", "Thu & Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Saturday",
	];

	const dayFilterCounts: Record<string, number> = {};
	DAY_FILTER_OPTIONS.forEach((opt) => {
		if (opt === "All") {
			dayFilterCounts[opt] = deptFilteredCourses.length;
		} else {
			const targetDays = DAY_MAP[opt] ?? [opt];
			dayFilterCounts[opt] = deptFilteredCourses.filter((c) => {
				const label = c.days.length > 0 ? getDaysLabel(c.days) : "Unassigned";
				if (opt === label) return true;
				if (targetDays.length === 1 && c.days.includes(targetDays[0]) && c.days.length === 1) return true;
				return false;
			}).length;
		}
	});

	const filteredCourses = activeDayTab === "All"
		? deptFilteredCourses
		: deptFilteredCourses.filter((c) => {
			const label = c.days.length > 0 ? getDaysLabel(c.days) : "Unassigned";
			if (activeDayTab === label) return true;
			const targetDays = DAY_MAP[activeDayTab] ?? [activeDayTab];
			if (targetDays.length === 1 && c.days.includes(targetDays[0]) && c.days.length === 1) return true;
			return false;
		});

	// Group by day for display
	const coursesByDay: Record<string, typeof filteredCourses> = {};
	filteredCourses.forEach((c) => {
		const dayKey = c.days.length > 0 ? getDaysLabel(c.days) : "Unassigned";
		if (!coursesByDay[dayKey]) coursesByDay[dayKey] = [];
		coursesByDay[dayKey].push(c);
	});
	const sortedDayKeys = Object.keys(coursesByDay).sort();

	const handleStartEdit = (course: OfferedCourse | PendingCourse) => {
		const id = "_id" in course ? course._id : course._tempId;
		setEditingId(id);
		setEditForm({
			courseCode: course.courseCode,
			unicode: course.unicode,
			section: course.section,
			room: course.room,
			teacherInitials: "_id" in course ? course.teacherInitials : course.teacher,
			teacher: "_id" in course ? undefined : course.teacher,
			startTime: course.startTime,
			endTime: course.endTime,
			daySuffix: course.daySuffix,
			days: course.days,
			isLab: course.isLab,
		});
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditForm({});
	};

	const handleEditField = (field: string, value: string) => {
		setEditForm((prev) => ({ ...prev, [field]: value }));
	};

	const handleSaveEdit = async () => {
		if (!editingId) return;

		// Check if editing a pending course (_tempId)
		if (hasPending) {
			setPendingCourses((prev) =>
				prev.map((c) =>
					c._tempId === editingId
						? {
							...c,
							courseCode: editForm.courseCode ?? c.courseCode,
							unicode: editForm.unicode ?? c.unicode,
							section: editForm.section ?? c.section,
							room: editForm.room ?? c.room,
							teacher: editForm.teacher ?? editForm.teacherInitials ?? c.teacher,
							startTime: editForm.startTime ?? c.startTime,
							endTime: editForm.endTime ?? c.endTime,
							daySuffix: editForm.daySuffix ?? c.daySuffix,
							days: editForm.days ?? c.days,
							isLab: editForm.isLab !== undefined ? editForm.isLab : c.isLab,
						}
						: c
				)
			);
			setEditingId(null);
			setEditForm({});
			return;
		}

		// Saved course — API call
		try {
			const res = await api.patch(`/admin/schedule/offered-courses/${editingId}`, editForm);
			if (res.data.success) {
				setOfferedCourses((prev) =>
					prev.map((c) => (c._id === editingId ? { ...c, ...res.data.data.course } : c))
				);
				setEditingId(null);
				setEditForm({});
				fetchStats();
			}
		} catch { /* silent */ }
	};

	const handleDeleteCourse = async (course: OfferedCourse | PendingCourse) => {
		if ("_tempId" in course && !("_id" in course)) {
			// Pending — remove from local state
			setPendingCourses((prev) => prev.filter((c) => c._tempId !== course._tempId));
			return;
		}
		// Saved — API delete
		const saved = course as OfferedCourse;
		try {
			const res = await api.delete(`/admin/schedule/offered-courses/single/${saved._id}`);
			if (res.data.success) {
				setOfferedCourses((prev) => prev.filter((c) => c._id !== saved._id));
				fetchStats();
			}
		} catch { /* silent */ }
	};

	const handleToggleLab = async (course: OfferedCourse | PendingCourse) => {
		const newIsLab = !course.isLab;
		if ("_tempId" in course && !("_id" in course)) {
			setPendingCourses((prev) =>
				prev.map((c) => c._tempId === (course as PendingCourse)._tempId ? { ...c, isLab: newIsLab } : c)
			);
			return;
		}
		const saved = course as OfferedCourse;
		try {
			const res = await api.patch(`/admin/schedule/offered-courses/${saved._id}`, { isLab: newIsLab });
			if (res.data.success) {
				setOfferedCourses((prev) =>
					prev.map((c) => (c._id === saved._id ? { ...c, ...res.data.data.course } : c))
				);
			}
		} catch { /* silent */ }
	};

	return (
		<div className="flex min-h-screen bg-background admin-theme">
			<div className="hidden lg:block">
				<AdminSidebar activePage="Schedule Builder" />
			</div>
			<div className="flex-1 flex flex-col min-w-0">
				<AdminHeader />
				<main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-20 lg:pb-8 space-y-8">

					{/* Page Intro */}
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
					>
						<div>
							<h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Manage Schedules</h1>
							<p className="text-muted-foreground mt-2 text-sm md:text-base max-w-2xl">
								Upload bulk data via CSV/Excel or manually enter individual course schedules and teacher assignments.
							</p>
						</div>
						<div className="flex gap-2 shrink-0">
							<Button variant="outline" className="rounded-xl gap-2 text-xs font-bold shadow-sm">
								<Download className="w-4 h-4" /> Export
							</Button>
							<Button className="rounded-xl gap-2 text-xs font-bold bg-foreground text-background hover:bg-foreground/90">
								<Upload className="w-4 h-4" /> Import
							</Button>
						</div>
					</motion.div>

					{/* 1. Bulk Data Upload */}
					<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
						<Card className="overflow-hidden">
							<div className="p-6 border-b border-border flex items-center justify-between">
								<h3 className="font-bold text-base flex items-center gap-2">
									<UploadCloud className="w-5 h-5 text-primary" />
									1. Bulk Data Upload
								</h3>
								<Badge variant="secondary" className="text-primary bg-primary/10 border-0 text-xs font-semibold">
									Supports CSV, XLSX
								</Badge>
							</div>
							<CardContent className="p-6 md:p-8">
								{/* Semester selector */}
								<div className="mb-6 flex items-center gap-3">
									<label htmlFor="semester" className="text-sm font-bold text-muted-foreground whitespace-nowrap">
										Semester:
									</label>
									<input
										id="semester"
										type="text"
										value={semester}
										onChange={(e) => setSemester(e.target.value)}
										placeholder="e.g. Summer 2025"
										className="px-4 py-2 bg-transparent border border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm text-foreground w-56"
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
									{/* Drop Zone */}
									<div
										className={`md:col-span-3 border-2 border-dashed rounded-2xl p-10 md:p-14 flex flex-col items-center justify-center cursor-pointer transition-all group
                      ${isDragging ? "border-primary/70 bg-primary/5" : "border-border hover:border-primary/40 bg-card"}`}
										onDragOver={handleDragOver}
										onDragLeave={handleDragLeave}
										onDrop={handleDrop}
										onClick={() => !uploading && fileInputRef.current?.click()}
									>
										<div className={`w-20 h-20 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-6 transition-transform shadow-inner ${isDragging ? "scale-110" : "group-hover:scale-110"}`}>
											{uploading ? <Loader2 className="w-10 h-10 animate-spin" /> : <UploadCloud className="w-10 h-10" />}
										</div>
										{uploading ? (
											<>
												<h4 className="text-xl font-bold text-foreground">Parsing File...</h4>
												<p className="text-muted-foreground mt-2 text-sm">Processing {uploadedFile?.name}</p>
											</>
										) : pendingMeta ? (
											<>
												<h4 className="text-xl font-bold text-amber-600">Parsed — Review &amp; Save</h4>
												<p className="text-muted-foreground mt-2 text-sm">
													{pendingMeta.totalParsed} entries parsed | {pendingMeta.tbaCount} TBA | {pendingMeta.conflictCount} conflicts | {pendingMeta.errors.length} parse errors
												</p>
												<p className="mt-3 text-sm font-bold text-amber-600">Review the table below, then click Save All to commit to the database.</p>
												{pendingMeta.errors.length > 0 && (
													<div className="mt-4 max-h-32 overflow-y-auto w-full max-w-lg text-left">
														{pendingMeta.errors.slice(0, 5).map((err, i) => (
															<p key={i} className="text-xs text-destructive flex items-start gap-1 mb-1">
																<AlertCircle className="w-3 h-3 mt-0.5 shrink-0" /> {err}
															</p>
														))}
														{pendingMeta.errors.length > 5 && (
															<p className="text-xs text-muted-foreground">...and {pendingMeta.errors.length - 5} more errors</p>
														)}
													</div>
												)}
												<p className="text-muted-foreground mt-3 text-xs">Click or drop to replace with a different file</p>
											</>
										) : uploadResult ? (
											<>
												<h4 className="text-xl font-bold text-emerald-600">Saved to Database</h4>
												<p className="text-muted-foreground mt-2 text-sm">
													{uploadResult.totalSaved} entries saved | {uploadResult.tbaCount} TBA | {uploadResult.conflictCount} conflicts | {uploadResult.errors.length} parse errors
												</p>
												{uploadResult.errors.length > 0 && (
													<div className="mt-4 max-h-32 overflow-y-auto w-full max-w-lg text-left">
														{uploadResult.errors.slice(0, 5).map((err, i) => (
															<p key={i} className="text-xs text-destructive flex items-start gap-1 mb-1">
																<AlertCircle className="w-3 h-3 mt-0.5 shrink-0" /> {err}
															</p>
														))}
														{uploadResult.errors.length > 5 && (
															<p className="text-xs text-muted-foreground">...and {uploadResult.errors.length - 5} more errors</p>
														)}
													</div>
												)}
												<p className="text-muted-foreground mt-3 text-xs">Click or drop to upload another file</p>
											</>
										) : uploadError ? (
											<>
												<h4 className="text-xl font-bold text-destructive">Upload Failed</h4>
												<p className="text-muted-foreground mt-2 text-sm">{uploadError}</p>
												<p className="text-muted-foreground mt-3 text-xs">Click or drop to try again</p>
											</>
										) : uploadedFile ? (
											<>
												<h4 className="text-xl font-bold text-foreground">{uploadedFile.name}</h4>
												<p className="text-muted-foreground mt-2 text-sm">{(uploadedFile.size / 1024).toFixed(1)} KB — click to replace</p>
											</>
										) : (
											<>
												<h4 className="text-xl font-bold text-foreground">Drop your master data here</h4>
												<p className="text-muted-foreground mt-2 text-sm">CSV, XLSX, or JSON files supported (Max 50MB)</p>
											</>
										)}
										<Button
											type="button"
											className="mt-8 rounded-xl px-8 py-3 shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
											onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
										>
											Select Files to Upload
										</Button>
										<input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.json" className="hidden" onChange={handleFileSelect} />
									</div>

									{/* Recent Uploads Log */}
									<div className="space-y-3">
										<h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent Uploads Log</h4>
										<div className="space-y-3">
											{uploadLogs.length === 0 ? (
												<p className="text-xs text-muted-foreground text-center py-4">No uploads yet</p>
											) : (
												uploadLogs.slice(0, 5).map((log) => (
													<div key={log._id} className="p-3 bg-secondary/50 rounded-xl border border-border">
														<div className="flex items-center gap-3">
															{log.errorCount === 0 ? (
																<CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
															) : (
																<FileText className="w-5 h-5 text-amber-500 shrink-0" />
															)}
															<div className="flex-1 min-w-0">
																<p className="text-xs font-bold truncate">{log.fileName}</p>
																<p className="text-[10px] text-muted-foreground mt-0.5">
																	{new Date(log.createdAt).toLocaleDateString()} | {log.totalEntries} entries | {(log.fileSize / 1024).toFixed(0)} KB
																</p>
															</div>
														</div>
													</div>
												))
											)}
										</div>
										{uploadLogs.length > 0 && (
											<Button variant="link" className="text-primary text-xs font-bold p-0 h-auto w-full justify-center" onClick={handleClearUploadHistory}>
												Clear Upload History
											</Button>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					{/* 2. Manual Entry + Quick Stats */}
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="grid grid-cols-1 lg:grid-cols-3 gap-8"
					>
						{/* Manual Entry Form */}
						<div className="lg:col-span-2">
							<Card className="overflow-hidden border-0 shadow-lg shadow-primary/5">
								<div className="px-6 py-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
									<h3 className="font-extrabold text-base flex items-center gap-2.5 text-foreground">
										<div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
											<FileEdit className="w-4 h-4 text-primary" />
										</div>
										Manual Data Entry
									</h3>
									<p className="text-xs text-muted-foreground mt-1 ml-[42px]">Add courses manually to the pending list</p>
								</div>
								<CardContent className="p-6 pt-8">
									<form onSubmit={handleSubmit} className="space-y-0">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mb-8">
											{/* Left column */}
											<div className="space-y-5">
												<FloatingInput id="courseCode" label="Course Code" value={form.courseCode} onChange={(v) => handleFormChange("courseCode", v)} />
												<FloatingInput id="unicode" label="Unicode" value={form.unicode} onChange={(v) => handleFormChange("unicode", v)} />
												<div className="grid grid-cols-2 gap-4">
													<FloatingInput id="section" label="Section" value={form.section} onChange={(v) => handleFormChange("section", v)} />
													<FloatingInput id="room" label="Room" value={form.room} onChange={(v) => handleFormChange("room", v)} />
												</div>
												{/* Lab toggle */}
												<div
													className="relative flex items-center bg-secondary/40 rounded-xl px-4 py-3 cursor-pointer select-none w-fit hover:bg-secondary/60 transition-colors"
													onClick={() => setForm((prev) => ({ ...prev, isLab: !prev.isLab }))}
												>
													<label className="pointer-events-none absolute left-4 -top-2.5 bg-card px-1 text-xs font-bold text-muted-foreground">
														Lab
													</label>
													<div className="flex items-center gap-3">
														<div className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${form.isLab ? "bg-primary" : "bg-muted"}`}>
															<div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isLab ? "translate-x-4" : "translate-x-0"}`} />
														</div>
														<span className="text-sm text-foreground font-medium">{form.isLab ? "Yes" : "No"}</span>
													</div>
												</div>
											</div>
											{/* Right column */}
											<div className="space-y-5">
												{/* Teacher fields */}
												<div className="grid grid-cols-2 gap-4">
													<FloatingInput id="teacherInitials" label="Teacher Short Name" value={form.teacherInitials} onChange={(v) => handleFormChange("teacherInitials", v)} />
													<FloatingInput id="teacherFullName" label="Teacher Full Name" value={form.teacherFullName} onChange={(v) => handleFormChange("teacherFullName", v)} />
												</div>
												{/* Schedule Day */}
												<div className="relative">
													<select
														value={form.days}
														onChange={(e) => handleFormChange("days", e.target.value)}
														className="w-full px-4 py-3 bg-transparent border border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none text-sm text-foreground"
													>
														<optgroup label="Paired Days">
															{["Sun & Tue", "Mon & Wed", "Thu & Sat"].map((d) => (
																<option key={d} value={d}>{d}</option>
															))}
														</optgroup>
														<optgroup label="Individual Days">
															{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"].map((d) => (
																<option key={d} value={d}>{d}</option>
															))}
														</optgroup>
													</select>
													<label className="pointer-events-none absolute left-4 -top-2.5 bg-card px-1 text-xs font-bold text-muted-foreground">
														Schedule Day
													</label>
													<ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
												</div>
												{/* Time fields */}
												<div className="grid grid-cols-2 gap-4">
													<div className="relative">
														<input
															type="time"
															value={form.startTime}
															onChange={(e) => handleFormChange("startTime", e.target.value)}
															className="w-full px-4 py-3 bg-transparent border border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm text-foreground"
														/>
														<label className="pointer-events-none absolute left-4 -top-2.5 bg-card px-1 text-xs font-bold text-muted-foreground">
															Start Time
														</label>
													</div>
													<div className="relative">
														<input
															type="time"
															value={form.endTime}
															onChange={(e) => handleFormChange("endTime", e.target.value)}
															className="w-full px-4 py-3 bg-transparent border border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm text-foreground"
														/>
														<label className="pointer-events-none absolute left-4 -top-2.5 bg-card px-1 text-xs font-bold text-muted-foreground">
															End Time
														</label>
													</div>
												</div>
											</div>
										</div>

										<div className="flex items-center justify-between pt-5 border-t border-dashed border-border/60">
											<p className="text-xs text-muted-foreground flex items-center gap-1.5">
												<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
												Entry will be added to pending list
											</p>
											<div className="flex gap-3">
												<Button type="button" variant="ghost" className="font-bold text-sm px-6 rounded-xl" onClick={handleReset}>
													Reset Form
												</Button>
												<Button type="submit" className="px-8 rounded-xl font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
													Add Entry
												</Button>
											</div>
										</div>
									</form>
								</CardContent>
							</Card>
						</div>

						{/* Sidebar: Quick Stats + Guidelines */}
						<div className="space-y-6">
							<div className="bg-primary rounded-2xl p-6 text-primary-foreground shadow-xl shadow-primary/20">
								<div className="flex items-center justify-between mb-6">
									<h3 className="font-bold text-lg">Quick Stats</h3>
									<BarChart3 className="w-5 h-5 text-white/50" />
								</div>
								<div className="grid grid-cols-1 gap-4">
									{[
										{ label: "TOTAL REGISTERED COURSES", value: String(stats.totalCourses) },
										{ label: "RUNNING CLASS SECTIONS", value: String(stats.totalSections) },
										{ label: "TBA TEACHERS", value: String(stats.tbaCount) },
										{ label: "SCHEDULE CONFLICTS", value: String(stats.conflictCount) },
									].map((stat) => (
										<div key={stat.label} className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-white/[0.15] transition-colors">
											<p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
											<div className="flex items-end justify-between">
												<p className="text-4xl font-black">{stat.value}</p>
											</div>
										</div>
									))}
								</div>
							</div>

							<Card>
								<CardContent className="p-5">
									<h3 className="font-bold mb-3 flex items-center gap-2 text-foreground text-sm">
										<Info className="w-4 h-4 text-primary" />
										Data Guidelines
									</h3>
									<ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
										{dataGuidelines.map((g, i) => <li key={i}>{g}</li>)}
									</ul>
								</CardContent>
							</Card>
						</div>
					</motion.div>

					{/* 3. Uploaded Schedule Data */}
					<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
						<Card>
							<div className="p-6 border-b border-border flex flex-col gap-4">
								<div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
									<h3 className="font-bold text-base flex items-center gap-2">
										<History className="w-5 h-5 text-primary" />
										{hasPending ? "Parsed Schedule — Unsaved Preview" : "Uploaded Schedule Data"}
										{hasPending ? (
											<Badge variant="secondary" className="ml-2 text-xs bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
												{pendingCourses.length} unsaved
											</Badge>
										) : offeredCourses.length > 0 ? (
											<Badge variant="secondary" className="ml-2 text-xs">{offeredCourses.length} courses</Badge>
										) : null}
									</h3>
									<div className="flex items-center gap-2 flex-wrap">
										{departments.map((dept) => (
											<button
												key={dept}
												onClick={() => setActiveDeptTab(dept)}
												className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${activeDeptTab === dept
													? "bg-primary text-primary-foreground"
													: "bg-secondary text-muted-foreground hover:bg-secondary/80"
													}`}
											>
												{dept}
											</button>
										))}
									</div>
								</div>

								{/* Day filter tabs */}
								<div className="flex items-center gap-1.5 flex-wrap">
									<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mr-1">Days:</span>
									{DAY_FILTER_OPTIONS.map((opt) => {
										const count = dayFilterCounts[opt] ?? 0;
										const isActive = activeDayTab === opt;
										const isPaired = ["Sun & Tue", "Mon & Wed", "Thu & Sat"].includes(opt);
										return (
											<button
												key={opt}
												onClick={() => setActiveDayTab(opt)}
												className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${isActive
														? isPaired
															? "bg-primary text-primary-foreground shadow-sm"
															: opt === "All"
																? "bg-foreground text-background shadow-sm"
																: "bg-primary/80 text-primary-foreground shadow-sm"
														: count === 0
															? "bg-secondary/50 text-muted-foreground/40 cursor-default"
															: isPaired
																? "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
																: "bg-secondary/60 text-muted-foreground/70 hover:bg-secondary hover:text-muted-foreground"
													}`}
												disabled={count === 0 && opt !== "All"}
											>
												{opt}
												{count > 0 && (
													<span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${isActive
															? "bg-white/20 text-inherit"
															: "bg-muted text-muted-foreground"
														}`}>
														{count}
													</span>
												)}
											</button>
										);
									})}
								</div>
							</div>

							{/* Unsaved changes banner */}
							{hasPending && (
								<div className="px-6 py-4 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
									<div className="flex items-start gap-2">
										<AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
										<div>
											<p className="text-sm font-bold text-amber-700 dark:text-amber-400">
												{pendingCourses.length} unsaved entries — not yet in the database
											</p>
											<p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
												Review below. Edit or delete individual rows, then click Save All to commit.
											</p>
										</div>
									</div>
									<Button
										onClick={handleSaveAll}
										disabled={saving}
										className="rounded-xl gap-2 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0"
									>
										{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
										{saving ? "Saving..." : "Save All"}
									</Button>
								</div>
							)}

							{coursesLoading ? (
								<div className="p-12 flex items-center justify-center">
									<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
								</div>
							) : filteredCourses.length === 0 ? (
								<div className="p-12 text-center text-muted-foreground text-sm">
									{hasPending ? "No entries match this filter." : "No courses found. Upload a schedule file to see data here."}
								</div>
							) : (
								<TooltipProvider delayDuration={200}>
									<div className="space-y-0">
										{sortedDayKeys.map((dayKey) => (
											<div key={dayKey}>
												<div className="px-6 py-4 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent border-b border-border border-l-4 border-l-primary flex items-center justify-between">
													<div className="flex items-center gap-3">
														<CalendarDays className="w-5 h-5 text-primary" />
														<h4 className="text-sm font-extrabold text-foreground uppercase tracking-wide">{dayKey}</h4>
														<Badge variant="secondary" className="text-[11px] font-bold bg-primary/15 text-primary border-0 px-2.5 py-0.5 rounded-full">
															{coursesByDay[dayKey].length} {coursesByDay[dayKey].length === 1 ? "course" : "courses"}
														</Badge>
													</div>
												</div>
												<div className="overflow-x-auto">
													<Table>
														<TableHeader>
															<TableRow className="bg-secondary/30">
																<TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-6 w-24">Code</TableHead>
																<TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-20">Unicode</TableHead>
																<TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-16">Sec</TableHead>
																<TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-20">Room</TableHead>
																<TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-20">Teacher</TableHead>
																<TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-28">Day</TableHead>
																<TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-28">Time</TableHead>
																<TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider w-16">Lab</TableHead>
																<TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right pr-6 w-24">Actions</TableHead>
															</TableRow>
														</TableHeader>
														<TableBody>
															{coursesByDay[dayKey].map((course) => {
																const isPending = !("_id" in course);
																const rowId = isPending ? (course as PendingCourse)._tempId : (course as OfferedCourse)._id;
																const isEditing = editingId === rowId;
																const displayTeacher = isPending
																	? (course as PendingCourse).teacher
																	: (course as OfferedCourse).teacherInitials;
																return (
																	<TableRow
																		key={rowId}
																		className={`transition-colors ${isPending
																			? course.hasConflict
																				? "bg-destructive/5 hover:bg-destructive/10 border-l-2 border-l-destructive"
																				: "bg-amber-50/60 dark:bg-amber-950/10 hover:bg-amber-50 dark:hover:bg-amber-950/20 border-l-2 border-l-amber-400"
																			: course.hasConflict
																				? "bg-destructive/5 hover:bg-destructive/10 border-l-2 border-l-destructive"
																				: "hover:bg-secondary/30"
																			}`}
																	>
																		<TableCell className="pl-6">
																			{isEditing ? (
																				<input
																					className="w-full px-2 py-1 text-xs border border-border rounded bg-transparent focus:border-primary outline-none"
																					value={editForm.courseCode ?? ""}
																					onChange={(e) => handleEditField("courseCode", e.target.value)}
																				/>
																			) : (
																				<div className="flex flex-col gap-0.5">
																					<span className="font-bold text-foreground text-sm">{course.courseCode || course.unicode}</span>
																					{isPending && (
																						<span className="text-[10px] text-amber-600 font-semibold leading-tight">UNSAVED</span>
																					)}
																					{course.hasConflict && (
																						<Tooltip>
																							<TooltipTrigger asChild>
																								<span className="text-[10px] text-destructive font-semibold leading-tight cursor-help">
																									Conflict
																								</span>
																							</TooltipTrigger>
																							<TooltipContent side="right" className="max-w-sm">
																								<p className="text-xs font-normal whitespace-pre-wrap">{course.conflictReason}</p>
																							</TooltipContent>
																						</Tooltip>
																					)}
																				</div>
																			)}
																		</TableCell>
																		<TableCell>
																			{isEditing ? (
																				<input
																					className="w-full px-2 py-1 text-xs border border-border rounded bg-transparent focus:border-primary outline-none"
																					value={editForm.unicode ?? ""}
																					onChange={(e) => handleEditField("unicode", e.target.value)}
																				/>
																			) : (
																				<span className="text-sm text-muted-foreground">{course.unicode}</span>
																			)}
																		</TableCell>
																		<TableCell>
																			{isEditing ? (
																				<input
																					className="w-full px-2 py-1 text-xs border border-border rounded bg-transparent focus:border-primary outline-none"
																					value={editForm.section ?? ""}
																					onChange={(e) => handleEditField("section", e.target.value)}
																				/>
																			) : (
																				<span className="text-sm text-muted-foreground">{course.section}</span>
																			)}
																		</TableCell>
																		<TableCell>
																			{isEditing ? (
																				<input
																					className="w-full px-2 py-1 text-xs border border-border rounded bg-transparent focus:border-primary outline-none"
																					value={editForm.room ?? ""}
																					onChange={(e) => handleEditField("room", e.target.value)}
																				/>
																			) : (
																				<span className="text-sm text-muted-foreground">{course.room}</span>
																			)}
																		</TableCell>
																		<TableCell>
																			{isEditing ? (
																				<input
																					className="w-full px-2 py-1 text-xs border border-border rounded bg-transparent focus:border-primary outline-none"
																					value={editForm.teacherInitials ?? editForm.teacher ?? ""}
																					onChange={(e) => {
																						handleEditField("teacherInitials", e.target.value);
																						handleEditField("teacher", e.target.value);
																					}}
																				/>
																			) : (
																				<span className={`text-sm ${course.teacherTBA ? "text-amber-500 font-bold" : "text-muted-foreground"}`}>
																					{displayTeacher || "TBA"}
																				</span>
																			)}
																		</TableCell>
																		<TableCell>
																			{isEditing ? (
																				<select
																					className="w-full px-2 py-1 text-xs border border-border rounded bg-transparent focus:border-primary outline-none"
																					value={getDaysLabel(editForm.days ?? course.days)}
																					onChange={(e) => {
																						const newDays = DAY_MAP[e.target.value] ?? [e.target.value];
																						setEditForm((prev) => ({ ...prev, days: newDays }));
																					}}
																				>
																					<optgroup label="Paired Days">
																						{["Sun & Tue", "Mon & Wed", "Thu & Sat"].map((d) => (
																							<option key={d} value={d}>{d}</option>
																						))}
																					</optgroup>
																					<optgroup label="Individual Days">
																						{["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"].map((d) => (
																							<option key={d} value={d}>{d}</option>
																						))}
																					</optgroup>
																				</select>
																			) : (
																				<span className="text-sm text-muted-foreground">{getDaysLabel(course.days)}</span>
																			)}
																		</TableCell>
																		<TableCell>
																			{isEditing ? (
																				<div className="flex gap-1">
																					<input
																						className="w-16 px-1 py-1 text-xs border border-border rounded bg-transparent focus:border-primary outline-none"
																						value={editForm.startTime ?? ""}
																						onChange={(e) => handleEditField("startTime", e.target.value)}
																						placeholder="HH:MM"
																					/>
																					<span className="text-xs text-muted-foreground self-center">-</span>
																					<input
																						className="w-16 px-1 py-1 text-xs border border-border rounded bg-transparent focus:border-primary outline-none"
																						value={editForm.endTime ?? ""}
																						onChange={(e) => handleEditField("endTime", e.target.value)}
																						placeholder="HH:MM"
																					/>
																				</div>
																			) : (
																				<span className="text-xs text-muted-foreground">{course.startTime} - {course.endTime}</span>
																			)}
																		</TableCell>
																		<TableCell>
																			<div className="flex items-center gap-2">
																				<div
																					className="flex items-center gap-2 cursor-pointer select-none"
																					onClick={() => handleToggleLab(course as OfferedCourse | PendingCourse)}
																				>
																					<div className={`relative w-8 h-[18px] rounded-full transition-colors flex-shrink-0 ${course.isLab ? "bg-purple-500" : "bg-muted"}`}>
																						<div className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-white rounded-full shadow transition-transform ${course.isLab ? "translate-x-[14px]" : "translate-x-0"}`} />
																					</div>
																					<span className={`text-[10px] font-semibold ${course.isLab ? "text-purple-600 dark:text-purple-400" : "text-muted-foreground"}`}>
																						{course.isLab ? "Lab" : "-"}
																					</span>
																				</div>
																				{course.hasConflict && (
																					<Tooltip>
																						<TooltipTrigger asChild>
																							<div>
																								<Badge variant="destructive" className="text-[10px] w-fit cursor-help">!</Badge>
																							</div>
																						</TooltipTrigger>
																						<TooltipContent side="left" className="max-w-sm">
																							<p className="text-xs font-normal whitespace-pre-wrap">{course.conflictReason}</p>
																						</TooltipContent>
																					</Tooltip>
																				)}
																			</div>
																		</TableCell>
																		<TableCell className="text-right pr-6">
																			{isEditing ? (
																				<div className="flex items-center justify-end gap-1">
																					<Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:text-emerald-600" onClick={handleSaveEdit}>
																						<Save className="w-3.5 h-3.5" />
																					</Button>
																					<Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:text-muted-foreground" onClick={handleCancelEdit}>
																						<X className="w-3.5 h-3.5" />
																					</Button>
																				</div>
																			) : (
																				<div className="flex items-center justify-end gap-1">
																					<Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:text-primary" onClick={() => handleStartEdit(course as OfferedCourse | PendingCourse)}>
																						<Pencil className="w-3.5 h-3.5" />
																					</Button>
																					<Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg hover:text-destructive" onClick={() => handleDeleteCourse(course as OfferedCourse | PendingCourse)}>
																						<Trash2 className="w-3.5 h-3.5" />
																					</Button>
																				</div>
																			)}
																		</TableCell>
																	</TableRow>
																);
															})}
														</TableBody>
													</Table>
												</div>
											</div>
										))}
									</div>
								</TooltipProvider>
							)}

							{filteredCourses.length > 0 && (
								<div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
									<p className="text-xs text-muted-foreground">
										Showing {filteredCourses.length} of {hasPending ? pendingCourses.length : offeredCourses.length} courses
										{activeDeptTab !== "All" && ` in ${activeDeptTab}`}
										{hasPending && " — UNSAVED"}
									</p>
									{hasPending && (
										<Button
											onClick={handleSaveAll}
											disabled={saving}
											className="rounded-xl gap-2 text-sm font-bold bg-amber-600 hover:bg-amber-700 text-white"
										>
											{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
											{saving ? "Saving..." : `Save All ${pendingCourses.length} Entries`}
										</Button>
									)}
								</div>
							)}
						</Card>
					</motion.div>

					{/* 4. Upload Issues: Conflicts + Parse Errors */}
					{(pendingMeta || uploadResult) && (() => {
						const meta = pendingMeta ?? uploadResult;
						const conflicts = meta?.conflictCount ?? 0;
						const errors = meta?.errors ?? [];
						const totalParsed = meta?.totalParsed ?? 0;
						const totalSaved = pendingMeta ? pendingCourses.length : (uploadResult?.totalSaved ?? 0);
						if (conflicts === 0 && errors.length === 0) return null;
						return (
							<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
								<Card>
									<div className="p-6 border-b border-border flex items-center justify-between">
										<h3 className="font-bold text-base flex items-center gap-2">
											<AlertCircle className="w-5 h-5 text-destructive" />
											Upload Issues
										</h3>
										<p className="text-xs text-muted-foreground">
											{totalSaved} {pendingMeta ? "pending" : "saved"} / {totalParsed} parsed
										</p>
									</div>
									<CardContent className="p-6 space-y-4">
										{conflicts > 0 && (
											<div>
												<p className="text-xs font-bold text-destructive uppercase tracking-wider mb-2 flex items-center gap-1.5">
													<AlertCircle className="w-3.5 h-3.5" />
													{conflicts} Schedule Conflicts — rows highlighted in red in the table. Click pencil to fix.
												</p>
											</div>
										)}
										{errors.length > 0 && (
											<div>
												<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
													{errors.length} Parse Errors — rows could not be read from the Excel file
												</p>
												<div className="space-y-1.5 max-h-48 overflow-y-auto">
													{errors.map((err, i) => (
														<div key={i} className="flex items-start gap-2 p-2 bg-destructive/5 rounded-lg border border-destructive/10">
															<AlertCircle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
															<p className="text-xs text-foreground">{err}</p>
														</div>
													))}
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							</motion.div>
						);
					})()}

				</main>
			</div>
		</div>
	);
};

export default AdminScheduleBuilder;

