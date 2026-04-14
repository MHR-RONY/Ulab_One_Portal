import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Computer, Briefcase, Zap, Landmark, Upload, Plus, FileText, CheckCircle, XCircle, Eye, PlusCircle, Loader2 } from "lucide-react";
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
} from "@/hooks/useAdminResources";

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

const AdminResources = () => {
	const navigate = useNavigate();
	const [courseName, setCourseName] = useState("");
	const [courseCode, setCourseCode] = useState("");
	const [department, setDepartment] = useState("");
	const [description, setDescription] = useState("");
	const [formSuccess, setFormSuccess] = useState(false);

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
													<FileText className="w-5 h-5 text-orange-400" />
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
													<button
														onClick={() => approveNote(item._id)}
														className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded-lg transition-colors"
														title="Approve"
													>
														<CheckCircle className="w-4 h-4" />
													</button>
													<button
														onClick={() => rejectNote(item._id)}
														className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"
														title="Reject"
													>
														<XCircle className="w-4 h-4" />
													</button>
													<button className="p-1.5 hover:bg-secondary text-muted-foreground rounded-lg transition-colors" title="View">
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
		</div>
	);
};

export default AdminResources;


