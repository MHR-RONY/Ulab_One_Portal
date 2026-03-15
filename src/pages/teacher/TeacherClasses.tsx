import { motion } from "framer-motion";
import {
  Users, Star, UserCheck, ClipboardList, TrendingUp, TrendingDown,
  Download, Plus, FileEdit, CheckSquare, MessageSquare, Terminal,
  Calculator, Cpu, CheckCircle, MessageCircle, AlertTriangle, CalendarDays
} from "lucide-react";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import TeacherHeader from "@/components/teacher/TeacherHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import TeacherBottomNav from "@/components/teacher/TeacherBottomNav";

const stats = [
  { icon: Users, label: "Total Students", value: "186", change: "+4%", positive: true, bgClass: "bg-primary/10 text-primary" },
  { icon: Star, label: "Avg. Grade", value: "3.64 CGPA", change: "+1.2%", positive: true, bgClass: "bg-stat-purple/10 text-stat-purple" },
  { icon: UserCheck, label: "Avg. Attendance", value: "91.4%", change: "-2%", positive: false, bgClass: "bg-stat-amber/10 text-stat-amber" },
  { icon: ClipboardList, label: "Pending Gradings", value: "42", change: null, positive: true, bgClass: "bg-stat-emerald/10 text-stat-emerald" },
];

const classes = [
  {
    icon: Terminal, name: "Data Structures", code: "CSE-201", schedule: "Mon/Wed 10:00 AM",
    section: "Section A", students: 48, avgGrade: "B+", attendance: "94%", progress: 72,
  },
  {
    icon: Calculator, name: "Algorithms", code: "CSE-305", schedule: "Tue/Thu 02:00 PM",
    section: "Section C", students: 42, avgGrade: "A-", attendance: "88%", progress: 45,
  },
  {
    icon: Cpu, name: "Operating Systems", code: "CSE-301", schedule: "Sun/Tue 08:30 AM",
    section: "Section B", students: 56, avgGrade: "B", attendance: "92%", progress: 60,
  },
];

const performanceData = [
  { month: "AUG", percent: 65 },
  { month: "SEP", percent: 80 },
  { month: "OCT", percent: 75 },
  { month: "NOV", percent: 92 },
  { month: "DEC", percent: 85, projected: true },
];

const activities = [
  { icon: CheckCircle, label: "12 Students submitted Assignment 3", sub: "Data Structures • 2 hours ago", color: "bg-stat-emerald/10 text-stat-emerald" },
  { icon: MessageCircle, label: "New question from Abid Hasan", sub: "Algorithms • 4 hours ago", color: "bg-primary/10 text-primary" },
  { icon: AlertTriangle, label: "Low attendance alert: Operating Systems", sub: "System Notification • 6 hours ago", color: "bg-stat-amber/10 text-stat-amber" },
  { icon: CalendarDays, label: "Quiz 2 scheduled for next Tuesday", sub: "Data Structures • 1 day ago", color: "bg-stat-purple/10 text-stat-purple" },
];

const TeacherClasses = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const content = (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">My Classes</h2>
          <p className="text-muted-foreground font-medium text-sm">Managing 4 active courses this semester.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-all">
            <Download className="w-4 h-4" /> Export Reports
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/15 hover:shadow-xl active:scale-[0.98] transition-all">
            <Plus className="w-4 h-4" /> Create Class
          </button>
        </div>
      </motion.section>

      {/* Stats Grid */}
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
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgClass}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              {stat.change && (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${stat.positive ? "text-stat-emerald" : "text-destructive"}`}>
                  {stat.change}
                  {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm font-semibold">{stat.label}</p>
            <h3 className="text-2xl font-extrabold text-foreground mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Course Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {classes.map((cls, i) => (
          <motion.div
            key={cls.code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate(`/teacher/classes/${cls.code}`)}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <cls.icon className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 bg-secondary rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  {cls.section}
                </span>
              </div>
              <h4 className="text-xl font-bold text-foreground mb-1">{cls.name}</h4>
              <p className="text-muted-foreground text-sm font-medium mb-6">{cls.code} • {cls.schedule}</p>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Students</p>
                  <p className="text-lg font-bold text-foreground">{cls.students}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Avg Grade</p>
                  <p className="text-lg font-bold text-foreground">{cls.avgGrade}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Attendance</p>
                  <p className="text-lg font-bold text-foreground">{cls.attendance}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-muted-foreground uppercase">Syllabus Progress</span>
                  <span className="text-primary">{cls.progress}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cls.progress}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            </div>
            <div className="bg-secondary/50 p-4 border-t border-border grid grid-cols-3 gap-2">
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-card transition-colors">
                <FileEdit className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground">Grade</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-card transition-colors">
                <CheckSquare className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground">Attend</span>
              </button>
              <button className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-card transition-colors">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-[10px] font-bold text-muted-foreground">Message</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Row: Performance + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Semester Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="bg-card p-6 md:p-8 rounded-2xl border border-border"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h4 className="text-lg font-bold text-foreground">Semester Performance</h4>
              <p className="text-muted-foreground text-sm">Average grade trends across all sections</p>
            </div>
            <select className="bg-secondary border-none rounded-lg text-xs font-bold py-1.5 pl-3 pr-8 text-foreground focus:ring-2 focus:ring-primary/20 outline-none">
              <option>Monthly View</option>
              <option>Weekly View</option>
            </select>
          </div>
          <div className="relative h-64 flex items-end justify-between px-2 gap-4">
            {performanceData.map((d, i) => (
              <motion.div
                key={d.month}
                className="flex flex-col items-center gap-2 group w-full"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: 0.7 + i * 0.08, duration: 0.5 }}
                style={{ transformOrigin: "bottom" }}
              >
                <div className="w-8 bg-secondary rounded-t-lg h-32 relative overflow-hidden group-hover:bg-primary/10 transition-all">
                  <motion.div
                    className={`absolute bottom-0 w-full rounded-t-lg ${d.projected ? "bg-primary/40 border-2 border-dashed border-primary/30" : "bg-primary"}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${d.percent}%` }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                  />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">{d.month}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Course Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
          className="bg-card p-6 md:p-8 rounded-2xl border border-border"
        >
          <h4 className="text-lg font-bold text-foreground mb-6">Course Activity</h4>
          <div className="space-y-6">
            {activities.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.06, duration: 0.3 }}
                className="flex gap-4"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${a.color}`}>
                  <a.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-foreground font-semibold">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors">
            View All Activity
          </button>
        </motion.div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <TeacherHeader />
        <main className="pb-28">{content}</main>
        <TeacherBottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden premium-bg">
      <div className="hidden md:block">
        <TeacherSidebar activePage="My Classes" />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TeacherHeader />
        <main className="flex-1 overflow-y-auto">{content}</main>
      </div>
    </div>
  );
};

export default TeacherClasses;
