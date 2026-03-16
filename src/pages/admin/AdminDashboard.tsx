import { motion } from "framer-motion";
import {
  Users, GraduationCap, Activity, ShieldCheck,
  TrendingUp, CheckCircle2, XCircle, Clock,
  Download, UserPlus, CalendarClock, FileText
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

const stats = [
  { icon: Users, label: "Total Students", value: "12,842", change: "+4.2%", positive: true, colorClass: "text-primary bg-primary/10" },
  { icon: GraduationCap, label: "Total Teachers", value: "846", change: "+1.8%", positive: true, colorClass: "text-stat-purple bg-stat-purple/10" },
  { icon: Activity, label: "Active Sessions", value: "2,105", change: "Live", positive: true, colorClass: "text-stat-amber bg-stat-amber/10" },
  { icon: ShieldCheck, label: "System Health", value: "99.98%", change: "Stable", positive: true, colorClass: "text-stat-emerald bg-stat-emerald/10" },
];

const trafficData = [
  { day: "MON", value: 2400 },
  { day: "TUE", value: 3200 },
  { day: "WED", value: 2800 },
  { day: "THU", value: 3600 },
  { day: "FRI", value: 3100 },
  { day: "SAT", value: 1800 },
  { day: "SUN", value: 1200 },
];

const pendingApprovals = [
  { icon: UserPlus, title: "New Teacher: Dr. Sarah Jenkins", subtitle: "Applied for Computer Science Faculty", iconBg: "bg-primary/10 text-primary" },
  { icon: CalendarClock, title: "Reschedule: CSC101 Section A", subtitle: "Requested by Prof. David Miller", iconBg: "bg-stat-amber/10 text-stat-amber" },
  { icon: FileText, title: "Resource Approval: Lab Manual V2", subtitle: "Physics Department Upload", iconBg: "bg-stat-emerald/10 text-stat-emerald" },
];

const systemLogs = [
  { status: "bg-stat-emerald", title: "Server Backup Completed", time: "2 minutes ago • Automated task" },
  { status: "bg-stat-amber", title: "Failed Login Attempt (Admin)", time: "14 minutes ago • IP: 192.168.1.45" },
  { status: "bg-primary", title: "New Policy Updated", time: "1 hour ago • By: Rivera (Super Admin)" },
  { status: "bg-stat-emerald", title: "System Cache Cleared", time: "3 hours ago • Weekly maintenance" },
  { status: "bg-destructive", title: "Storage Alert (90% capacity)", time: "5 hours ago • Resource node 03" },
];

const enrollmentFaculties = [
  { name: "BBA Faculty", percent: 78 },
  { name: "CS Faculty", percent: 92 },
];

const AdminDashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden premium-bg">
      <div className="hidden md:block">
        <AdminSidebar activePage="Dashboard" />
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
            <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Dashboard Overview</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Real-time insights for ULAB Portal administration.</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="bg-card p-6 rounded-2xl border border-border"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl ${stat.colorClass}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-stat-emerald">{stat.change}</span>
                </div>
                <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                <h3 className="text-2xl font-extrabold text-foreground mt-1">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* Traffic + Enrollment */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-lg text-foreground">Platform Traffic</h4>
                <select className="bg-secondary border-none rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-none">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trafficData}>
                    <defs>
                      <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
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
                      fill="url(#trafficGrad)"
                      dot={{ fill: "hsl(var(--card))", stroke: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Enrollment Growth */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="bg-primary rounded-2xl p-6 text-primary-foreground flex flex-col justify-between"
            >
              <div>
                <h4 className="font-bold text-lg opacity-90">Enrollment Growth</h4>
                <p className="text-4xl font-extrabold mt-2">12.5%</p>
                <p className="text-sm opacity-75 mt-1">vs Last Semester</p>
              </div>
              <div className="space-y-4 mt-6">
                {enrollmentFaculties.map((f) => (
                  <div key={f.name}>
                    <div className="flex justify-between text-sm font-semibold mb-1.5">
                      <span>{f.name}</span>
                      <span>{f.percent}% Full</span>
                    </div>
                    <div className="w-full bg-primary-foreground/20 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${f.percent}%` }}
                        transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-primary-foreground"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Approvals + System Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pending Approvals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-lg text-foreground">Pending Approvals</h4>
                <button className="text-primary text-sm font-semibold hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                {pendingApprovals.map((item) => (
                  <div key={item.title} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${item.iconBg}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors">
                        Approve
                      </button>
                      <button className="px-4 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-bold hover:bg-secondary/80 transition-colors">
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* System Logs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="bg-card p-6 rounded-2xl border border-border"
            >
              <h4 className="font-bold text-lg text-foreground mb-5">System Logs</h4>
              <div className="space-y-4">
                {systemLogs.map((log) => (
                  <div key={log.title} className="flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${log.status}`} />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{log.title}</p>
                      <p className="text-xs text-muted-foreground">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="mt-6 w-full text-center text-xs font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                Download Full Log
              </button>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
