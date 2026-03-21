import { BookOpen, CalendarDays, History, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardStats } from "@/hooks/useStudentDashboard";

interface StatsGridProps {
  stats: DashboardStats | null;
}

const StatsGrid = ({ stats }: StatsGridProps) => {
  const upcomingCount = stats?.upcomingClassesCount ?? 0;
  const nextClassDetail = stats?.nextClass
    ? `Next: ${stats.nextClass.code} at ${formatTime(stats.nextClass.time)}`
    : "No more classes today";
  const totalSessions = stats?.totalSessionsToday ?? 0;
  const completedSessions = stats?.completedSessionsToday ?? 0;
  const remainingSessions = totalSessions - completedSessions;

  const statCards = [
    {
      icon: BookOpen,
      label: "Upcoming Classes",
      value: `${upcomingCount} Remaining`,
      detail: nextClassDetail,
      badge: "TODAY",
      colorClass: "text-stat-blue bg-stat-blue/10",
      badgeClass: "text-stat-blue bg-stat-blue/10",
      glowColor: "hsl(217 91% 60% / 0.08)",
    },
    {
      icon: CalendarDays,
      label: "Today's Schedule",
      value: `${totalSessions} Sessions`,
      detail: `${completedSessions} completed, ${remainingSessions} upcoming`,
      badge: "WEEKLY",
      colorClass: "text-stat-purple bg-stat-purple/10",
      badgeClass: "text-stat-purple bg-stat-purple/10",
      glowColor: "hsl(271 81% 56% / 0.08)",
    },
    {
      icon: History,
      label: "Recent Notes",
      value: "3 Uploads",
      detail: "Algorithms & Data Struct.",
      badge: "NEW",
      colorClass: "text-stat-amber bg-stat-amber/10",
      badgeClass: "text-stat-amber bg-stat-amber/10",
      glowColor: "hsl(38 92% 50% / 0.08)",
    },
    {
      icon: MessageSquare,
      label: "Unread Messages",
      value: "5 New",
      detail: "3 from Study Group A",
      badge: "ACTIVE",
      colorClass: "text-stat-emerald bg-stat-emerald/10",
      badgeClass: "text-stat-emerald bg-stat-emerald/10",
      glowColor: "hsl(160 84% 39% / 0.08)",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
          className="glass-card glossy-shine bg-card p-6 rounded-2xl border border-border cursor-pointer"
          style={{ "--glow": stat.glowColor } as React.CSSProperties}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2.5 rounded-xl ${stat.colorClass} backdrop-blur-sm`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${stat.badgeClass} tracking-wider`}>
              {stat.badge}
            </span>
          </div>
          <h3 className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">{stat.label}</h3>
          <p className="text-2xl font-extrabold mt-1.5 text-foreground tracking-tight">{stat.value}</p>
          <p className="text-xs text-muted-foreground mt-2 font-medium">{stat.detail}</p>
        </motion.div>
      ))}
    </div>
  );
};

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

export default StatsGrid;
