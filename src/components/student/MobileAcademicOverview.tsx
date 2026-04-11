import { CheckCircle, GraduationCap, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import type { AttendanceSummary } from "@/hooks/useStudentDashboard";

interface MobileAcademicOverviewProps {
  attendance?: AttendanceSummary[];
  semester?: number;
  loading?: boolean;
}

const COLORS = [
  "hsl(var(--stat-emerald))",
  "hsl(var(--primary))",
  "hsl(var(--stat-amber))",
  "hsl(var(--stat-blue))",
  "hsl(var(--destructive))",
];

const STATUS_MAP = (pct: number): { label: string; colorClass: string } => {
  if (pct >= 85) return { label: "Excellent", colorClass: "text-stat-emerald bg-stat-emerald/10" };
  if (pct >= 75) return { label: "Good", colorClass: "text-primary bg-primary/10" };
  return { label: "At Risk", colorClass: "text-stat-amber bg-stat-amber/10" };
};

const AnimatedDonutRing = ({ percent, color, radius, stroke, delay }: { percent: number; color: string; radius: number; stroke: number; delay: number }) => {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <>
      <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth={stroke} />
      <motion.circle
        cx="60" cy="60" r={radius} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ delay, duration: 1.4, ease: "easeOut" }}
        transform="rotate(-90 60 60)"
      />
    </>
  );
};

const AnimatedCounter = ({ target, delay }: { target: number; delay: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timeout = setTimeout(() => {
      const duration = 1400;
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [target, delay]);
  return <>{count}%</>;
};

const MobileAcademicOverview = ({ attendance, semester, loading }: MobileAcademicOverviewProps) => {
  const overallAttendance = attendance && attendance.length > 0
    ? Math.round(attendance.reduce((sum, a) => sum + a.percentage, 0) / attendance.length)
    : 0;
  const totalCredits = attendance ? attendance.length * 3 : 0;

  const stats = [
    { icon: CheckCircle, label: "Attendance", value: loading ? "..." : `${overallAttendance}%`, colorClass: "text-primary" },
    { icon: GraduationCap, label: "Courses", value: loading ? "..." : `${attendance?.length ?? 0}`, colorClass: "text-primary" },
    { icon: Star, label: "Credits", value: loading ? "..." : `${totalCredits}`, colorClass: "text-primary" },
  ];

  const semesterLabel = semester ? `Semester ${semester}` : "";
  const visibleCourses = attendance?.slice(0, 4) ?? [];

  return (
    <section className="md:hidden px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground text-lg font-semibold tracking-tight">Academic Overview</h3>
        {semesterLabel && (
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">{semesterLabel}</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className="flex flex-col gap-1 rounded-2xl p-4 glass-card bg-card border border-border"
          >
            <stat.icon className={`w-5 h-5 ${stat.colorClass}`} />
            <p className="text-muted-foreground text-[10px] font-medium uppercase mt-1">{stat.label}</p>
            <p className="text-foreground text-xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Attendance Summary Graph */}
      {!loading && visibleCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-6 glass-card bg-card rounded-2xl border border-border p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-semibold text-foreground">Attendance Summary</h4>
            <span className="text-[10px] text-muted-foreground">Min 75% required</span>
          </div>

          <div className="flex gap-5 items-center">
            {/* Donut Chart */}
            <div className="flex flex-col items-center flex-shrink-0 gap-1.5">
              <svg width="80" height="80" viewBox="0 0 120 120">
                {visibleCourses.map((c, i) => (
                  <AnimatedDonutRing
                    key={c.courseCode}
                    percent={c.percentage}
                    color={COLORS[i % COLORS.length]}
                    radius={50 - i * 12}
                    stroke={8}
                    delay={0.5 + i * 0.15}
                  />
                ))}
              </svg>
              <div className="flex items-baseline gap-0.5">
                <span className="text-base font-bold text-foreground">
                  <AnimatedCounter target={overallAttendance} delay={0.5} />
                </span>
                <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest">Avg</span>
              </div>
            </div>

            {/* Course bars */}
            <div className="flex-1 space-y-3 min-w-0">
              {visibleCourses.map((c, i) => {
                const { label, colorClass } = STATUS_MAP(c.percentage);
                const color = COLORS[i % COLORS.length];
                return (
                  <div key={c.courseCode} className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="text-xs font-medium text-foreground truncate">{c.courseCode}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md ${colorClass}`}>{label}</span>
                        <span className="text-xs font-semibold text-foreground w-8 text-right">{c.percentage}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.percentage}%` }}
                        transition={{ delay: 0.5 + i * 0.15, duration: 1.4, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default MobileAcademicOverview;
