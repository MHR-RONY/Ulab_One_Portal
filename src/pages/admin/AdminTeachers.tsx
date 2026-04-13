import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	UserPlus, Eye, Pencil, CalendarDays, Trash2,
	ChevronDown, Loader2, AlertCircle, CheckCircle2,
	AtSign, Lock, User, Hash, BookOpen, Eye as EyeIcon, EyeOff, Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import {
	Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import api from "@/lib/api";

const DEPT_OPTIONS = ["CSE", "BBA", "English", "MSJ", "Bangla", "EEE", "Architecture", "ULAB"];
const DEPT_FILTERS = ["All Departments", ...DEPT_OPTIONS];
const ITEMS_PER_PAGE = 20;

const AVATAR_COLORS = [
	"bg-primary/15 text-primary",
	"bg-chart-2/15 text-chart-2",
	"bg-chart-3/15 text-chart-3",
	"bg-chart-4/15 text-chart-4",
	"bg-destructive/15 text-destructive",
];

interface ITeacherRow {
	_id: string;
	name: string;
	email: string;
	teacherId: string;
	department: string;
	avatar?: string | null;
	avatar?: string | null;
}

const getInitials = (name: string) => {
	const parts = name.trim().split(" ");
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AdminTeachers = () => {
	const [activeDept, setActiveDept] = useState("All Departments");
	const [currentPage, setCurrentPage] = useState(1);
	const [searchQuery, setSearchQuery] = useState("");
	const navigate = useNavigate();

	// Teacher list state
	const [teachers, setTeachers] = useState<ITeacherRow[]>([]);
	const [loadingTeachers, setLoadingTeachers] = useState(true);
	const [fetchError, setFetchError] = useState("");

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [form, setForm] = useState({ name: "", email: "", password: "", teacherId: "", department: "" });
	const [showPassword, setShowPassword] = useState(false);
	const [formErrors, setFormErrors] = useState<Partial<typeof form>>({});
	const [submitting, setSubmitting] = useState(false);
	const [formError, setFormError] = useState("");
	const [formSuccess, setFormSuccess] = useState("");

	// Edit dialog state
	const [editTeacher, setEditTeacher] = useState<ITeacherRow | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editForm, setEditForm] = useState({ name: "", email: "", teacherId: "", department: "" });
	const [editFormErrors, setEditFormErrors] = useState<Partial<{ name: string; email: string; teacherId: string; department: string }>>({});
	const [editSubmitting, setEditSubmitting] = useState(false);
	const [editFormError, setEditFormError] = useState("");
	const [editFormSuccess, setEditFormSuccess] = useState("");
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [deleteSubmitting, setDeleteSubmitting] = useState(false);

	const fetchTeachers = async () => {
		setLoadingTeachers(true);
		setFetchError("");
		try {
			const { data } = await api.get("/admin/teachers");
			setTeachers(Array.isArray(data.data?.teachers) ? data.data.teachers : []);
		} catch {
			setFetchError("Failed to load teachers. Please try again.");
		} finally {
			setLoadingTeachers(false);
		}
	};

	useEffect(() => { fetchTeachers(); }, []);

	useEffect(() => { setCurrentPage(1); }, [searchQuery, activeDept]);

	const filteredTeachers = teachers.filter((t) => {
		const matchesDept = activeDept === "All Departments" || t.department === activeDept;
		const q = searchQuery.trim().toLowerCase();
		const matchesSearch =
			!q ||
			t.name.toLowerCase().includes(q) ||
			t.email.toLowerCase().includes(q) ||
			t.teacherId.toLowerCase().includes(q);
		return matchesDept && matchesSearch;
	});
	const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / ITEMS_PER_PAGE));
	const paginatedTeachers = filteredTeachers.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	const validate = () => {
		const errors: Partial<typeof form> = {};
		if (!form.name.trim()) errors.name = "Name is required";
		if (!form.email.trim()) errors.email = "Email is required";
		if (!form.password) errors.password = "Password is required";
		else if (form.password.length < 6) errors.password = "Minimum 6 characters";
		if (!form.teacherId.trim()) errors.teacherId = "Teacher ID is required";
		if (!form.department) errors.department = "Department is required";
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError("");
		setFormSuccess("");
		if (!validate()) return;
		setSubmitting(true);
		try {
			await api.post("/admin/teacher", form);
			setFormSuccess("Teacher account created successfully.");
			setTimeout(() => {
				setDialogOpen(false);
				setForm({ name: "", email: "", password: "", teacherId: "", department: "" });
				setFormErrors({});
				setFormSuccess("");
				fetchTeachers();
			}, 1200);
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } } };
			setFormError(err.response?.data?.message ?? "Failed to create teacher. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	const updateField = (field: keyof typeof form, value: string) => {
		setForm((prev) => ({ ...prev, [field]: value }));
		if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }));
		setFormError("");
	};

	const openEditDialog = (t: ITeacherRow) => {
		setEditTeacher(t);
		setEditForm({ name: t.name, email: t.email, teacherId: t.teacherId, department: t.department });
		setEditFormErrors({});
		setEditFormError("");
		setEditFormSuccess("");
		setDeleteConfirmOpen(false);
		setEditDialogOpen(true);
	};

	const validateEditForm = () => {
		const errors: Partial<{ name: string; email: string; teacherId: string; department: string }> = {};
		if (!editForm.name.trim()) errors.name = "Name is required";
		if (!editForm.email.trim()) errors.email = "Email is required";
		if (!editForm.teacherId.trim()) errors.teacherId = "Teacher ID is required";
		if (!editForm.department) errors.department = "Department is required";
		setEditFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editTeacher || !validateEditForm()) return;
		setEditFormError("");
		setEditFormSuccess("");
		setEditSubmitting(true);
		try {
			await api.put(`/admin/teacher/${editTeacher._id}`, editForm);
			setEditFormSuccess("Teacher updated successfully.");
			setTimeout(() => {
				setEditDialogOpen(false);
				fetchTeachers();
			}, 1200);
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } } };
			setEditFormError(err.response?.data?.message ?? "Failed to update teacher. Please try again.");
		} finally {
			setEditSubmitting(false);
		}
	};

	const handleDeleteTeacher = async () => {
		if (!editTeacher) return;
		setDeleteSubmitting(true);
		try {
			await api.delete(`/admin/teacher/${editTeacher._id}`);
			setEditDialogOpen(false);
			fetchTeachers();
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } } };
			setEditFormError(err.response?.data?.message ?? "Failed to delete teacher. Please try again.");
			setDeleteConfirmOpen(false);
		} finally {
			setDeleteSubmitting(false);
		}
	};

	const updateEditField = (field: keyof typeof editForm, value: string) => {
		setEditForm((prev) => ({ ...prev, [field]: value }));
		if (editFormErrors[field]) setEditFormErrors((prev) => ({ ...prev, [field]: undefined }));
		setEditFormError("");
	};

	return (
		<div className="flex h-screen overflow-hidden premium-bg admin-theme">
			<div className="hidden md:block">
				<AdminSidebar activePage="Teachers" />
			</div>
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<AdminHeader />
				<main className="flex-1 overflow-y-auto p-4 md:p-8">
					{/* Page Header */}
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8"
					>
						<div>
							<h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
								Teacher Directory
							</h2>
							<p className="text-muted-foreground text-sm mt-1">
								Manage and monitor all faculty members across departments.
							</p>
						</div>
						<button
							onClick={() => { setDialogOpen(true); setFormError(""); setFormSuccess(""); }}
							className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
						>
							<UserPlus className="w-4 h-4" />
							Add New Teacher
						</button>
					</motion.div>

					{/* Search + Department Filters */}
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1, duration: 0.4 }}
						className="flex flex-col gap-4 mb-6"
					>
						{/* Search bar */}
						<div className="relative max-w-sm">
							<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
							<input
								type="text"
								placeholder="Search by name, email or ID..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
							/>
						</div>
						{/* Dept filters */}
						<div className="flex flex-wrap items-center gap-3">
							{DEPT_FILTERS.map((dept) => (
								<button
									key={dept}
									onClick={() => setActiveDept(dept)}
									className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeDept === dept
										? "bg-primary text-primary-foreground"
										: "bg-card border border-border hover:border-primary/40 text-foreground"
										}`}
								>
									{dept}
									{dept !== "All Departments" && <ChevronDown className="w-3.5 h-3.5" />}
								</button>
							))}
						</div>
					</motion.div>

					{/* Table */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.4 }}
						className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
					>
						{loadingTeachers ? (
							<div className="overflow-x-auto animate-pulse">
								<table className="w-full text-left border-collapse">
									<thead>
										<tr className="border-b border-border bg-secondary/50">
											<th className="px-6 py-4"><div className="h-3 w-28 bg-muted rounded-full" /></th>
											<th className="px-6 py-4"><div className="h-3 w-20 bg-muted rounded-full" /></th>
											<th className="px-6 py-4"><div className="h-3 w-24 bg-muted rounded-full" /></th>
											<th className="px-6 py-4"><div className="h-3 w-16 bg-muted rounded-full" /></th>
											<th className="px-6 py-4"><div className="h-3 w-16 bg-muted rounded-full ml-auto" /></th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{Array.from({ length: 8 }).map((_, i) => (
											<tr key={i}>
												<td className="px-6 py-4">
													<div className="flex items-center gap-3">
														<div className="w-10 h-10 rounded-full bg-muted flex-shrink-0" />
														<div className="space-y-1.5">
															<div className="h-3 w-36 bg-muted rounded-full" />
															<div className="h-2 w-44 bg-muted rounded-full" />
														</div>
													</div>
												</td>
												<td className="px-6 py-4"><div className="h-3 w-20 bg-muted rounded-full" /></td>
												<td className="px-6 py-4"><div className="h-5 w-16 bg-muted rounded-full" /></td>
												<td className="px-6 py-4"><div className="h-5 w-14 bg-muted rounded-full" /></td>
												<td className="px-6 py-4">
													<div className="flex items-center justify-end gap-2">
														<div className="h-8 w-8 bg-muted rounded-lg" />
														<div className="h-8 w-8 bg-muted rounded-lg" />
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						) : fetchError ? (
							<div className="flex items-center justify-center py-20 gap-3 text-destructive">
								<AlertCircle className="w-5 h-5" />
								<span className="text-sm font-medium">{fetchError}</span>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left border-collapse">
									<thead>
										<tr className="border-b border-border bg-secondary/50">
											<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Teacher Name</th>
											<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">ID Number</th>
											<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Department</th>
											<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
											<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border">
										{filteredTeachers.length === 0 ? (
											<tr>
												<td colSpan={5} className="px-6 py-16 text-center text-sm text-muted-foreground">
													{searchQuery ? `No teachers match "${searchQuery}"` : `No teachers found${activeDept !== "All Departments" ? ` in ${activeDept}` : ""}. Click "Add New Teacher" to create one.`}
												</td>
											</tr>
										) : (
											paginatedTeachers.map((teacher, i) => (
												<motion.tr
													key={teacher._id}
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													transition={{ delay: 0.25 + i * 0.04, duration: 0.3 }}
													className="hover:bg-secondary/30 transition-colors"
												>
													<td className="px-6 py-4">
														<div className="flex items-center gap-3">
															<div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 relative">
																{teacher.avatar && (
																	<img
																		src={`${(import.meta.env.VITE_API_URL ?? "http://localhost:5003/api").replace(/\/api$/, "")}${teacher.avatar}`}
																		alt={teacher.name}
																		className="w-full h-full object-cover absolute inset-0"
																		onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
																	/>
																)}
																<div className={`w-full h-full ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center font-bold text-xs`}>
																	{getInitials(teacher.name)}
																</div>
															</div>
															<div>
																<p className="text-sm font-bold text-foreground">{teacher.name}</p>
																<p className="text-[11px] text-muted-foreground">{teacher.email}</p>
															</div>
														</div>
													</td>
													<td className="px-6 py-4 text-sm font-medium text-foreground">{teacher.teacherId}</td>
													<td className="px-6 py-4">
														<span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-secondary text-foreground border border-border">
															{teacher.department}
														</span>
													</td>
													<td className="px-6 py-4">
														<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stat-emerald/10 text-stat-emerald">
															<span className="w-1.5 h-1.5 rounded-full bg-stat-emerald" />
															Active
														</span>
													</td>
													<td className="px-6 py-4 text-right">
														<div className="flex items-center justify-end gap-2">
															<button
																onClick={() => navigate(`/admin/teachers/${teacher._id}`)}
																className="p-1.5 hover:bg-secondary rounded-lg text-primary transition-colors"
																title="View Profile"
															>
																<Eye className="w-5 h-5" />
															</button>
															<button
																onClick={() => openEditDialog(teacher)}
																className="p-1.5 hover:bg-secondary rounded-lg text-primary transition-colors"
																title="Edit"
															>
																<Pencil className="w-5 h-5" />
															</button>
															<button
																onClick={() => navigate("/admin/schedules")}
																className="p-1.5 hover:bg-secondary rounded-lg text-primary transition-colors"
																title="Schedule"
															>
																<CalendarDays className="w-5 h-5" />
															</button>
														</div>
													</td>
												</motion.tr>
											))
										)}
									</tbody>
								</table>
							</div>
						)}

						{/* Pagination */}
						{!loadingTeachers && !fetchError && (
							<div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
								<p className="text-sm text-muted-foreground font-medium">
									Showing{" "}
									<span className="text-foreground font-bold">
										{filteredTeachers.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1}&ndash;{Math.min(currentPage * ITEMS_PER_PAGE, filteredTeachers.length)}
									</span>{" of "}
									<span className="text-foreground font-bold">{filteredTeachers.length}</span> teacher{filteredTeachers.length !== 1 ? "s" : ""}
								</p>
								{totalPages > 1 && (
									<div className="flex items-center gap-2">
										<button
											onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
											disabled={currentPage === 1}
											className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
										>
											Previous
										</button>
										{Array.from({ length: totalPages }, (_, idx) => idx + 1).map((page) => (
											<button
												key={page}
												onClick={() => setCurrentPage(page)}
												className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${currentPage === page
														? "bg-primary text-primary-foreground"
														: "border border-border hover:bg-secondary text-foreground"
													}`}
											>
												{page}
											</button>
										))}
										<button
											onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
											disabled={currentPage === totalPages}
											className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
										>
											Next
										</button>
									</div>
								)}
							</div>
						)}
					</motion.div>
				</main>
			</div>

			{/* Create Teacher Dialog */}
			<Dialog open={dialogOpen} onOpenChange={(open) => { if (!submitting) { setDialogOpen(open); if (!open) { setForm({ name: "", email: "", password: "", teacherId: "", department: "" }); setFormErrors({}); setFormError(""); setFormSuccess(""); } } }}>
				<DialogContent className="sm:max-w-md rounded-2xl admin-theme">
					<DialogHeader>
						<DialogTitle className="text-xl font-extrabold">Create Teacher Account</DialogTitle>
						<DialogDescription>
							Fill in the details below. The teacher will use this email and password to log in.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4 mt-2">
						<AnimatePresence>
							{formError && (
								<motion.div
									initial={{ opacity: 0, y: -4 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -4 }}
									className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900/50 dark:bg-red-900/20"
								>
									<AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
									<p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
								</motion.div>
							)}
							{formSuccess && (
								<motion.div
									initial={{ opacity: 0, y: -4 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -4 }}
									className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-900/50 dark:bg-green-900/20"
								>
									<CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
									<p className="text-sm text-green-600 dark:text-green-400">{formSuccess}</p>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Name */}
						<div className="space-y-1.5">
							<label className="text-sm font-semibold text-foreground">Full Name</label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									placeholder="e.g. Dr. Sarah Jenkins"
									className={`pl-9 rounded-xl ${formErrors.name ? "border-red-500" : ""}`}
									value={form.name}
									onChange={(e) => updateField("name", e.target.value)}
								/>
							</div>
							{formErrors.name && <p className="text-xs text-red-500">{formErrors.name}</p>}
						</div>

						{/* Email */}
						<div className="space-y-1.5">
							<label className="text-sm font-semibold text-foreground">Email Address</label>
							<div className="relative">
								<AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									type="email"
									placeholder="teacher@ulab.edu.bd"
									className={`pl-9 rounded-xl ${formErrors.email ? "border-red-500" : ""}`}
									value={form.email}
									onChange={(e) => updateField("email", e.target.value)}
								/>
							</div>
							{formErrors.email && <p className="text-xs text-red-500">{formErrors.email}</p>}
						</div>

						{/* Password */}
						<div className="space-y-1.5">
							<label className="text-sm font-semibold text-foreground">Password</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									type={showPassword ? "text" : "password"}
									placeholder="Minimum 6 characters"
									className={`pl-9 pr-9 rounded-xl ${formErrors.password ? "border-red-500" : ""}`}
									value={form.password}
									onChange={(e) => updateField("password", e.target.value)}
								/>
								<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
									{showPassword ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
								</button>
							</div>
							{formErrors.password && <p className="text-xs text-red-500">{formErrors.password}</p>}
						</div>

						{/* Teacher ID */}
						<div className="space-y-1.5">
							<label className="text-sm font-semibold text-foreground">Teacher ID</label>
							<div className="relative">
								<Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									placeholder="e.g. T-1001"
									className={`pl-9 rounded-xl ${formErrors.teacherId ? "border-red-500" : ""}`}
									value={form.teacherId}
									onChange={(e) => updateField("teacherId", e.target.value)}
								/>
							</div>
							{formErrors.teacherId && <p className="text-xs text-red-500">{formErrors.teacherId}</p>}
						</div>

						{/* Department */}
						<div className="space-y-1.5">
							<label className="text-sm font-semibold text-foreground">Department</label>
							<div className="relative">
								<BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
								<Select value={form.department} onValueChange={(v) => updateField("department", v)}>
									<SelectTrigger className={`pl-9 rounded-xl ${formErrors.department ? "border-red-500" : ""}`}>
										<SelectValue placeholder="Select department" />
									</SelectTrigger>
									<SelectContent>
										{DEPT_OPTIONS.map((d) => (
											<SelectItem key={d} value={d}>{d}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							{formErrors.department && <p className="text-xs text-red-500">{formErrors.department}</p>}
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={submitting}
							className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-60 mt-2"
						>
							{submitting ? (
								<><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
							) : (
								<><UserPlus className="w-4 h-4" /> Create Teacher Account</>
							)}
						</button>
					</form>
				</DialogContent>
			</Dialog>

			{/* Edit Teacher Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={(open) => { if (!editSubmitting && !deleteSubmitting) { setEditDialogOpen(open); if (!open) setDeleteConfirmOpen(false); } }}>
				<DialogContent className="sm:max-w-md rounded-2xl admin-theme">
					<DialogHeader>
						<DialogTitle className="text-xl font-extrabold">Edit Teacher</DialogTitle>
						<DialogDescription>
							Update the details for {editTeacher?.name ?? "this teacher"}.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
						<AnimatePresence>
							{editFormError && (
								<motion.div
									initial={{ opacity: 0, y: -4 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -4 }}
									className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-900/50 dark:bg-red-900/20"
								>
									<AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
									<p className="text-sm text-red-600 dark:text-red-400">{editFormError}</p>
								</motion.div>
							)}
							{editFormSuccess && (
								<motion.div
									initial={{ opacity: 0, y: -4 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -4 }}
									className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-900/50 dark:bg-green-900/20"
								>
									<CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
									<p className="text-sm text-green-600 dark:text-green-400">{editFormSuccess}</p>
								</motion.div>
							)}
						</AnimatePresence>

						<div className="space-y-1.5">
							<label className="text-sm font-semibold text-foreground">Full Name</label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									placeholder="e.g. Dr. Sarah Jenkins"
									className={`pl-9 rounded-xl ${editFormErrors.name ? "border-red-500" : ""}`}
									value={editForm.name}
									onChange={(e) => updateEditField("name", e.target.value)}
								/>
							</div>
							{editFormErrors.name && <p className="text-xs text-red-500">{editFormErrors.name}</p>}
						</div>

						<div className="space-y-1.5">
							<label className="text-sm font-semibold text-foreground">Email Address</label>
							<div className="relative">
								<AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									type="email"
									placeholder="teacher@ulab.edu.bd"
									className={`pl-9 rounded-xl ${editFormErrors.email ? "border-red-500" : ""}`}
									value={editForm.email}
									onChange={(e) => updateEditField("email", e.target.value)}
								/>
							</div>
							{editFormErrors.email && <p className="text-xs text-red-500">{editFormErrors.email}</p>}
						</div>

						<div className="space-y-1.5">
							<label className="text-sm font-semibold text-foreground">Teacher ID</label>
							<div className="relative">
								<Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									placeholder="e.g. T-1001"
									className={`pl-9 rounded-xl ${editFormErrors.teacherId ? "border-red-500" : ""}`}
									value={editForm.teacherId}
									onChange={(e) => updateEditField("teacherId", e.target.value)}
								/>
							</div>
							{editFormErrors.teacherId && <p className="text-xs text-red-500">{editFormErrors.teacherId}</p>}
						</div>

						<div className="space-y-1.5">
							<label className="text-sm font-semibold text-foreground">Department</label>
							<div className="relative">
								<BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
								<Select value={editForm.department} onValueChange={(v) => updateEditField("department", v)}>
									<SelectTrigger className={`pl-9 rounded-xl ${editFormErrors.department ? "border-red-500" : ""}`}>
										<SelectValue placeholder="Select department" />
									</SelectTrigger>
									<SelectContent>
										{DEPT_OPTIONS.map((d) => (
											<SelectItem key={d} value={d}>{d}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							{editFormErrors.department && <p className="text-xs text-red-500">{editFormErrors.department}</p>}
						</div>

						<button
							type="submit"
							disabled={editSubmitting || !!editFormSuccess}
							className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-60"
						>
							{editSubmitting ? (
								<><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
							) : (
								<><Pencil className="w-4 h-4" /> Update Teacher</>
							)}
						</button>
					</form>

					<div className="mt-4 pt-4 border-t border-border">
						{!deleteConfirmOpen ? (
							<button
								type="button"
								onClick={() => setDeleteConfirmOpen(true)}
								disabled={editSubmitting}
								className="w-full py-2.5 rounded-xl text-sm font-bold border border-destructive/40 text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-2"
							>
								<Trash2 className="w-4 h-4" /> Delete Teacher
							</button>
						) : (
							<div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 space-y-3">
								<p className="text-sm text-destructive font-semibold text-center">
									Are you sure? This action cannot be undone.
								</p>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => setDeleteConfirmOpen(false)}
										disabled={deleteSubmitting}
										className="flex-1 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-secondary transition-colors"
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={handleDeleteTeacher}
										disabled={deleteSubmitting}
										className="flex-1 py-2 rounded-xl text-sm font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"
									>
										{deleteSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete"}
									</button>
								</div>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default AdminTeachers;
