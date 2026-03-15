import { useState, useCallback } from "react";
import { Search, Filter, PlusCircle, FileText, Upload, Eye, Clock, Plus, Sparkles, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/student/Sidebar";
import Header from "@/components/student/Header";
import BottomNav from "@/components/student/BottomNav";
import MobileNotesLibrary from "@/components/notes/MobileNotesLibrary";
import { useIsMobile } from "@/hooks/use-mobile";
import { coursesData, subjects } from "@/data/coursesData";
export { coursesData } from "@/data/coursesData";
export type { CourseNotes, NoteItem } from "@/data/coursesData";

const ImageWithSkeleton = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [loaded, setLoaded] = useState(false);
  const onLoad = useCallback(() => setLoaded(true), []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {!loaded && (
        <div className="absolute inset-0 skeleton-premium">
          {/* Layered gradient base */}
          <div className="absolute inset-0 bg-gradient-to-br from-secondary via-muted to-secondary" />
          {/* Animated wave shimmer */}
          <div className="absolute inset-0 animate-[skeleton-wave_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-primary/[0.07] to-transparent" style={{ backgroundSize: '200% 100%' }} />
          {/* Glowing sweep */}
          <div className="absolute inset-0 animate-[skeleton-sweep_2.5s_ease-in-out_infinite]">
            <div className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-card/60 to-transparent blur-sm" />
          </div>
          {/* Placeholder icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-primary/[0.06] flex items-center justify-center animate-pulse">
              <svg className="w-6 h-6 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
            </div>
          </div>
          {/* Bottom shimmer bars */}
          <div className="absolute bottom-3 left-3 right-3 space-y-2">
            <div className="h-2 w-2/3 rounded-full bg-primary/[0.06] animate-pulse" />
            <div className="h-2 w-1/3 rounded-full bg-primary/[0.04] animate-pulse" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-700 ease-out ${loaded ? "opacity-100" : "opacity-0"}`}
        onLoad={onLoad}
      />
    </div>
  );
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

const NotesLibrary = () => {
  const [activeSubject, setActiveSubject] = useState("All Departments");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        <MobileNotesLibrary />
        <BottomNav />
      </>
    );
  }

  const filteredCourses = coursesData.filter((course) => {
    const matchesSubject = activeSubject === "All Departments" || course.department === activeSubject;
    const matchesSearch =
      searchQuery === "" ||
      course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">
        <Sidebar activePage="Notes Library" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="hidden md:block">
          <Header />
        </div>
        

        <main className="flex-1 overflow-y-auto bg-secondary/30">
          <div className="p-4 md:p-8 lg:p-10 max-w-6xl mx-auto flex flex-col gap-6 md:gap-8">
            {/* Hero Header */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-stat-amber" />
                  <span className="text-xs font-bold uppercase tracking-widest text-stat-amber">Peer-powered learning</span>
                </div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-foreground">
                  University Notes Library
                </h1>
                <p className="text-muted-foreground max-w-lg">
                  Access curated academic resources shared by top students and faculty. Vote for the best notes.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-all hover:shadow-sm">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button className="group flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.03] active:scale-95 transition-all">
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Upload New Notes</span>
                </button>
              </div>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="relative"
            >
              <div className="flex h-12 items-center rounded-2xl bg-card border border-border px-4 shadow-sm focus-within:shadow-md focus-within:border-primary/30 transition-all">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <input
                  className="flex-1 border-none bg-transparent text-base focus:ring-0 focus:outline-none placeholder:text-muted-foreground ml-3"
                  placeholder="Search by course name or code..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </motion.div>

            {/* Subject Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1"
            >
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setActiveSubject(subject)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    activeSubject === subject
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground hover:shadow-sm"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </motion.div>

            {/* Stats Bar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex items-center gap-6 px-1"
            >
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-stat-emerald" />
                <span><strong className="text-foreground">{filteredCourses.length}</strong> courses available</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4 text-stat-blue" />
                <span><strong className="text-foreground">{filteredCourses.reduce((s, c) => s + c.noteCount, 0)}</strong> total notes</span>
              </div>
            </motion.div>

            {/* Course Cards Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubject}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="group flex flex-col rounded-2xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 transition-all duration-300"
                  >
                    {/* Image Header */}
                    <div className="relative h-44 overflow-hidden bg-secondary">
                      <ImageWithSkeleton
                        src={course.image}
                        alt={course.courseName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                      <div className={`absolute top-3 left-3 ${course.badgeColor} rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm`}>
                        {course.departmentShort}
                      </div>
                      {/* Note count pill on image */}
                      <div className="absolute bottom-3 right-3 bg-card/90 backdrop-blur-sm rounded-full px-3 py-1 text-[11px] font-bold text-foreground shadow-sm flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {course.noteCount}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors duration-200">
                          {course.courseName}
                        </h3>
                        <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-lg px-2.5 py-1 border border-primary/10">
                          {course.courseCode}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-5">
                        <Clock className="w-3.5 h-3.5" />
                        {course.lastUpdated}
                      </div>

                      <div className="mt-auto flex gap-2">
                        <button
                          onClick={() => navigate(`/notes/${course.id}`)}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-bold hover:bg-primary/90 shadow-sm hover:shadow-md hover:shadow-primary/15 active:scale-[0.97] transition-all duration-200"
                        >
                          <Eye className="w-4 h-4" />
                          View Notes
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border text-muted-foreground py-2.5 text-sm font-medium hover:bg-secondary hover:text-foreground hover:border-primary/20 active:scale-[0.97] transition-all duration-200">
                          <Upload className="w-4 h-4" />
                          Upload
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Request a Course Card */}
                <motion.div
                  custom={filteredCourses.length}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border p-8 text-center hover:border-primary/40 hover:bg-primary/[0.02] transition-all duration-300 cursor-pointer min-h-[300px]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                    <PlusCircle className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">Request a Course</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">Don't see your course? Let us know!</p>
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {filteredCourses.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20 text-muted-foreground"
              >
                <FileText className="w-14 h-14 mx-auto mb-4 opacity-30" />
                <p className="font-bold text-lg text-foreground">No courses found</p>
                <p className="text-sm mt-1">Try a different search or department filter.</p>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
};

export default NotesLibrary;
