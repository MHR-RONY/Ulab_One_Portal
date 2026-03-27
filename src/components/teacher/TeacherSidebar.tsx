import { useEffect } from "react";
import {
  LayoutDashboard, BookOpen, UserCheck, Star, BarChart3,
  LogOut, GraduationCap, Settings, MessageSquare
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRole } from "@/contexts/RoleContext";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/teacher" },
  { icon: UserCheck, label: "Attendance", href: "/teacher/attendance" },
  { icon: BookOpen, label: "My Classes", href: "/teacher/classes" },
  { icon: Star, label: "Assignments", href: "/teacher" },
  { icon: BarChart3, label: "Analytics", href: "/teacher/analytics" },
  { icon: MessageSquare, label: "Messages", href: "/teacher/chat" },
  { icon: Settings, label: "Settings", href: "/teacher/settings" },
];

interface TeacherSidebarProps {
  activePage?: string;
}

const accentColorMap: Record<number, string> = {
  0: "38 92% 50%",
  1: "217 91% 60%",
  2: "160 84% 39%",
  3: "262 83% 58%",
  4: "350 89% 60%",
  5: "180 72% 42%",
  6: "243 75% 59%",
  7: "199 89% 48%",
  8: "16 90% 55%",
  9: "192 91% 43%",
  10: "84 75% 42%",
};

const TeacherSidebar = ({ activePage = "Dashboard" }: TeacherSidebarProps) => {
  const { switchRole } = useRole();
  const navigate = useNavigate();
  const { profile } = useTeacherProfile();

  useEffect(() => {
    const stored = localStorage.getItem("teacher-accent-index");
    if (stored === null) {
      localStorage.setItem("teacher-accent-index", "0");
    }
    const index = stored !== null ? parseInt(stored, 10) : 0;
    const hsl = accentColorMap[index] ?? accentColorMap[0];
    const applyColor = () => {
      const el = document.querySelector<HTMLElement>(".teacher-theme");
      if (!el) return;
      el.style.setProperty("--primary", hsl);
      el.style.setProperty("--ring", hsl);
      el.style.setProperty("--sidebar-primary", hsl);
      el.style.setProperty("--sidebar-accent", hsl);
      el.style.setProperty("--sidebar-accent-foreground", hsl);
      el.style.setProperty("--teacher-glow", hsl);
    };
    applyColor();
    requestAnimationFrame(applyColor);
  }, []);

  // Once profile loads from DB, override with the DB value
  useEffect(() => {
    if (!profile || typeof profile.accentColorIndex !== "number") return;
    const hsl = accentColorMap[profile.accentColorIndex] ?? accentColorMap[0];
    localStorage.setItem("teacher-accent-index", String(profile.accentColorIndex));
    const el = document.querySelector<HTMLElement>(".teacher-theme");
    if (!el) return;
    el.style.setProperty("--primary", hsl);
    el.style.setProperty("--ring", hsl);
    el.style.setProperty("--sidebar-primary", hsl);
    el.style.setProperty("--sidebar-accent", hsl);
    el.style.setProperty("--sidebar-accent-foreground", hsl);
    el.style.setProperty("--teacher-glow", hsl);
  }, [profile]);

  const handleSwitchToStudent = () => {
    switchRole("student");
    navigate("/");
  };

  return (
    <aside className="w-64 h-screen flex-shrink-0 border-r border-border bg-card/80 backdrop-blur-xl flex flex-col sticky top-0 teacher-sidebar-glossy teacher-shimmer">
      <div className="p-6 flex items-center gap-3 relative z-10">
        <motion.div
          className="bg-primary rounded-xl p-2 text-primary-foreground shadow-lg shadow-primary/25 teacher-avatar-glow"
          whileHover={{ scale: 1.08, rotate: -3 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <GraduationCap className="w-6 h-6" />
        </motion.div>
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">ULAB One</h1>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto relative z-10">
        {navItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
          >
            <Link
              to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm ${
                activePage === item.label
                  ? "teacher-nav-active text-primary font-semibold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.15 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <item.icon className="w-5 h-5" />
              </motion.div>
              <span>{item.label}</span>
              {activePage === item.label && (
                <motion.div
                  layoutId="teacher-active-dot"
                  className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_hsl(38_92%_50%/0.5)]"
                />
              )}
            </Link>
          </motion.div>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-3 relative z-10">
        <div className="flex items-center gap-3 px-2">
          <motion.div
            className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs teacher-avatar-glow"
            whileHover={{ scale: 1.05 }}
          >
            {profile ? getInitials(profile.name) : "--"}
          </motion.div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-foreground truncate">{profile?.name ?? "Loading..."}</span>
            <span className="text-xs text-muted-foreground">{profile?.department ?? "Faculty"}</span>
          </div>
        </div>
        <motion.button
          onClick={() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("ulab-role");
            navigate("/teacher/login");
          }}
          className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 text-sm font-semibold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </motion.button>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
