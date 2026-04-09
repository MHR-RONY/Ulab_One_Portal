import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
	UserPlus, Edit, Users, History, Key, Settings, GraduationCap,
	Trash2, CheckCircle, Shield, Loader2, RefreshCw,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api from "@/lib/api";

type AdminStatus = "Active" | "Away" | "Inactive";

interface AdminRecord {
	_id: string;
	name: string;
	email: string;
	role: string;
	createdAt: string;
}

const createAdminSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type CreateAdminForm = z.infer<typeof createAdminSchema>;

const statusColors: Record<AdminStatus, string> = {
	Active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
	Away: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
	Inactive: "bg-muted text-muted-foreground",
};

const statusDotColors: Record<AdminStatus, string> = {
	Active: "bg-green-500",
	Away: "bg-amber-500",
	Inactive: "bg-muted-foreground/40",
};

const tabs = ["All Admins", "Super Admins", "Sub-Admins", "Dept Admins"];

interface PermissionModule {
	icon: React.ElementType;
	name: string;
	description: string;
	read: boolean;
	write: boolean;
	delete: boolean;
	fullAccess: boolean;
}

const defaultPermissions: PermissionModule[] = [
	{ icon: Users, name: "Students Management", description: "Access student profiles and enrollment data", read: true, write: true, delete: true, fullAccess: true },
	{ icon: GraduationCap, name: "Academic Data", description: "Manage courses, schedules, and grading", read: true, write: true, delete: false, fullAccess: false },
	{ icon: Settings, name: "System Settings", description: "Configuration of global portal parameters", read: true, write: false, delete: false, fullAccess: false },
];

