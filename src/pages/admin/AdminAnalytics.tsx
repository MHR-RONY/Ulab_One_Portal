import { motion } from "framer-motion";
import {
  Users, Globe, UserPlus, Activity, TrendingUp, TrendingDown,
  Calendar, MoreVertical, CloudDownload, FileText, FileSpreadsheet
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useState } from "react";

const stats = [
  { icon: Users, label: "Total Active Users", value: "12,450", change: "+12%", positive: true, colorClass: "text-primary bg-primary/10" },
  { icon: Globe, label: "Monthly Traffic", value: "85.2K", change: "+5%", positive: true, colorClass: "text-blue-500 bg-blue-500/10" },
  { icon: UserPlus, label: "New Enrollments", value: "432", change: "-2%", positive: false, colorClass: "text-stat-purple bg-stat-purple/10" },
  { icon: Activity, label: "System Health", value: "99.9%", change: "Optimal", positive: true, colorClass: "text-stat-emerald bg-stat-emerald/10" },
];

const trafficData = [
  { day: "May 01", value: 1800 },
  { day: "May 05", value: 2200 },
  { day: "May 08", value: 2600 },
  { day: "May 10", value: 3200 },
  { day: "May 12", value: 2900 },
  { day: "May 15", value: 4502 },
  { day: "May 18", value: 3100 },
  { day: "May 20", value: 3800 },
  { day: "May 22", value: 3400 },
  { day: "May 25", value: 2800 },
  { day: "May 28", value: 3600 },
  { day: "May 30", value: 4100 },
];

const departments = [
  { name: "CSE - Computer Science", percent: 92 },
  { name: "BBS - Business School", percent: 78 },
  { name: "EEE - Electrical Engineering", percent: 64 },
  { name: "Arts & Humanities", percent: 45 },
];

const systemAlerts = [
  { time: "14:22:15", level: "CRITICAL", levelColor: "bg-destructive/10 text-destructive", message: "SQL Injection attempt blocked", status: "Resolved", statusColor: "text-stat-emerald" },
  { time: "13:05:40", level: "WARNING", levelColor: "bg-stat-amber/10 text-stat-amber", message: "Latency increase in Node #4", status: "Monitoring", statusColor: "text-muted-foreground" },
  { time: "12:58:12", level: "INFO", levelColor: "bg-blue-500/10 text-blue-500", message: "System backup completed", status: "Success", statusColor: "text-stat-emerald" },
  { time: "10:45:01", level: "CRITICAL", levelColor: "bg-destructive/10 text-destructive", message: "Mail server connection timeout", status: "Failed", statusColor: "text-destructive" },
];

