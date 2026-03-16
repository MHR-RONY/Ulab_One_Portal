import { motion } from "framer-motion";
import {
  Users, TrendingUp, Award, Search, ChevronRight,
  BarChart3, ArrowUp, ArrowDown, ArrowLeft, BookOpen,
  Clock, GraduationCap, AlertTriangle
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const students = [
  { id: "211014022", name: "Rahat Chowdhury", course: "CS-301", cgpa: 3.72, attendance: 89, status: "Good Standing", trend: "up", midterm: 82, final: 88, assignments: 90 },
  { id: "211014088", name: "Mehedi Hasan", course: "CS-301", cgpa: 3.45, attendance: 85, status: "Good Standing", trend: "up", midterm: 75, final: 80, assignments: 85 },
  { id: "222015099", name: "Zubair Hassan", course: "CS-305", cgpa: 3.55, attendance: 92, status: "Good Standing", trend: "up", midterm: 78, final: 85, assignments: 88 },
  { id: "203011078", name: "Nusrat Jahan", course: "CS-301", cgpa: 3.60, attendance: 91, status: "Good Standing", trend: "up", midterm: 80, final: 84, assignments: 87 },
  { id: "193014112", name: "Faria Tasnim", course: "CS-305", cgpa: 3.88, attendance: 95, status: "Excellent", trend: "up", midterm: 92, final: 95, assignments: 94 },
  { id: "203011045", name: "Sumaiya Akhter", course: "CS-401", cgpa: 2.95, attendance: 62, status: "At Risk", trend: "down", midterm: 55, final: 60, assignments: 58 },
  { id: "213016055", name: "Tanvir Ahmed", course: "CS-401", cgpa: 3.50, attendance: 88, status: "Good Standing", trend: "up", midterm: 76, final: 82, assignments: 80 },
  { id: "203016032", name: "Mithila Rahman", course: "CS-305", cgpa: 3.65, attendance: 93, status: "Good Standing", trend: "up", midterm: 84, final: 88, assignments: 90 },
  { id: "211014055", name: "Arif Hossain", course: "CS-301", cgpa: 3.10, attendance: 78, status: "Good Standing", trend: "down", midterm: 68, final: 72, assignments: 75 },
  { id: "203011090", name: "Rima Sultana", course: "CS-401", cgpa: 2.80, attendance: 58, status: "At Risk", trend: "down", midterm: 50, final: 55, assignments: 52 },
];

const courseBreakdown = [
  { code: "CS-301", name: "Advanced Data Structures", enrolled: 42, avgGpa: 3.48, avgAttendance: 87, atRisk: 3, credits: 3, schedule: "Sun, Tue 10:00–11:30 AM", room: "Room 405, CS Building", semester: "Fall 2025", section: "A" },
  { code: "CS-305", name: "Design & Analysis of Algorithms", enrolled: 38, avgGpa: 3.62, avgAttendance: 91, atRisk: 1, credits: 3, schedule: "Mon, Wed 1:00–2:30 PM", room: "Room 302, CS Building", semester: "Fall 2025", section: "B" },
  { code: "CS-401", name: "Operating Systems", enrolled: 35, avgGpa: 3.35, avgAttendance: 84, atRisk: 5, credits: 3, schedule: "Tue, Thu 3:00–4:30 PM", room: "Lab 201, CS Building", semester: "Fall 2025", section: "A" },
];

const TeacherPerformanceTab = () => {
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  const filtered = students.filter(s =>
    (selectedCourse ? s.course === selectedCourse : true) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.includes(search))
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Excellent": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "At Risk": return "bg-destructive/10 text-destructive";
      default: return "bg-primary/10 text-primary";
    }
  };

  const course = courseBreakdown.find(c => c.code === selectedCourse);

  // Course Detail View
  if (selectedCourse && course) {
    const courseStudents = students.filter(s => s.course === selectedCourse);
    const excellentCount = courseStudents.filter(s => s.status === "Excellent").length;
    const atRiskCount = courseStudents.filter(s => s.status === "At Risk").length;
    const avgMidterm = Math.round(courseStudents.reduce((a, s) => a + s.midterm, 0) / courseStudents.length);
    const avgFinal = Math.round(courseStudents.reduce((a, s) => a + s.final, 0) / courseStudents.length);
    const avgAssignment = Math.round(courseStudents.reduce((a, s) => a + s.assignments, 0) / courseStudents.length);

    return (
      <>
        <button onClick={() => { setSelectedCourse(null); setSearch(""); }}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to All Courses
        </button>

        {/* Course Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">{course.code}</span>
                <span className="text-xs text-muted-foreground font-semibold">Section {course.section}</span>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-1">{course.name}</h2>
              <p className="text-sm text-muted-foreground">{course.semester} · {course.credits} Credits</p>
            </div>
            <div className="flex flex-col gap-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {course.schedule}</span>
              <span className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" /> {course.room}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Enrolled", value: courseStudents.length, icon: Users, color: "text-primary" },
            { label: "Avg GPA", value: course.avgGpa, icon: TrendingUp, color: "text-chart-2" },
            { label: "Attendance", value: `${course.avgAttendance}%`, icon: BarChart3, color: "text-chart-4" },
            { label: "Avg Midterm", value: `${avgMidterm}%`, icon: GraduationCap, color: "text-chart-3" },
            { label: "Avg Final", value: `${avgFinal}%`, icon: Award, color: "text-primary" },
            { label: "At Risk", value: atRiskCount, icon: AlertTriangle, color: "text-destructive" },
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card p-4 rounded-xl border border-border">
              <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
              <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Grade Distribution */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border p-5 mb-8">
          <h3 className="text-sm font-bold text-foreground mb-4">Score Breakdown (Averages)</h3>
          <div className="space-y-3">
            {[
              { label: "Midterm", value: avgMidterm },
              { label: "Final", value: avgFinal },
              { label: "Assignments", value: avgAssignment },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-muted-foreground w-24">{item.label}</span>
                <div className="flex-1 bg-secondary h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.value >= 80 ? "bg-primary" : item.value >= 60 ? "bg-chart-4" : "bg-destructive"}`}
                    style={{ width: `${item.value}%` }} />
                </div>
                <span className="text-xs font-bold text-foreground w-10 text-right">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Student Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-foreground">Enrolled Students</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-lg text-sm" />
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Student</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">CGPA</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Midterm</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Final</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Assignments</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Attendance</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-bold text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.id}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-foreground text-center">{s.cgpa}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-foreground text-center">{s.midterm}%</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-foreground text-center">{s.final}%</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-foreground text-center">{s.assignments}%</td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 bg-secondary h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${s.attendance >= 85 ? "bg-primary" : s.attendance >= 75 ? "bg-chart-4" : "bg-destructive"}`}
                            style={{ width: `${s.attendance}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">{s.attendance}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${getStatusStyle(s.status)}`}>{s.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </>
    );
  }

  // Default: All courses overview
  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card p-5 rounded-xl border border-border">
          <Users className="w-5 h-5 text-primary mb-2" />
          <p className="text-2xl font-extrabold text-foreground">115</p>
          <p className="text-xs text-muted-foreground font-semibold">Total Students</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card p-5 rounded-xl border border-border">
          <TrendingUp className="w-5 h-5 text-chart-2 mb-2" />
          <p className="text-2xl font-extrabold text-foreground">3.48</p>
          <p className="text-xs text-muted-foreground font-semibold">Avg. CGPA</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card p-5 rounded-xl border border-border">
          <BarChart3 className="w-5 h-5 text-chart-4 mb-2" />
          <p className="text-2xl font-extrabold text-foreground">87%</p>
          <p className="text-xs text-muted-foreground font-semibold">Avg. Attendance</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card p-5 rounded-xl border border-border">
          <Award className="w-5 h-5 text-destructive mb-2" />
          <p className="text-2xl font-extrabold text-foreground">9</p>
          <p className="text-xs text-muted-foreground font-semibold">At Risk Students</p>
        </motion.div>
      </div>

      {/* Course-wise Breakdown */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-8">
        <h3 className="text-lg font-bold text-foreground mb-4">Course-wise Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courseBreakdown.map((c) => (
            <div key={c.code} onClick={() => setSelectedCourse(c.code)}
              className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-primary">{c.code}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h4 className="font-bold text-sm text-foreground mb-3">{c.name}</h4>
              <div className="grid grid-cols-3 gap-2 text-center border-t border-border pt-3">
                <div>
                  <p className="text-sm font-extrabold text-foreground">{c.avgGpa}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Avg GPA</p>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-foreground">{c.avgAttendance}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Attend.</p>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-destructive">{c.atRisk}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">At Risk</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Student List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">All Students</h3>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-lg text-sm" />
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Student</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Course</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">CGPA</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Attendance</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center">Trend</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-secondary/30 transition-colors cursor-pointer">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-bold text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.id}</p>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-primary">{s.course}</td>
                  <td className="px-5 py-3.5 text-sm font-bold text-foreground text-center">{s.cgpa}</td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-12 bg-secondary h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${s.attendance >= 85 ? "bg-primary" : s.attendance >= 75 ? "bg-chart-4" : "bg-destructive"}`}
                          style={{ width: `${s.attendance}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    {s.trend === "up"
                      ? <ArrowUp className="w-4 h-4 text-green-500 mx-auto" />
                      : <ArrowDown className="w-4 h-4 text-destructive mx-auto" />
                    }
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${getStatusStyle(s.status)}`}>{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
};

export default TeacherPerformanceTab;
