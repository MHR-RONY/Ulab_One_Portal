import { useState } from "react";
import Sidebar from "@/components/student/Sidebar";
import BottomNav from "@/components/student/BottomNav";
import MobileMenuDrawer from "@/components/student/MobileMenuDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { TrendingUp, Calendar, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";

const subjects = [
  { name: "CSE101: Introduction to Programming", percent: 92, attended: 23, total: 25, color: "bg-primary" },
  { name: "ENG101: Basic Composition", percent: 85, attended: 17, total: 20, color: "bg-primary/70" },
  { name: "MAT101: Calculus I", percent: 78, attended: 14, total: 18, color: "bg-stat-amber" },
  { name: "PHY101: General Physics I", percent: 95, attended: 19, total: 20, color: "bg-stat-emerald" },
];

const recentActivity = [
  { date: "Oct 24, 2023", code: "CSE101", section: "Sec 03", status: "PRESENT", time: "09:00 AM" },
  { date: "Oct 24, 2023", code: "ENG101", section: "Sec 01", status: "PRESENT", time: "11:30 AM" },
  { date: "Oct 23, 2023", code: "MAT101", section: "Sec 02", status: "ABSENT", time: "02:00 PM" },
  { date: "Oct 22, 2023", code: "PHY101", section: "Sec 01", status: "PRESENT", time: "10:00 AM" },
];

// Calendar data: 0=no class, 1=present, 2=absent, 3=today, 4=future
const calendarDays = [
  0, 0, 0, 0, 0, 1, 1, // row 1 (5 empty + Sat/Sun)
  1, 1, 2, 1, 1, 1, 1, // row 2
  1, 1, 1, 0, 1, 1, 1, // row 3
  2, 1, 1, 1, 3, 4, 4, // row 4
];

const Attendance = () => {
  const [semester, setSemester] = useState("current");
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">
        <Sidebar activePage="Attendance Tracker" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
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
                <button className="px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-secondary transition-colors">Export Report</button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold shadow-sm">Refresh Stats</button>
              </div>
            </div>

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
                  <span className="text-4xl font-bold text-foreground">88.5%</span>
                  <span className="text-sm font-medium text-stat-emerald">+2.4% from last month</span>
                </div>
                <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "88.5%" }} />
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
                  <span className="text-4xl font-bold text-foreground">106</span>
                  <span className="text-muted-foreground text-sm">/ 120 Total Sessions</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4 italic">Next class in 2 hours: CSE201</p>
              </div>

              <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-medium text-muted-foreground">Risk Threshold</p>
                  <span className="p-2 bg-stat-amber/10 text-stat-amber rounded-lg">
                    <AlertTriangle className="w-5 h-5" />
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">0</span>
                  <span className="text-muted-foreground text-sm">Courses below 75%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-4">You are currently meeting all requirements.</p>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                {/* Subject-wise Progress */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-border flex justify-between items-center">
                    <h2 className="text-lg font-bold text-foreground">Subject-wise Progress</h2>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="text-xs bg-secondary border border-border rounded-md px-3 py-1.5 text-foreground"
                    >
                      <option value="current">Current Semester</option>
                      <option value="previous">Previous Semester</option>
                    </select>
                  </div>
                  <div className="p-6 space-y-6">
                    {subjects.map((s) => (
                      <div key={s.name} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-foreground">{s.name}</span>
                          <span className="text-muted-foreground">{s.percent}% ({s.attended}/{s.total})</span>
                        </div>
                        <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                          <div className={`h-full ${s.color} rounded-full`} style={{ width: `${s.percent}%` }} />
                        </div>
                      </div>
                    ))}
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
                        {recentActivity.map((row, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4 text-foreground">{row.date}</td>
                            <td className="px-6 py-4 font-medium text-foreground">{row.code}</td>
                            <td className="px-6 py-4 text-foreground">{row.section}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                row.status === "PRESENT"
                                  ? "bg-stat-emerald/10 text-stat-emerald"
                                  : "bg-destructive/10 text-destructive"
                              }`}>
                                {row.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">{row.time}</td>
                          </tr>
                        ))}
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
                      <ChevronLeft className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                      <ChevronRight className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4 text-center">
                      <p className="text-sm font-semibold text-foreground">October 2023</p>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-muted-foreground mb-2">
                      {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => (
                        <span key={d}>{d}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((type, i) => {
                        const day = i - 4; // offset for empty cells
                        if (type === 0 && i < 5) return <div key={i} className="h-8" />;
                        const dayNum = day;
                        if (type === 0) {
                          return (
                            <div key={i} className="h-8 flex items-center justify-center rounded-lg bg-secondary text-xs font-bold text-foreground">
                              {dayNum}
                            </div>
                          );
                        }
                        const classes = {
                          1: "bg-stat-emerald text-white",
                          2: "bg-destructive text-white",
                          3: "border-2 border-primary text-primary bg-transparent",
                          4: "bg-secondary text-muted-foreground",
                        };
                        return (
                          <div key={i} className={`h-8 flex items-center justify-center rounded-lg text-xs font-bold ${classes[type as keyof typeof classes]}`}>
                            {dayNum}
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="mt-8 space-y-3">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="w-3 h-3 rounded-full bg-stat-emerald" />
                        <span className="text-muted-foreground">Present (19 days)</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="w-3 h-3 rounded-full bg-destructive" />
                        <span className="text-muted-foreground">Absent (2 days)</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="w-3 h-3 rounded-full border-2 border-primary" />
                        <span className="text-muted-foreground">Today</span>
                      </div>
                    </div>

                    {/* Note */}
                    <div className="mt-8 p-4 bg-primary/10 rounded-lg">
                      <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">Note</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        You need to maintain at least 75% attendance in each course to be eligible for Final Examinations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default Attendance;
