import { motion } from "framer-motion";
import {
  TrendingUp, BookOpen, Award, GraduationCap, ChevronDown, ChevronUp,
  CheckCircle, Clock, AlertCircle, Download, Filter, BarChart3
} from "lucide-react";
import { useState } from "react";

interface Course {
  code: string;
  name: string;
  section: string;
  credits: number;
  grade?: string;
  status?: "completed" | "in-progress" | "withdrawn" | "failed";
}

interface PastSemester {
  semester: string;
  gpa: number;
  credits: number;
  courses: Course[];
}

interface StudentData {
  name: string;
  cgpa: string;
  cgpaChange: string;
  creditsCompleted: number;
  totalCredits: number;
  department: string;
  semester: string;
  courses: { code: string; name: string; section: string; credits: number }[];
  gpaTrend: { semester: string; gpa: number }[];
}

// Generate mock past semester data based on student's GPA trend
const generatePastSemesters = (student: StudentData): PastSemester[] => {
  const coursesByDept: Record<string, Course[][]> = {
    CSE: [
      [
        { code: "CSE110", name: "Programming Language I", section: "01", credits: 3, grade: "A-", status: "completed" },
        { code: "MAT101", name: "Calculus I", section: "02", credits: 3, grade: "B+", status: "completed" },
        { code: "PHY101", name: "Physics I", section: "01", credits: 3, grade: "A", status: "completed" },
        { code: "ENG101", name: "English Composition", section: "03", credits: 3, grade: "A", status: "completed" },
      ],
      [
        { code: "CSE111", name: "Programming Language II", section: "02", credits: 3, grade: "A", status: "completed" },
        { code: "MAT102", name: "Calculus II", section: "01", credits: 3, grade: "B+", status: "completed" },
        { code: "CSE173", name: "Discrete Mathematics", section: "01", credits: 3, grade: "A-", status: "completed" },
        { code: "PHY102", name: "Physics II", section: "02", credits: 3, grade: "B", status: "completed" },
      ],
      [
        { code: "CSE220", name: "Data Structures", section: "01", credits: 3, grade: "A", status: "completed" },
        { code: "CSE221", name: "Algorithms", section: "02", credits: 3, grade: "A-", status: "completed" },
        { code: "MAT205", name: "Linear Algebra", section: "01", credits: 3, grade: "B+", status: "completed" },
        { code: "CSE260", name: "Digital Logic Design", section: "01", credits: 3, grade: "A", status: "completed" },
      ],
      [
        { code: "CSE250", name: "OOP Concepts", section: "01", credits: 3, grade: "A", status: "completed" },
        { code: "CSE251", name: "Theory of Computation", section: "02", credits: 3, grade: "B+", status: "completed" },
        { code: "CSE310", name: "Operating Systems", section: "01", credits: 3, grade: "A-", status: "completed" },
        { code: "STA201", name: "Probability & Statistics", section: "01", credits: 3, grade: "A", status: "completed" },
      ],
      [
        { code: "CSE370", name: "Database Systems", section: "01", credits: 3, grade: "A", status: "completed" },
        { code: "CSE331", name: "Data Structures", section: "02", credits: 3, grade: "A-", status: "completed" },
        { code: "CSE341", name: "Computer Architecture", section: "01", credits: 3, grade: "B+", status: "completed" },
        { code: "CSE360", name: "Computer Networks", section: "01", credits: 3, grade: "A", status: "completed" },
      ],
    ],
    BBA: [
      [
        { code: "BBA101", name: "Principles of Management", section: "01", credits: 3, grade: "A-", status: "completed" },
        { code: "BBA102", name: "Business Mathematics", section: "02", credits: 3, grade: "B+", status: "completed" },
        { code: "ECO101", name: "Micro Economics", section: "01", credits: 3, grade: "B", status: "completed" },
        { code: "ENG101", name: "English Composition", section: "01", credits: 3, grade: "A", status: "completed" },
      ],
      [
        { code: "BBA201", name: "Financial Accounting", section: "01", credits: 3, grade: "A", status: "completed" },
        { code: "BBA210", name: "Organizational Behavior", section: "02", credits: 3, grade: "B+", status: "completed" },
        { code: "ECO102", name: "Macro Economics", section: "01", credits: 3, grade: "B+", status: "completed" },
        { code: "STA201", name: "Business Statistics", section: "01", credits: 3, grade: "A-", status: "completed" },
      ],
      [
        { code: "BBA301", name: "Marketing Management", section: "01", credits: 3, grade: "A-", status: "completed" },
        { code: "BBA310", name: "Cost Accounting", section: "02", credits: 3, grade: "B", status: "completed" },
        { code: "BBA320", name: "Business Law", section: "01", credits: 3, grade: "A", status: "completed" },
      ],
    ],
    default: [
      [
        { code: "GEN101", name: "Introduction to Studies", section: "01", credits: 3, grade: "A", status: "completed" },
        { code: "ENG101", name: "English Composition", section: "01", credits: 3, grade: "A-", status: "completed" },
        { code: "HIS101", name: "History & Civilization", section: "02", credits: 3, grade: "B+", status: "completed" },
      ],
      [
        { code: "GEN201", name: "Research Methods", section: "01", credits: 3, grade: "A", status: "completed" },
        { code: "GEN210", name: "Critical Thinking", section: "02", credits: 3, grade: "A-", status: "completed" },
        { code: "GEN220", name: "Academic Writing", section: "01", credits: 3, grade: "B+", status: "completed" },
      ],
    ],
  };

  const deptCourses = coursesByDept[student.department] || coursesByDept.default;

  return student.gpaTrend.slice(0, -1).map((item, i) => ({
    semester: item.semester,
    gpa: item.gpa,
    credits: (deptCourses[i % deptCourses.length] || deptCourses[0]).reduce((s, c) => s + c.credits, 0),
    courses: deptCourses[i % deptCourses.length] || deptCourses[0],
  }));
};

