import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Search, Upload, FileText, MoreVertical, ArrowUpCircle,
  Pin, Pencil, Trash2, LayoutGrid, List, SlidersHorizontal,
  ChevronRight, ChevronLeft
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const departmentData: Record<string, {
  name: string;
  courses: { code: string; title: string; notes: number; contributors: number; lastUpdated: string; selected?: boolean }[];
  stats: { totalNotes: string; notesChange: string; contributors: number; contribChange: string; pending: number; pendingChange: string };
}> = {
  cse: {
    name: "CSE",
    stats: { totalNotes: "1,240", notesChange: "+12%", contributors: 45, contribChange: "+5%", pending: 12, pendingChange: "-2%" },
    courses: [
      { code: "CSE 221", title: "Algorithms", notes: 248, contributors: 12, lastUpdated: "2 hrs ago", selected: true },
      { code: "CSE 110", title: "Programming I", notes: 412, contributors: 28, lastUpdated: "Oct 18, 2023" },
      { code: "CSE 225", title: "Data Structures", notes: 186, contributors: 8, lastUpdated: "Oct 15, 2023" },
    ],
  },
  bbs: {
    name: "BBS",
    stats: { totalNotes: "850", notesChange: "+8%", contributors: 32, contribChange: "+3%", pending: 5, pendingChange: "-1%" },
    courses: [
      { code: "BBS 101", title: "Intro to Business", notes: 320, contributors: 18, lastUpdated: "3 hrs ago", selected: true },
      { code: "BBS 202", title: "Marketing Fundamentals", notes: 210, contributors: 14, lastUpdated: "Oct 20, 2023" },
      { code: "BBS 301", title: "Financial Management", notes: 180, contributors: 10, lastUpdated: "Oct 17, 2023" },
    ],
  },
  eee: {
    name: "EEE",
    stats: { totalNotes: "980", notesChange: "+10%", contributors: 38, contribChange: "+4%", pending: 8, pendingChange: "+1%" },
    courses: [
      { code: "EEE 201", title: "Circuit Theory", notes: 290, contributors: 15, lastUpdated: "1 hr ago", selected: true },
      { code: "EEE 305", title: "Signal Processing", notes: 220, contributors: 12, lastUpdated: "Oct 19, 2023" },
      { code: "EEE 401", title: "Power Systems", notes: 170, contributors: 9, lastUpdated: "Oct 16, 2023" },
    ],
  },
  architecture: {
    name: "Architecture",
    stats: { totalNotes: "600", notesChange: "+6%", contributors: 22, contribChange: "+2%", pending: 3, pendingChange: "0%" },
    courses: [
      { code: "ARC 101", title: "Design Studio I", notes: 180, contributors: 10, lastUpdated: "4 hrs ago", selected: true },
      { code: "ARC 201", title: "Building Materials", notes: 150, contributors: 8, lastUpdated: "Oct 21, 2023" },
      { code: "ARC 301", title: "Urban Planning", notes: 120, contributors: 6, lastUpdated: "Oct 14, 2023" },
    ],
  },
};

const notesData = [
  { title: "Dynamic Programming Intro", meta: "Week 04 • 2.4 MB", uploader: "Jack Dorsey", date: "Oct 12, 2023", upvotes: 432, type: "pdf" },
  { title: "Dijkstra's Algorithm Walkthrough", meta: "Midterm Review • 1.1 MB", uploader: "Mina Patel", date: "Oct 14, 2023", upvotes: 215, type: "doc" },
  { title: "Space Complexity Analysis", meta: "Class Lecture Notes • 0.8 MB", uploader: "Rahul Sen", date: "Oct 16, 2023", upvotes: 89, type: "slide" },
];

const typeColors: Record<string, string> = {
  pdf: "bg-orange-100 dark:bg-orange-900/30 text-primary",
  doc: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  slide: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
};

