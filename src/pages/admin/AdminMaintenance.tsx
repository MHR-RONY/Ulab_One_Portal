import { useState } from "react";
import { motion } from "framer-motion";
import {
	Database, HardDrive, Wifi, Server, RefreshCw, Trash2,
	Download, Upload, Shield, Activity, AlertTriangle,
	CheckCircle2, Clock, Zap, Cloud, Link2, Settings,
	FileText, Archive, RotateCcw, Eye
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
	Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const storageItems = [
	{ label: "Course Materials", size: "12.4 GB", percent: 42, icon: FileText, color: "text-primary" },
	{ label: "Student Uploads", size: "8.7 GB", percent: 29, icon: Upload, color: "text-blue-500" },
	{ label: "System Backups", size: "5.2 GB", percent: 18, icon: Archive, color: "text-stat-amber" },
	{ label: "Logs & Cache", size: "3.1 GB", percent: 11, icon: Database, color: "text-stat-purple" },
];

const connections = [
	{ name: "PostgreSQL Database", status: "Connected", uptime: "99.98%", latency: "12ms", icon: Database, statusColor: "text-stat-emerald" },
	{ name: "Redis Cache Server", status: "Connected", uptime: "99.95%", latency: "3ms", icon: Zap, statusColor: "text-stat-emerald" },
	{ name: "Email SMTP Server", status: "Connected", uptime: "99.80%", latency: "45ms", icon: Cloud, statusColor: "text-stat-emerald" },
	{ name: "CDN Edge Network", status: "Degraded", uptime: "97.20%", latency: "120ms", icon: Wifi, statusColor: "text-stat-amber" },
	{ name: "External API Gateway", status: "Disconnected", uptime: "—", latency: "—", icon: Link2, statusColor: "text-destructive" },
];

const backupHistory = [
	{ id: "BKP-2025-0612", date: "Jun 12, 2025 03:00 AM", size: "2.1 GB", type: "Full", status: "Completed" },
	{ id: "BKP-2025-0611", date: "Jun 11, 2025 03:00 AM", size: "1.8 GB", type: "Incremental", status: "Completed" },
	{ id: "BKP-2025-0610", date: "Jun 10, 2025 03:00 AM", size: "2.0 GB", type: "Full", status: "Completed" },
	{ id: "BKP-2025-0609", date: "Jun 09, 2025 03:00 AM", size: "1.6 GB", type: "Incremental", status: "Failed" },
];

const systemTasks = [
	{ label: "Clear Application Cache", desc: "Remove temporary files and cached data", icon: Trash2, variant: "outline" as const },
	{ label: "Rebuild Search Index", desc: "Re-index all searchable content", icon: RefreshCw, variant: "outline" as const },
	{ label: "Run Database Migration", desc: "Apply pending schema changes", icon: Database, variant: "outline" as const },
	{ label: "Force Sync All Users", desc: "Re-sync user data from auth provider", icon: RotateCcw, variant: "outline" as const },
];

const AdminMaintenance = () => {
	const [activeSection, setActiveSection] = useState("storage");

	const sections = [
		{ key: "storage", label: "Resource Storage", icon: HardDrive },
		{ key: "connections", label: "User Connections", icon: Wifi },
		{ key: "backups", label: "Backup & Recovery", icon: Archive },
		{ key: "tasks", label: "System Tasks", icon: Settings },
		{ key: "health", label: "Health Monitor", icon: Activity },
	];

	return (
		<div className="flex h-screen overflow-hidden premium-bg admin-theme">
			<div className="hidden md:block">
				<AdminSidebar activePage="Maintenance" />
			</div>
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<AdminHeader />
				<main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
					{/* Header */}
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
					>
						<h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Advanced System Management</h2>
						<p className="text-muted-foreground text-sm mt-0.5">Resource storage, connections, backups, and system health.</p>
					</motion.div>

					{/* Quick Status Bar */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						{[
							{ label: "Storage Used", value: "29.4 / 50 GB", percent: 59, icon: HardDrive, color: "text-primary" },
							{ label: "Active Connections", value: "3 / 5", percent: 60, icon: Wifi, color: "text-stat-emerald" },
							{ label: "Last Backup", value: "6h ago", percent: 100, icon: Archive, color: "text-stat-amber" },
							{ label: "System Load", value: "42%", percent: 42, icon: Activity, color: "text-stat-purple" },
						].map((item, i) => (
							<motion.div
								key={item.label}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.06, duration: 0.4 }}
							>
								<Card>
									<CardContent className="p-4">
										<div className="flex items-center gap-2 mb-2">
											<item.icon className={`w-4 h-4 ${item.color}`} />
											<span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
										</div>
										<p className="text-lg font-extrabold text-foreground">{item.value}</p>
										<Progress value={item.percent} className="mt-2 h-1.5" />
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>

					{/* Section Tabs */}
					<div className="flex items-center gap-2 overflow-x-auto pb-2">
						{sections.map((section) => (
							<button
								key={section.key}
								onClick={() => setActiveSection(section.key)}
								className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeSection === section.key
										? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
										: "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
									}`}
							>
								<section.icon className="w-4 h-4" />
								{section.label}
							</button>
						))}
					</div>

					{/* Storage Section */}
					{activeSection === "storage" && (
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
							<Card>
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-6">
										<div>
											<h3 className="text-lg font-bold text-foreground">Storage Breakdown</h3>
											<p className="text-xs text-muted-foreground">Total capacity: 50 GB • Used: 29.4 GB (59%)</p>
										</div>
										<Button variant="outline" className="rounded-xl gap-2">
											<Download className="w-4 h-4" />
											Export Report
										</Button>
									</div>
									<div className="w-full h-4 bg-secondary rounded-full overflow-hidden flex mb-6">
										<div className="h-full bg-primary" style={{ width: "42%" }} />
										<div className="h-full bg-blue-500" style={{ width: "29%" }} />
										<div className="h-full bg-stat-amber" style={{ width: "18%" }} />
										<div className="h-full bg-stat-purple" style={{ width: "11%" }} />
									</div>
									<div className="space-y-4">
										{storageItems.map((item) => (
											<div key={item.label} className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
												<div className="flex items-center gap-4">
													<div className={`p-2.5 rounded-xl bg-secondary ${item.color}`}>
														<item.icon className="w-5 h-5" />
													</div>
													<div>
														<p className="text-sm font-semibold text-foreground">{item.label}</p>
														<p className="text-xs text-muted-foreground">{item.percent}% of total storage</p>
													</div>
												</div>
												<div className="flex items-center gap-4">
													<span className="text-sm font-bold text-foreground">{item.size}</span>
													<Button variant="ghost" size="icon" className="h-8 w-8">
														<Trash2 className="w-4 h-4 text-muted-foreground" />
													</Button>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}

					{/* Connections Section */}
					{activeSection === "connections" && (
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
							<Card>
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-6">
										<div>
											<h3 className="text-lg font-bold text-foreground">Service Connections</h3>
											<p className="text-xs text-muted-foreground">Monitor all external and internal service connections</p>
										</div>
										<Button className="rounded-xl gap-2">
											<RefreshCw className="w-4 h-4" />
											Test All
										</Button>
									</div>
									<div className="space-y-4">
										{connections.map((conn) => (
											<div key={conn.name} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 transition-all">
												<div className="flex items-center gap-4">
													<div className="p-2.5 rounded-xl bg-secondary">
														<conn.icon className="w-5 h-5 text-foreground" />
													</div>
													<div>
														<p className="text-sm font-semibold text-foreground">{conn.name}</p>
														<div className="flex items-center gap-3 mt-0.5">
															<span className={`text-xs font-bold ${conn.statusColor}`}>{conn.status}</span>
															<span className="text-xs text-muted-foreground">Uptime: {conn.uptime}</span>
															<span className="text-xs text-muted-foreground">Latency: {conn.latency}</span>
														</div>
													</div>
												</div>
												<div className="flex items-center gap-2">
													{conn.status === "Connected" && (
														<Badge className="bg-stat-emerald/10 text-stat-emerald border-stat-emerald/20 text-[10px]">
															<CheckCircle2 className="w-3 h-3 mr-1" />
															Healthy
														</Badge>
													)}
													{conn.status === "Degraded" && (
														<Badge className="bg-stat-amber/10 text-stat-amber border-stat-amber/20 text-[10px]">
															<AlertTriangle className="w-3 h-3 mr-1" />
															Degraded
														</Badge>
													)}
													{conn.status === "Disconnected" && (
														<Badge variant="destructive" className="text-[10px]">
															Offline
														</Badge>
													)}
													<Button variant="ghost" size="icon" className="h-8 w-8">
														<Eye className="w-4 h-4" />
													</Button>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}

					{/* Backups Section */}
					{activeSection === "backups" && (
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
							<Card>
								<CardContent className="p-6">
									<div className="flex items-center justify-between mb-6">
										<div>
											<h3 className="text-lg font-bold text-foreground">Backup History</h3>
											<p className="text-xs text-muted-foreground">Automated daily backups at 3:00 AM</p>
										</div>
										<div className="flex gap-3">
											<Button variant="outline" className="rounded-xl gap-2">
												<Clock className="w-4 h-4" />
												Schedule
											</Button>
											<Button className="rounded-xl gap-2">
												<Database className="w-4 h-4" />
												Backup Now
											</Button>
										</div>
									</div>
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="text-[10px] font-bold uppercase tracking-wider">Backup ID</TableHead>
												<TableHead className="text-[10px] font-bold uppercase tracking-wider">Date & Time</TableHead>
												<TableHead className="text-[10px] font-bold uppercase tracking-wider">Size</TableHead>
												<TableHead className="text-[10px] font-bold uppercase tracking-wider">Type</TableHead>
												<TableHead className="text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
												<TableHead className="text-[10px] font-bold uppercase tracking-wider">Actions</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{backupHistory.map((backup) => (
												<TableRow key={backup.id}>
													<TableCell className="font-mono text-sm font-semibold text-foreground">{backup.id}</TableCell>
													<TableCell className="text-sm text-muted-foreground">{backup.date}</TableCell>
													<TableCell className="text-sm font-semibold text-foreground">{backup.size}</TableCell>
													<TableCell>
														<Badge variant="outline" className="text-[10px] font-bold">
															{backup.type}
														</Badge>
													</TableCell>
													<TableCell>
														<span className={`text-sm font-bold ${backup.status === "Completed" ? "text-stat-emerald" : "text-destructive"}`}>
															{backup.status}
														</span>
													</TableCell>
													<TableCell>
														<div className="flex gap-1">
															<Button variant="ghost" size="icon" className="h-8 w-8">
																<Download className="w-4 h-4" />
															</Button>
															<Button variant="ghost" size="icon" className="h-8 w-8">
																<RotateCcw className="w-4 h-4" />
															</Button>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</CardContent>
							</Card>
						</motion.div>
					)}

					{/* System Tasks */}
					{activeSection === "tasks" && (
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
							<Card>
								<CardContent className="p-6">
									<div className="mb-6">
										<h3 className="text-lg font-bold text-foreground">System Maintenance Tasks</h3>
										<p className="text-xs text-muted-foreground">Run administrative tasks for system upkeep</p>
									</div>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{systemTasks.map((task) => (
											<div key={task.label} className="p-5 rounded-xl border border-border hover:border-primary/20 transition-all">
												<div className="flex items-start gap-4">
													<div className="p-2.5 rounded-xl bg-primary/10 text-primary">
														<task.icon className="w-5 h-5" />
													</div>
													<div className="flex-1">
														<p className="text-sm font-bold text-foreground">{task.label}</p>
														<p className="text-xs text-muted-foreground mt-1">{task.desc}</p>
														<Button variant={task.variant} size="sm" className="mt-3 rounded-lg text-xs">
															Execute
														</Button>
													</div>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-6">
									<h3 className="text-lg font-bold text-foreground mb-4">Danger Zone</h3>
									<div className="space-y-4">
										{[
											{ label: "Purge All Logs", desc: "Permanently delete all system logs older than 90 days" },
											{ label: "Reset User Sessions", desc: "Force logout all currently active users" },
											{ label: "Factory Reset Portal", desc: "Restore all settings to factory defaults (irreversible)" },
										].map((item) => (
											<div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-destructive/20 bg-destructive/5">
												<div>
													<p className="text-sm font-semibold text-foreground">{item.label}</p>
													<p className="text-xs text-muted-foreground">{item.desc}</p>
												</div>
												<Button variant="destructive" size="sm" className="rounded-lg text-xs">
													Execute
												</Button>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}

					{/* Health Monitor */}
					{activeSection === "health" && (
						<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{[
									{ label: "CPU Usage", value: "34%", status: "Normal", icon: Server, color: "text-stat-emerald" },
									{ label: "Memory Usage", value: "6.2 / 16 GB", status: "Normal", icon: HardDrive, color: "text-stat-emerald" },
									{ label: "Disk I/O", value: "125 MB/s", status: "High", icon: Activity, color: "text-stat-amber" },
								].map((item) => (
									<Card key={item.label}>
										<CardContent className="p-5">
											<div className="flex items-center justify-between mb-3">
												<div className="flex items-center gap-2">
													<item.icon className="w-4 h-4 text-muted-foreground" />
													<span className="text-sm font-semibold text-muted-foreground">{item.label}</span>
												</div>
												<Badge className={`${item.color === "text-stat-emerald" ? "bg-stat-emerald/10 text-stat-emerald border-stat-emerald/20" : "bg-stat-amber/10 text-stat-amber border-stat-amber/20"} text-[10px]`}>
													{item.status}
												</Badge>
											</div>
											<p className="text-2xl font-extrabold text-foreground">{item.value}</p>
										</CardContent>
									</Card>
								))}
							</div>

							<Card>
								<CardContent className="p-6">
									<h3 className="text-lg font-bold text-foreground mb-6">Service Health Overview</h3>
									<div className="space-y-3">
										{[
											{ name: "Web Server (Nginx)", status: "Operational", uptime: "30d 12h", color: "bg-stat-emerald" },
											{ name: "Application Server", status: "Operational", uptime: "30d 12h", color: "bg-stat-emerald" },
											{ name: "Database Cluster", status: "Operational", uptime: "28d 6h", color: "bg-stat-emerald" },
											{ name: "Cache Layer (Redis)", status: "Operational", uptime: "15d 3h", color: "bg-stat-emerald" },
											{ name: "CDN Edge Nodes", status: "Degraded", uptime: "2d 8h", color: "bg-stat-amber" },
											{ name: "Mail Delivery", status: "Operational", uptime: "30d 12h", color: "bg-stat-emerald" },
										].map((service) => (
											<div key={service.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
												<div className="flex items-center gap-3">
													<div className={`w-2.5 h-2.5 rounded-full ${service.color}`} />
													<span className="text-sm font-semibold text-foreground">{service.name}</span>
												</div>
												<div className="flex items-center gap-4">
													<span className="text-xs text-muted-foreground">Uptime: {service.uptime}</span>
													<span className={`text-xs font-bold ${service.status === "Operational" ? "text-stat-emerald" : "text-stat-amber"}`}>
														{service.status}
													</span>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}
				</main>
			</div>
		</div>
	);
};

export default AdminMaintenance;
