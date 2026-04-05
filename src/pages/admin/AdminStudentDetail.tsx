import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Mail, Calendar, User, TrendingUp, BookOpen, Clock,
  Pencil, MessageSquare, ShieldCheck, LockOpen, Ban, GraduationCap,
  ChevronRight, Download, AlertTriangle, BarChart3, CalendarCheck,
  CalendarX, Award, CheckCircle, AlertCircle
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useState } from "react";
import AccountSettingsTab from "@/components/admin/AccountSettingsTab";
import AcademicProgressTab from "@/components/admin/AcademicProgressTab";

interface StudentData {
  name: string;
  fullLegalName: string;
  email: string;
  id: string;
  department: string;
  departmentFull: string;
  semester: string;
  status: string;
  avatar: string;
  phone: string;
  address: string;
  dob: string;
  cgpa: string;
  cgpaChange: string;
  creditsCompleted: number;
  totalCredits: number;
  advisor: string;
  advisorTitle: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  admissionDate: string;
  bloodGroup: string;
  attendance: number;
  totalClasses: number;
  present: number;
  absent: number;
  lateArrival: number;
  courses: { code: string; name: string; section: string; credits: number }[];
  gpaTrend: { semester: string; gpa: number }[];
}

const allStudents: Record<string, StudentData> = {
  "211014022": {
    name: "Rahat Chowdhury", fullLegalName: "Rahat Bin Kamal Chowdhury",
    email: "rahat.chowdhury@ulab.edu.bd", id: "211014022",
    department: "CSE", departmentFull: "Department of Computer Science & Engineering",
    semester: "Fall 2023", status: "Active", avatar: "RC",
    phone: "+880 1712-345678", address: "House 12, Road 5, Dhanmondi, Dhaka-1205",
    dob: "15 March, 2001", cgpa: "3.72", cgpaChange: "+0.08",
    creditsCompleted: 96, totalCredits: 136,
    advisor: "Dr. Mahfuzur Rahman", advisorTitle: "Professor, CSE",
    guardianName: "Kamal Chowdhury", guardianPhone: "+880 1811-223344", guardianRelation: "Father",
    admissionDate: "Fall 2021", bloodGroup: "O+",
    attendance: 89, totalClasses: 156, present: 139, absent: 12, lateArrival: 5,
    courses: [
      { code: "CSE370", name: "Database Systems", section: "01", credits: 3 },
      { code: "CSE331", name: "Data Structures", section: "02", credits: 3 },
      { code: "CSE341", name: "Algorithms", section: "01", credits: 3 },
      { code: "CSE421", name: "Computer Networks", section: "03", credits: 3 },
    ],
    gpaTrend: [
      { semester: "F21", gpa: 3.40 }, { semester: "S22", gpa: 3.52 },
      { semester: "F22", gpa: 3.60 }, { semester: "S23", gpa: 3.65 },
      { semester: "F23", gpa: 3.72 },
    ],
  },
  "203011045": {
    name: "Sumaiya Akhter", fullLegalName: "Sumaiya Akhter Begum",
    email: "sumaiya.a@ulab.edu.bd", id: "203011045",
    department: "BBA", departmentFull: "Department of Business Administration",
    semester: "Spring 2021", status: "Suspended", avatar: "SA",
    phone: "+880 1698-765432", address: "Apt 4B, Mirpur DOHS, Dhaka-1216",
    dob: "22 July, 2000", cgpa: "2.95", cgpaChange: "-0.15",
    creditsCompleted: 110, totalCredits: 130,
    advisor: "Prof. Nasreen Begum", advisorTitle: "Associate Professor, BBA",
    guardianName: "Akhter Hossain", guardianPhone: "+880 1912-556677", guardianRelation: "Father",
    admissionDate: "Spring 2020", bloodGroup: "A+",
    attendance: 62, totalClasses: 140, present: 87, absent: 45, lateArrival: 8,
    courses: [
      { code: "BBA301", name: "Marketing Management", section: "01", credits: 3 },
      { code: "BBA310", name: "Financial Accounting", section: "02", credits: 3 },
      { code: "BBA315", name: "Business Ethics", section: "01", credits: 3 },
    ],
    gpaTrend: [
      { semester: "S20", gpa: 3.20 }, { semester: "F20", gpa: 3.10 },
      { semester: "S21", gpa: 2.95 },
    ],
  },
  "222015099": {
    name: "Zubair Hassan", fullLegalName: "Zubair Bin Hassan Ahmed",
    email: "zubair.hassan@ulab.edu.bd", id: "222015099",
    department: "MSJ", departmentFull: "Department of Media Studies & Journalism",
    semester: "Summer 2022", status: "Active", avatar: "ZH",
    phone: "+880 1756-112233", address: "Uttara Sector 7, Dhaka-1230",
    dob: "5 November, 2002", cgpa: "3.55", cgpaChange: "+0.10",
    creditsCompleted: 60, totalCredits: 130,
    advisor: "Dr. Anisur Rahman", advisorTitle: "Assistant Professor, MSJ",
    guardianName: "Jamal Hassan", guardianPhone: "+880 1856-998877", guardianRelation: "Father",
    admissionDate: "Summer 2022", bloodGroup: "B+",
    attendance: 92, totalClasses: 120, present: 110, absent: 7, lateArrival: 3,
    courses: [
      { code: "MSJ201", name: "Journalism Fundamentals", section: "01", credits: 3 },
      { code: "MSJ210", name: "Media Law", section: "01", credits: 3 },
      { code: "MSJ220", name: "Digital Media", section: "02", credits: 3 },
    ],
    gpaTrend: [
      { semester: "Su22", gpa: 3.30 }, { semester: "F22", gpa: 3.45 },
      { semester: "S23", gpa: 3.55 },
    ],
  },
  "193014112": {
    name: "Faria Tasnim", fullLegalName: "Faria Tasnim Ahmed",
    email: "faria.tasnim@ulab.edu.bd", id: "193014112",
    department: "English", departmentFull: "Department of English & Humanities",
    semester: "Fall 2019", status: "Active", avatar: "FT",
    phone: "+880 1634-445566", address: "Bashundhara R/A, Dhaka-1229",
    dob: "10 January, 1999", cgpa: "3.88", cgpaChange: "+0.05",
    creditsCompleted: 126, totalCredits: 132,
    advisor: "Dr. Shamsad Mortuza", advisorTitle: "Professor, English",
    guardianName: "Tasnim Ahmed", guardianPhone: "+880 1734-667788", guardianRelation: "Father",
    admissionDate: "Fall 2019", bloodGroup: "AB+",
    attendance: 95, totalClasses: 180, present: 171, absent: 6, lateArrival: 3,
    courses: [
      { code: "ENG401", name: "Postcolonial Literature", section: "01", credits: 3 },
      { code: "ENG410", name: "Sociolinguistics", section: "01", credits: 3 },
      { code: "ENG415", name: "Creative Writing", section: "02", credits: 3 },
      { code: "ENG420", name: "Research Methodology", section: "01", credits: 3 },
    ],
    gpaTrend: [
      { semester: "F19", gpa: 3.60 }, { semester: "S20", gpa: 3.70 },
      { semester: "F20", gpa: 3.75 }, { semester: "S21", gpa: 3.80 },
      { semester: "F21", gpa: 3.85 }, { semester: "S22", gpa: 3.88 },
    ],
  },
  "211014088": {
    name: "Mehedi Hasan", fullLegalName: "Mehedi Hasan Mahmud",
    email: "mehedi.hasan@ulab.edu.bd", id: "211014088",
    department: "CSE", departmentFull: "Department of Computer Science & Engineering",
    semester: "Fall 2023", status: "Active", avatar: "MH",
    phone: "+880 1778-334455", address: "Mohammadpur, Dhaka-1207",
    dob: "28 September, 2001", cgpa: "3.45", cgpaChange: "+0.12",
    creditsCompleted: 90, totalCredits: 136,
    advisor: "Dr. Mahfuzur Rahman", advisorTitle: "Professor, CSE",
    guardianName: "Hasan Mahmud", guardianPhone: "+880 1878-112200", guardianRelation: "Father",
    admissionDate: "Fall 2021", bloodGroup: "O-",
    attendance: 85, totalClasses: 150, present: 128, absent: 16, lateArrival: 6,
    courses: [
      { code: "CSE370", name: "Database Systems", section: "02", credits: 3 },
      { code: "CSE331", name: "Data Structures", section: "01", credits: 3 },
      { code: "CSE350", name: "Software Engineering", section: "01", credits: 3 },
    ],
    gpaTrend: [
      { semester: "F21", gpa: 3.10 }, { semester: "S22", gpa: 3.20 },
      { semester: "F22", gpa: 3.30 }, { semester: "S23", gpa: 3.33 },
      { semester: "F23", gpa: 3.45 },
    ],
  },
  "203011078": {
    name: "Nusrat Jahan", fullLegalName: "Nusrat Jahan Ara",
    email: "nusrat.j@ulab.edu.bd", id: "203011078",
    department: "BBA", departmentFull: "Department of Business Administration",
    semester: "Spring 2022", status: "Active", avatar: "NJ",
    phone: "+880 1645-778899", address: "Gulshan 2, Dhaka-1212",
    dob: "3 May, 2001", cgpa: "3.60", cgpaChange: "+0.10",
    creditsCompleted: 100, totalCredits: 130,
    advisor: "Prof. Nasreen Begum", advisorTitle: "Associate Professor, BBA",
    guardianName: "Jahan Ara", guardianPhone: "+880 1945-223311", guardianRelation: "Mother",
    admissionDate: "Spring 2020", bloodGroup: "A-",
    attendance: 91, totalClasses: 145, present: 132, absent: 9, lateArrival: 4,
    courses: [
      { code: "BBA301", name: "Marketing Management", section: "02", credits: 3 },
      { code: "BBA330", name: "Human Resource Management", section: "01", credits: 3 },
      { code: "BBA340", name: "Strategic Management", section: "01", credits: 3 },
    ],
    gpaTrend: [
      { semester: "S20", gpa: 3.30 }, { semester: "F20", gpa: 3.40 },
      { semester: "S21", gpa: 3.50 }, { semester: "F21", gpa: 3.55 },
      { semester: "S22", gpa: 3.60 },
    ],
  },
  "213016055": {
    name: "Tanvir Ahmed", fullLegalName: "Tanvir Bin Ahmed Chowdhury",
    email: "tanvir.ahmed@ulab.edu.bd", id: "213016055",
    department: "Bangla", departmentFull: "Department of Bangla Language & Literature",
    semester: "Fall 2023", status: "Active", avatar: "TA",
    phone: "+880 1723-556677", address: "Banani, Dhaka-1213",
    dob: "17 August, 2002", cgpa: "3.50", cgpaChange: "+0.15",
    creditsCompleted: 45, totalCredits: 130,
    advisor: "Dr. Aminul Islam", advisorTitle: "Associate Professor, Bangla",
    guardianName: "Ahmed Karim", guardianPhone: "+880 1823-998800", guardianRelation: "Father",
    admissionDate: "Fall 2023", bloodGroup: "B-",
    attendance: 88, totalClasses: 80, present: 70, absent: 7, lateArrival: 3,
    courses: [
      { code: "BAN101", name: "Bangla Sahityer Itihas", section: "01", credits: 3 },
      { code: "BAN110", name: "Bhasha Biggan", section: "01", credits: 3 },
      { code: "BAN120", name: "Madhyajuger Bangla Sahitya", section: "02", credits: 3 },
    ],
    gpaTrend: [
      { semester: "F23", gpa: 3.50 },
    ],
  },
  "203016032": {
    name: "Mithila Rahman", fullLegalName: "Mithila Rahman Uddin",
    email: "mithila.r@ulab.edu.bd", id: "203016032",
    department: "Bangla", departmentFull: "Department of Bangla Language & Literature",
    semester: "Spring 2021", status: "Active", avatar: "MR",
    phone: "+880 1667-889900", address: "Khilgaon, Dhaka-1219",
    dob: "25 December, 2000", cgpa: "3.65", cgpaChange: "+0.05",
    creditsCompleted: 105, totalCredits: 130,
    advisor: "Dr. Aminul Islam", advisorTitle: "Associate Professor, Bangla",
    guardianName: "Rahman Uddin", guardianPhone: "+880 1967-443322", guardianRelation: "Father",
    admissionDate: "Spring 2021", bloodGroup: "AB-",
    attendance: 93, totalClasses: 160, present: 149, absent: 8, lateArrival: 3,
    courses: [
      { code: "BAN301", name: "Adhunik Bangla Kabita", section: "01", credits: 3 },
      { code: "BAN310", name: "Rabindra Sahitya", section: "01", credits: 3 },
      { code: "BAN320", name: "Nazrul Sahitya", section: "02", credits: 3 },
    ],
    gpaTrend: [
      { semester: "S21", gpa: 3.40 }, { semester: "F21", gpa: 3.50 },
      { semester: "S22", gpa: 3.55 }, { semester: "F22", gpa: 3.60 },
      { semester: "S23", gpa: 3.65 },
    ],
  },
};

