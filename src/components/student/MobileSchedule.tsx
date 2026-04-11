import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import type { DashboardClass } from "@/hooks/useStudentDashboard";

interface MobileScheduleProps {
  classes?: DashboardClass[];
  loading?: boolean;
}

const formatTime = (time: string) => {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return { time: `${displayHour}:${m}`, period };
};

const MobileSchedule = ({ classes, loading }: MobileScheduleProps) => {
  const navigate = useNavigate();

  return (
    <section className="md:hidden px-4 pt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground text-lg font-semibold tracking-tight">Today's Schedule</h3>
        <button onClick={() => navigate("/schedule")} className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors">View All</button>
      </div>
      {loading ? (
        <div className="py-8 text-center text-muted-foreground text-sm">Loading schedule...</div>
      ) : !classes || classes.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground text-sm">No classes scheduled today.</div>
      ) : (
        <div className="space-y-3">
          {classes.map((cls, i) => {
            const { time, period } = formatTime(cls.startTime);
            const isActive = cls.status === "NOW";
            return (
              <motion.div
                key={`${cls.courseCode}-${cls.startTime}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-4 glass-card bg-card p-4 rounded-2xl border border-border cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-border pr-4">
                  <span className="text-sm font-semibold text-foreground">{time}</span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase">{period}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-foreground">{cls.courseName || cls.courseCode}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{cls.room}{cls.teacher ? ` - ${cls.teacher}` : ""}</p>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-primary shadow-lg shadow-primary/30 animate-pulse" : cls.status === "COMPLETED" ? "bg-stat-emerald/50" : "bg-muted-foreground/30"}`} />
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MobileSchedule;
