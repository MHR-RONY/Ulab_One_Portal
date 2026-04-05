import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  UploadCloud, CheckCircle2, FileText, FileEdit, BookOpen,
  Info, History, Pencil, Trash2, Plus, User,
  BarChart3, Download, Upload, ChevronDown,
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// --- Types ---
type DotColor = "green" | "amber";
type CreditColor = "blue" | "green" | "purple";
type SubjectDept = "All Departments" | "Computer Science (CSE)" | "Business School (BBS)" | "Electrical Engineering (EEE)";

type RecentEntry = {
  id: number;
  code: string;
  courseName: string;
  courseType: string;
  section: string;
  schedule: string;
  dotColor: DotColor;
};

type Subject = {
  id: number;
  code: string;
  name: string;
  type: string;
  credits: string;
  creditColor: CreditColor;
  department: string;
};

// --- Static Data ---
const recentEntries: RecentEntry[] = [
  { id: 1, code: "CS202", courseName: "Data Structures", courseType: "MAJOR ELECTIVE", section: "Section B", schedule: "Mon, 10:00 AM", dotColor: "green" },
  { id: 2, code: "ENG101", courseName: "English Composition", courseType: "CORE CURRICULUM", section: "Section A", schedule: "Tue, 02:30 PM", dotColor: "amber" },
];

const subjectsData: Subject[] = [
  { id: 1, code: "CSE301", name: "Database Management Systems", type: "CORE TECHNICAL", credits: "3.0 Credits", creditColor: "blue", department: "CSE" },
  { id: 2, code: "BBS182", name: "Principles of Marketing", type: "GENERAL EDUCATION", credits: "2.0 Credits", creditColor: "green", department: "BBS" },
  { id: 3, code: "EEE284", name: "Microprocessors & Interfacing", type: "MAJOR REQUIREMENT", credits: "4.0 Credits", creditColor: "purple", department: "EEE" },
];

const quickStats = [
  { label: "TOTAL REGISTERED COURSES", value: "248", badge: "+12%" },
  { label: "ACTIVE FACULTY STAFF", value: "62", badge: "Steady" },
  { label: "RUNNING CLASS SECTIONS", value: "1,402", badge: "+5%" },
];

const dataGuidelines = [
  "Ensure Course Codes match the official registry.",
  "Rooms must be formatted as [Building] [Number].",
  "Times should be in 24-hour format or specify AM/PM.",
  "Duplicates will be automatically flagged for review.",
];

const deptFilters: SubjectDept[] = [
  "All Departments",
  "Computer Science (CSE)",
  "Business School (BBS)",
  "Electrical Engineering (EEE)",
];

// --- Sub-components ---
interface FloatingInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (val: string) => void;
}

const FloatingInput = ({ id, label, type = "text", value, onChange }: FloatingInputProps) => (
  <div className="relative">
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={label}
      className="peer w-full px-4 py-3 bg-transparent border border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder-transparent text-sm text-foreground"
    />
    <label
      htmlFor={id}
      className="pointer-events-none absolute left-4 -top-2.5 bg-card px-1 text-xs font-bold text-muted-foreground transition-all
        peer-placeholder-shown:text-sm peer-placeholder-shown:top-3.5
        peer-focus:-top-2.5 peer-focus:text-primary peer-focus:text-xs"
    >
      {label}
    </label>
  </div>
);

const CreditBadge = ({ credits, color }: { credits: string; color: CreditColor }) => {
  const colorMap: Record<CreditColor, string> = {
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400",
    green: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold ${colorMap[color]}`}>
      {credits}
    </span>
  );
};

const ScheduleDot = ({ color }: { color: DotColor }) => {
  const colorMap: Record<DotColor, string> = {
    green: "bg-emerald-500",
    amber: "bg-amber-500",
  };
  return <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${colorMap[color]}`} />;
};

