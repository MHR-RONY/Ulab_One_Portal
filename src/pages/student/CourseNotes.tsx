import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronUp, ChevronDown, Eye, Download, FileText, Upload, Trophy } from "lucide-react";
import Sidebar from "@/components/student/Sidebar";
import Header from "@/components/student/Header";
import BottomNav from "@/components/student/BottomNav";
import MobileHeader from "@/components/student/MobileHeader";
import { coursesData, NoteItem } from "./NotesLibrary";

const CourseNotes = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = coursesData.find((c) => c.id === courseId);

  const [notes, setNotes] = useState<NoteItem[]>(() =>
    course ? [...course.notes].sort((a, b) => b.votes - a.votes) : []
  );

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-bold text-foreground">Course not found</p>
          <button onClick={() => navigate("/notes")} className="mt-4 text-sm text-primary font-medium hover:underline">
            ← Back to Notes Library
          </button>
        </div>
      </div>
    );
  }

  const handleVote = (noteId: string, direction: 1 | -1) => {
    setNotes((prev) => {
      const updated = prev.map((note) => {
        if (note.id !== noteId) return note;
        let newVote: 0 | 1 | -1 = direction;
        let voteDelta: number = direction;
        if (note.userVote === direction) {
          newVote = 0;
          voteDelta = -direction;
        } else if (note.userVote === (direction === 1 ? -1 : 1)) {
          voteDelta = direction * 2;
        }
        return { ...note, votes: note.votes + voteDelta, userVote: newVote };
      });
      return [...updated].sort((a, b) => b.votes - a.votes);
    });
  };

  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="w-4 h-4 text-amber-500" />;
    if (index === 1) return <Trophy className="w-4 h-4 text-slate-400" />;
    if (index === 2) return <Trophy className="w-4 h-4 text-amber-700" />;
    return <span className="text-xs font-bold text-muted-foreground w-4 text-center">#{index + 1}</span>;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">
        <Sidebar activePage="Notes Library" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="hidden md:block">
          <Header />
        </div>
        <MobileHeader />

        <main className="flex-1 overflow-y-auto bg-secondary/30">
          <div className="p-4 md:p-8 lg:p-10 max-w-4xl mx-auto flex flex-col gap-6">
            {/* Back + Title */}
            <div>
              <button
                onClick={() => navigate("/notes")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Notes Library
              </button>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{course.courseCode}</p>
                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground">{course.courseName}</h1>
                  <p className="text-muted-foreground mt-1">{course.noteCount} notes shared by students • Vote for the best ones!</p>
                </div>
                <button className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>Upload Note</span>
                </button>
              </div>
            </div>

            {/* Notes List */}
            <div className="flex flex-col gap-3">
              {notes.map((note, index) => (
                <div
                  key={note.id}
                  className="flex gap-3 md:gap-4 rounded-xl bg-card border border-border p-4 shadow-sm hover:shadow-md transition-all"
                >
                  {/* Vote Column */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0 pt-1">
                    <button
                      onClick={() => handleVote(note.id, 1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                        note.userVote === 1
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:bg-secondary hover:text-primary"
                      }`}
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <span className={`text-sm font-bold tabular-nums ${note.userVote === 1 ? "text-primary" : note.userVote === -1 ? "text-destructive" : "text-foreground"}`}>
                      {note.votes}
                    </span>
                    <button
                      onClick={() => handleVote(note.id, -1)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                        note.userVote === -1
                          ? "bg-destructive/15 text-destructive"
                          : "text-muted-foreground hover:bg-secondary hover:text-destructive"
                      }`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getRankBadge(index)}
                      <h3 className="font-bold text-foreground truncate">{note.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{note.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="font-medium">{note.author}</span>
                      <span>{note.date}</span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {note.fileType} • {note.fileSize}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 shrink-0">
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors" title="Preview">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors" title="Download">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {notes.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-semibold">No notes yet for this course</p>
                <p className="text-sm mt-1">Be the first to upload!</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default CourseNotes;