const tabs = [
  { id: "overview", label: "Overview", icon: User },
  { id: "academic", label: "Academic Progress", icon: TrendingUp },
  { id: "attendance", label: "Attendance", icon: Calendar },
  { id: "settings", label: "Account Settings", icon: Pencil },
];

// Heatmap data generator
const generateHeatmap = () => {
  const levels = ["none", "low", "med", "full", "absent", "warning"] as const;
  const weights = [0.1, 0.1, 0.15, 0.5, 0.08, 0.07];
  const rows = 4;
  const cols = 7;
  const result: string[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: string[] = [];
    for (let c = 0; c < cols; c++) {
      if (c >= 5) { row.push("none"); continue; }
      const rand = Math.random();
      let cumulative = 0;
      let picked = "full";
      for (let i = 0; i < weights.length; i++) {
        cumulative += weights[i];
        if (rand < cumulative) { picked = levels[i]; break; }
      }
      row.push(picked);
    }
    result.push(row);
  }
  return result;
};

const heatmapColors: Record<string, string> = {
  none: "bg-muted",
  low: "bg-primary/20",
  med: "bg-primary/60",
  full: "bg-primary",
  absent: "bg-destructive/60",
  warning: "bg-amber-400/80",
};

const getAttendanceStatus = (percent: number) => {
  if (percent >= 90) return { label: "Above Threshold", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
  if (percent >= 80) return { label: "On Track", color: "bg-primary/10 text-primary" };
  if (percent >= 75) return { label: "Near Threshold", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" };
  return { label: "Below Threshold", color: "bg-destructive/10 text-destructive" };
};

const getBarColor = (percent: number) => {
  if (percent >= 90) return "bg-green-500";
  if (percent >= 80) return "bg-primary";
  if (percent >= 75) return "bg-amber-500";
  return "bg-destructive";
};

const AttendanceTab = ({ student }: { student: StudentData }) => {
  const [heatmap] = useState(generateHeatmap);
  const attendancePercent = Math.round((student.present / student.totalClasses) * 100 * 10) / 10;
  const exemptions = Math.max(0, student.lateArrival - 2);

  const courseAttendance = student.courses.map((c, i) => {
    const total = Math.round(student.totalClasses / student.courses.length);
    const attended = Math.round(total * (0.7 + Math.random() * 0.28));
    const percent = Math.round((attended / total) * 100);
    return { ...c, attended, total, percent };
  });

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-green-500 text-sm font-bold">+2.4%</span>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Overall Attendance</p>
          <p className="text-3xl font-bold text-foreground mt-1">{attendancePercent}%</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <span className="text-muted-foreground text-sm font-medium">Total: {student.totalClasses}</span>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Sessions Attended</p>
          <p className="text-3xl font-bold text-foreground mt-1">{student.present}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-destructive/10 rounded-lg text-destructive">
              <CalendarX className="w-5 h-5" />
            </div>
            <span className="text-destructive text-sm font-bold">-1.2%</span>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Absent Count</p>
          <p className="text-3xl font-bold text-foreground mt-1">{student.absent}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-muted-foreground text-sm font-medium">{student.lateArrival > 3 ? "3 Pending" : "1 Pending"}</span>
          </div>
          <p className="text-muted-foreground text-sm font-medium">Approved Exemptions</p>
          <p className="text-3xl font-bold text-foreground mt-1">{exemptions}</p>
        </motion.div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Subject-wise Breakdown */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <h3 className="text-lg font-bold text-foreground">Subject-Wise Breakdown</h3>
              <button className="text-primary text-sm font-bold hover:underline">View History</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Course Name</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Sessions</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Percentage</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {courseAttendance.map((course) => {
                    const status = getAttendanceStatus(course.percent);
                    const barColor = getBarColor(course.percent);
                    return (
                      <tr key={course.code} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground">{course.name}</span>
                            <span className="text-xs text-muted-foreground">{course.code} | Sec {course.section}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-foreground">{course.attended}/{course.total}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-16 bg-secondary h-1.5 rounded-full overflow-hidden">
                              <div className={`${barColor} h-full rounded-full`} style={{ width: `${course.percent}%` }} />
                            </div>
                            <span className="text-sm font-bold text-foreground">{course.percent}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Manage Exemptions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-primary/5 dark:bg-primary/10 p-8 rounded-2xl border border-primary/20 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-foreground mb-2">Manage Attendance Exemptions</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Logged absences due to medical or official institutional reasons can be cleared by submitting official documentation here.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-6 py-3 rounded-xl bg-card text-primary border border-primary/20 font-bold shadow-sm hover:bg-secondary transition-all">
                View Past Requests
              </button>
              <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                New Exemption Request
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-8">
          {/* Heatmap */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground">Attendance Heatmap</h3>
              <select className="bg-transparent border-none text-xs font-bold text-muted-foreground focus:ring-0 cursor-pointer">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
              {[
                { label: "None", color: "bg-muted" },
                { label: "Low", color: "bg-primary/20" },
                { label: "Med", color: "bg-primary/60" },
                { label: "Full", color: "bg-primary" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className={`size-3 rounded ${l.color}`} />
                  <span>{l.label}</span>
                </div>
              ))}
            </div>

            {/* Day Labels */}
            <div className="grid grid-cols-7 gap-1.5 mb-1">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i} className="text-[10px] text-center text-muted-foreground font-bold py-1">{d}</div>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {heatmap.flat().map((level, i) => (
                <div key={i} className={`aspect-square rounded ${heatmapColors[level]}`} />
              ))}
            </div>

            {/* Patterns & Insights */}
            <div className="mt-8 pt-6 border-t border-border">
              <h4 className="text-sm font-bold text-foreground mb-4">Patterns & Insights</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">Consistent attendance on Monday and Friday morning sessions.</p>
                </div>
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">Occasional absences noted on Tuesday afternoon (Lab sessions).</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card p-6 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-bold text-foreground mb-6">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              {[
                { icon: Mail, label: "Notify Student" },
                { icon: User, label: "Contact Parent/Guardian" },
                { icon: Download, label: "Generate Warning Letter" },
              ].map((action) => (
                <button key={action.label} className="w-full flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-primary/10 hover:text-primary transition-all group">
                  <div className="flex items-center gap-3">
                    <action.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

const AdminStudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const student = studentId ? allStudents[studentId] : null;

  if (!student) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <div className="hidden md:block">
          <AdminSidebar activePage="Students" />
        </div>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeader />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="text-2xl font-extrabold text-foreground mb-2">Student Not Found</h2>
              <p className="text-muted-foreground mb-6">The student ID doesn't exist in our records.</p>
              <button
                onClick={() => navigate("/admin/students")}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                Back to Directory
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const maxGpa = 4.0;

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card p-5 rounded-xl border border-border">
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Current CGPA</p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold text-primary">{student.cgpa}</h3>
              <span className={`text-xs font-medium pb-1 flex items-center ${student.cgpaChange.startsWith("+") ? "text-green-500" : "text-destructive"}`}>
                <TrendingUp className="w-3 h-3 mr-0.5" />{student.cgpaChange}
              </span>
            </div>
          </div>
          <div className="bg-card p-5 rounded-xl border border-border">
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Credits Completed</p>
            <h3 className="text-2xl font-bold text-foreground">{student.creditsCompleted} / {student.totalCredits}</h3>
          </div>
          <div className="bg-card p-5 rounded-xl border border-border">
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Average Attendance</p>
            <h3 className="text-2xl font-bold text-foreground">{student.attendance}%</h3>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h3 className="font-bold text-lg text-foreground">Current Semester Enrolled Courses</h3>
            <span className="text-sm text-muted-foreground font-medium">{student.semester}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Course Code</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Course Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Section</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {student.courses.map((course) => (
                  <tr key={course.code} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary text-sm">{course.code}</td>
                    <td className="px-6 py-4 text-sm text-foreground">{course.name}</td>
                    <td className="px-6 py-4 text-sm text-center text-foreground">{course.section}</td>
                    <td className="px-6 py-4 text-sm text-right text-foreground">{course.credits.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-card p-6 rounded-xl border border-border">
          <h3 className="font-bold text-lg text-foreground mb-6">GPA Trend Visualization</h3>
          <div className="h-48 flex items-end justify-between px-4 gap-3">
            {student.gpaTrend.map((item, i) => {
              const heightPercent = (item.gpa / maxGpa) * 100;
              const opacity = 0.2 + (i / (student.gpaTrend.length - 1 || 1)) * 0.8;
              return (
                <div key={item.semester} className="flex-1 relative group" style={{ height: "100%" }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: "easeOut" }}
                    className="absolute bottom-0 w-full rounded-t-lg bg-primary transition-all hover:brightness-110 cursor-pointer"
                    style={{ opacity }}
                  />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold bg-foreground text-background px-2 py-1 rounded transition-opacity z-10">
                    {item.gpa.toFixed(2)}
                  </span>
                  <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase font-bold text-muted-foreground">
                    {item.semester}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-card p-6 rounded-xl border border-border">
          <h3 className="font-bold text-lg text-foreground mb-6">Personal Details</h3>
          <div className="space-y-4">
            {[
              { label: "Full Legal Name", value: student.fullLegalName },
              { label: "Date of Birth", value: student.dob },
              { label: "Mobile Number", value: student.phone },
              { label: "Guardian Contact", value: `${student.guardianPhone} (${student.guardianRelation})` },
              { label: "Address", value: student.address },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <p className="text-foreground font-medium text-sm mt-0.5 leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-card p-6 rounded-xl border border-border">
          <h3 className="font-bold text-lg text-foreground mb-6">Administrative Actions</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary transition-colors">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="w-4 h-4 text-muted-foreground" /> Reset Credentials
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary transition-colors">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <LockOpen className="w-4 h-4 text-muted-foreground" /> Unlock Account
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center justify-between p-3 rounded-lg border border-destructive/20 hover:bg-destructive/5 transition-colors">
              <span className="flex items-center gap-2 text-sm font-bold text-destructive">
                <Ban className="w-4 h-4" /> Change Academic Status
              </span>
              <ChevronRight className="w-4 h-4 text-destructive/50" />
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
          className="bg-primary/5 p-6 rounded-xl border border-primary/20">
          <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" /> Academic Advisor
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {student.advisor.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">{student.advisor}</p>
              <p className="text-xs text-muted-foreground">{student.advisorTitle}</p>
            </div>
          </div>
          <button className="w-full mt-4 py-2 text-xs font-bold text-primary bg-card rounded-lg shadow-sm border border-primary/20 hover:bg-primary/5 transition-colors">
            Change Advisor
          </button>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background admin-theme">
      <div className="hidden md:block">
        <AdminSidebar activePage="Students" />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto w-full px-4 md:px-10 py-8">

            <button
              onClick={() => navigate("/admin/students")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-semibold mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Student Directory
            </button>

            {/* Student Header Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-xl shadow-sm border border-border p-6 mb-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-extrabold text-2xl border-4 border-secondary shadow-lg flex-shrink-0">
                      {student.avatar}
                    </div>
                    <span className={`absolute -bottom-1 -right-1 border-4 border-card rounded-full w-6 h-6 ${student.status === "Active" ? "bg-green-500" : "bg-yellow-500"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="text-2xl font-bold text-foreground">{student.name}</h1>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${student.status === "Active" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                        {student.status === "Active" ? "Active Student" : "Suspended"}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-base mt-1">ID: {student.id} • {student.departmentFull}</p>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" /> Enrolled: {student.admissionDate}
                      </span>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" /> {student.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                  {activeTab === "attendance" ? (
                    <>
                      <button className="flex-1 md:flex-none flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-secondary transition-colors">
                        <Download className="w-4 h-4" /> Export Report
                      </button>
                      <button className="flex-1 md:flex-none flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                        + Log Exemption
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-secondary transition-colors">
                        Edit Records
                      </button>
                      <button className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                        Message Student
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border mb-8 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary font-bold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && renderOverviewTab()}
            {activeTab === "attendance" && <AttendanceTab student={student} />}
            {activeTab === "academic" && <AcademicProgressTab student={student} />}
            {activeTab === "settings" && <AccountSettingsTab student={student} />}

            {/* Attendance History Summary (always visible) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="mt-8 bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="font-bold text-lg text-foreground">Attendance History Summary</h3>
                <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                  Download Full Report <Download className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border">
                <div className="p-6 text-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Total Classes</p>
                  <p className="text-3xl font-bold text-foreground">{student.totalClasses}</p>
                </div>
                <div className="p-6 text-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Present</p>
                  <p className="text-3xl font-bold text-green-500">{student.present}</p>
                </div>
                <div className="p-6 text-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Absent</p>
                  <p className="text-3xl font-bold text-destructive">{student.absent}</p>
                </div>
                <div className="p-6 text-center">
                  <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Late Arrival</p>
                  <p className="text-3xl font-bold text-yellow-500">{student.lateArrival}</p>
                </div>
              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminStudentDetail;
