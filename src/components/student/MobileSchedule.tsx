import { motion } from "framer-motion";

const classes = [
  { time: "09:00", period: "AM", name: "Advanced Algorithms", location: "Room 402 • Building B", active: true },
  { time: "11:30", period: "AM", name: "UI/UX Design Studio", location: "Lab 105 • Creative Arts", active: false },
];

const MobileSchedule = () => {
  return (
    <section className="md:hidden px-4 pt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-foreground text-lg font-extrabold tracking-tight">Today's Schedule</h3>
        <button className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors">View All</button>
      </div>
      <div className="space-y-3">
        {classes.map((cls, i) => (
          <motion.div
            key={cls.time}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.35 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-4 glass-card bg-card p-4 rounded-2xl border border-border cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-border pr-4">
              <span className="text-sm font-extrabold text-foreground">{cls.time}</span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">{cls.period}</span>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-foreground">{cls.name}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">{cls.location}</p>
            </div>
            <div className={`w-2.5 h-2.5 rounded-full ${cls.active ? "bg-primary shadow-lg shadow-primary/30 animate-pulse" : "bg-muted-foreground/30"}`} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default MobileSchedule;
