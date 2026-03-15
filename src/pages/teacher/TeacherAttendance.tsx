import { useState } from "react";
import { ChevronLeft, ChevronRight, Search, CheckCheck, Save, Users, UserX, TrendingUp, CalendarDays, ArrowLeft, Calendar, Check, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import TeacherBottomNav from "@/components/teacher/TeacherBottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const dates = ["Oct 18", "Oct 20", "Oct 22", "Oct 24", "Oct 26"];

const studentsData = [
  { name: "Abrar Fahim", id: "201014032", initials: "AF", color: "bg-emerald-500" },
  { name: "Sayeeda Khan", id: "201014045", initials: "SK", color: "bg-blue-500" },
  { name: "Tanvir Hossain", id: "201014088", initials: "TH", color: "bg-amber-500" },
  { name: "Zakir Ahmed", id: "201014112", initials: "ZA", color: "bg-purple-500" },
  { name: "Maheen Jamil", id: "201014156", initials: "MJ", color: "bg-rose-500" },
  { name: "Adnan Sami", id: "201014199", initials: "AS", color: "bg-slate-400" },
  { name: "Nabila Sultana", id: "212014056", initials: "NS", color: "bg-cyan-500" },
  { name: "Rifat Jahan", id: "212014105", initials: "RJ", color: "bg-indigo-500" },
];

const desktopStudents = [
  { name: "Abir Hasan", id: "212014023", initials: "AH", color: "bg-emerald-500", history: [true, true, false, null, null] as (boolean | null)[], total: 92 },
  { name: "Nabila Sultana", id: "212014056", initials: "NS", color: "bg-blue-500", history: [true, true, true, null, null] as (boolean | null)[], total: 100 },
  { name: "Samiul Karim", id: "212014088", initials: "SK", color: "bg-purple-500", history: [false, true, true, null, null] as (boolean | null)[], total: 75 },
  { name: "Zahra Maheen", id: "212014092", initials: "ZM", color: "bg-amber-500", history: [true, true, true, null, null] as (boolean | null)[], total: 98 },
  { name: "Rifat Jahan", id: "212014105", initials: "RJ", color: "bg-rose-500", history: [true, false, false, null, null] as (boolean | null)[], total: 64 },
  { name: "Tanvir Ahmed", id: "212014110", initials: "TA", color: "bg-cyan-500", history: [true, true, true, null, null] as (boolean | null)[], total: 96 },
  { name: "Fatima Begum", id: "212014118", initials: "FB", color: "bg-indigo-500", history: [true, false, true, null, null] as (boolean | null)[], total: 82 },
  { name: "Rakib Islam", id: "212014125", initials: "RI", color: "bg-teal-500", history: [false, true, true, null, null] as (boolean | null)[], total: 71 },
];

const activeDateIndex = 3;
const totalStudents = 42;

const TeacherAttendance = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [attendance, setAttendance] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    [...studentsData, ...desktopStudents].forEach(s => { init[s.id] = false; });
    return init;
  });

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = totalStudents - presentCount;

  const toggleAttendance = (id: string) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const markAllPresent = () => {
    const all: Record<string, boolean> = {};
    [...studentsData, ...desktopStudents].forEach(s => { all[s.id] = true; });
    setAttendance(all);
  };

  // ─── MOBILE VERSION ───
  if (isMobile) {
    const filtered = studentsData.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search)
    );

    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-card border-b border-border">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground p-1 rounded-full">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base font-bold text-foreground leading-tight">Data Structures (Section A)</h1>
                <p className="text-xs font-semibold text-primary">ULAB One Portal</p>
              </div>
            </div>
            <button className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Calendar className="w-5 h-5" />
            </button>
          </div>

          {/* Date bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-secondary/50 border-t border-border/50">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">Thursday, Oct 24, 2024</span>
            </div>
            <Button variant="outline" size="sm" className="text-xs h-8">Change Date</Button>
          </div>
        </div>

        {/* Students header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Students ({totalStudents})</h2>
          <Button variant="outline" size="sm" onClick={markAllPresent} className="gap-1.5 text-xs h-8">
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Present
          </Button>
        </div>

        {/* Student List */}
        <div className="flex-1 px-4 pb-32 space-y-3">
          {filtered.map((student, idx) => {
            const isChecked = attendance[student.id];
            return (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <button
                  onClick={() => toggleAttendance(student.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                    isChecked
                      ? "bg-card border-primary/20 shadow-sm"
                      : "bg-card border-border"
                  }`}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={`${student.color} text-white text-sm font-bold`}>
                      {student.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-foreground text-sm">{student.name}</p>
                    <p className="text-xs text-muted-foreground">ID: {student.id}</p>
                  </div>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    isChecked
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/30 bg-transparent"
                  }`}>
                    {isChecked && <Check className="w-4 h-4" />}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Fixed Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 py-4 z-30 flex items-center gap-4">
          <div className="flex-shrink-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Attendance Status</p>
            <p className="text-foreground">
              <span className="text-2xl font-bold text-primary">{presentCount}</span>
              <span className="text-sm text-muted-foreground"> / {totalStudents}</span>
            </p>
            <p className="text-xs text-muted-foreground">present</p>
          </div>
          <Button className="flex-1 h-12 rounded-full gap-2 text-base font-semibold">
            <Upload className="w-5 h-5" /> Save Attendance
          </Button>
        </div>
      </div>
    );
  }

  // ─── DESKTOP VERSION ───
  const filteredDesktop = desktopStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search)
  );
  const perPage = 5;
  const totalPages = Math.ceil(filteredDesktop.length / perPage);
  const paginated = filteredDesktop.slice((currentPage - 1) * perPage, currentPage * perPage);

  const getStatusIcon = (val: boolean | null) => {
    if (val === true) return <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-xs font-bold">✓</div>;
    if (val === false) return <div className="w-6 h-6 rounded-full bg-destructive/15 text-destructive flex items-center justify-center text-xs font-bold">✕</div>;
    return <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/20" />;
  };

  const getTotalColor = (pct: number) => {
    if (pct >= 90) return "text-emerald-600 bg-emerald-500/10";
    if (pct >= 75) return "text-primary bg-primary/10";
    return "text-destructive bg-destructive/10";
  };

  return (
    <div className="flex min-h-screen bg-background">
      <TeacherSidebar activePage="Attendance" />
      <div className="flex-1">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Courses</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-primary font-semibold">Attendance Management</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search student..." className="pl-9 w-64" value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Manual Attendance Sheet</h2>
                    <p className="text-sm text-muted-foreground mt-1">Fall Semester 2023 │ CSE201 – Data Structures</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">Active Date Selection</p>
                      <div className="flex items-center gap-2 bg-secondary rounded-xl px-3 py-2">
                        <button className="text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /></button>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-semibold">Oct 24, 2023</span>
                        </div>
                        <button className="text-muted-foreground hover:text-foreground"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </div>
                    <Button variant="outline" onClick={markAllPresent} className="gap-2">
                      <CheckCheck className="w-4 h-4" /> Mark All Present
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <Button className="gap-2"><Save className="w-4 h-4" /> Save Attendance</Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Table */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student Information</th>
                      {dates.map((d, i) => (
                        <th key={d} className={`text-center px-4 py-4 text-xs font-semibold uppercase tracking-wider ${i === activeDateIndex ? "text-primary" : "text-muted-foreground"}`}>{d}</th>
                      ))}
                      <th className="text-center px-3 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((student, idx) => (
                      <motion.tr key={student.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9"><AvatarFallback className={`${student.color} text-white text-xs font-bold`}>{student.initials}</AvatarFallback></Avatar>
                            <div>
                              <p className="font-semibold text-foreground text-sm">{student.name}</p>
                              <p className="text-xs text-muted-foreground">ID: {student.id}</p>
                            </div>
                          </div>
                        </td>
                        {student.history.map((val, hi) => (
                          <td key={hi} className="text-center px-4 py-4">
                            {hi === activeDateIndex ? (
                              <div className="flex justify-center">
                                <Checkbox checked={attendance[student.id]} onCheckedChange={() => toggleAttendance(student.id)} className="h-6 w-6 rounded-md" />
                              </div>
                            ) : (
                              <div className="flex justify-center">{getStatusIcon(val)}</div>
                            )}
                          </td>
                        ))}
                        <td className="text-center px-3 py-4">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getTotalColor(student.total)}`}>{student.total}%</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-t border-border">
                <p className="text-xs text-muted-foreground">Showing {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, filteredDesktop.length)} of {filteredDesktop.length} students</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${currentPage === i + 1 ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"}`}>{i + 1}</button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg hover:bg-secondary disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-4">
            <Card><CardContent className="p-5 flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center"><Users className="w-6 h-6 text-emerald-600" /></div><div><p className="text-sm text-muted-foreground font-medium">Present Today</p><p className="text-2xl font-bold text-foreground">{presentCount} / {totalStudents}</p></div></CardContent></Card>
            <Card><CardContent className="p-5 flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center"><UserX className="w-6 h-6 text-destructive" /></div><div><p className="text-sm text-muted-foreground font-medium">Absent Today</p><p className="text-2xl font-bold text-foreground">{absentCount}</p></div></CardContent></Card>
            <Card><CardContent className="p-5 flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-primary" /></div><div><p className="text-sm text-muted-foreground font-medium">Avg. Attendance</p><p className="text-2xl font-bold text-foreground">89.4%</p></div></CardContent></Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAttendance;
