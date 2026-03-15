import { motion } from "framer-motion";
import {
  Users, TrendingUp, AlertTriangle, Bell, MessageSquare,
  ClipboardCheck, GraduationCap
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import TeacherBottomNav from "@/components/teacher/TeacherBottomNav";

const attendanceWeekly = [
  { day: "MON", value: 40 },
  { day: "TUE", value: 80 },
  { day: "WED", value: 60 },
  { day: "THU", value: 45 },
  { day: "FRI", value: 70 },
  { day: "SAT", value: 50 },
  { day: "SUN", value: 85 },
];

const quickStats = [
  { icon: Users, label: "STUDENTS", value: "124", colorClass: "text-primary" },
  { icon: TrendingUp, label: "ATTENDANCE", value: "92%", colorClass: "text-stat-emerald" },
  { icon: ClipboardCheck, label: "PENDING", value: "18", colorClass: "text-stat-amber" },
];

const alerts = [
  {
    icon: AlertTriangle,
    title: "Low Performance Alert",
    desc: "4 students in CSE101 are below the 40% grade threshold.",
    time: "2h ago",
    borderColor: "border-l-destructive",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    actions: [
      { label: "Email Students", primary: true },
      { label: "Details", primary: false },
    ],
  },
  {
    icon: MessageSquare,
    title: "New Message",
    desc: "Sarah Jenkins sent a query regarding Mid-Term schedule.",
    time: "5h ago",
    borderColor: "border-l-primary",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    actions: [{ label: "Reply Now", primary: false }],
  },
  {
    icon: ClipboardCheck,
    title: "Grading Deadline",
    desc: "Final Project grades for Section 2 are due in 48 hours.",
    time: "1d ago",
    borderColor: "border-l-stat-amber",
    iconBg: "bg-stat-amber/10",
    iconColor: "text-stat-amber",
    actions: [],
  },
];


const MobileTeacherDashboard = () => {
  

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-card border-b border-border sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl">
            <GraduationCap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-foreground text-lg font-bold leading-none">ULAB One</h1>
            <p className="text-muted-foreground text-xs mt-0.5">Teacher Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-xl">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card animate-pulse" />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold ring-2 ring-primary/10">
            DR
          </div>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto pb-28">
        {/* Welcome Banner */}
        <section className="p-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-primary rounded-2xl p-5 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <h2 className="text-xl font-bold">Good morning, Dr. Rahim</h2>
            <p className="text-primary-foreground/80 text-sm mt-1">
              You have 3 classes today and 18 pending grades.
            </p>
          </motion.div>
        </section>

        {/* Quick Stats */}
        <section className="px-4 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {quickStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                className="flex flex-col gap-1.5 rounded-xl p-3 bg-card border border-border"
              >
                <stat.icon className={`w-5 h-5 ${stat.colorClass}`} />
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="text-foreground text-lg font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Attendance Trend */}
        <section className="px-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-card rounded-2xl p-4 border border-border"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-foreground font-bold">Attendance Trend</h3>
              <span className="text-primary text-xs font-semibold px-2.5 py-1 bg-primary/10 rounded-full">
                Last 7 Days
              </span>
            </div>
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendanceWeekly}>
                  <defs>
                    <linearGradient id="mobileAttGrad" x1="0" y1="0" x2="0" y2="1">
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
                  <YAxis hide domain={[0, 100]} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="url(#mobileAttGrad)"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </section>

        {/* Priority Alerts */}
        <section className="px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-foreground font-bold">Priority Alerts</h3>
              <button className="text-primary text-xs font-semibold">View All</button>
            </div>
            <div className="flex flex-col gap-3">
              {alerts.map((alert, i) => (
                <motion.div
                  key={alert.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.35 }}
                  className={`flex items-start gap-3 p-3 bg-card rounded-xl border-l-4 ${alert.borderColor} border border-border`}
                >
                  <div className={`${alert.iconBg} p-2 rounded-xl shrink-0`}>
                    <alert.icon className={`w-5 h-5 ${alert.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-foreground text-sm font-bold">{alert.title}</h4>
                      <span className="text-muted-foreground text-[10px] shrink-0 ml-2">{alert.time}</span>
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">{alert.desc}</p>
                    {alert.actions.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {alert.actions.map((action) => (
                          <button
                            key={action.label}
                            className={`px-3 py-1 text-[10px] font-bold rounded-full transition-colors ${
                              action.primary
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>

      <TeacherBottomNav />
    </div>
  );
};

export default MobileTeacherDashboard;
