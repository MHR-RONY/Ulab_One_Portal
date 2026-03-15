import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const courses = [
  { code: "CSE402", name: "Databases", percent: 92, color: "hsl(var(--stat-emerald))", status: "Excellent", statusColor: "text-stat-emerald bg-stat-emerald/10" },
  { code: "CSE301", name: "Algorithms", percent: 85, color: "hsl(var(--primary))", status: "Good", statusColor: "text-primary bg-primary/10" },
  { code: "MAT201", name: "Calculus", percent: 68, color: "hsl(var(--stat-amber))", status: "At Risk", statusColor: "text-stat-amber bg-stat-amber/10" },
];

const average = Math.round(courses.reduce((s, c) => s + c.percent, 0) / courses.length);

const AnimatedDonutRing = ({ percent, color, radius, stroke, delay }: { percent: number; color: string; radius: number; stroke: number; delay: number }) => {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <>
      <circle cx="80" cy="80" r={radius} fill="none" stroke="hsl(var(--secondary))" strokeWidth={stroke} />
      <motion.circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ delay, duration: 1.4, ease: "easeOut" }}
        transform="rotate(-90 80 80)"
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

const AttendanceSummary = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      className="glass-card bg-card rounded-2xl border border-border"
    >
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">Attendance Summary</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Current semester · all subjects</p>
        </div>
        <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">View Details</button>
      </div>
      <div className="p-6 flex gap-8 items-center">
        {/* Donut Chart */}
        <div className="relative flex-shrink-0 w-[160px] h-[160px]">
          <svg width="160" height="160" viewBox="0 0 160 160">
            <AnimatedDonutRing percent={courses[0].percent} color={courses[0].color} radius={65} stroke={10} delay={0.5} />
            <AnimatedDonutRing percent={courses[1].percent} color={courses[1].color} radius={50} stroke={10} delay={0.7} />
            <AnimatedDonutRing percent={courses[2].percent} color={courses[2].color} radius={35} stroke={10} delay={0.9} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-extrabold text-foreground">
              <AnimatedCounter target={average} delay={0.5} />
            </span>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Average</span>
          </div>
        </div>

        {/* Course bars */}
        <div className="flex-1 space-y-5">
          {courses.map((c, i) => (
            <div key={c.code} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-sm font-bold text-foreground">{c.code}</span>
                  <span className="text-sm text-muted-foreground">· {c.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${c.statusColor}`}>{c.status}</span>
                  <span className="text-sm font-extrabold text-foreground w-10 text-right">{c.percent}%</span>
                </div>
              </div>
              <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${c.percent}%` }}
                  transition={{ delay: 0.5 + i * 0.2, duration: 1.4, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ background: c.color }}
                />
              </div>
            </div>
          ))}
          <div className="border-t border-border pt-3 mt-3">
            <p className="text-xs text-muted-foreground">Minimum required attendance is <span className="font-bold text-foreground">75%</span></p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AttendanceSummary;
