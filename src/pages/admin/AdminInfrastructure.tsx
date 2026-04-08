import { motion } from "framer-motion";
import {
	Server, Database, HardDrive, FileText, Film, Code,
	PlusCircle, Download, Activity, Eye, Cloud, CreditCard,
	BookOpen, Settings
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const storageBreakdown = [
	{ label: "MEDIA", height: "30%" },
	{ label: "DOCS", height: "50%" },
	{ label: "LOGS", height: "20%" },
	{ label: "BACKUP", height: "85%" },
	{ label: "SYSTEM", height: "70%" },
];

const fileStats = [
	{ icon: FileText, label: "DOCUMENTS", count: "452,102", unit: "files", pct: 82 },
	{ icon: Film, label: "MEDIA", count: "12,840", unit: "files", pct: 45 },
	{ icon: Code, label: "CONFIGURATION", count: "89,203", unit: "files", pct: 12 },
];

const dbStats = [
	{ label: "Uptime", value: "99.992%", accent: false },
	{ label: "Avg. Latency", value: "14ms", accent: true },
	{ label: "Total Records", value: "42.8M", accent: false },
];

const trafficStats = [
	{ label: "ACTIVE CONNECTIONS", value: "14,209", accent: true },
	{ label: "REQUEST RATE", value: "2.4k", suffix: "/sec", accent: false },
	{ label: "PEAK LOAD TIME", value: "10:45 AM", accent: false },
];

const trafficChartData = [
	{ time: "00:00", connections: 2100, requests: 800, latency: 12 },
	{ time: "02:00", connections: 1400, requests: 500, latency: 8 },
	{ time: "04:00", connections: 980, requests: 350, latency: 6 },
	{ time: "06:00", connections: 2800, requests: 1200, latency: 14 },
	{ time: "08:00", connections: 8500, requests: 3800, latency: 22 },
	{ time: "09:00", connections: 11200, requests: 5200, latency: 28 },
	{ time: "10:00", connections: 13800, requests: 6100, latency: 32 },
	{ time: "10:45", connections: 14209, requests: 6800, latency: 35 },
	{ time: "12:00", connections: 12400, requests: 5600, latency: 26 },
	{ time: "14:00", connections: 10800, requests: 4900, latency: 24 },
	{ time: "16:00", connections: 11600, requests: 5300, latency: 27 },
	{ time: "18:00", connections: 9200, requests: 4100, latency: 20 },
	{ time: "20:00", connections: 5800, requests: 2400, latency: 15 },
	{ time: "22:00", connections: 3600, requests: 1400, latency: 10 },
	{ time: "23:59", connections: 2400, requests: 900, latency: 9 },
];

const integrations = [
	{ name: "Canvas LMS", desc: "Student enrollment & grade sync", badge: "CONNECTED", badgeColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", borderColor: "border-l-primary", iconColor: "text-primary", icon: BookOpen, meta: "Last sync: 2m ago", action: "Config" },
	{ name: "Archive Node Cluster", desc: "Read-only historical datasets", badge: "EXTERNAL DB", badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400", borderColor: "border-l-blue-500", iconColor: "text-blue-500", icon: Database, meta: "Latency: 42ms", action: "Monitor" },
	{ name: "Stripe Connect", desc: "Tuition fee processing", badge: "GATEWAY", badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", borderColor: "border-l-emerald-500", iconColor: "text-emerald-500", icon: CreditCard, meta: "Status: Active", action: "Logs" },
	{ name: "AWS S3 Backup", desc: "Nightly disaster recovery", badge: "REDUNDANT", badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", borderColor: "border-l-amber-500", iconColor: "text-amber-500", icon: Cloud, meta: "Next sync: 01:00", action: "Config" },
];

const AdminInfrastructure = () => {
	return (
		<div className="flex h-screen overflow-hidden bg-background admin-theme">
			<div className="hidden md:block">
				<AdminSidebar activePage="Maintenance" />
			</div>
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<AdminHeader />
				<main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
					<div className="max-w-[1400px] mx-auto space-y-10">
						{/* Header */}
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex flex-col md:flex-row md:items-end justify-between gap-4"
						>
							<div>
								<h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Infrastructure Control Center</h1>
								<p className="text-muted-foreground mt-2 flex items-center gap-2">
									<span className="flex h-2 w-2 rounded-full bg-green-500" />
									System status: Healthy · All services operational
								</p>
							</div>
							<div className="flex gap-3">
								<Button className="rounded-xl h-11 px-6 gap-2 font-bold shadow-lg shadow-primary/20">
									<PlusCircle className="w-4 h-4" />
									Deploy Node
								</Button>
								<Button variant="outline" className="rounded-xl h-11 px-6 gap-2 font-bold">
									<Download className="w-4 h-4" />
									Report
								</Button>
							</div>
						</motion.div>

						{/* Resource Storage + Database Cluster */}
						<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
							{/* Resource Storage Overview */}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.05 }}
								className="xl:col-span-2"
							>
								<Card className="rounded-xl">
									<CardContent className="p-6">
										<div className="flex justify-between items-center mb-8">
											<div>
												<h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
													<HardDrive className="w-5 h-5 text-primary" /> Resource Storage Overview
												</h3>
												<p className="text-sm text-muted-foreground">Real-time disk and object storage analysis</p>
											</div>
											<span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">30 DAYS</span>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
											{/* Bar chart + total */}
											<div className="flex flex-col">
												<div className="flex items-end gap-3 mb-2">
													<span className="text-5xl font-black tracking-tighter text-foreground">
														1.2<span className="text-2xl text-muted-foreground font-medium">TB</span>
													</span>
													<span className="text-green-500 text-sm font-bold pb-2 flex items-center gap-0.5">
														<Activity className="w-3 h-3" /> +5.2%
													</span>
												</div>
												<p className="text-sm text-muted-foreground mb-6">Total used of 2.0 TB cluster capacity</p>
												<div className="flex-1 flex items-end gap-2 h-32 px-2">
													{storageBreakdown.map((bar) => (
														<div
															key={bar.label}
															className="bg-primary/20 border-t-2 border-primary w-full rounded-t-sm transition-all hover:bg-primary/40"
															style={{ height: bar.height }}
														/>
													))}
												</div>
												<div className="flex justify-between mt-3 px-1">
													{storageBreakdown.map((bar) => (
														<span key={bar.label} className="text-[10px] font-bold text-muted-foreground">{bar.label}</span>
													))}
												</div>
											</div>
											{/* File type breakdown */}
											<div className="flex flex-col justify-between space-y-4">
												{fileStats.map((stat) => (
													<div key={stat.label} className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/5">
														<div className="flex items-center gap-3">
															<stat.icon className="w-5 h-5 text-primary" />
															<div>
																<p className="text-xs font-bold text-muted-foreground uppercase">{stat.label}</p>
																<p className="text-lg font-bold text-foreground">
																	{stat.count} <span className="text-sm font-normal text-muted-foreground">{stat.unit}</span>
																</p>
															</div>
														</div>
														<div className="text-right">
															<p className="text-xs font-bold text-primary">{stat.pct}%</p>
															<div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
																<div className="bg-primary h-full rounded-full" style={{ width: `${stat.pct}%` }} />
															</div>
														</div>
													</div>
												))}
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>

							{/* Database Cluster */}
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 }}
							>
								<div className="bg-foreground text-background rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full">
									<div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full" />
									<div>
										<h3 className="text-xl font-bold flex items-center gap-2 mb-1">
											<Database className="w-5 h-5 text-primary" /> Database Cluster
										</h3>
										<p className="text-background/50 text-sm mb-6">
											Status: <span className="text-green-400 font-bold uppercase tracking-widest text-xs">Optimized</span>
										</p>
										<div className="space-y-6">
											{dbStats.map((stat, i) => (
												<div key={stat.label} className={`flex justify-between items-center ${i < dbStats.length - 1 ? "border-b border-background/5 pb-4" : ""}`}>
													<p className="text-background/50 font-medium">{stat.label}</p>
													<p className={`text-xl font-black ${stat.accent ? "text-primary" : ""}`}>{stat.value}</p>
												</div>
											))}
										</div>
									</div>
									<div className="mt-8 pt-6 border-t border-background/10">
										<button className="w-full py-3 rounded-lg bg-background/5 hover:bg-background/10 font-bold text-sm transition-all flex items-center justify-center gap-2">
											<Eye className="w-4 h-4" /> Performance Analytics
										</button>
									</div>
								</div>
							</motion.div>
						</div>

						<motion.section
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.15 }}
						>
							<div className="flex items-center justify-between mb-6">
								<h3 className="text-2xl font-black tracking-tight flex items-center gap-3 text-foreground">
									<Activity className="w-6 h-6 text-primary" /> Traffic Monitor & Load Distribution
								</h3>
							</div>
							<Card className="rounded-xl">
								<CardContent className="p-6">
									<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
										{/* Stats */}
										<div className="space-y-4">
											{trafficStats.map((stat) => (
												<div key={stat.label} className="bg-secondary/50 p-4 rounded-lg">
													<p className="text-xs font-bold text-muted-foreground uppercase">{stat.label}</p>
													<h4 className={`text-3xl font-black ${stat.accent ? "text-primary" : "text-foreground"}`}>
														{stat.value}
														{stat.suffix && <span className="text-sm font-normal text-muted-foreground">{stat.suffix}</span>}
													</h4>
												</div>
											))}
										</div>
										{/* Line Chart */}
										<div className="lg:col-span-3 h-[300px]">
											<ResponsiveContainer width="100%" height="100%">
												<LineChart data={trafficChartData}>
													<CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
													<XAxis dataKey="time" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
													<YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
													<Tooltip
														contentStyle={{
															backgroundColor: "hsl(var(--card))",
															border: "1px solid hsl(var(--border))",
															borderRadius: "0.75rem",
															fontSize: 12,
														}}
													/>
													<Legend wrapperStyle={{ fontSize: 12 }} />
													<Line type="monotone" dataKey="connections" name="Connections" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
													<Line type="monotone" dataKey="requests" name="Requests" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={false} />
													<Line type="monotone" dataKey="latency" name="Latency (ms)" stroke="hsl(217 91% 60%)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
												</LineChart>
											</ResponsiveContainer>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.section>

						{/* Integration Hub */}
						<motion.section
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="pb-10"
						>
							<h3 className="text-2xl font-black tracking-tight flex items-center gap-3 mb-6 text-foreground">
								<Server className="w-6 h-6 text-primary" /> Integration Hub
							</h3>
							<div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
								{integrations.map((item) => (
									<div
										key={item.name}
										className={`min-w-[300px] bg-card p-6 rounded-xl border-l-4 ${item.borderColor} shadow-lg shadow-primary/5 flex flex-col justify-between border border-border`}
									>
										<div>
											<div className="flex justify-between items-start mb-4">
												<item.icon className={`w-10 h-10 ${item.iconColor}`} />
												<span className={`${item.badgeColor} text-[10px] font-black px-2 py-1 rounded`}>{item.badge}</span>
											</div>
											<h4 className="text-xl font-bold text-foreground mb-1">{item.name}</h4>
											<p className="text-sm text-muted-foreground">{item.desc}</p>
										</div>
										<div className="mt-6 flex items-center justify-between text-xs">
											<span className="font-bold text-muted-foreground">{item.meta}</span>
											<button className="text-primary font-bold hover:underline">{item.action}</button>
										</div>
									</div>
								))}
							</div>
						</motion.section>

						{/* Footer */}
						<footer className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
							<p className="text-muted-foreground text-sm font-medium flex items-center gap-2">
								<Server className="w-4 h-4 text-primary" /> ULAB One Portal
							</p>
							<div className="flex gap-6 text-sm text-muted-foreground">
								<a className="hover:text-primary transition-colors" href="#">Documentation</a>
								<a className="hover:text-primary transition-colors" href="#">API Keys</a>
								<a className="hover:text-primary transition-colors" href="#">System Logs</a>
								<a className="hover:text-primary transition-colors" href="#">Privacy</a>
							</div>
							<p className="text-xs text-muted-foreground">© 2024 Infrastructure Dashboard v4.2.1</p>
						</footer>
					</div>
				</main>
			</div>
		</div>
	);
};

export default AdminInfrastructure;
