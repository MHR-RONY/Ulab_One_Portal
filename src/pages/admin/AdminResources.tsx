import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Computer, Briefcase, Zap, Landmark, Upload, Plus, FileText, CheckCircle, XCircle, Eye, PlusCircle } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const departments = [
  { name: "CSE", icon: Computer, iconBg: "bg-blue-50 dark:bg-blue-900/20", iconColor: "text-blue-500", recent: 12, courses: 45, notes: "1,240" },
  { name: "BBS", icon: Briefcase, iconBg: "bg-orange-50 dark:bg-orange-900/20", iconColor: "text-orange-500", recent: 5, courses: 38, notes: "850" },
  { name: "EEE", icon: Zap, iconBg: "bg-amber-50 dark:bg-amber-900/20", iconColor: "text-amber-500", recent: 8, courses: 42, notes: "980" },
  { name: "Architecture", icon: Landmark, iconBg: "bg-purple-50 dark:bg-purple-900/20", iconColor: "text-purple-500", recent: 3, courses: 30, notes: "600" },
];

const pendingApprovals = [
  { title: "Data Structures Mid-Term Prep", meta: "CSE 201 • PDF • 4.2 MB", uploader: "Tanvir Ahmed", dept: "CSE", deptColor: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" },
  { title: "Macroeconomics Case Study", meta: "BBS 102 • DOCX • 1.1 MB", uploader: "Sarah Kabir", dept: "BBS", deptColor: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400" },
  { title: "Circuit Theory Lab Notes", meta: "EEE 305 • PDF • 8.7 MB", uploader: "Rafiqul Islam", dept: "EEE", deptColor: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" },
];

const deptRouteMap: Record<string, string> = {
  CSE: "cse",
  BBS: "bbs",
  EEE: "eee",
  Architecture: "architecture",
};

const AdminResources = () => {
  const navigate = useNavigate();
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="flex min-h-screen bg-background admin-theme">
      <AdminSidebar activePage="Notes & Resources" />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Page Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">Departmental Overview</h2>
              <p className="text-muted-foreground text-sm">Central repository management for academic resources.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Upload className="w-4 h-4" />
                Bulk Upload
              </Button>
              <Button className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Add Department
              </Button>
            </div>
          </div>

          {/* Department Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {departments.map((dept) => (
              <div
                key={dept.name}
                onClick={() => navigate(`/admin/resources/${deptRouteMap[dept.name]}`)}
                className="bg-card p-5 rounded-xl border border-border/50 hover:border-primary/20 transition-all shadow-sm hover:shadow-md group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 ${dept.iconBg} ${dept.iconColor} rounded-xl group-hover:scale-110 transition-transform`}>
                    <dept.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full uppercase tracking-tighter">
                    +{dept.recent} Recent
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-4 text-foreground">{dept.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total Courses</span>
                    <span className="font-bold text-foreground">{dept.courses}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Total Notes</span>
                    <span className="font-bold text-foreground">{dept.notes}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Create Repository Card */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm mb-8">
            <div className="p-6 border-b border-border/50 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg text-foreground">Create Repository Card</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Course Name</label>
                  <Input placeholder="e.g. Data Structures" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Course Code</label>
                  <Input placeholder="e.g. CSE 201" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Department</label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cse">CSE</SelectItem>
                      <SelectItem value="bbs">BBS</SelectItem>
                      <SelectItem value="eee">EEE</SelectItem>
                      <SelectItem value="arc">Architecture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3 space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Description</label>
                  <Textarea
                    placeholder="Briefly describe the course content for this repository..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <Button className="gap-2 shadow-lg shadow-primary/20">
                    <PlusCircle className="w-4 h-4" />
                    Create Repository Card
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2 text-foreground">
                <FileText className="w-5 h-5 text-primary" />
                Pending Approvals
              </h3>
              <button className="text-xs font-bold text-primary hover:underline">View All</button>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Note Title</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Uploader</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Department</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingApprovals.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-secondary/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-orange-400" />
                        <div>
                          <p className="text-sm font-bold text-foreground">{item.title}</p>
                          <p className="text-[10px] text-muted-foreground">{item.meta}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          {item.uploader.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-foreground">{item.uploader}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-lg font-bold ${item.deptColor}`}>
                        {item.dept}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        Pending
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded-lg transition-colors">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors">
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 hover:bg-secondary text-muted-foreground rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-4 bg-secondary/30 border-t border-border/50 flex justify-center">
              <button className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">Show More Results</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminResources;
