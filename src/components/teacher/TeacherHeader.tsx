import { Search, Bell, Settings } from "lucide-react";

const TeacherHeader = () => {
  return (
    <header className="h-16 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-8 flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full bg-secondary/70 border border-border/50 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-card transition-all duration-200 outline-none placeholder:text-muted-foreground"
            placeholder="Search students, courses or files..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2.5 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl relative transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card animate-pulse" />
        </button>
        <button className="p-2.5 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl transition-all duration-200">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default TeacherHeader;
