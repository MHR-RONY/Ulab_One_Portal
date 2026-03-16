import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Download, Plus, Edit2, MapPin, User, Clock,
  ChevronLeft, ChevronRight, LayoutGrid, List
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

// --- Data ---
const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY"];

type ScheduleEntry = {
  code: string; name: string; room: string; teacher: string;
  color: string; borderColor: string;
};

type TimetableData = Record<string, Record<string, ScheduleEntry>>;

const timetable: TimetableData = {
  "08:00 AM": {
    SUNDAY: { code: "CSE-101", name: "Intro to Programming", room: "Room 402", teacher: "Dr. Sarah J.", color: "bg-primary/10", borderColor: "border-primary" },
    TUESDAY: { code: "MAT-212", name: "Linear Algebra", room: "Room 105", teacher: "Prof. Ahmed", color: "bg-blue-50 dark:bg-blue-950/30", borderColor: "border-blue-400" },
  },
  "10:00 AM": {
    MONDAY: { code: "ENG-102", name: "Business Comm.", room: "Room 301", teacher: "Ms. Thompson", color: "bg-green-50 dark:bg-green-950/30", borderColor: "border-green-400" },
    WEDNESDAY: { code: "PHY-201", name: "Quantum Physics", room: "Lab B", teacher: "Dr. Walton", color: "bg-blue-50 dark:bg-blue-950/30", borderColor: "border-blue-400" },
    THURSDAY: { code: "CSE-204", name: "Data Structures", room: "Room 402", teacher: "Dr. Sarah J.", color: "bg-purple-50 dark:bg-purple-950/30", borderColor: "border-purple-400" },
  },
  "01:00 PM": {
    MONDAY: { code: "CSE-305", name: "Database Systems", room: "Room 202", teacher: "Dr. Mike Ross", color: "bg-primary/10", borderColor: "border-primary" },
    THURSDAY: { code: "MAT-111", name: "Calculus I", room: "Room 108", teacher: "Prof. Lee", color: "bg-purple-50 dark:bg-purple-950/30", borderColor: "border-purple-400" },
  },
};

const timeSlots = ["08:00 AM", "10:00 AM", "01:00 PM"];

const activeSchedules = [
  { code: "CSE-101", name: "Intro to Programming", section: "Section A", teacher: "Dr. Sarah J.", initials: "SJ", initialsColor: "bg-primary", days: "SUN, WED", time: "08:00 AM - 09:30 AM", room: "Room 402" },
  { code: "MAT-212", name: "Linear Algebra", section: "Section C", teacher: "Prof. Ahmed", initials: "AH", initialsColor: "bg-blue-500", days: "TUE, THU", time: "10:00 AM - 11:30 AM", room: "Room 105" },
  { code: "ENG-102", name: "Business Comm.", section: "Section B1", teacher: "Ms. Thompson", initials: "MT", initialsColor: "bg-green-500", days: "MON", time: "10:00 AM - 01:00 PM", room: "Room 301" },
];

// --- Components ---
const ClassCard = ({ entry }: { entry: ScheduleEntry }) => (
  <div className={`${entry.color} border-l-[3px] ${entry.borderColor} rounded-lg p-2.5 h-full`}>
    <p className="text-[11px] font-bold text-primary">{entry.code}</p>
    <p className="text-xs font-semibold text-foreground mt-0.5 leading-tight">{entry.name}</p>
    <div className="mt-1.5 space-y-0.5">
      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
        <MapPin className="w-3 h-3" /> {entry.room}
      </p>
      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
        <User className="w-3 h-3" /> {entry.teacher}
      </p>
    </div>
  </div>
);

const MobileClassCard = ({ time, entry }: { time: string; entry: ScheduleEntry }) => (
  <div className={`${entry.color} border-l-[3px] ${entry.borderColor} rounded-xl p-3`}>
    <div className="flex items-center justify-between mb-1">
      <span className="text-[11px] font-bold text-primary">{entry.code}</span>
      <span className="text-[10px] text-muted-foreground">{time}</span>
    </div>
    <p className="text-sm font-semibold text-foreground">{entry.name}</p>
    <div className="flex items-center gap-3 mt-2">
      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
        <MapPin className="w-3 h-3" /> {entry.room}
      </p>
      <p className="text-[11px] text-muted-foreground flex items-center gap-1">
        <User className="w-3 h-3" /> {entry.teacher}
      </p>
    </div>
  </div>
);