const AdminDepartmentNotes = () => {
  const { deptId } = useParams<{ deptId: string }>();
  const [selectedCourse, setSelectedCourse] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [listViewMode, setListViewMode] = useState<"list" | "grid">("list");
  const [activeDeptFilter, setActiveDeptFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const dept = departmentData[deptId || "cse"] || departmentData.cse;
  const deptFilters = ["All", "CSE", "BBS", "EEE", "ENG"];

  return (
    <div className="flex min-h-screen bg-background admin-theme">
      <AdminSidebar activePage="Notes & Resources" />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Breadcrumbs & Header */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                <Link to="/admin/resources" className="hover:text-primary transition-colors">Portal</Link>
                <ChevronRight className="w-3 h-3" />
                <Link to="/admin/resources" className="hover:text-primary transition-colors">Department</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-foreground">{dept.name} Notes Management</span>
              </div>
              <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                  <h1 className="text-foreground text-3xl font-black tracking-tight">Departmental Notes</h1>
                  <p className="text-muted-foreground mt-1">Manage and moderate high-quality academic resources.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Export Report
                  </Button>
                  <Button className="gap-2 shadow-lg shadow-primary/20">
                    <Upload className="w-4 h-4" />
                    Batch Upload
                  </Button>
                </div>
              </div>
            </div>

            {/* Search & Department Filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-10 bg-secondary border-border rounded-xl"
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-2 whitespace-nowrap">Departments:</span>
                {deptFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveDeptFilter(f.toLowerCase())}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                      activeDeptFilter === f.toLowerCase()
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2 rounded-2xl p-6 bg-card border border-border shadow-sm relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FileText className="w-16 h-16" />
                </div>
                <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Total Notes</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-foreground text-3xl font-bold">{dept.stats.totalNotes}</p>
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">{dept.stats.notesChange}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-2xl p-6 bg-card border border-border shadow-sm relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FileText className="w-16 h-16" />
                </div>
                <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Active Contributors</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-foreground text-3xl font-bold">{dept.stats.contributors}</p>
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">{dept.stats.contribChange}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 rounded-2xl p-6 bg-card border border-border shadow-sm relative overflow-hidden group">
                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <FileText className="w-16 h-16" />
                </div>
                <p className="text-muted-foreground text-sm font-semibold uppercase tracking-wider">Pending Approvals</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-foreground text-3xl font-bold">{dept.stats.pending}</p>
                  <span className="text-rose-600 dark:text-rose-400 text-xs font-bold bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-full">{dept.stats.pendingChange}</span>
                </div>
              </div>
            </div>

            {/* Course Repositories */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-foreground text-lg font-bold">Course Repositories</h3>
                <div className="flex items-center bg-secondary p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-all ${viewMode === "grid" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dept.courses.map((course, idx) => (
                  <div
                    key={course.code}
                    onClick={() => setSelectedCourse(idx)}
                    className={`rounded-2xl p-5 transition-all relative overflow-hidden group cursor-pointer ${
                      selectedCourse === idx
                        ? "bg-card border-2 border-primary shadow-xl shadow-primary/5 hover:scale-[1.01]"
                        : "bg-card border border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                          selectedCourse === idx
                            ? "text-primary bg-primary/10"
                            : "text-muted-foreground bg-secondary"
                        }`}>
                          {course.code}
                        </span>
                        <h4 className="text-lg font-bold text-foreground mt-1">{course.title}</h4>
                      </div>
                      <button className="text-muted-foreground hover:text-primary transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-3 pt-2 border-t border-border/50">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Total Notes</span>
                        <span className="text-foreground font-bold">{course.notes}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Active Contributors</span>
                        <span className="text-foreground font-bold">{course.contributors}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Last Updated</span>
                        <span className="text-foreground font-bold">{course.lastUpdated}</span>
                      </div>
                    </div>
                    <button className={`w-full mt-5 py-2.5 text-xs font-bold rounded-xl transition-all ${
                      selectedCourse === idx
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:opacity-90"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}>
                      Open Repository
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Manage Notes Table */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="flex flex-wrap items-center justify-between p-6 border-b border-border gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-foreground text-lg font-bold">
                    Manage Notes for {dept.courses[selectedCourse]?.code}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-primary font-bold bg-primary/10 px-3 py-1 rounded-full">
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Filter by: All Time</span>
                  </div>
                </div>
                <div className="flex items-center bg-secondary border border-border rounded-lg overflow-hidden p-1">
                  <button
                    onClick={() => setListViewMode("list")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      listViewMode === "list" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    List View
                  </button>
                  <button
                    onClick={() => setListViewMode("grid")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      listViewMode === "grid" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Grid View
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Note Title</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Uploader</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Upvotes</th>
                      <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {notesData.map((note, idx) => (
                      <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[note.type]}`}>
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{note.title}</p>
                              <p className="text-[11px] text-muted-foreground">{note.meta}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary">
                              {note.uploader.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">{note.uploader}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{note.date}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-foreground font-bold">
                            <ArrowUpCircle className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm">{note.upvotes}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                              <Pin className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  Showing 3 of {dept.courses[selectedCourse]?.notes} notes
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1">
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button size="sm" className="gap-1 shadow-lg shadow-primary/20">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDepartmentNotes;
