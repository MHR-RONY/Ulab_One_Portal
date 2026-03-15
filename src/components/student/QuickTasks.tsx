import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const initialTasks = [
  "Submit DBMS Project",
  "Prep for Calculus Quiz",
  "Email Prof regarding Lab 5",
];

const QuickTasks = () => {
  const [checked, setChecked] = useState<boolean[]>([false, false, false]);

  const toggle = (i: number) => {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55, duration: 0.4 }}
      className="bg-primary rounded-2xl p-6 text-primary-foreground shadow-xl shadow-primary/15 relative overflow-hidden"
    >
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none rounded-2xl" />

      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
        <CheckCircle className="w-5 h-5" />
        Quick Tasks
      </h3>
      <div className="space-y-4 relative z-10">
        {initialTasks.map((task, i) => (
          <label key={task} className="flex items-center gap-3 group cursor-pointer">
            <input
              type="checkbox"
              checked={checked[i]}
              onChange={() => toggle(i)}
              className="w-5 h-5 rounded border-primary-foreground/30 bg-primary-foreground/10 checked:bg-primary-foreground checked:text-primary focus:ring-primary-foreground transition-all"
            />
            <span className={`text-sm font-medium group-hover:opacity-80 transition-opacity ${checked[i] ? "line-through opacity-60" : ""}`}>
              {task}
            </span>
          </label>
        ))}
      </div>
      <button className="relative z-10 w-full mt-6 py-2.5 px-4 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 backdrop-blur-sm">
        Add New Task
      </button>
    </motion.div>
  );
};

export default QuickTasks;
