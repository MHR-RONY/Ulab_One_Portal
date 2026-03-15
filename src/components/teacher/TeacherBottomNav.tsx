import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, CalendarDays, User, Plus } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", href: "/teacher" },
  { icon: BookOpen, label: "Courses", href: "/teacher/classes" },
  { icon: CalendarDays, label: "Schedule", href: "/teacher/settings" },
  { icon: User, label: "Profile", href: "/teacher/profile" },
];

const TeacherBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border px-4 pb-6 pt-2 z-50">
      <div className="flex items-center justify-between">
        {navItems.slice(0, 2).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.label} to={item.href} className={`flex flex-col items-center gap-1 flex-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Center FAB */}
        <div className="flex flex-col items-center gap-1 flex-1">
          <button className="bg-primary size-12 rounded-full flex items-center justify-center -mt-8 shadow-lg shadow-primary/30 text-primary-foreground">
            <Plus className="w-6 h-6" />
          </button>
          <span className="text-[10px] font-medium text-muted-foreground mt-1">Actions</span>
        </div>

        {navItems.slice(2).map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.label} to={item.href} className={`flex flex-col items-center gap-1 flex-1 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default TeacherBottomNav;