const AdminAnalytics = () => {
  const [activeTab, setActiveTab] = useState<"realtime" | "historical">("realtime");

  return (
    <div className="flex h-screen overflow-hidden premium-bg admin-theme">
      <div className="hidden md:block">
        <AdminSidebar activePage="Analytics" />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          {/* Title & Actions */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">System Analytics & Reports</h2>
              <p className="text-muted-foreground text-sm mt-0.5">Unified performance intelligence and system utilization metrics.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-bold text-foreground hover:bg-secondary transition-all">
                <Calendar className="w-4 h-4" />
                Last 30 Days
              </button>
              <div className="flex items-center gap-0.5 bg-primary rounded-xl p-0.5">
                <button
                  onClick={() => setActiveTab("realtime")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "realtime" ? "bg-card text-primary shadow-sm" : "text-primary-foreground opacity-80 hover:opacity-100"}`}
                >
                  Real-time
                </button>
                <button
                  onClick={() => setActiveTab("historical")}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "historical" ? "bg-card text-primary shadow-sm" : "text-primary-foreground opacity-80 hover:opacity-100"}`}
                >
                  Historical
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="bg-card p-6 rounded-2xl border border-border hover:border-primary/20 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl ${stat.colorClass} group-hover:bg-primary group-hover:text-primary-foreground transition-all`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full ${stat.positive ? "text-stat-emerald bg-stat-emerald/10" : "text-destructive bg-destructive/10"}`}>
                    {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {stat.change}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-extrabold text-foreground mt-1">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Platform Traffic */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h4 className="font-bold text-lg text-foreground">Platform Traffic</h4>
                  <p className="text-xs text-muted-foreground">Visitor volume over the last 30 days</p>
                </div>
                <button className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      fill="url(#analyticsGrad)"
                      dot={{ fill: "hsl(var(--card))", stroke: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* User Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="bg-card rounded-2xl p-6 border border-border flex flex-col"
            >
              <h4 className="font-bold text-lg text-foreground mb-6">User Distribution</h4>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative w-48 h-48 rounded-full border-[20px] border-secondary flex items-center justify-center">
                  <svg className="absolute inset-[-20px] w-[calc(100%+40px)] h-[calc(100%+40px)]" viewBox="0 0 200 200">
                    <circle
                      cx="100" cy="100" r="90"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="20"
                      strokeDasharray={`${0.72 * 2 * Math.PI * 90} ${2 * Math.PI * 90}`}
                      strokeLinecap="round"
                      transform="rotate(-90 100 100)"
                    />
                  </svg>
                  <div className="text-center z-10">
                    <span className="text-3xl font-extrabold text-foreground">12.4K</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Total Users</p>
                  </div>
                </div>
                <div className="mt-8 space-y-3 w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm font-semibold text-foreground">Students</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">8,940 (72%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-secondary" />
                      <span className="text-sm font-semibold text-foreground">Teachers</span>
                    </div>
                    <span className="text-sm font-bold text-foreground">3,510 (28%)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Engagement & Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Departmental Engagement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="bg-card rounded-2xl p-6 border border-border"
            >
              <h4 className="font-bold text-lg text-foreground mb-8">Departmental Engagement</h4>
              <div className="space-y-6">
                {departments.map((dept, i) => (
                  <div key={dept.name}>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-foreground">{dept.name}</span>
                      <span className="text-primary">{dept.percent}% Activity</span>
                    </div>
                    <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${dept.percent}%` }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-primary rounded-full"
                        style={{ opacity: 1 - i * 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* System Alerts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="bg-card rounded-2xl p-6 border border-border overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-lg text-foreground">Recent System Alerts</h4>
                <button className="text-xs font-bold text-primary hover:underline">View All Logs</button>
              </div>
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border">
                    <tr className="text-muted-foreground uppercase text-[10px] tracking-widest font-extrabold">
                      <th className="pb-4 px-2">Timestamp</th>
                      <th className="pb-4 px-2">Alert Level</th>
                      <th className="pb-4 px-2">Message</th>
                      <th className="pb-4 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {systemAlerts.map((alert) => (
                      <tr key={alert.time} className="group hover:bg-secondary/50 transition-colors">
                        <td className="py-4 px-2 font-medium whitespace-nowrap text-foreground">{alert.time}</td>
                        <td className="py-4 px-2">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${alert.levelColor}`}>
                            {alert.level}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-muted-foreground truncate max-w-[150px]">{alert.message}</td>
                        <td className={`py-4 px-2 font-bold ${alert.statusColor}`}>{alert.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Data Export */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="bg-primary/5 rounded-2xl p-8 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-card rounded-xl flex items-center justify-center shadow-lg shadow-primary/10">
                <CloudDownload className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-foreground">Data Export Center</h3>
                <p className="text-muted-foreground max-w-sm text-sm">Download aggregated system data for offline auditing. Available in standard formats.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-card hover:shadow-md transition-all rounded-xl text-sm font-extrabold text-foreground">
                <FileText className="w-4 h-4" />
                Export PDF
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-xl text-sm font-extrabold">
                <FileSpreadsheet className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminAnalytics;
