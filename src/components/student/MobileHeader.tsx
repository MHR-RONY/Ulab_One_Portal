import { Bell } from "lucide-react";
import MobileMenuDrawer from "@/components/student/MobileMenuDrawer";

interface MobileHeaderProps {
  studentName?: string;
}

const MobileHeader = ({ studentName }: MobileHeaderProps) => {
  const firstName = studentName?.split(" ")[0] ?? "there";
  const initials = studentName
    ? studentName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "..";

  return (
    <header className="md:hidden flex items-center justify-between p-4 bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm ring-2 ring-primary/10">
          {initials}
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">Welcome back,</span>
          <h2 className="text-foreground text-lg font-bold leading-tight">{firstName}</h2>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button className="flex items-center justify-center rounded-xl h-10 w-10 bg-secondary/70 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card animate-pulse" />
        </button>
        <MobileMenuDrawer activePage="Dashboard" />
      </div>
    </header>
  );
};

export default MobileHeader;
