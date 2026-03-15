import {
  LayoutDashboard, BookOpen, UserCheck, Star, BarChart3,
  LogOut, GraduationCap, Settings, MessageSquare
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useRole } from "@/contexts/RoleContext";

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

const TeacherSidebar = ({ activePage = "Dashboard" }: TeacherSidebarProps) => {
  const { switchRole } = useRole();
  const navigate = useNavigate();

  const handleSwitchToStudent = () => {
    switchRole("student");
    navigate("/");
  };

  return (
    <aside className="w-64 h-screen flex-shrink-0 border-r border-border bg-card/80 backdrop-blur-xl flex flex-col sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary rounded-xl p-2 text-primary-foreground shadow-lg shadow-primary/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight text-foreground">ULAB One</h1>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
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
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-primary/10">
            AI
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-foreground truncate">Dr. Ariful Islam</span>
            <span className="text-xs text-muted-foreground">Senior Lecturer</span>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200 text-sm font-semibold"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default TeacherSidebar;
