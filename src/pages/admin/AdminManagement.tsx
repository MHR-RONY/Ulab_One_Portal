import { useState } from "react";
import { motion } from "framer-motion";
import {
	UserPlus, Edit, Users, History, Key, Settings, GraduationCap,
	PlusCircle, Trash2, CheckCircle, Shield
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

type AdminStatus = "Active" | "Away" | "Inactive";

interface Admin {
	id: string;
	name: string;
	role: string;
	roleLabel: string;
	status: AdminStatus;
	lastSeen: string;
	initials: string;
}

const admins: Admin[] = [
	{ id: "1", name: "Dr. Arshad Ali", role: "SUPER ADMIN", roleLabel: "Super Admin", status: "Active", lastSeen: "Last seen 5m ago", initials: "AA" },
	{ id: "2", name: "Sarah Johnson", role: "DEPT ADMIN - CSE", roleLabel: "Dept Admin - CSE", status: "Active", lastSeen: "Last seen 2h ago", initials: "SJ" },
	{ id: "3", name: "Tanvir Ahmed", role: "SUB-ADMIN", roleLabel: "Sub-Admin", status: "Away", lastSeen: "Away for 1d", initials: "TA" },
];

const activityLog = [
	{ icon: Edit, iconBg: "bg-primary/10 text-primary", user: "Dr. Arshad", text: "updated permissions for Sarah Johnson.", time: "2 minutes ago" },
	{ icon: UserPlus, iconBg: "bg-green-500/10 text-green-600", user: "System", text: "automatically granted Dept Admin role to Tanvir Ahmed.", time: "1 hour ago" },
	{ icon: Trash2, iconBg: "bg-red-500/10 text-red-600", user: "Dr. Arshad", text: "removed Admin access for 'James Miller'.", time: "3 hours ago" },
];

const tabs = ["All Admins (24)", "Super Admins", "Sub-Admins", "Dept Admins"];

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

const AdminManagement = () => {
	const [activeTab, setActiveTab] = useState(0);
	const [selectedAdmin, setSelectedAdmin] = useState(admins[0]);
	const [permissions, setPermissions] = useState(defaultPermissions);

	const togglePerm = (idx: number, field: "read" | "write" | "delete") => {
		setPermissions(prev => prev.map((p, i) => i === idx ? { ...p, [field]: !p[field] } : p));
	};

	const toggleFullAccess = (idx: number) => {
		setPermissions(prev => prev.map((p, i) => {
			if (i !== idx) return p;
			const newFull = !p.fullAccess;
			return { ...p, fullAccess: newFull, read: newFull || p.read, write: newFull || p.write, delete: newFull || p.delete };
		}));
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
						<Button className="rounded-xl px-5 gap-2 font-bold shadow-lg shadow-primary/20">
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
										: "font-medium text-muted-foreground hover:text-primary"
									}`}
							>
								{tab}
							</button>
						))}
					</div>

					{/* Admin Cards + Activity */}
					<div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
						{/* Admin Cards */}
						<div className="xl:col-span-2 space-y-4">
							<h3 className="text-lg font-bold flex items-center gap-2">
								<Users className="w-5 h-5 text-primary" />
								Administrators
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{admins.map((admin) => (
									<Card
										key={admin.id}
										className={`cursor-pointer transition-all hover:border-primary/50 ${selectedAdmin.id === admin.id ? "ring-2 ring-primary" : ""
											}`}
										onClick={() => setSelectedAdmin(admin)}
									>
										<CardContent className="p-5 flex items-start gap-4">
											<div className="relative">
												<div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-lg border-2 border-background shadow-md">
													{admin.initials}
												</div>
												<div className={`absolute bottom-0 right-0 w-4 h-4 ${statusDotColors[admin.status]} border-2 border-background rounded-full`} />
											</div>
											<div className="flex-1 min-w-0">
												<p className="font-bold text-foreground">{admin.name}</p>
												<p className={`text-xs font-semibold uppercase ${admin.role === "SUPER ADMIN" ? "text-primary" : "text-muted-foreground"}`}>
													{admin.role}
												</p>
												<div className="mt-2 flex items-center gap-2">
													<span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[admin.status]}`}>
														{admin.status}
													</span>
													<span className="text-[10px] text-muted-foreground">{admin.lastSeen}</span>
												</div>
											</div>
											{selectedAdmin.id === admin.id && (
												<CheckCircle className="w-5 h-5 text-primary shrink-0" />
											)}
										</CardContent>
									</Card>
								))}

								{/* View All */}
								<div className="rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center p-5 cursor-pointer hover:text-primary hover:border-primary transition-all text-muted-foreground">
									<div className="text-center">
										<PlusCircle className="w-8 h-8 mx-auto" />
										<p className="text-sm font-bold mt-1">View All Admins</p>
									</div>
								</div>
							</div>
						</div>

						{/* Recent Activity */}
						<div className="space-y-4">
							<h3 className="text-lg font-bold flex items-center gap-2">
								<History className="w-5 h-5 text-primary" />
								Recent Activity
							</h3>
							<Card>
								<CardContent className="p-0">
									<div className="p-4 space-y-4">
										{activityLog.map((log, i) => (
											<div key={i} className="flex gap-3">
												<div className={`w-8 h-8 rounded-full ${log.iconBg} flex items-center justify-center shrink-0`}>
													<log.icon className="w-3.5 h-3.5" />
												</div>
												<div>
													<p className="text-xs text-foreground">
														<span className="font-bold">{log.user}</span> {log.text}
													</p>
													<p className="text-[10px] text-muted-foreground mt-1">{log.time}</p>
												</div>
											</div>
										))}
									</div>
									<button className="w-full py-3 bg-muted/50 text-xs font-bold text-muted-foreground hover:bg-muted transition-colors">
										View All Logs
									</button>
								</CardContent>
							</Card>
						</div>
					</div>

					{/* Granular Permission Control */}
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
									<Button variant="ghost" className="rounded-xl font-bold px-6">Reset to Default</Button>
									<Button className="rounded-xl font-bold px-8 shadow-lg shadow-primary/20">Save Changes</Button>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</main>
			</div>
		</div>
	);
};

export default AdminManagement;
