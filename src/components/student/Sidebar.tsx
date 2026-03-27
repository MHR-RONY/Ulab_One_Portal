import { BookOpen, Calendar, FileText, MessageSquare, Users, ClipboardCheck, User, Settings, LogOut, GraduationCap } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";

const navItems = [
  { icon: BookOpen, label: "Dashboard", href: "/" },
  { icon: Calendar, label: "Schedule Builder", href: "/schedule" },
  { icon: FileText, label: "Notes Library", href: "/notes" },
  { icon: MessageSquare, label: "Messages", href: "/chat" },
  { icon: Users, label: "Group Chat", href: "/chat" },
  { icon: ClipboardCheck, label: "Attendance Tracker", href: "/attendance" },
];

const bottomItems = [
  { icon: User, label: "My Profile", href: "/profile" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

interface SidebarProps {
  activePage?: string;
}

const Sidebar = ({ activePage = "Dashboard" }: SidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore errors — still clear local session
    }
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <aside className="w-72 h-screen flex-shrink-0 border-r border-border bg-card/80 backdrop-blur-xl flex flex-col sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary rounded-xl p-2 text-primary-foreground shadow-lg shadow-primary/20">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-primary">ULAB One</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
          >
            <Link
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                activePage === item.label
                  ? "bg-primary/10 text-primary font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-0.5"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          </motion.div>
        ))}

        <div className="pt-4 pb-2">
          <div className="h-px bg-border mx-4" />
        </div>

        {bottomItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.04, duration: 0.3 }}
          >
            <Link
              to={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                activePage === item.label
                  ? "bg-primary/10 text-primary font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-0.5"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          </motion.div>
        ))}
      </nav>

      <div className="p-4 border-t border-border space-y-2">
        <button className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/5 transition-all duration-200 hover:translate-x-0.5" onClick={handleLogout}>
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
