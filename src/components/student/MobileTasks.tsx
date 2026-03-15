import { ClipboardList, FileEdit } from "lucide-react";
import { motion } from "framer-motion";

const tasks = [
  {
    icon: ClipboardList,
    name: "Database Project Phase 2",
    detail: "Submission via Portal • 11:59 PM",
    badge: "TOMORROW",
    badgeClass: "text-stat-amber bg-stat-amber/10",
    iconBg: "bg-stat-amber/10",
    iconColor: "text-stat-amber",
  },
  {
    icon: FileEdit,
    name: "Math Quiz: Linear Algebra",
    detail: "In-person Exam • Room 301",
    badge: "OCT 24",
    badgeClass: "text-muted-foreground bg-secondary",
    iconBg: "bg-stat-blue/10",
    iconColor: "text-stat-blue",
  },
];

const MobileTasks = () => {
  return (
    <section className="md:hidden px-4 pt-8 pb-28">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground text-lg font-extrabold tracking-tight">Upcoming Tasks</h3>
        <button className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors">Manage</button>
      </div>
      <div className="space-y-3">
        {tasks.map((task, i) => (
          <motion.div
            key={task.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.35 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-start gap-4 glass-card bg-card p-4 rounded-2xl border border-border cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-xl ${task.iconBg} flex items-center justify-center shrink-0`}>
              <task.icon className={`w-5 h-5 ${task.iconColor}`} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start gap-2">
                <h4 className="text-sm font-bold text-foreground">{task.name}</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${task.badgeClass}`}>{task.badge}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{task.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default MobileTasks;