const gradeColor = (grade?: string) => {
  if (!grade) return "text-muted-foreground";
  if (grade.startsWith("A")) return "text-green-600 dark:text-green-400";
  if (grade.startsWith("B")) return "text-primary";
  if (grade.startsWith("C")) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
};

const statusConfig = {
  completed: { icon: CheckCircle, label: "Completed", color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" },
  "in-progress": { icon: Clock, label: "In Progress", color: "text-primary", bg: "bg-primary/10 text-primary" },
  withdrawn: { icon: AlertCircle, label: "Withdrawn", color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" },
  failed: { icon: AlertCircle, label: "Failed", color: "text-destructive", bg: "bg-destructive/10 text-destructive" },
};

const AcademicProgressTab = ({ student }: { student: StudentData }) => {
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);
  const pastSemesters = generatePastSemesters(student);
  const maxGpa = 4.0;
  const completionPercent = Math.round((student.creditsCompleted / student.totalCredits) * 100);

  const totalCoursesCompleted = pastSemesters.reduce((s, sem) => s + sem.courses.length, 0);
  const currentSemesterLabel = student.gpaTrend[student.gpaTrend.length - 1]?.semester || student.semester;

  return (
    <>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><GraduationCap className="w-5 h-5" /></div>
            <span className={`text-sm font-bold ${student.cgpaChange.startsWith("+") ? "text-green-500" : "text-destructive"}`}>{student.cgpaChange}</span>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Cumulative GPA</p>
          <p className="text-3xl font-bold text-foreground mt-1">{student.cgpa} <span className="text-sm text-muted-foreground font-normal">/ 4.00</span></p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400"><BookOpen className="w-5 h-5" /></div>
            <span className="text-muted-foreground text-sm font-medium">{completionPercent}%</span>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Credits Progress</p>
          <p className="text-3xl font-bold text-foreground mt-1">{student.creditsCompleted} <span className="text-sm text-muted-foreground font-normal">/ {student.totalCredits}</span></p>
          <div className="w-full bg-secondary h-2 rounded-full overflow-hidden mt-3">
            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${completionPercent}%` }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400"><Award className="w-5 h-5" /></div>
            <span className="text-muted-foreground text-sm font-medium">{student.gpaTrend.length} total</span>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Semesters Completed</p>
          <p className="text-3xl font-bold text-foreground mt-1">{student.gpaTrend.length - 1} <span className="text-sm text-muted-foreground font-normal">+ 1 current</span></p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400"><BarChart3 className="w-5 h-5" /></div>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Courses Completed</p>
          <p className="text-3xl font-bold text-foreground mt-1">{totalCoursesCompleted} <span className="text-sm text-muted-foreground font-normal">courses</span></p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Current Semester */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-foreground">Current Semester</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase">{currentSemesterLabel} — In Progress</span>
              </div>
              <span className="text-sm text-muted-foreground font-medium">{student.courses.length} Courses • {student.courses.reduce((s, c) => s + c.credits, 0)} Credits</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Course</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Section</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Credits</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {student.courses.map((course) => (
                    <tr key={course.code} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-primary text-sm">{course.code}</span>
                        <p className="text-sm text-foreground">{course.name}</p>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-foreground">{course.section}</td>
                      <td className="px-6 py-4 text-center text-sm font-medium text-foreground">{course.credits}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                          <Clock className="w-3 h-3" /> In Progress
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Past Semesters */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" /> Past Semester Records
              </h3>
              <button className="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                <Download className="w-4 h-4" /> Export Transcript
              </button>
            </div>
            <div className="space-y-3">
              {pastSemesters.map((sem, idx) => {
                const isExpanded = expandedSemester === sem.semester;
                return (
                  <div key={sem.semester} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                    <button
                      onClick={() => setExpandedSemester(isExpanded ? null : sem.semester)}
                      className="w-full p-5 flex items-center justify-between hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {sem.semester}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-foreground">Semester {sem.semester}</p>
                          <p className="text-xs text-muted-foreground">{sem.courses.length} courses • {sem.credits} credits</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                          <p className="text-sm font-bold text-foreground">GPA: {sem.gpa.toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-20 bg-secondary h-1.5 rounded-full overflow-hidden">
                              <div className="bg-primary h-full rounded-full" style={{ width: `${(sem.gpa / maxGpa) * 100}%` }} />
                            </div>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="border-t border-border">
                        <table className="w-full text-left">
                          <thead className="bg-secondary/50">
                            <tr>
                              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Course</th>
                              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Credits</th>
                              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Grade</th>
                              <th className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {sem.courses.map((course) => {
                              const st = statusConfig[course.status || "completed"];
                              return (
                                <tr key={course.code} className="hover:bg-secondary/30 transition-colors">
                                  <td className="px-6 py-3">
                                    <span className="font-bold text-primary text-sm">{course.code}</span>
                                    <p className="text-sm text-foreground">{course.name}</p>
                                  </td>
                                  <td className="px-6 py-3 text-center text-sm text-foreground">{course.credits}</td>
                                  <td className="px-6 py-3 text-center">
                                    <span className={`text-lg font-black ${gradeColor(course.grade)}`}>{course.grade || "—"}</span>
                                  </td>
                                  <td className="px-6 py-3 text-right">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${st.bg}`}>
                                      <st.icon className="w-3 h-3" /> {st.label}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div className="px-6 py-3 bg-secondary/30 border-t border-border flex justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Semester GPA</span>
                          <span className="text-sm font-bold text-foreground">{sem.gpa.toFixed(2)} / 4.00</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
              {pastSemesters.length === 0 && (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-bold">No past semester records</p>
                  <p className="text-muted-foreground text-sm mt-1">This student is in their first semester.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* GPA Trend Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6">GPA Trend</h3>
            <div className="h-48 flex items-end justify-between px-2 gap-2">
              {student.gpaTrend.map((item, i) => {
                const heightPercent = (item.gpa / maxGpa) * 100;
                const isLatest = i === student.gpaTrend.length - 1;
                return (
                  <div key={item.semester} className="flex-1 relative group" style={{ height: "100%" }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                      className={`absolute bottom-0 w-full rounded-t-lg transition-all cursor-pointer ${isLatest ? "bg-primary" : "bg-primary/40"}`}
                    />
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold bg-foreground text-background px-2 py-1 rounded transition-opacity z-10">
                      {item.gpa.toFixed(2)}
                    </span>
                    <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold text-muted-foreground whitespace-nowrap">
                      {item.semester}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-10 pt-4 border-t border-border flex justify-between text-xs text-muted-foreground">
              <span>Lowest: {Math.min(...student.gpaTrend.map(g => g.gpa)).toFixed(2)}</span>
              <span>Highest: {Math.max(...student.gpaTrend.map(g => g.gpa)).toFixed(2)}</span>
            </div>
          </motion.div>

          {/* Degree Progress */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-4">Degree Completion</h3>
            <div className="relative w-36 h-36 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--primary))" strokeWidth="8"
                  strokeDasharray={`${completionPercent * 2.64} ${264 - completionPercent * 2.64}`}
                  strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-foreground">{completionPercent}%</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase">Complete</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Credits Earned</span>
                <span className="font-bold text-foreground">{student.creditsCompleted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Credits Remaining</span>
                <span className="font-bold text-foreground">{student.totalCredits - student.creditsCompleted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Graduation</span>
                <span className="font-bold text-primary">{completionPercent >= 90 ? "Spring 2024" : completionPercent >= 70 ? "Fall 2024" : "Spring 2025"}</span>
              </div>
            </div>
          </motion.div>

          {/* Academic Standing */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-green-50 dark:bg-green-900/10 p-6 rounded-2xl border border-green-200 dark:border-green-900/30">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h3 className="font-bold text-foreground">Academic Standing</h3>
            </div>
            <p className="text-green-700 dark:text-green-400 font-bold text-lg mb-1">
              {parseFloat(student.cgpa) >= 3.5 ? "Dean's List" : parseFloat(student.cgpa) >= 3.0 ? "Good Standing" : parseFloat(student.cgpa) >= 2.0 ? "Satisfactory" : "Academic Probation"}
            </p>
            <p className="text-sm text-muted-foreground">
              {parseFloat(student.cgpa) >= 3.5
                ? "This student qualifies for the Dean's List distinction."
                : "Maintaining minimum academic requirements."}
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AcademicProgressTab;
