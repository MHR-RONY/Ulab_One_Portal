import { CheckCircle, GraduationCap, Star, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { icon: CheckCircle, label: "Attendance", value: "92%", change: "2%", colorClass: "text-primary" },
  { icon: GraduationCap, label: "Credits", value: "105", change: "12", colorClass: "text-primary" },
  { icon: Star, label: "GPA", value: "3.85", change: "0.1", colorClass: "text-primary" },
];

const MobileAcademicOverview = () => {
  return (
    <section className="md:hidden px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground text-lg font-extrabold tracking-tight">Academic Overview</h3>
        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">Spring 2024</span>
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
            <p className="text-muted-foreground text-[10px] font-bold uppercase mt-1">{stat.label}</p>
            <p className="text-foreground text-xl font-extrabold">{stat.value}</p>
            <p className="text-stat-emerald text-[10px] font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> {stat.change}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default MobileAcademicOverview;
