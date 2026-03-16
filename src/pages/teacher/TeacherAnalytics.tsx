import { motion } from "framer-motion";
import {
  GraduationCap, UserCheck, Zap, Users, TrendingUp, TrendingDown,
  CalendarDays, Download, MessageSquare
} from "lucide-react";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import TeacherHeader from "@/components/teacher/TeacherHeader";
import TeacherBottomNav from "@/components/teacher/TeacherBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip
} from "recharts";

const kpis = [
  {
    icon: GraduationCap,
    label: "Average GPA",
    value: "3.42",
    change: "+2.1%",
    positive: true,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: UserCheck,
    label: "Avg. Attendance",
    value: "88.5%",
    change: "-1.2%",
    positive: false,
    iconBg: "bg-stat-amber/10",
    iconColor: "text-stat-amber",
  },
  {
    icon: Zap,
    label: "Engagement Score",
    value: "76",
    valueSuffix: "/100",
    change: "+5.4%",
    positive: true,
    iconBg: "bg-stat-purple/10",
    iconColor: "text-stat-purple",
  },
  {
    icon: Users,
    label: "Total Students",
    value: "142",
    change: "Live",
    neutral: true,
    iconBg: "bg-secondary",
    iconColor: "text-muted-foreground",
  },
];

const gradeDistribution = [
  { grade: "F", height: "16.6%", opacity: "bg-muted" },
  { grade: "D", height: "33.3%", opacity: "bg-muted" },
  { grade: "C", height: "50%", opacity: "bg-primary/60" },
  { grade: "B", height: "83.3%", opacity: "bg-primary/80" },
  { grade: "A", height: "100%", opacity: "bg-primary" },
];

const attendanceData = [
  { week: "WK 1", value: 75, target: 90 },
  { week: "WK 4", value: 78, target: 90 },
  { week: "WK 8", value: 82, target: 90 },
  { week: "WK 12", value: 88, target: 90 },
  { week: "WK 16", value: 92, target: 90 },
];

const heatmapData = [
  { label: "Morning", values: [20, 40, 10, 60, 100, 5, 5] },
  { label: "Afternoon", values: [80, 100, 80, 20, 40, 10, 5] },
  { label: "Evening", values: [10, 20, 40, 60, 80, 20, 10] },
];
const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const sections = [
  { name: "Section A (CSE101)", percent: 82, color: "bg-primary" },
  { name: "Section B (CSE101)", percent: 74, color: "bg-primary" },
  { name: "Section C (MAT202)", percent: 91, color: "bg-stat-emerald" },
  { name: "Section D (CSE304)", percent: 68, color: "bg-stat-amber" },
];

const atRiskStudents = [
  {
    name: "Ryan Jordan",
    id: "21203045",
    initials: "RJ",
    gpa: "1.8 (D-)",
    attendance: "62.0%",
    status: "High Risk",
    statusColor: "text-destructive bg-destructive/10 border-destructive/20",
    dotColor: "bg-destructive",
    avatarBg: "bg-primary/10 text-primary border-primary/20",
  },
  {
    name: "Liam Chen",
    id: "21102941",
    initials: "LC",
    gpa: "2.4 (C)",
    attendance: "78.5%",
    status: "Falling",
    statusColor: "text-stat-amber bg-stat-amber/10 border-stat-amber/20",
    dotColor: "bg-stat-amber",
    avatarBg: "bg-stat-amber/10 text-stat-amber border-stat-amber/20",
  },
];

