import { motion } from "framer-motion";
import {
  Code, Presentation, Users, Star, Clock, BookOpen,
  GraduationCap, ChevronRight, TrendingUp, Award,
  CheckCircle2, BarChart3, Phone, MapPin, Calendar
} from "lucide-react";

interface TeacherData {
  name: string; email: string; id: string; department: string;
  status: string; avatar: string; avatarColor: string;
  title: string; joinedDate: string; phone: string;
  office: string; expertise: string[]; education: string;
  totalStudents: number; coursesThisSemester: number;
  avgRating: number; researchPapers: number;
}

interface TeacherOverviewTabProps {
  teacher: TeacherData;
}

const currentCourses = [
  { title: "Advanced Data Structures", code: "CS-301", section: "A", icon: Code, students: 42, attendance: "94%", rating: 4.8, schedule: "Sun/Tue 10:00 AM" },
  { title: "Design & Analysis of Algorithms", code: "CS-305", section: "C", icon: Presentation, students: 38, attendance: "89%", rating: 4.9, schedule: "Mon/Wed 2:00 PM" },
  { title: "Operating Systems", code: "CS-401", section: "B", icon: Code, students: 35, attendance: "91%", rating: 4.7, schedule: "Tue/Thu 11:30 AM" },
];

const pastRecords = [
  { year: "2025 Fall", course: "Operating Systems", students: 55, passRate: "92%", result: "Completed" },
  { year: "2025 Spring", course: "Object Oriented Analysis", students: 60, passRate: "88%", result: "Completed" },
  { year: "2024 Fall", course: "Database Systems", students: 48, passRate: "95%", result: "Completed" },
  { year: "2024 Spring", course: "Computer Networks", students: 52, passRate: "90%", result: "Completed" },
];

const gradeDistribution = [
  { grade: "A", pct: 45, color: "bg-primary" },
  { grade: "B", pct: 35, color: "bg-primary/70" },
  { grade: "C", pct: 15, color: "bg-chart-4" },
  { grade: "D", pct: 5, color: "bg-muted-foreground/30" },
];

const timeline = [
  { icon: Award, title: "Outstanding Educator Award", date: "JAN 2026", desc: "Recognized for excellence in digital curriculum design.", color: "text-primary bg-primary/10" },
  { icon: TrendingUp, title: "Promotion: Senior Professor", date: "AUG 2024", desc: "Promoted based on research output and student feedback.", color: "text-chart-3 bg-chart-3/10" },
  { icon: CheckCircle2, title: "Faculty Member of the Year", date: "DEC 2023", desc: "Voted by students and peers for outstanding contributions.", color: "text-chart-2 bg-chart-2/10" },
];

const TeacherOverviewTab = ({ teacher }: TeacherOverviewTabProps) => {
  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card p-5 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-primary" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Students</p>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{teacher.totalStudents}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card p-5 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-chart-2" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Courses</p>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{teacher.coursesThisSemester}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card p-5 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-chart-4" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Rating</p>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{teacher.avgRating}/5.0</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card p-5 rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-4 h-4 text-chart-3" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Publications</p>
          </div>
          <p className="text-2xl font-extrabold text-foreground">{teacher.researchPapers}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Courses - narrower cards */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                Current Courses
              </h3>
              <button className="text-sm font-semibold text-primary hover:underline">View Schedule</button>
            </div>
            <div className="space-y-3">
              {currentCourses.map((course) => (
                <div key={course.code} className="bg-card rounded-xl border border-border p-4 hover:border-primary/30 transition-all flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <course.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-foreground text-sm truncate">{course.title}</h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-primary/10 text-primary uppercase flex-shrink-0">
                        Sec {course.section}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{course.code} · {course.schedule}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-center flex-shrink-0">
                    <div>
                      <p className="text-sm font-extrabold text-foreground">{course.students}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Students</p>
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-foreground">{course.attendance}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Attend.</p>
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-foreground">{course.rating}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold">Rating</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Past Records */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                Past Records & History
              </h3>
              <button className="text-sm font-semibold text-muted-foreground hover:text-foreground">Export CSV</button>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Year/Term</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Course Title</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Students</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pass Rate</th>
                    <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pastRecords.map((rec) => (
                    <tr key={rec.year + rec.course} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground">{rec.year}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground">{rec.course}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{rec.students}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{rec.passRate}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {rec.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-8">
          {/* Personal Details */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 className="text-lg font-bold text-foreground mb-4">Personal Details</h3>
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              {[
                { icon: Phone, label: "Phone", value: teacher.phone },
                { icon: MapPin, label: "Office", value: teacher.office },
                { icon: GraduationCap, label: "Education", value: teacher.education },
                { icon: Calendar, label: "Joined", value: teacher.joinedDate },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3">
                  <item.icon className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Expertise</p>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.expertise.map((e) => (
                    <span key={e} className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-primary/10 text-primary">{e}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Analytics */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" /> Analytics
            </h3>
            <div className="bg-card rounded-xl border border-border p-5 space-y-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Avg. Feedback Score</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-primary">{teacher.avgRating}</span>
                  <span className="text-sm text-muted-foreground">/5.0</span>
                </div>
                <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(teacher.avgRating / 5) * 100}%` }} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Grade Distribution</p>
                <div className="space-y-2.5">
                  {gradeDistribution.map((g) => (
                    <div key={g.grade} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-foreground w-4">{g.grade}</span>
                      <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${g.color} rounded-full`} style={{ width: `${g.pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{g.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Career Timeline */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" /> Career Timeline
            </h3>
            <div className="bg-card rounded-xl border border-border p-5">
              <div className="space-y-5">
                {timeline.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-9 h-9 rounded-full ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.title}</p>
                      <p className="text-[11px] font-bold text-primary">{item.date}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default TeacherOverviewTab;
