import { motion } from "framer-motion";
import {
  Users, CalendarDays, HelpCircle, Zap, TrendingUp, TrendingDown,
  Download, Plus, Trophy, AlertTriangle, ArrowLeft, Menu, X, GraduationCap
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import TeacherHeader from "@/components/teacher/TeacherHeader";
import MobileTeacherDashboard from "@/components/teacher/MobileTeacherDashboard";
import { useIsMobile } from "@/hooks/use-mobile";

// Stats data
const stats = [
  { icon: Users, label: "Total Students", value: "1,284", change: "+4% vs LW", positive: true, colorClass: "text-primary bg-primary/10" },
  { icon: CalendarDays, label: "Avg. Attendance", value: "92.4%", change: "+2.1%", positive: true, colorClass: "text-stat-blue bg-stat-blue/10" },
  { icon: HelpCircle, label: "Quiz Pass Rate", value: "78.2%", change: "-0.5%", positive: false, colorClass: "text-stat-amber bg-stat-amber/10" },
  { icon: Zap, label: "Active Engagement", value: "85.0", change: "+12%", positive: true, colorClass: "text-stat-purple bg-stat-purple/10" },
];

// Attendance trend data
const attendanceData = [
  { week: "WK 01", value: 75 },
  { week: "WK 04", value: 80 },
  { week: "WK 06", value: 78 },
  { week: "WK 08", value: 82 },
  { week: "WK 10", value: 81 },
  { week: "WK 12", value: 88 },
  { week: "WK 14", value: 85 },
  { week: "WK 16", value: 90 },
];

// Radar data
const engagementData = [
  { subject: "Quizzes", A: 85 },
  { subject: "Submission", A: 90 },
  { subject: "Participation", A: 65 },
  { subject: "Forum Activity", A: 70 },
];

// Section performance
const sections = [
  { name: "Section A (CS-101)", gpa: "3.85", percent: 85, color: "bg-primary" },
  { name: "Section B (CS-102)", gpa: "3.40", percent: 72, color: "bg-primary/60" },
  { name: "Section C (MAT-203)", gpa: "3.92", percent: 94, color: "bg-primary" },
  { name: "Section D (CS-205)", gpa: "2.80", percent: 55, color: "bg-destructive" },
];

const topPerformers = [
  { name: "Sarah Jenkins", grade: "A+", initials: "SJ" },
  { name: "Marcus Chen", grade: "A", initials: "MC" },
  { name: "Elena Rossi", grade: "A", initials: "ER" },
];

const atRiskStudents = [
  { name: "David Miller", tag: "Attendance", tagColor: "text-destructive bg-destructive/10", initials: "DM" },
  { name: "Lisa Wang", tag: "Low Scores", tagColor: "text-stat-amber bg-stat-amber/10", initials: "LW" },
  { name: "James Doe", tag: "Late Sub", tagColor: "text-destructive bg-destructive/10", initials: "JD" },
];

const mobileMenuItems = [
  { label: "Dashboard", href: "/teacher" },
  { label: "Classes", href: "/teacher" },
  { label: "Attendance", href: "/teacher" },
  { label: "Grades", href: "/teacher" },
  { label: "Engagement", href: "/teacher" },
  { label: "Reports", href: "/teacher" },
  { label: "Switch to Student", href: "/" },
];

const TeacherDashboard = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile } = useTeacherProfile();

  const mainContent = (
    <div className="p-4 md:p-8 space-y-8">
      {/* Academic Overview Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Academic Overview</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Spring Semester 2024 • {profile?.department ?? "Department"}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-all">
            <Download className="w-4 h-4" /> Export Report
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/15 hover:shadow-xl hover:shadow-primary/20 active:scale-[0.98] transition-all">
            <Plus className="w-4 h-4" /> New Announcement
          </button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="glass-card bg-card p-6 rounded-2xl border border-border"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2.5 rounded-xl ${stat.colorClass}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold ${stat.positive ? "text-stat-emerald" : "text-destructive"}`}>
                {stat.change}
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-extrabold text-foreground mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-2 glass-card bg-card p-6 rounded-2xl border border-border"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="font-bold text-lg text-foreground">Class Attendance Trends</h4>
              <p className="text-muted-foreground text-sm">Weekly percentage over current semester</p>
            </div>
            <select className="bg-secondary border-none rounded-xl px-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary/20 outline-none">
              <option>Last 6 Months</option>
              <option>Last 3 Months</option>
            </select>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
                />
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
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  fill="url(#attendanceGrad)"
                  dot={{ fill: "hsl(var(--card))", stroke: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Student Engagement Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="glass-card bg-card p-6 rounded-2xl border border-border flex flex-col"
        >
          <h4 className="font-bold text-lg text-foreground">Student Engagement</h4>
          <p className="text-muted-foreground text-sm mb-4">Metrics comparison</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={engagementData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
                />
                <PolarRadiusAxis hide />
                <Radar
                  dataKey="A"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Avg. Score</span>
              <span className="font-bold text-foreground">78%</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-bold text-foreground">94%</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Performance Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="glass-card bg-card p-6 rounded-2xl border border-border"
        >
          <h4 className="font-bold text-lg text-foreground mb-1">Section Performance</h4>
          <p className="text-muted-foreground text-sm mb-6">Comparing average grade by section</p>
          <div className="space-y-5">
            {sections.map((section, i) => (
              <div key={section.name} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-foreground">{section.name}</span>
                  <span className="text-foreground">{section.gpa} GPA</span>
                </div>
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${section.percent}%` }}
                    transition={{ delay: 0.6 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                    className={`h-full rounded-full ${section.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Performers & At Risk */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Performers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="glass-card bg-card p-6 rounded-2xl border border-border"
          >
            <div className="flex items-center gap-2 mb-5">
              <Trophy className="w-5 h-5 text-stat-amber" />
              <h4 className="font-bold text-foreground">Top Performers</h4>
            </div>
            <div className="space-y-4">
              {topPerformers.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[10px] font-bold ring-2 ring-primary/10">
                      {s.initials}
                    </div>
                    <span className="text-sm font-medium text-foreground">{s.name}</span>
                  </div>
                  <span className="text-xs font-bold text-primary">{s.grade}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* At Risk */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="glass-card bg-card p-6 rounded-2xl border border-border"
          >
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h4 className="font-bold text-foreground">At Risk</h4>
            </div>
            <div className="space-y-4">
              {atRiskStudents.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive text-[10px] font-bold ring-2 ring-destructive/10">
                      {s.initials}
                    </div>
                    <span className="text-sm font-medium text-foreground">{s.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] rounded-md font-bold uppercase ${s.tagColor}`}>{s.tag}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return <MobileTeacherDashboard teacherName={profile?.name ?? ""} />;
  }

  return (
    <div className="flex h-screen overflow-hidden premium-bg">
      <div className="hidden md:block">
        <TeacherSidebar activePage="Dashboard" />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TeacherHeader />
        <main className="flex-1 overflow-y-auto">{mainContent}</main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