// --- Main Page ---
const AdminScheduleBuilder = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeDept, setActiveDept] = useState<SubjectDept>("All Departments");

  const [form, setForm] = useState({
    courseCode: "",
    courseName: "",
    section: "",
    room: "",
    day: "Monday",
    time: "",
    teacherSearch: "",
  });

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setUploadedFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setUploadedFile(e.target.files[0]);
  };

  const handleFormChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setForm({ courseCode: "", courseName: "", section: "", room: "", day: "Monday", time: "", teacherSearch: "" });
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); };

  const filteredSubjects =
    activeDept === "All Departments"
      ? subjectsData
      : subjectsData.filter((s) => s.department === (activeDept.match(/\((\w+)\)/)?.[1] ?? ""));

  return (
    <div className="flex min-h-screen bg-background admin-theme">
      <div className="hidden lg:block">
        <AdminSidebar activePage="Schedule Builder" />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-20 lg:pb-8 space-y-8">

          {/* Page Intro */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Manage Schedules</h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-base max-w-2xl">
                Upload bulk data via CSV/Excel or manually enter individual course schedules and teacher assignments.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" className="rounded-xl gap-2 text-xs font-bold shadow-sm">
                <Download className="w-4 h-4" /> Export
              </Button>
              <Button className="rounded-xl gap-2 text-xs font-bold bg-foreground text-background hover:bg-foreground/90">
                <Upload className="w-4 h-4" /> Import
              </Button>
            </div>
          </motion.div>

          {/* 1. Bulk Data Upload */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <UploadCloud className="w-5 h-5 text-primary" />
                  1. Bulk Data Upload
                </h3>
                <Badge variant="secondary" className="text-primary bg-primary/10 border-0 text-xs font-semibold">
                  Supports CSV, XLSX
                </Badge>
              </div>
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
                  {/* Drop Zone */}
                  <div
                    className={`md:col-span-3 border-2 border-dashed rounded-2xl p-10 md:p-14 flex flex-col items-center justify-center cursor-pointer transition-all group
                      ${isDragging ? "border-primary/70 bg-primary/5" : "border-border hover:border-primary/40 bg-card"}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className={`w-20 h-20 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-6 transition-transform shadow-inner ${isDragging ? "scale-110" : "group-hover:scale-110"}`}>
                      <UploadCloud className="w-10 h-10" />
                    </div>
                    {uploadedFile ? (
                      <>
                        <h4 className="text-xl font-bold text-foreground">{uploadedFile.name}</h4>
                        <p className="text-muted-foreground mt-2 text-sm">{(uploadedFile.size / 1024).toFixed(1)} KB — click to replace</p>
                      </>
                    ) : (
                      <>
                        <h4 className="text-xl font-bold text-foreground">Drop your master data here</h4>
                        <p className="text-muted-foreground mt-2 text-sm">CSV, XLSX, or JSON files supported (Max 50MB)</p>
                      </>
                    )}
                    <Button
                      type="button"
                      className="mt-8 rounded-xl px-8 py-3 shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      Select Files to Upload
                    </Button>
                    <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls,.json" className="hidden" onChange={handleFileSelect} />
                  </div>

                  {/* Recent Uploads Log */}
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Recent Uploads Log</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">Spring_Schedules_v2.xlsx</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">2 mins ago • 1.2 MB</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-xl border border-border">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">Teacher_Directory.csv</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">1 hour ago • 450 KB</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="link" className="text-primary text-xs font-bold p-0 h-auto w-full justify-center">
                      Clear Upload History
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 2. Manual Entry + Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Manual Entry Form */}
            <div className="lg:col-span-2">
              <Card>
                <div className="p-6 border-b border-border">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <FileEdit className="w-5 h-5 text-primary" />
                    2. Manual Data Entry
                  </h3>
                </div>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      {/* Left column */}
                      <div className="space-y-6">
                        <FloatingInput id="courseCode" label="Course Code" value={form.courseCode} onChange={(v) => handleFormChange("courseCode", v)} />
                        <FloatingInput id="courseName" label="Course Name" value={form.courseName} onChange={(v) => handleFormChange("courseName", v)} />
                        <div className="grid grid-cols-2 gap-4">
                          <FloatingInput id="section" label="Section" value={form.section} onChange={(v) => handleFormChange("section", v)} />
                          <FloatingInput id="room" label="Room" value={form.room} onChange={(v) => handleFormChange("room", v)} />
                        </div>
                      </div>
                      {/* Right column */}
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Schedule Day */}
                          <div className="relative">
                            <select
                              value={form.day}
                              onChange={(e) => handleFormChange("day", e.target.value)}
                              className="w-full px-4 py-3 bg-transparent border border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none text-sm text-foreground"
                            >
                              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((d) => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                            <label className="pointer-events-none absolute left-4 -top-2.5 bg-card px-1 text-xs font-bold text-muted-foreground">
                              Schedule Day
                            </label>
                            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
                          </div>
                          {/* Start Time */}
                          <div className="relative">
                            <input
                              type="time"
                              value={form.time}
                              onChange={(e) => handleFormChange("time", e.target.value)}
                              className="w-full px-4 py-3 bg-transparent border border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-sm text-foreground"
                            />
                            <label className="pointer-events-none absolute left-4 -top-2.5 bg-card px-1 text-xs font-bold text-muted-foreground">
                              Start Time
                            </label>
                          </div>
                        </div>
                        {/* Teacher Assignment */}
                        <div className="p-5 bg-secondary/50 rounded-2xl border border-border space-y-4">
                          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Teacher Assignment</h4>
                          <div className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground shrink-0">
                              <User className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Search Teacher</p>
                              <input
                                type="text"
                                value={form.teacherSearch}
                                onChange={(e) => handleFormChange("teacherSearch", e.target.value)}
                                placeholder="Enter name or ID..."
                                className="w-full border-none p-0 focus:ring-0 bg-transparent text-sm font-semibold placeholder:text-muted-foreground/50 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                        Drafts are automatically saved
                      </p>
                      <div className="flex gap-3">
                        <Button type="button" variant="ghost" className="font-bold text-sm px-6" onClick={handleReset}>
                          Reset Form
                        </Button>
                        <Button type="submit" className="px-8 rounded-xl font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
                          Publish Entry
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar: Quick Stats + Guidelines */}
            <div className="space-y-6">
              <div className="bg-primary rounded-2xl p-6 text-primary-foreground shadow-xl shadow-primary/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">Quick Stats</h3>
                  <BarChart3 className="w-5 h-5 text-white/50" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {quickStats.map((stat) => (
                    <div key={stat.label} className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/20 hover:bg-white/[0.15] transition-colors">
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                      <div className="flex items-end justify-between">
                        <p className="text-4xl font-black">{stat.value}</p>
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{stat.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Card>
                <CardContent className="p-5">
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-foreground text-sm">
                    <Info className="w-4 h-4 text-primary" />
                    Data Guidelines
                  </h3>
                  <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
                    {dataGuidelines.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* 3. Recently Added Entries */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Recently Added Entries
                </h3>
                <Button variant="link" className="text-primary p-0 h-auto font-bold text-sm">
                  View All Records
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/40">
                      <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-6">Code</TableHead>
                      <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Course Name</TableHead>
                      <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Section</TableHead>
                      <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Schedule</TableHead>
                      <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEntries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-secondary/30 transition-colors">
                        <TableCell className="font-bold text-foreground pl-6">{entry.code}</TableCell>
                        <TableCell>
                          <p className="font-semibold text-foreground text-sm">{entry.courseName}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">{entry.courseType}</p>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{entry.section}</TableCell>
                        <TableCell>
                          <span className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ScheduleDot color={entry.dotColor} />
                            {entry.schedule}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-primary">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </motion.div>

          {/* 4. Subject Registration List */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                  <h3 className="font-bold text-base flex items-center gap-2 shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Subject Registration List
                  </h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    {deptFilters.map((dept) => (
                      <button
                        key={dept}
                        onClick={() => setActiveDept(dept)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          activeDept === dept
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
                <Button className="rounded-xl gap-1.5 text-xs font-bold shadow-sm shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Add Subject
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/40">
                      <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-6">Code</TableHead>
                      <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Subject Name</TableHead>
                      <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Credits</TableHead>
                      <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Department</TableHead>
                      <TableHead className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-right pr-6">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects.map((subject) => (
                      <TableRow key={subject.id} className="hover:bg-secondary/30 transition-colors">
                        <TableCell className="font-bold text-foreground pl-6">{subject.code}</TableCell>
                        <TableCell>
                          <p className="font-semibold text-foreground text-sm">{subject.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">{subject.type}</p>
                        </TableCell>
                        <TableCell>
                          <CreditBadge credits={subject.credits} color={subject.creditColor} />
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{subject.department}</TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-primary">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="px-6 py-4 border-t border-border">
                <p className="text-xs text-muted-foreground">Showing {filteredSubjects.length} of 42 subjects</p>
              </div>
            </Card>
          </motion.div>

        </main>
      </div>
    </div>
  );
};

export default AdminScheduleBuilder;

