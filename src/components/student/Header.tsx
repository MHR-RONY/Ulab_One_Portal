import { Search, Bell, HelpCircle } from "lucide-react";

const Header = () => {
  return (
    <header className="h-20 bg-card/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-8 flex-shrink-0">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            className="w-full bg-secondary/70 border border-border/50 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-card transition-all duration-200 outline-none placeholder:text-muted-foreground"
            placeholder="Search courses, notes, or messages..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6 ml-8">
        <div className="flex items-center gap-1.5">
          <button className="p-2.5 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl relative transition-all duration-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-card animate-pulse" />
          </button>
          <button className="p-2.5 text-muted-foreground hover:bg-secondary hover:text-foreground rounded-xl transition-all duration-200">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="flex items-center gap-3 cursor-pointer hover:bg-secondary/70 p-2 rounded-xl transition-all duration-200">
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">Alex Thompson</p>
            <p className="text-[11px] text-muted-foreground font-medium">ID: 21-0423-1</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm ring-2 ring-primary/10">
            AT
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
