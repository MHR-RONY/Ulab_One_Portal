import { Home, BookOpen, Calendar, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: BookOpen, label: "Courses", href: "/notes" },
  { icon: Calendar, label: "Schedule", href: "/schedule" },
  { icon: User, label: "Profile", href: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20">
      <div className="flex border-t border-border/50 bg-card/80 backdrop-blur-xl px-4 pb-6 pt-3 shadow-[0_-4px_20px_-4px_hsl(0_0%_0%/0.06)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.label}
              to={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 transition-all duration-200 ${
                isActive ? "text-primary scale-105" : "text-muted-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${isActive ? "bg-primary/10" : ""}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider">{item.label}</p>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
