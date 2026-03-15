import { useState } from "react";
import { Search, Upload, ChevronUp, ChevronDown, MessageSquare, Bookmark, Filter, ArrowLeft, Cpu, Binary, BookOpen, Zap, Brain, Calculator } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { coursesData } from "@/data/coursesData";
import MobileMenuDrawer from "@/components/student/MobileMenuDrawer";

const courseIcons: Record<string, React.ReactNode> = {
  "Computer Science": <Cpu className="w-5 h-5 text-primary" />,
  "Business Administration": <BookOpen className="w-5 h-5 text-primary" />,
  "English": <BookOpen className="w-5 h-5 text-primary" />,
  "Electrical Engineering": <Zap className="w-5 h-5 text-primary" />,
  "Psychology": <Brain className="w-5 h-5 text-primary" />,
  "Mathematics": <Calculator className="w-5 h-5 text-primary" />,
};

const tabs = ["Courses", "Recents", "Bookmarks"];

// Top rated notes across all courses
const topRatedNotes = coursesData
  .flatMap((course) =>
    course.notes.map((note) => ({
      ...note,
      courseName: course.courseName,
      courseCode: course.courseCode,
      courseId: course.id,
    }))
  )
  .sort((a, b) => b.votes - a.votes)
  .slice(0, 5);

const avatarColors = [
  "bg-stat-blue/20 text-stat-blue",
  "bg-stat-emerald/20 text-stat-emerald",
  "bg-stat-purple/20 text-stat-purple",
  "bg-stat-amber/20 text-stat-amber",
];

const MobileNotesLibrary = () => {
  const [activeTab, setActiveTab] = useState("Courses");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredCourses = coursesData.filter(
    (course) =>
      searchQuery === "" ||
      course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-secondary/30">
      {/* Header */}
      <div className="flex items-center bg-card p-4 pb-2 justify-between sticky top-0 z-10 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center rounded-full w-10 h-10 text-primary hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-primary text-lg font-bold tracking-tight flex-1 text-center">
          Notes Library
        </h2>
        <MobileMenuDrawer activePage="Notes Library" />
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 bg-card">
        <div className="flex items-center h-12 w-full rounded-xl bg-primary/5 border border-primary/10 px-4 gap-2">
          <Search className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            className="flex-1 bg-transparent text-base focus:outline-none placeholder:text-muted-foreground"
            placeholder="Search courses or topics"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border-b border-border">
        <div className="flex px-4 gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center justify-center pb-3 pt-4 border-b-[3px] transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              <span className="text-sm font-bold tracking-wide">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {activeTab === "Courses" && (
            <motion.div
              key="courses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Enrolled Courses */}
              <div className="px-4 py-6">
                <h3 className="text-primary text-xl font-bold mb-4">Your Enrolled Courses</h3>
                <div className="grid gap-3">
                  {filteredCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="bg-card p-4 rounded-xl shadow-sm border border-border"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-foreground font-bold text-lg leading-tight">
                            {course.courseName}
                          </h4>
                          <p className="text-muted-foreground text-sm mt-1">
                            {course.courseCode} • {course.noteCount} Notes
                          </p>
                        </div>
                        <div className="bg-primary/10 p-2.5 rounded-lg">
                          {courseIcons[course.department] || <BookOpen className="w-5 h-5 text-primary" />}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/notes/${course.id}`)}
                          className="flex-1 bg-primary text-primary-foreground py-2.5 px-4 rounded-lg font-semibold text-sm active:scale-[0.97] transition-all"
                        >
                          View Library
                        </button>
                        <button className="flex items-center justify-center w-12 bg-primary/10 text-primary py-2.5 rounded-lg active:scale-[0.95] transition-all">
                          <Upload className="w-5 h-5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Top Rated Notes */}
              <div className="px-4 py-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-primary text-xl font-bold">Top Rated Notes</h3>
                  <button className="text-primary text-sm font-semibold flex items-center gap-1">
                    Filter <Filter className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {topRatedNotes.map((note, index) => {
                    const initials = note.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("");
                    const colorClass = avatarColors[index % avatarColors.length];

                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.05, duration: 0.3 }}
                        className="bg-card rounded-xl p-4 flex gap-3 border border-border"
                        onClick={() => navigate(`/notes/${note.courseId}`)}
                      >
                        {/* Vote Column */}
                        <div className="flex flex-col items-center justify-center bg-primary/5 rounded-lg px-2 py-1 h-fit">
                          <button className="text-muted-foreground hover:text-primary transition-colors">
                            <ChevronUp className="w-5 h-5" />
                          </button>
                          <span className="text-xs font-bold text-primary">{note.votes}</span>
                          <button className="text-muted-foreground hover:text-destructive transition-colors">
                            <ChevronDown className="w-5 h-5" />
                          </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-6 h-6 rounded-full ${colorClass} flex items-center justify-center`}>
                              <span className="text-[10px] font-bold">{initials}</span>
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground truncate">
                              Posted by u/{note.author.replace(" ", "_")} • {note.date}
                            </span>
                          </div>
                          <h5 className="text-foreground font-semibold leading-snug text-sm">
                            {note.title}
                          </h5>
                          <div className="flex items-center gap-3 mt-3">
                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>{Math.floor(Math.random() * 30) + 5}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground text-xs">
                              <Bookmark className="w-3.5 h-3.5" />
                              <span>Save</span>
                            </div>
                            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto truncate max-w-[120px]">
                              {note.courseName}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "Recents" && (
            <motion.div
              key="recents"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-12 text-center text-muted-foreground"
            >
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold text-foreground">No recent notes</p>
              <p className="text-sm mt-1">Notes you view will appear here.</p>
            </motion.div>
          )}

          {activeTab === "Bookmarks" && (
            <motion.div
              key="bookmarks"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-4 py-12 text-center text-muted-foreground"
            >
              <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold text-foreground">No bookmarked notes</p>
              <p className="text-sm mt-1">Save notes to find them quickly later.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MobileNotesLibrary;