const TeacherAnalytics = () => {
  const isMobile = useIsMobile();

  const content = (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Teacher Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Holistic performance monitoring for Spring 2024 Semester</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary transition-all">
            <CalendarDays className="w-4 h-4" /> Last 30 Days
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl active:scale-[0.98] transition-all">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-card p-5 md:p-6 rounded-2xl border border-border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl ${kpi.iconBg}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
              </div>
              {kpi.neutral ? (
                <span className="text-muted-foreground text-xs font-bold">Live</span>
              ) : (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${kpi.positive ? "text-stat-emerald" : "text-destructive"}`}>
                  {kpi.change}
                  {kpi.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                </span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-muted-foreground text-[10px] md:text-xs font-bold uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl md:text-3xl font-bold mt-1 text-foreground">
                {kpi.value}
                {kpi.valueSuffix && <span className="text-muted-foreground text-lg font-normal">{kpi.valueSuffix}</span>}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row: Grade Distribution + Attendance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card p-6 rounded-2xl border border-border"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-lg text-foreground">Grade Distribution</h3>
              <p className="text-xs text-muted-foreground">Performance spread across all enrolled students</p>
            </div>
            <select className="bg-secondary border-none rounded-xl px-3 py-1.5 text-xs font-bold text-foreground outline-none">
              <option>All Sections</option>
              <option>Section A</option>
              <option>Section B</option>
            </select>
          </div>
          <div className="flex items-end justify-between h-48 gap-4 px-2">
            {gradeDistribution.map((g) => (
              <div key={g.grade} className="flex-1 group relative flex flex-col items-center justify-end h-full">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: g.height }}
                  transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                  className={`w-full rounded-t-lg ${g.opacity} transition-all`}
                />
                <p className={`text-[11px] mt-3 font-bold ${g.grade === "A" ? "text-primary" : "text-muted-foreground"}`}>
                  {g.grade}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Attendance Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card p-6 rounded-2xl border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-lg text-foreground">Attendance Trends</h3>
              <p className="text-xs text-muted-foreground">Weekly attendance percentage (%)</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> <span className="text-[10px] font-bold text-foreground">Current</span></div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground/30" /> <span className="text-[10px] font-bold text-foreground">Target</span></div>
            </div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis hide domain={[60, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#analyticsGrad)" dot={{ fill: "hsl(var(--card))", stroke: "hsl(var(--primary))", strokeWidth: 2, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Heatmap + Section Comparison */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2 bg-card p-6 rounded-2xl border border-border"
        >
          <div className="mb-6">
            <h3 className="font-bold text-lg text-foreground">Student Engagement Heatmap</h3>
            <p className="text-xs text-muted-foreground">Interaction levels across course activities</p>
          </div>
          {/* Days header */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 mb-2">
            <div />
            {days.map(d => (
              <div key={d} className="text-[8px] font-bold text-center text-muted-foreground">{d}</div>
            ))}
          </div>
          {/* Rows */}
          <div className="space-y-1">
            {heatmapData.map(row => (
              <div key={row.label} className="grid grid-cols-[60px_repeat(7,1fr)] gap-1 items-center">
                <div className="text-[8px] font-bold text-muted-foreground">{row.label}</div>
                {row.values.map((v, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-sm"
                    style={{
                      backgroundColor: v <= 5
                        ? "hsl(var(--muted))"
                        : `hsl(var(--primary) / ${Math.min(v / 100, 1)})`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-[8px] font-bold text-muted-foreground uppercase">Engagement Level:</span>
            <div className="flex gap-1">
              {[0.1, 0.4, 0.7, 1].map(o => (
                <div key={o} className="w-2 h-2 rounded-sm" style={{ backgroundColor: `hsl(var(--primary) / ${o})` }} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Section Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-card p-6 rounded-2xl border border-border"
        >
          <h3 className="font-bold text-lg text-foreground mb-6">Section Comparison</h3>
          <div className="space-y-6">
            {sections.map((s, i) => (
              <div key={s.name} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-foreground">{s.name}</span>
                  <span className={`font-black ${s.percent >= 90 ? "text-stat-emerald" : s.percent < 70 ? "text-stat-amber" : "text-primary"}`}>
                    {s.percent}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${s.percent}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                    className={`h-full rounded-full ${s.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Attention Required Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
      >
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Attention Required</h3>
          <button className="text-primary text-sm font-bold hover:underline">View All Students</button>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/50">
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Current Grade</th>
                <th className="px-6 py-4">Attendance</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {atRiskStudents.map(s => (
                <tr key={s.id} className="hover:bg-secondary/30 transition-all">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full ${s.avatarBg} flex items-center justify-center font-bold text-xs border`}>
                        {s.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{s.name}</p>
                        <p className="text-[10px] text-muted-foreground font-medium tracking-tight">ID: {s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${s.dotColor}`} />
                      <span className="font-bold text-sm text-foreground">{s.gpa}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-muted-foreground">{s.attendance}</td>
                  <td className="px-6 py-5">
                    <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${s.statusColor}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="p-2 hover:bg-secondary rounded-xl text-primary border border-transparent hover:border-border transition-all">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden p-4 space-y-3">
          {atRiskStudents.map(s => (
            <div key={s.id} className="bg-secondary/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${s.avatarBg} flex items-center justify-center font-bold text-xs border`}>
                    {s.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{s.name}</p>
                    <p className="text-[10px] text-muted-foreground">ID: {s.id}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border ${s.statusColor}`}>
                  {s.status}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">GPA: <span className="font-bold text-foreground">{s.gpa}</span></span>
                <span className="text-muted-foreground">Attendance: <span className="font-bold text-foreground">{s.attendance}</span></span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="flex-1 overflow-y-auto pb-20">{content}</div>
        <TeacherBottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden premium-bg">
      <div className="hidden md:block">
        <TeacherSidebar activePage="Analytics" />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TeacherHeader />
        <main className="flex-1 overflow-y-auto">{content}</main>
      </div>
    </div>
  );
};

export default TeacherAnalytics;
