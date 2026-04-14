import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
	Search, Upload, FileText, MoreVertical, ArrowUpCircle,
	Pin, Pencil, Trash2, LayoutGrid, List, SlidersHorizontal,
	ChevronRight, ChevronLeft, Loader2
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { useDepartmentDetail, useRepositoryNotes, useUpdateRepository, useDeleteRepository, type DeptCourse } from "@/hooks/useAdminResources";

const typeColors: Record<string, string> = {
	pdf: "bg-orange-100 dark:bg-orange-900/30 text-primary",
	docx: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
	pptx: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
	other: "bg-secondary text-muted-foreground",
};

const AdminDepartmentNotes = () => {
	const { deptId } = useParams<{ deptId: string }>();
	const [selectedCourseIdx, setSelectedCourseIdx] = useState(0);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [listViewMode, setListViewMode] = useState<"list" | "grid">("list");
	const [searchQuery, setSearchQuery] = useState("");

	// Edit dialog state
	const [editOpen, setEditOpen] = useState(false);
	const [editCourse, setEditCourse] = useState<DeptCourse | null>(null);
	const [editName, setEditName] = useState("");
	const [editCode, setEditCode] = useState("");

	// Delete dialog state
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deleteCourse, setDeleteCourse] = useState<DeptCourse | null>(null);

	const { detail, loading: detailLoading, refetch: refetchDetail } = useDepartmentDetail(deptId ?? "cse");
	const { updateRepository, loading: updateLoading, error: updateError } = useUpdateRepository();
	const { deleteRepository, loading: deleteLoading } = useDeleteRepository();

	const selectedCourse = detail?.courses[selectedCourseIdx] ?? null;
	const { notes, loading: notesLoading } = useRepositoryNotes(selectedCourse?._id ?? null);

	const handleEditOpen = (course: DeptCourse) => {
		setEditCourse(course);
		setEditName(course.title);
		setEditCode(course.code);
		setEditOpen(true);
	};

	const handleEditSave = async () => {
		if (!editCourse) return;
		const success = await updateRepository(editCourse._id, {
			courseName: editName,
			courseCode: editCode,
		});
		if (success) {
			setEditOpen(false);
			setEditCourse(null);
			await refetchDetail();
		}
	};

	const handleDeleteOpen = (course: DeptCourse) => {
		setDeleteCourse(course);
		setDeleteOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!deleteCourse) return;
		const success = await deleteRepository(deleteCourse._id);
		if (success) {
			setDeleteOpen(false);
			setDeleteCourse(null);
			if (selectedCourseIdx > 0) setSelectedCourseIdx(selectedCourseIdx - 1);
			await refetchDetail();
		}
	};

	const filteredNotes = searchQuery
		? notes.filter((n) => n.title.toLowerCase().includes(searchQuery.toLowerCase()))
		: notes;

	return (
		<div className="flex min-h-screen bg-background admin-theme">
			<AdminSidebar activePage="Notes & Resources" />
			<div className="flex-1 flex flex-col">
				<AdminHeader />
				<main className="flex-1 p-6 lg:p-10 overflow-y-auto">
					<div className="max-w-7xl mx-auto space-y-8">
						{/* Breadcrumbs & Header */}
						<div className="flex flex-col gap-2">
							<div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
								<Link to="/admin/resources" className="hover:text-primary transition-colors">Portal</Link>
								<ChevronRight className="w-3 h-3" />
								<Link to="/admin/resources" className="hover:text-primary transition-colors">Department</Link>
								<ChevronRight className="w-3 h-3" />
								<span className="text-foreground">{detail?.dept ?? deptId?.toUpperCase()} Notes Management</span>
							</div>
							<div className="flex flex-wrap justify-between items-end gap-4">
								<div>
									<h1 className="text-foreground text-3xl font-black tracking-tight">Departmental Notes</h1>
									<p className="text-muted-foreground mt-1">Manage and moderate high-quality academic resources.</p>
								</div>
								<div className="flex gap-3">
									<Button variant="outline" className="gap-2">
										<Upload className="w-4 h-4" />
										Export Report
									</Button>
									<Button className="gap-2 shadow-lg shadow-primary/20">
										<Upload className="w-4 h-4" />
										Batch Upload
									</Button>
								</div>
							</div>
						</div>

						{/* Search */}
						<div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
							<div className="relative w-full md:w-96">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									className="pl-10 bg-secondary border-border rounded-xl"
									placeholder="Search notes..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
								/>
							</div>
						</div>

						{/* Stats Grid */}
						{detailLoading ? (
							<div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
						) : (
							<>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="flex flex-col gap-2 rounded-2xl p-6 bg-card border border-border shadow-sm relative overflow-hidden group">
										<div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
											<FileText className="w-16 h-16" />
										</div>
										<p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Total Notes</p>
										<div className="flex items-baseline gap-2">
											<p className="text-foreground text-3xl font-bold">{detail?.totalNotes ?? 0}</p>
										</div>
									</div>
									<div className="flex flex-col gap-2 rounded-2xl p-6 bg-card border border-border shadow-sm relative overflow-hidden group">
										<div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
											<FileText className="w-16 h-16" />
										</div>
										<p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Course Repositories</p>
										<div className="flex items-baseline gap-2">
											<p className="text-foreground text-3xl font-bold">{detail?.courses.length ?? 0}</p>
										</div>
									</div>
									<div className="flex flex-col gap-2 rounded-2xl p-6 bg-card border border-border shadow-sm relative overflow-hidden group">
										<div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
											<FileText className="w-16 h-16" />
										</div>
										<p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Pending Approvals</p>
										<div className="flex items-baseline gap-2">
											<p className="text-foreground text-3xl font-bold">{detail?.pendingCount ?? 0}</p>
										</div>
									</div>
								</div>

								{/* Course Repositories */}
								<div className="flex flex-col gap-4">
									<div className="flex items-center justify-between">
										<h3 className="text-foreground text-lg font-bold">Course Repositories</h3>
										<div className="flex items-center bg-secondary p-1 rounded-lg">
											<button
												onClick={() => setViewMode("grid")}
												className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
											>
												<LayoutGrid className="w-5 h-5" />
											</button>
											<button
												onClick={() => setViewMode("list")}
												className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
											>
												<List className="w-5 h-5" />
											</button>
										</div>
									</div>
									{detail?.courses.length === 0 ? (
										<div className="text-center py-12 text-muted-foreground text-sm">
											No repositories found for this department. Create one from the Resources overview.
										</div>
									) : (
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
											{detail?.courses.map((course, idx) => (
												<div
													key={course._id}
													onClick={() => setSelectedCourseIdx(idx)}
													className={`rounded-2xl p-5 transition-all relative overflow-hidden group cursor-pointer ${selectedCourseIdx === idx
														? "bg-card border-2 border-primary shadow-xl shadow-primary/5 hover:scale-[1.01]"
														: "bg-card border border-border hover:border-primary/40"
														}`}
												>
													<div className="flex justify-between items-start mb-4">
														<div>
															<span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${selectedCourseIdx === idx ? "text-primary bg-primary/10" : "text-muted-foreground bg-secondary"}`}>
																{course.code}
															</span>
															<h4 className="text-lg font-bold text-foreground mt-1">{course.title}</h4>
														</div>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<button className="text-muted-foreground hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
																	<MoreVertical className="w-5 h-5" />
																</button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align="end">
																<DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEditOpen(course); }}>
																	<Pencil className="w-4 h-4 mr-2" /> Edit
																</DropdownMenuItem>
																<DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteOpen(course); }}>
																	<Trash2 className="w-4 h-4 mr-2" /> Delete
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
													<div className="space-y-3 pt-2 border-t border-border/50">
														<div className="flex justify-between text-xs">
															<span className="text-muted-foreground font-medium">Total Notes</span>
															<span className="text-foreground font-bold">{course.notes}</span>
														</div>
														<div className="flex justify-between text-xs">
															<span className="text-muted-foreground font-medium">Total Upvotes</span>
															<span className="text-foreground font-bold">{course.upvotes}</span>
														</div>
													</div>
													<button className={`w-full mt-5 py-2.5 text-xs font-bold rounded-xl transition-all ${selectedCourseIdx === idx
														? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90"
														: "bg-secondary text-muted-foreground hover:bg-secondary/80"
														}`}>
														Open Repository
													</button>
												</div>
											))}
										</div>
									)}
								</div>

								{/* Manage Notes Table */}
								{selectedCourse && (
									<div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
										<div className="flex flex-wrap items-center justify-between p-6 border-b border-border gap-4">
											<div className="flex items-center gap-4">
												<h3 className="text-foreground text-lg font-bold">
													Manage Notes for {selectedCourse.code}
												</h3>
												<div className="flex items-center gap-2 text-xs text-primary font-bold bg-primary/10 px-3 py-1 rounded-full">
													<SlidersHorizontal className="w-3 h-3" />
													<span>Approved Notes</span>
												</div>
											</div>
											<div className="flex items-center bg-secondary border border-border rounded-lg overflow-hidden p-1">
												<button
													onClick={() => setListViewMode("list")}
													className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${listViewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
												>
													List View
												</button>
												<button
													onClick={() => setListViewMode("grid")}
													className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${listViewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
												>
													Grid View
												</button>
											</div>
										</div>
										<div className="overflow-x-auto">
											<table className="w-full text-left">
												<thead className="bg-secondary/50">
													<tr>
														<th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Note Title</th>
														<th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Uploader</th>
														<th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Date</th>
														<th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Upvotes</th>
														<th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-border">
													{notesLoading ? (
														<tr>
															<td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">
																<Loader2 className="w-5 h-5 animate-spin mx-auto" />
															</td>
														</tr>
													) : filteredNotes.length === 0 ? (
														<tr>
															<td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">
																No approved notes in this repository yet.
															</td>
														</tr>
													) : (
														filteredNotes.map((note) => (
															<tr key={note._id} className="hover:bg-secondary/30 transition-colors">
																<td className="px-6 py-4">
																	<div className="flex items-center gap-3">
																		<div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[note.fileType] ?? typeColors.other}`}>
																			<FileText className="w-4 h-4" />
																		</div>
																		<div>
																			<p className="text-sm font-bold text-foreground">{note.title}</p>
																			<p className="text-[11px] text-muted-foreground">
																				{note.week ? `${note.week} • ` : ""}{note.fileType.toUpperCase()} • {note.fileSize}
																			</p>
																		</div>
																	</div>
																</td>
																<td className="px-6 py-4">
																	<div className="flex items-center gap-2">
																		<div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary">
																			{note.uploaderName.charAt(0).toUpperCase()}
																		</div>
																		<span className="text-sm font-medium text-muted-foreground">{note.uploaderName}</span>
																	</div>
																</td>
																<td className="px-6 py-4 text-sm text-muted-foreground">
																	{new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
																</td>
																<td className="px-6 py-4">
																	<div className="flex items-center gap-1.5 text-foreground font-bold">
																		<ArrowUpCircle className="w-5 h-5 text-emerald-500" />
																		<span className="text-sm">{note.upvotes}</span>
																	</div>
																</td>
																<td className="px-6 py-4 text-right">
																	<div className="flex justify-end gap-2">
																		<button className="p-2 text-muted-foreground hover:text-primary transition-colors" title="Pin">
																			<Pin className="w-4 h-4" />
																		</button>
																		<button className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Edit">
																			<Pencil className="w-4 h-4" />
																		</button>
																		<button className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
																			<Trash2 className="w-4 h-4" />
																		</button>
																	</div>
																</td>
															</tr>
														))
													)}
												</tbody>
											</table>
										</div>
										<div className="p-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
											<p className="text-xs text-muted-foreground">
												Showing {filteredNotes.length} of {selectedCourse.notes} notes
											</p>
											<div className="flex gap-2">
												<Button variant="outline" size="sm" className="gap-1">
													<ChevronLeft className="w-4 h-4" />
													Previous
												</Button>
												<Button size="sm" className="gap-1 shadow-lg shadow-primary/20">
													Next
													<ChevronRight className="w-4 h-4" />
												</Button>
											</div>
										</div>
									</div>
								)}
							</>
						)}
					</div>
				</main>
			</div>
			{/* Edit Repository Dialog */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit Repository</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-2">
						<div>
							<label className="text-sm font-medium text-foreground">Course Name</label>
							<Input value={editName} onChange={(e) => setEditName(e.target.value)} className="mt-1" />
						</div>
						<div>
							<label className="text-sm font-medium text-foreground">Course Code</label>
							<Input value={editCode} onChange={(e) => setEditCode(e.target.value)} className="mt-1" />
						</div>
						{updateError && <p className="text-sm text-destructive">{updateError}</p>}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
						<Button onClick={handleEditSave} disabled={updateLoading}>
							{updateLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
							Save Changes
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Repository Dialog */}
			<Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Repository</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground py-2">
						Are you sure you want to delete <span className="font-bold text-foreground">{deleteCourse?.title}</span>? This will permanently remove the repository and all its notes.
					</p>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
						<Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleteLoading}>
							{deleteLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default AdminDepartmentNotes;