const AdminSchedules = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [mobileDay, setMobileDay] = useState(0);

  const mobileDayEntries = Object.entries(timetable)
    .map(([time, slots]) => ({ time, entry: slots[days[mobileDay]] }))
    .filter((e) => e.entry);

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <AdminSidebar activePage="Schedules" />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto pb-20 lg:pb-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">Academic Schedules</h1>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">
                  Manage and monitor university-wide class timings for the current semester.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-xl gap-2 text-xs md:text-sm">
                  <Download className="w-4 h-4" /> Export
                </Button>
                <Button className="rounded-xl gap-2 text-xs md:text-sm">
                  <Plus className="w-4 h-4" /> Add New Schedule
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="mb-6">
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search by course code, teacher, or room..." className="pl-9 rounded-xl" />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                    <Select defaultValue="fall2024">
                      <SelectTrigger className="rounded-xl w-[150px] shrink-0 text-xs md:text-sm">
                        <SelectValue placeholder="Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fall2024">Fall 2024</SelectItem>
                        <SelectItem value="spring2025">Spring 2025</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="cse">
                      <SelectTrigger className="rounded-xl w-[150px] shrink-0 text-xs md:text-sm">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="cse">Department: CSE</SelectItem>
                        <SelectItem value="bbs">Department: BBS</SelectItem>
                        <SelectItem value="eee">Department: EEE</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue="main">
                      <SelectTrigger className="rounded-xl w-[150px] shrink-0 text-xs md:text-sm">
                        <SelectValue placeholder="Campus" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main Campus</SelectItem>
                        <SelectItem value="north">North Campus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* View Toggle */}
                  <div className="hidden md:flex border border-border rounded-xl overflow-hidden shrink-0">
                    <button
                      onClick={() => setView("grid")}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                    >
                      <LayoutGrid className="w-4 h-4" /> Grid
                    </button>
                    <button
                      onClick={() => setView("list")}
                      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"}`}
                    >
                      <List className="w-4 h-4" /> List
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Timetable Grid — Desktop */}
          <AnimatePresence mode="wait">
            {view === "grid" && (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.08 }}
                className="mb-6"
              >
                {/* Desktop Grid */}
                <Card className="hidden md:block overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-[700px]">
                      <thead>
                        <tr>
                          <th className="w-24 p-3 border-b border-r border-border bg-secondary/50" />
                          {days.map((d) => (
                            <th key={d} className="p-3 border-b border-r border-border bg-secondary/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center last:border-r-0">
                              {d}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {timeSlots.map((time, ti) => (
                          <>
                            <tr key={time}>
                              <td className="p-3 border-r border-b border-border text-xs text-muted-foreground font-medium whitespace-nowrap align-top">
                                {time}
                              </td>
                              {days.map((day) => (
                                <td key={day} className="p-2 border-r border-b border-border align-top last:border-r-0 min-h-[100px] h-[110px]">
                                  {timetable[time]?.[day] ? (
                                    <ClassCard entry={timetable[time][day]} />
                                  ) : null}
                                </td>
                              ))}
                            </tr>
                            {ti === 1 && (
                              <tr key="lunch">
                                <td colSpan={6} className="py-2 text-center">
                                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                                    Lunch Break Period
                                  </span>
                                </td>
                              </tr>
                            )}
                          </>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Mobile Day Swiper */}
                <div className="md:hidden">
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setMobileDay((p) => Math.max(0, p - 1))} disabled={mobileDay === 0}
                      className="p-2 rounded-xl bg-secondary text-muted-foreground disabled:opacity-30">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">{days[mobileDay]}</h3>
                    <button onClick={() => setMobileDay((p) => Math.min(days.length - 1, p + 1))} disabled={mobileDay === days.length - 1}
                      className="p-2 rounded-xl bg-secondary text-muted-foreground disabled:opacity-30">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  {/* Day pills */}
                  <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1 scrollbar-none">
                    {days.map((d, i) => (
                      <button key={d} onClick={() => setMobileDay(i)}
                        className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${i === mobileDay ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                        {d.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {mobileDayEntries.length > 0 ? mobileDayEntries.map(({ time, entry }) => (
                      <MobileClassCard key={time} time={time} entry={entry!} />
                    )) : (
                      <Card>
                        <CardContent className="p-8 text-center">
                          <Clock className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No classes scheduled</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Schedule List */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base md:text-lg font-bold text-foreground">Active Schedule List</h2>
                  <span className="text-xs text-primary font-medium">Showing {activeSchedules.length} schedules</span>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] font-bold uppercase tracking-wider">Course & Section</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-wider">Teacher</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-wider">Day & Time</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-wider">Room</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeSchedules.map((s) => (
                        <TableRow key={s.code}>
                          <TableCell>
                            <p className="font-semibold text-foreground text-sm">{s.code}: {s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.section}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className={`w-7 h-7 ${s.initialsColor} text-primary-foreground rounded-full flex items-center justify-center text-[10px] font-bold shrink-0`}>
                                {s.initials}
                              </span>
                              <span className="text-sm text-foreground">{s.teacher}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="bg-secondary text-[10px] font-bold text-foreground px-2 py-0.5 rounded uppercase tracking-wider">
                                {s.days}
                              </span>
                              <span className="text-sm text-muted-foreground">{s.time}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-foreground">{s.room}</TableCell>
                          <TableCell className="text-right">
                            <button className="text-primary text-sm font-semibold hover:underline">Edit</button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {activeSchedules.map((s) => (
                    <div key={s.code} className="border border-border rounded-xl p-3.5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{s.code}: {s.name}</p>
                          <p className="text-[11px] text-muted-foreground">{s.section}</p>
                        </div>
                        <button className="text-primary text-xs font-semibold">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`w-6 h-6 ${s.initialsColor} text-primary-foreground rounded-full flex items-center justify-center text-[9px] font-bold`}>
                          {s.initials}
                        </span>
                        <span className="text-xs text-foreground">{s.teacher}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="bg-secondary px-1.5 py-0.5 rounded font-bold text-[10px] uppercase text-foreground">{s.days}</span>
                          {s.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {s.room}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground">Page 1 of 4</p>
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">Prev</Button>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs h-8">Next</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-border text-xs text-muted-foreground gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500" /> System Online
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Last Updated: 12 Oct 2024, 10:30 AM
              </span>
            </div>
            <span>© 2024 University Academic Portal. Administrative Dashboard.</span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSchedules;
