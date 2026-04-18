import { FileText, Download } from "lucide-react";
import { motion } from "framer-motion";
import { useRecentNotes } from "@/hooks/useStudentNotes";
import { useNavigate } from "react-router-dom";

const COLOR_CLASSES = [
  "text-destructive bg-destructive/10",
  "text-stat-blue bg-stat-blue/10",
  "text-stat-amber bg-stat-amber/10",
];

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 172800) return "Yesterday";
  return `${Math.floor(diff / 86400)}d ago`;
}

const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://localhost:5003";

/**
 * Fetches the file with credentials and triggers a real browser download.
 * The simple <a download> attribute is blocked for cross-origin URLs.
 */
async function downloadFile(fileUrl: string, title: string) {
  try {
    const absUrl = `${BASE_URL}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
    const response = await fetch(absUrl, { credentials: "include" });
    if (!response.ok) throw new Error("Failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = title + ".pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    window.open(`${BASE_URL}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`, "_blank");
  }
}

const RecentResources = () => {
  const { notes, loading } = useRecentNotes();
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="glass-card bg-card rounded-2xl border border-border overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-bold text-foreground tracking-tight">Recent Resources</h3>
      </div>

      <div className="p-4 space-y-2">
        {loading ? (
          // Skeleton state
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-36 bg-muted rounded" />
                <div className="h-2 w-24 bg-muted/60 rounded" />
              </div>
              <div className="w-5 h-5 rounded bg-muted" />
            </div>
          ))
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No approved notes yet.</p>
        ) : (
          notes.map((note, i) => {
            const truncated = note.title.length > 20 ? note.title.slice(0, 20) + "..." : note.title;
            return (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.06, duration: 0.3 }}
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 p-3 hover:bg-secondary/70 rounded-xl transition-all duration-200 cursor-pointer group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${COLOR_CLASSES[i % COLOR_CLASSES.length]}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{truncated}</p>
                  <p className="text-xs text-muted-foreground">
                    {note.fileSize} • {timeAgo(note.createdAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); downloadFile(note.fileUrl, note.title); }}
                  className="shrink-0"
                  title="Download"
                >
                  <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              </motion.div>
            );
          })
        )}
      </div>

      <div className="p-4 bg-secondary/30 text-center border-t border-border">
        <button
          onClick={() => navigate("/notes-library")}
          className="text-sm font-bold text-primary hover:text-primary/80 transition-colors"
        >
          View all Library
        </button>
      </div>
    </motion.div>
  );
};

export default RecentResources;
