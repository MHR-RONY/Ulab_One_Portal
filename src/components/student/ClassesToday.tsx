import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardClass } from "@/hooks/useStudentDashboard";

interface ClassesTodayProps {
  classes: DashboardClass[];
}

function formatTime(time: string): { display: string; period: string } {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return {
    display: `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
    period,
  };
}

const ClassesToday = ({ classes }: ClassesTodayProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.4 }}
      className="glass-card bg-card rounded-2xl border border-border"
    >
      <div className="p-6 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground tracking-tight">Classes Today</h3>
        <div className="flex gap-1.5">
          <button className="p-1.5 rounded-lg bg-secondary hover:bg-primary/10 hover:text-primary transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <button className="p-1.5 rounded-lg bg-secondary hover:bg-primary/10 hover:text-primary transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          No classes scheduled for today.
        </div>
      ) : (
        <div className="p-6 space-y-3">
          {classes.map((cls, i) => {
            const { display, period } = formatTime(cls.startTime);
            const isNow = cls.status === "NOW";
            return (
              <motion.div
                key={`${cls.courseCode}-${cls.startTime}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.08, duration: 0.3 }}
                whileHover={{ scale: 1.01 }}
                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isNow
                    ? "border-l-4 border-l-primary bg-primary/5 border-border shadow-[0_0_20px_-8px_hsl(var(--primary)/0.15)]"
                    : cls.status === "COMPLETED"
                    ? "bg-secondary/50 border-border opacity-75"
                    : "border-border hover:bg-secondary/50"
                }`}
              >
                <div className="w-16 flex flex-col items-center justify-center border-r border-border pr-4">
                  <span className={`text-sm font-extrabold ${isNow ? "text-primary" : "text-foreground"}`}>{display}</span>
                  <span className={`text-[10px] uppercase font-semibold ${isNow ? "text-primary/70" : "text-muted-foreground"}`}>{period}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">{cls.courseName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {cls.room}{cls.teacher ? ` • ${cls.teacher}` : ""}
                  </p>
                </div>
                <div
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-full tracking-wider ${
                    isNow
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : cls.status === "COMPLETED"
                      ? "bg-muted text-muted-foreground"
                      : "border border-border text-muted-foreground"
                  }`}
                >
                  {cls.status}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ClassesToday;
