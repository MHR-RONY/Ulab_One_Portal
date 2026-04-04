import { useState } from "react";
import Sidebar from "@/components/student/Sidebar";
import BottomNav from "@/components/student/BottomNav";
import MobileMenuDrawer from "@/components/student/MobileMenuDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { TrendingUp, Calendar, AlertTriangle, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useStudentAttendance, useStudentAttendanceDay } from "@/hooks/useStudentAttendance";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (time: string | null) => {
  if (!time) return "N/A";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
};

const getProgressColor = (pct: number) => {
  if (pct >= 85) return "bg-stat-emerald";
  if (pct >= 75) return "bg-stat-amber";
  return "bg-destructive";
};

const Attendance = () => {
  const now = new Date();
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { data, loading, error, refetch } = useStudentAttendance(calMonth, calYear);
  const { data: dayData, loading: dayLoading } = useStudentAttendanceDay(selectedDate);

  const prevMonth = () => {
    setSelectedDate(null);
    if (calMonth === 1) { setCalMonth(12); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    setSelectedDate(null);
    if (calMonth === 12) { setCalMonth(1); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  };

  const handleDayClick = (dateStr: string, type: string) => {
    if (type === "empty" || type === "future") return;
    setSelectedDate((prev) => (prev === dateStr ? null : dateStr));
  };

  // Build calendar grid
  const buildCalendar = () => {
    const presentSet = new Set(data?.calendarData.presentDates ?? []);
    const absentSet = new Set(data?.calendarData.absentDates ?? []);
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    // First day of month (0=Sun, adjust to Mon-based)
    const firstDay = new Date(calYear, calMonth - 1, 1).getDay();
    // Convert Sun=0 to Mon-based offset (Mon=0, ..., Sun=6)
    const offset = (firstDay + 6) % 7;
    const daysInMonth = new Date(calYear, calMonth, 0).getDate();

    const cells: Array<{ day: number | null; type: "empty" | "present" | "absent" | "today" | "future" | "plain" }> = [];

    for (let i = 0; i < offset; i++) {
      cells.push({ day: null, type: "empty" });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      if (dateStr === todayStr) {
        cells.push({ day: d, type: "today" });
      } else if (presentSet.has(dateStr)) {
        cells.push({ day: d, type: "present" });
      } else if (absentSet.has(dateStr)) {
        cells.push({ day: d, type: "absent" });
      } else {
        const isPast = dateStr < todayStr;
        cells.push({ day: d, type: isPast ? "plain" : "future" });
      }
    }

    return cells;
  };

  const calendarCells = buildCalendar();
  const presentCount = data?.calendarData.presentDates.length ?? 0;
  const absentCount = data?.calendarData.absentDates.length ?? 0;
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">
        <Sidebar activePage="Attendance Tracker" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {isMobile && (
          <header className="sticky top-0 z-20 bg-card border-b border-border">
            <div className="flex items-center px-4 py-3 gap-3">
              <h1 className="text-lg font-bold leading-tight text-foreground flex-1">Attendance</h1>
              <MobileMenuDrawer activePage="Attendance Tracker" />
            </div>
          </header>
        )}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">Attendance Tracker</h1>
                <p className="text-muted-foreground mt-1 text-sm md:text-base">Real-time monitoring of your academic presence and participation.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-sm"
                >
                  Refresh Stats
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium">{error}</div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-24 text-muted-foreground text-sm">Loading attendance data...</div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                  <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-sm font-medium text-muted-foreground">Overall Attendance</p>
                      <span className="p-2 bg-stat-emerald/10 text-stat-emerald rounded-lg">
                        <TrendingUp className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">{data?.overallStats.percentage ?? 0}%</span>
                    </div>
                    <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${data?.overallStats.percentage ?? 0}%` }} />
                    </div>
                  </div>

                  <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-sm font-medium text-muted-foreground">Classes Attended</p>
                      <span className="p-2 bg-primary/10 text-primary rounded-lg">
                        <Calendar className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">{data?.overallStats.attended ?? 0}</span>
                      <span className="text-muted-foreground text-sm">/ {data?.overallStats.total ?? 0} Total Sessions</span>
                    </div>
                  </div>

                  <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-sm font-medium text-muted-foreground">Risk Threshold</p>
                      <span className="p-2 bg-stat-amber/10 text-stat-amber rounded-lg">
                        <AlertTriangle className="w-5 h-5" />
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">{data?.overallStats.coursesAtRisk ?? 0}</span>
                      <span className="text-muted-foreground text-sm">Courses below 75%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      {(data?.overallStats.coursesAtRisk ?? 0) === 0
                        ? "You are currently meeting all requirements."
                        : "Some courses need attention."}
                    </p>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                  {/* Left Column */}
                  <div className="lg:col-span-2 space-y-6 md:space-y-8">
                    {/* Subject-wise Progress */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-border">
                        <h2 className="text-lg font-bold text-foreground">Subject-wise Progress</h2>
                      </div>
                      <div className="p-6 space-y-6">
                        {(data?.subjectProgress ?? []).length === 0 ? (
                          <p className="text-sm text-muted-foreground">No enrolled courses found.</p>
                        ) : (
                          (data?.subjectProgress ?? []).map((s) => (
                            <div key={s.courseCode} className="space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-foreground">
                                  {s.courseCode}: {s.courseName}
                                </span>
                                <span className="text-muted-foreground">
                                  {s.percentage}% ({s.attended}/{s.total})
                                </span>
                              </div>
                              <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${getProgressColor(s.percentage)} rounded-full`}
                                  style={{ width: `${s.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                      <div className="p-6 border-b border-border">
                        <h2 className="text-lg font-bold text-foreground">Recent Activity</h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="text-xs uppercase text-muted-foreground bg-secondary/50">
                              <th className="px-6 py-4 font-semibold">Date</th>
                              <th className="px-6 py-4 font-semibold">Course Code</th>
                              <th className="px-6 py-4 font-semibold">Section</th>
                              <th className="px-6 py-4 font-semibold">Status</th>
                              <th className="px-6 py-4 font-semibold">Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border text-sm">
                            {(data?.recentActivity ?? []).length === 0 ? (
                              <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground text-sm">
                                  No attendance records yet.
                                </td>
                              </tr>
                            ) : (
                              (data?.recentActivity ?? []).map((row, i) => (
                                <tr key={i}>
                                  <td className="px-6 py-4 text-foreground">{formatDate(row.date)}</td>
                                  <td className="px-6 py-4 font-medium text-foreground">{row.courseCode}</td>
                                  <td className="px-6 py-4 text-foreground">Sec {row.section}</td>
                                  <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                      row.status === "present"
                                        ? "bg-stat-emerald/10 text-stat-emerald"
                                        : "bg-destructive/10 text-destructive"
                                    }`}>
                                      {row.status.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-muted-foreground">{formatTime(row.time)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Calendar */}
                  <div className="lg:col-span-1">
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden sticky top-8">
                      <div className="p-6 border-b border-border flex justify-between items-center">
                        <h2 className="font-bold text-foreground">Attendance Calendar</h2>
                        <div className="flex gap-2">
                          <ChevronLeft
                            className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                            onClick={prevMonth}
                          />
                          <ChevronRight
                            className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                            onClick={nextMonth}
                          />
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="mb-4 text-center">
                          <p className="text-sm font-semibold text-foreground">
                            {MONTHS[calMonth - 1]} {calYear}
                          </p>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-muted-foreground mb-2">
                          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                            <span key={d}>{d}</span>
                          ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                          {calendarCells.map((cell, i) => {
                            if (cell.type === "empty") return <div key={i} className="h-8" />;
                            const dateStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(cell.day).padStart(2, "0")}`;
                            const isSelected = selectedDate === dateStr;
                            const isClickable = cell.type !== "future";
                            const classMap: Record<string, string> = {
                              present: "bg-stat-emerald text-white",
                              absent: "bg-destructive text-white",
                              today: "border-2 border-primary text-primary bg-transparent",
                              future: "bg-secondary text-muted-foreground opacity-40",
                              plain: "bg-secondary/50 text-foreground",
                            };
                            return (
                              <div
                                key={i}
                                onClick={() => handleDayClick(dateStr, cell.type)}
                                className={`h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all
                                  ${classMap[cell.type]}
                                  ${isClickable ? "cursor-pointer hover:opacity-80" : ""}
                                  ${isSelected ? "ring-2 ring-offset-1 ring-foreground" : ""}
                                `}
                              >
                                {cell.day}
                              </div>
                            );
                          })}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="w-3 h-3 rounded-full bg-stat-emerald" />
                            <span className="text-muted-foreground">Present ({presentCount})</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="w-3 h-3 rounded-full bg-destructive" />
                            <span className="text-muted-foreground">Absent ({absentCount})</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="w-3 h-3 rounded-full border-2 border-primary" />
                            <span className="text-muted-foreground">Today</span>
                          </div>
                        </div>

                        {/* Day Detail / Subject Breakdown */}
                        {selectedDate ? (
                          <div className="mt-6">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                                {formatDate(selectedDate)}
                              </h3>
                              <button
                                onClick={() => setSelectedDate(null)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {dayLoading ? (
                              <p className="text-xs text-muted-foreground py-2">Loading...</p>
                            ) : !dayData || dayData.records.length === 0 ? (
                              <p className="text-xs text-muted-foreground py-2">No classes recorded for this day.</p>
                            ) : (
                              <>
                                <div className="flex gap-3 mb-3 text-[11px] font-semibold">
                                  <span className="text-stat-emerald">{dayData.presentCount} Present</span>
                                  <span className="text-destructive">{dayData.absentCount} Absent</span>
                                  {dayData.notMarkedCount > 0 && (
                                    <span className="text-muted-foreground">{dayData.notMarkedCount} Not Marked</span>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  {dayData.records.map((r) => (
                                    <div
                                      key={r.courseCode}
                                      className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs border ${
                                        r.status === "present"
                                          ? "bg-stat-emerald/10 border-stat-emerald/20"
                                          : r.status === "absent"
                                          ? "bg-destructive/10 border-destructive/20"
                                          : "bg-secondary/50 border-border"
                                      }`}
                                    >
                                      <div className="min-w-0">
                                        <p className="font-semibold text-foreground truncate">{r.courseCode}</p>
                                        <p className="text-muted-foreground truncate">{r.courseName}</p>
                                        {r.time && (
                                          <p className="text-muted-foreground">{formatTime(r.time)} · Sec {r.section}</p>
                                        )}
                                      </div>
                                      <span className={`font-bold uppercase shrink-0 ml-2 ${
                                        r.status === "present"
                                          ? "text-stat-emerald"
                                          : r.status === "absent"
                                          ? "text-destructive"
                                          : "text-muted-foreground"
                                      }`}>
                                        {r.status === "not-marked" ? "—" : r.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="mt-6">
                            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Subject Breakdown</h3>
                            <div className="space-y-3">
                              {(data?.subjectProgress ?? []).length === 0 ? (
                                <p className="text-xs text-muted-foreground">No courses enrolled.</p>
                              ) : (
                                (data?.subjectProgress ?? []).map((s) => {
                                  const absent = s.total - s.attended;
                                  const pctColor =
                                    s.percentage >= 85
                                      ? "text-stat-emerald"
                                      : s.percentage >= 75
                                      ? "text-stat-amber"
                                      : "text-destructive";
                                  const barColor =
                                    s.percentage >= 85
                                      ? "bg-stat-emerald"
                                      : s.percentage >= 75
                                      ? "bg-stat-amber"
                                      : "bg-destructive";
                                  return (
                                    <div key={s.courseCode} className="bg-secondary/40 rounded-lg p-3 space-y-2">
                                      <div className="flex justify-between items-start gap-2">
                                        <span className="text-xs font-semibold text-foreground leading-tight">{s.courseCode}</span>
                                        <span className={`text-xs font-bold ${pctColor} shrink-0`}>{s.percentage}%</span>
                                      </div>
                                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                        <div
                                          className={`h-full ${barColor} rounded-full`}
                                          style={{ width: `${s.percentage}%` }}
                                        />
                                      </div>
                                      <div className="flex gap-3 text-[11px]">
                                        <span className="text-stat-emerald font-medium">{s.attended} present</span>
                                        <span className="text-destructive font-medium">{absent} absent</span>
                                        <span className="text-muted-foreground ml-auto">{s.total} total</span>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}

                        {/* Note */}
                        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                          <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Note</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            You need to maintain at least 75% attendance in each course to be eligible for Final Examinations.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default Attendance;
