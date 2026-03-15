import { useState } from "react";
import { Phone, Video, Info, PlusCircle, Image, Smile, Send, ArrowLeft, CheckCheck, Paperclip } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ChatThreadProps {
  onBack: () => void;
}

const ChatThread = ({ onBack }: ChatThreadProps) => {
  const [message, setMessage] = useState("");

  return (
    <>
      {/* Thread Header */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-4 md:px-6 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-muted-foreground hover:text-primary transition-colors mr-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-sm">
            PA
          </div>
          <div>
            <h3 className="text-sm font-bold leading-none text-foreground">Prof. Ahmed</h3>
            <p className="text-[11px] text-emerald-500 font-medium">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground hover:text-primary transition-colors"><Phone className="w-5 h-5" /></button>
          <button className="text-muted-foreground hover:text-primary transition-colors"><Video className="w-5 h-5" /></button>
          <button className="text-muted-foreground hover:text-primary transition-colors"><Info className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* Date Separator */}
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-border" />
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Today</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Received Message */}
        <div className="flex items-end gap-3 max-w-[85%] md:max-w-[80%]">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-semibold shrink-0 mb-1">
            PA
          </div>
          <div>
            <div className="bg-card p-3 rounded-2xl rounded-bl-none shadow-sm border border-border">
              <p className="text-sm text-foreground">Hello Everyone, just a reminder that the Final Project submission folder is open in Moodle.</p>
            </div>
            <span className="text-[10px] text-muted-foreground ml-1 mt-1 block">10:42 AM</span>
          </div>
        </div>

        {/* Received Message (continuation) */}
        <div className="flex items-end gap-3 max-w-[85%] md:max-w-[80%]">
          <div className="w-8 h-8 shrink-0 mb-1 opacity-0" />
          <div>
            <div className="bg-card p-3 rounded-2xl rounded-bl-none shadow-sm border border-border">
              <p className="text-sm text-foreground">Please submit the assignment by midnight tonight. No late submissions will be accepted.</p>
            </div>
            <span className="text-[10px] text-muted-foreground ml-1 mt-1 block">10:43 AM</span>
          </div>
        </div>

        {/* Sent Message */}
        <div className="flex items-end gap-3 max-w-[85%] md:max-w-[80%] ml-auto flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold shrink-0 mb-1">
            AR
          </div>
          <div className="flex flex-col items-end">
            <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-br-none shadow-md">
              <p className="text-sm">Thank you, Professor. I've already uploaded my zip file. Could you please confirm if it's readable?</p>
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[10px] text-muted-foreground">10:45 AM</span>
              <CheckCheck className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
        </div>

        {/* Typing Indicator */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs font-semibold shrink-0">
            PA
          </div>
          <div className="flex gap-1 bg-card px-3 py-2 rounded-full border border-border">
            <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-pulse" />
            <div className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-pulse [animation-delay:75ms]" />
            <div className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-pulse [animation-delay:150ms]" />
          </div>
        </div>
      </div>

      {/* Message Input Area */}
      <div className="p-4 md:p-6 bg-card border-t border-border">
        <div className="flex items-end gap-2 md:gap-4 bg-primary/5 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <div className="flex items-center gap-1 px-1 md:px-2 pb-1">
            <button className="h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
              <PlusCircle className="w-5 h-5" />
            </button>
            <button className="hidden md:flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-primary transition-colors">
              <Image className="w-5 h-5" />
            </button>
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm py-3 resize-none text-foreground placeholder:text-muted-foreground"
            placeholder="Type a message to Prof. Ahmed..."
            rows={1}
          />
          <div className="flex items-center gap-1 px-1 md:px-2 pb-1">
            <button className="hidden md:flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-primary transition-colors">
              <Smile className="w-5 h-5" />
            </button>
            <button className="h-10 w-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 transition-transform active:scale-95">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-2 flex justify-between items-center px-2">
          <p className="text-[10px] text-muted-foreground hidden md:block">Shift + Enter for new line</p>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Paperclip className="w-3 h-3" /> Projects_Notes.pdf
          </span>
        </div>
      </div>
    </>
  );
};

export default ChatThread;
