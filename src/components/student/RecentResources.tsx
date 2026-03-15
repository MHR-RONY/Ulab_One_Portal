import { FileText, Download } from "lucide-react";
import { motion } from "framer-motion";

const resources = [
  { name: "DBMS_Lec_12_Nor...", size: "2.4 MB", time: "2 hours ago", colorClass: "text-destructive bg-destructive/10" },
  { name: "Calculus_Revision...", size: "1.1 MB", time: "Yesterday", colorClass: "text-stat-blue bg-stat-blue/10" },
  { name: "Ethics_Assignmen...", size: "12 KB", time: "2 days ago", colorClass: "text-stat-amber bg-stat-amber/10" },
];

const RecentResources = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="glass-card bg-card rounded-2xl border border-border overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-bold text-foreground tracking-tight">Recent Resources</h3>
      </div>
      <div className="p-4 space-y-2">
        {resources.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.06, duration: 0.3 }}
            whileHover={{ x: 2 }}
            className="flex items-center gap-3 p-3 hover:bg-secondary/70 rounded-xl transition-all duration-200 cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.colorClass}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{r.name}</p>
              <p className="text-xs text-muted-foreground">{r.size} • {r.time}</p>
            </div>
            <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.div>
        ))}
      </div>
      <div className="p-4 bg-secondary/30 text-center border-t border-border">
        <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">View all Library</button>
      </div>
    </motion.div>
  );
};

export default RecentResources;