function getInitials(name: string): string {
	return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const AdminManagement = () => {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState(0);
	const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
	const [permissions, setPermissions] = useState(defaultPermissions);
	const [showDialog, setShowDialog] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<AdminRecord | null>(null);

	const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateAdminForm>({
		resolver: zodResolver(createAdminSchema),
	});

	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["admins"],
		queryFn: async () => {
			const res = await api.get<{ success: boolean; data: { admins: AdminRecord[]; total: number } }>("/admin/admins");
			return res.data.data;
		},
	});

	const admins = data?.admins ?? [];
	const selectedAdmin = admins.find((a) => a._id === selectedAdminId) ?? admins[0] ?? null;

	const createMutation = useMutation({
		mutationFn: async (payload: CreateAdminForm) => {
			const res = await api.post("/admin/admin", payload);
			return res.data;
		},
		onSuccess: () => {
			toast.success("Admin account created successfully");
			queryClient.invalidateQueries({ queryKey: ["admins"] });
			setShowDialog(false);
			reset();
		},
		onError: (err: unknown) => {
			const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "Failed to create admin";
			toast.error(msg);
		},
	});

	const deleteMutation = useMutation({
		mutationFn: async (id: string) => {
			const res = await api.delete(`/admin/admin/${id}`);
			return res.data;
		},
		onSuccess: () => {
			toast.success("Admin deleted successfully");
			queryClient.invalidateQueries({ queryKey: ["admins"] });
			setDeleteTarget(null);
		},
		onError: () => {
			toast.error("Failed to delete admin");
		},
	});

	const togglePerm = (idx: number, field: "read" | "write" | "delete") => {
		setPermissions((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: !p[field] } : p));
	};

	const toggleFullAccess = (idx: number) => {
		setPermissions((prev) => prev.map((p, i) => {
			if (i !== idx) return p;
			const newFull = !p.fullAccess;
			return { ...p, fullAccess: newFull, read: newFull || p.read, write: newFull || p.write, delete: newFull || p.delete };
		}));
	};

	const onSubmit = (values: CreateAdminForm) => {
		createMutation.mutate(values);
	};

	return (
		<div className="flex min-h-screen bg-background admin-theme">
			<AdminSidebar activePage="Management" />
			<div className="flex-1 flex flex-col">
				<AdminHeader />
				<main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8">
					{/* Header */}
					<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-4">
						<div className="space-y-1">
							<h1 className="text-3xl font-extrabold text-foreground tracking-tight">Admin Role Management</h1>
							<p className="text-muted-foreground max-w-2xl">Configure administrative access, granular permissions, and monitor system-wide activity.</p>
						</div>
						<Button onClick={() => setShowDialog(true)} className="rounded-xl px-5 gap-2 font-bold shadow-lg shadow-primary/20">
							<UserPlus className="w-4 h-4" />
							Add New Admin
						</Button>
					</motion.div>

					{/* Tabs */}
					<div className="border-b border-border flex gap-8 px-2 overflow-x-auto whitespace-nowrap">
						{tabs.map((tab, i) => (
							<button
								key={tab}
								onClick={() => setActiveTab(i)}
								className={`pb-4 text-sm px-1 transition-colors ${activeTab === i
									? "font-bold border-b-2 border-primary text-primary"
									: "font-medium text-muted-foreground hover:text-primary"}`}
							>
								{tab}
							</button>
						))}
					</div>

					{/* Admin Cards */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-bold flex items-center gap-2">
								<Users className="w-5 h-5 text-primary" />
								Administrators
								{data && <span className="text-sm font-normal text-muted-foreground ml-1">({data.total})</span>}
							</h3>
							<Button variant="ghost" size="sm" onClick={() => refetch()} className="gap-2 text-muted-foreground">
								<RefreshCw className="w-4 h-4" />
								Refresh
							</Button>
						</div>

						{isLoading && (
							<div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
								<Loader2 className="w-5 h-5 animate-spin" />
								<span>Loading admins...</span>
							</div>
						)}

						{isError && (
							<div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
								<p>Failed to load admins.</p>
								<Button variant="outline" onClick={() => refetch()} size="sm">Retry</Button>
							</div>
						)}

						{!isLoading && !isError && admins.length === 0 && (
							<div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
								<Shield className="w-10 h-10 opacity-30" />
								<p className="text-sm">No admins found. Create one using the button above.</p>
							</div>
						)}

						{!isLoading && !isError && admins.length > 0 && (
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
								{admins.map((admin) => {
									const isSelected = selectedAdmin?._id === admin._id;
									const status: AdminStatus = "Active";
									return (
										<Card
											key={admin._id}
											className={`cursor-pointer transition-all hover:border-primary/50 ${isSelected ? "ring-2 ring-primary" : ""}`}
											onClick={() => setSelectedAdminId(admin._id)}
										>
											<CardContent className="p-5 flex items-start gap-4">
												<div className="relative">
													<div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-lg border-2 border-background shadow-md">
														{getInitials(admin.name)}
													</div>
													<div className={`absolute bottom-0 right-0 w-4 h-4 ${statusDotColors[status]} border-2 border-background rounded-full`} />
												</div>
												<div className="flex-1 min-w-0">
													<p className="font-bold text-foreground">{admin.name}</p>
													<p className="text-xs text-muted-foreground truncate">{admin.email}</p>
													<div className="mt-2 flex items-center gap-2 flex-wrap">
														<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[status]}`}>
															{status}
														</span>
														<span className="text-[10px] text-muted-foreground">
															Joined {new Date(admin.createdAt).toLocaleDateString()}
														</span>
													</div>
												</div>
												<div className="flex flex-col items-center gap-2 shrink-0">
													{isSelected && <CheckCircle className="w-5 h-5 text-primary" />}
													<button
														onClick={(e) => { e.stopPropagation(); setDeleteTarget(admin); }}
														className="text-muted-foreground hover:text-destructive transition-colors"
													>
														<Trash2 className="w-4 h-4" />
													</button>
												</div>
											</CardContent>
										</Card>
									);
								})}
							</div>
						)}
					</div>

					{/* Granular Permission Control */}
					{selectedAdmin && (
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-lg font-bold flex items-center gap-2">
									<Key className="w-5 h-5 text-primary" />
									Granular Permission Control
								</h3>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<span>Editing:</span>
									<span className="font-bold text-foreground">{selectedAdmin.name}</span>
								</div>
							</div>

							<Card>
								<CardContent className="p-0">
									<div className="overflow-x-auto">
										<table className="w-full text-left border-collapse">
											<thead>
												<tr className="bg-muted/50">
													<th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider">Module Name</th>
													<th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider text-center">Read</th>
													<th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider text-center">Write</th>
													<th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider text-center">Delete</th>
													<th className="px-6 py-4 text-xs font-bold uppercase text-muted-foreground tracking-wider text-center">Full Access</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-border">
												{permissions.map((mod, idx) => (
													<tr key={mod.name}>
														<td className="px-6 py-5">
															<div className="flex items-center gap-3">
																<mod.icon className="w-5 h-5 text-muted-foreground" />
																<div>
																	<p className="font-bold text-foreground">{mod.name}</p>
																	<p className="text-xs text-muted-foreground">{mod.description}</p>
																</div>
															</div>
														</td>
														<td className="px-6 py-5 text-center">
															<div className="flex justify-center">
																<Checkbox checked={mod.read} onCheckedChange={() => togglePerm(idx, "read")} className="h-5 w-5" />
															</div>
														</td>
														<td className="px-6 py-5 text-center">
															<div className="flex justify-center">
																<Checkbox checked={mod.write} onCheckedChange={() => togglePerm(idx, "write")} className="h-5 w-5" />
															</div>
														</td>
														<td className="px-6 py-5 text-center">
															<div className="flex justify-center">
																<Checkbox checked={mod.delete} onCheckedChange={() => togglePerm(idx, "delete")} className="h-5 w-5" />
															</div>
														</td>
														<td className="px-6 py-5 text-center">
															<div className="flex justify-center">
																<Switch checked={mod.fullAccess} onCheckedChange={() => toggleFullAccess(idx)} />
															</div>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
									<div className="p-6 bg-muted/50 flex justify-end gap-3">
										<Button variant="ghost" className="rounded-xl font-bold px-6" onClick={() => setPermissions(defaultPermissions)}>Reset to Default</Button>
										<Button className="rounded-xl font-bold px-8 shadow-lg shadow-primary/20">Save Changes</Button>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}
				</main>
			</div>

			{/* Create Admin Dialog */}
			<Dialog open={showDialog} onOpenChange={(open) => { setShowDialog(open); if (!open) reset(); }}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Shield className="w-5 h-5 text-primary" />
							Create New Admin
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
						<div className="space-y-1.5">
							<Label htmlFor="name">Full Name</Label>
							<Input id="name" placeholder="Dr. Arshad Ali" {...register("name")} />
							{errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="email">Email Address</Label>
							<Input id="email" type="email" placeholder="admin@ulab.edu.bd" {...register("email")} />
							{errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="password">Password</Label>
							<Input id="password" type="password" placeholder="Min. 6 characters" {...register("password")} />
							{errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
						</div>
						<DialogFooter className="pt-2">
							<Button type="button" variant="ghost" onClick={() => { setShowDialog(false); reset(); }}>Cancel</Button>
							<Button type="submit" disabled={createMutation.isPending} className="gap-2">
								{createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
								Create Admin
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>Delete Admin</DialogTitle>
					</DialogHeader>
					<p className="text-sm text-muted-foreground">
						Are you sure you want to delete <span className="font-bold text-foreground">{deleteTarget?.name}</span>? This action cannot be undone.
					</p>
					<DialogFooter className="pt-2">
						<Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
						<Button
							variant="destructive"
							disabled={deleteMutation.isPending}
							className="gap-2"
							onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
						>
							{deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
							Delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default AdminManagement;
