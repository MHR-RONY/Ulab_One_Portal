import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, ArrowRight, ArrowLeft, Clock, Star, User, BookOpen, ChevronRight, GraduationCap, CheckCircle2, Sun, Moon, Sparkles, Plus, Shuffle, Zap, Save, PlusCircle, Info, Check, Building2, HelpCircle, Coffee, SlidersHorizontal, Scale } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Sidebar from "@/components/student/Sidebar";
import BottomNav from "@/components/student/BottomNav";
import MobileMenuDrawer from "@/components/student/MobileMenuDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, AnimatePresence } from "framer-motion";

interface Course {
  id: string;
  code: string;
  title: string;
  type: "Required" | "Elective";
  department: string;
  credits: number;
  category?: string;
}

interface Section {
  id: string;
  label: string;
  instructor: string;
  days: string;
  time: string;
  seats: number;
  totalSeats: number;
  status: "Available" | "Filling Fast" | "Full";
  room: string;
  building: string;
}

interface Instructor {
  name: string;
  title: string;
  department: string;
  rating: number;
  reviews: number;
  experience: number;
  bio: string;
}

const availableCourses: Course[] = [
  { id: "1", code: "CSE101", title: "Introduction to Computer Science", type: "Required", department: "School of Science & Engineering", credits: 3.0, category: "Engineering" },
  { id: "2", code: "MAT202", title: "Discrete Mathematics", type: "Required", department: "Department of Mathematics", credits: 4.0, category: "Engineering" },
  { id: "3", code: "PSY105", title: "Cognitive Psychology Foundations", type: "Elective", department: "Humanities & Social Sciences", credits: 3.0, category: "Arts" },
  { id: "4", code: "ENG210", title: "Technical Writing & Comm.", type: "Elective", department: "Humanities & Social Sciences", credits: 2.0, category: "Arts" },
  { id: "5", code: "CSE205", title: "Data Structures & Algorithms", type: "Required", department: "School of Science & Engineering", credits: 4.0, category: "Engineering" },
  { id: "6", code: "ART101", title: "History of Modern Art", type: "Elective", department: "Liberal Arts", credits: 3.0, category: "Arts" },
  { id: "7", code: "BUS201", title: "Principles of Marketing", type: "Elective", department: "Business School", credits: 4.0, category: "Business" },
];

const sectionsData: Record<string, Section[]> = {
  "1": [
    { id: "s1", label: "S1", instructor: "Dr. Ahmed", days: "Mon, Wed", time: "08:00 - 09:30", seats: 12, totalSeats: 35, status: "Available", room: "Room 402", building: "Science Bldg" },
    { id: "s2", label: "S2", instructor: "Ms. Sarah Jenkins", days: "Tue, Thu", time: "11:00 - 12:30", seats: 3, totalSeats: 40, status: "Filling Fast", room: "Room 105", building: "Main Hall" },
    { id: "s3", label: "S3", instructor: "Dr. Robert Chen", days: "Fri", time: "14:00 - 17:00", seats: 0, totalSeats: 30, status: "Full", room: "Room 312", building: "Lab Center" },
    { id: "s4", label: "S4", instructor: "Prof. Emily Davis", days: "Mon, Wed", time: "04:00 - 05:30", seats: 8, totalSeats: 40, status: "Available", room: "Room 201", building: "Arts Wing" },
    { id: "s5", label: "S5", instructor: "Dr. Ali Hassan", days: "Tue, Thu", time: "10:00 - 11:30", seats: 30, totalSeats: 40, status: "Available", room: "Room 118", building: "Tech Block" },
  ],
  "2": [
    { id: "s6", label: "S1", instructor: "Prof. Williams", days: "Mon, Wed", time: "09:00 - 10:30", seats: 18, totalSeats: 35, status: "Available", room: "Room 305", building: "Math Bldg" },
    { id: "s7", label: "S2", instructor: "Dr. Nadia Rahman", days: "Sun, Tue", time: "01:00 - 02:30", seats: 5, totalSeats: 35, status: "Filling Fast", room: "Room 210", building: "Main Hall" },
  ],
  "3": [
    { id: "s8", label: "S1", instructor: "Ms. Thompson", days: "Mon, Wed", time: "10:00 - 11:30", seats: 22, totalSeats: 30, status: "Available", room: "Room 104", building: "Humanities" },
    { id: "s9", label: "S2", instructor: "Dr. James Lee", days: "Sun, Tue", time: "11:30 - 01:00", seats: 15, totalSeats: 30, status: "Available", room: "Room 207", building: "Library" },
  ],
};

const instructorsData: Record<string, Instructor> = {
  "Dr. Ahmed": { name: "Dr. Ahmed", title: "Associate Professor", department: "Dept. of Computer Science & Engineering", rating: 4.8, reviews: 212, experience: 12, bio: "Specializes in Distributed Systems and Cloud Computing. Received PhD from MIT in 2010. Known for practical lab-based teaching approach." },
  "Ms. Sarah Jenkins": { name: "Ms. Sarah Jenkins", title: "Lecturer", department: "Dept. of Computer Science & Engineering", rating: 4.5, reviews: 98, experience: 6, bio: "Expert in Software Engineering and Web Development. Passionate about project-based learning." },
  "Dr. Robert Chen": { name: "Dr. Robert Chen", title: "Assistant Professor", department: "Dept. of Computer Science & Engineering", rating: 4.3, reviews: 67, experience: 4, bio: "Focuses on AI and Machine Learning. Recently published in top-tier conferences." },
  "Prof. Emily Davis": { name: "Prof. Emily Davis", title: "Professor", department: "Dept. of Computer Science & Engineering", rating: 4.9, reviews: 340, experience: 20, bio: "Pioneer in Database Systems. Has authored 3 textbooks used internationally." },
  "Dr. Ali Hassan": { name: "Dr. Ali Hassan", title: "Associate Professor", department: "Dept. of Computer Science & Engineering", rating: 4.6, reviews: 155, experience: 9, bio: "Specializes in Cybersecurity and Network Systems. Industry consultant." },
  "Prof. Williams": { name: "Prof. Williams", title: "Professor", department: "Dept. of Mathematics", rating: 4.7, reviews: 280, experience: 18, bio: "Award-winning educator in Applied Mathematics and Calculus." },
  "Dr. Nadia Rahman": { name: "Dr. Nadia Rahman", title: "Assistant Professor", department: "Dept. of Mathematics", rating: 4.4, reviews: 72, experience: 5, bio: "Researcher in Pure Mathematics with focus on Number Theory." },
  "Ms. Thompson": { name: "Ms. Thompson", title: "Senior Lecturer", department: "Dept. of English", rating: 4.6, reviews: 190, experience: 10, bio: "Published author and composition specialist. Mentors student writers." },
  "Dr. James Lee": { name: "Dr. James Lee", title: "Associate Professor", department: "Dept. of English", rating: 4.2, reviews: 88, experience: 7, bio: "Focuses on academic writing and critical thinking pedagogy." },
};

const filterCategories = ["All Courses", "Engineering", "Business", "Arts"];

const ScheduleBuilder = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [step, setStep] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [selectedSections, setSelectedSections] = useState<Record<string, string>>({});
  const [viewingInstructor, setViewingInstructor] = useState<string | null>(null);
  const [shiftPref, setShiftPref] = useState<"morning" | "evening" | "none">("morning");
  const [breakTimes, setBreakTimes] = useState<string[]>(["12:00 - 13:00"]);
  const [generatedSchedules, setGeneratedSchedules] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<number | null>(null);
  const [step4Tab, setStep4Tab] = useState<"weekly" | "list" | "conflicts">("weekly");
  const [saved, setSaved] = useState(false);
  const [mobileFilter, setMobileFilter] = useState("All Courses");
  const [breakDuration, setBreakDuration] = useState(60);
  const [avoidBackToBack, setAvoidBackToBack] = useState(true);

  const resetAll = () => {
    setStep(1); setSearch(""); setSelected([]); setActiveTab("");
    setSelectedSections({}); setViewingInstructor(null); setShiftPref("morning");
    setBreakTimes(["12:00 - 13:00"]); setGeneratedSchedules(false);
    setSelectedSchedule(null); setStep4Tab("weekly"); setSaved(false);
    setMobileFilter("All Courses");
  };

  const handleSave = () => setSaved(true);

  const filtered = availableCourses.filter((c) => {
    const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase()) || c.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = mobileFilter === "All Courses" || c.category === mobileFilter;
    return matchesSearch && (isMobile ? matchesFilter : true);
  });

  const toggle = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const selectedCourses = availableCourses.filter((c) => selected.includes(c.id));
  const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);
  const maxCredits = 18;

  const goToStep2 = () => {
    if (selected.length > 0) { setActiveTab(selected[0]); setStep(2); }
  };

  const currentSections = sectionsData[activeTab] || [];
  const activeCourse = availableCourses.find((c) => c.id === activeTab);
  const selectedSection = selectedSections[activeTab];
  const selectedSectionData = currentSections.find((s) => s.id === selectedSection);
  const currentInstructor = viewingInstructor
    ? instructorsData[viewingInstructor]
    : selectedSectionData ? instructorsData[selectedSectionData.instructor]
    : currentSections[0] ? instructorsData[currentSections[0].instructor] : null;

  const creditPercent = Math.round((totalCredits / maxCredits) * 100);

  // ===================== STEP 1 =====================
  const step1Content = (
    <div className="flex-1 flex flex-col min-h-0">
      {isMobile ? (
        // ========== MOBILE STEP 1 ==========
        <>
          {/* Mobile Header */}
          <div className="sticky top-0 z-20 bg-card/80 backdrop-blur-md border-b border-border px-4 pt-5 pb-4">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-muted">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <h1 className="text-lg font-bold text-foreground">Course Selection</h1>
              <MobileMenuDrawer activePage="Schedule Builder" />
            </div>
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search course code or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background border-border h-11 rounded-xl"
              />
            </div>
            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {filterCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMobileFilter(cat)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    mobileFilter === cat
                      ? "bg-schedule-accent text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Course Cards */}
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-48 space-y-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            {filtered.map((course, i) => {
              const isSelected = selected.includes(course.id);
              const badgeLabel = course.type === "Required" ? "REQUIRED" : course.type === "Elective" && course.category === "Engineering" ? "CORE" : "ELECTIVE";
              const badgeColor = badgeLabel === "REQUIRED" ? "bg-schedule-accent/15 text-schedule-accent" : badgeLabel === "CORE" ? "bg-stat-emerald/15 text-stat-emerald" : "bg-muted text-muted-foreground";
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => toggle(course.id)}
                  className={`bg-card rounded-xl border-2 px-3.5 py-3 cursor-pointer transition-all ${
                    isSelected
                      ? "border-schedule-accent shadow-[0_2px_8px_-2px_hsl(var(--schedule-accent)/0.2)]"
                      : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block px-2 py-px rounded text-[9px] font-bold uppercase tracking-wider ${badgeColor}`}>
                        {badgeLabel}
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-sm font-bold text-foreground">{course.code}</p>
                        <span className="text-xs text-muted-foreground">{course.credits.toFixed(1)} Credits</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-tight">{course.title}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3 transition-all ${
                      isSelected
                        ? "bg-schedule-accent border-schedule-accent"
                        : "border-muted-foreground/30 bg-transparent"
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Summary + Next */}
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.div
                initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2 bg-gradient-to-t from-background via-background to-transparent"
              >
                <div className="bg-card rounded-2xl border border-border shadow-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Selection Summary</p>
                      <p className="text-lg font-bold text-foreground">
                        {selected.length} Course{selected.length > 1 ? "s" : ""}{" "}
                        <span className="text-muted-foreground font-normal">| {totalCredits.toFixed(1)} Credits</span>
                      </p>
                    </div>
                    {/* Percentage Circle */}
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                        <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                        <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--schedule-accent))" strokeWidth="3"
                          strokeDasharray={`${(creditPercent / 100) * 125.6} 125.6`} strokeLinecap="round" />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-schedule-accent">{creditPercent}%</span>
                    </div>
                  </div>
                  <Button onClick={goToStep2} className="w-full gap-2 rounded-xl py-5 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold text-base shadow-[0_6px_24px_-4px_hsl(var(--schedule-accent)/0.4)]">
                    Next Step
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        // ========== DESKTOP STEP 1 (unchanged except color) ==========
        <>
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Schedule Builder</h1>
                <p className="text-muted-foreground text-sm mt-1">Step 1: Select your subjects for the upcoming semester</p>
              </div>
              <Button variant="outline" className="gap-2"><Calendar className="w-4 h-4" />Academic Calendar</Button>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
              <span className="text-primary cursor-pointer hover:underline">Portal</span><span>/</span><span>Schedule Builder</span>
            </div>
          </div>
          <div className="px-8 pb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search subjects (e.g. Computer Science, Calculus, Marketing)" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-card border-border h-12 rounded-xl" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-8 pb-32">
            <h2 className="font-semibold text-foreground text-lg mb-3">Available Courses</h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-[48px_160px_1fr_80px] items-center px-4 py-3 border-b border-border bg-muted/50">
                <div /><span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Course Title</span>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Credits</span>
              </div>
              {filtered.map((course, i) => {
                const isSelected = selected.includes(course.id);
                return (
                  <motion.div key={course.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    onClick={() => toggle(course.id)}
                    className={`cursor-pointer transition-colors border-b border-border last:border-b-0 grid grid-cols-[48px_160px_1fr_80px] items-center px-4 py-4 ${isSelected ? "bg-schedule-accent/5" : "hover:bg-muted/50"}`}>
                    <Checkbox checked={isSelected} onCheckedChange={() => toggle(course.id)} />
                    <span className="text-sm font-semibold text-schedule-accent">{course.code}</span>
                    <div><p className="text-sm font-medium text-foreground">{course.title}</p><p className="text-xs text-muted-foreground">{course.type} · {course.department}</p></div>
                    <span className="text-sm font-bold text-foreground text-right">{course.credits.toFixed(1)}</span>
                  </motion.div>
                );
              })}
              {filtered.length === 0 && <div className="py-12 text-center text-muted-foreground text-sm">No courses match your search.</div>}
            </div>
          </div>
          <AnimatePresence>
            {selected.length > 0 && (
              <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} className="fixed bottom-0 left-72 right-0 px-8 pb-4 z-30">
                <div className="bg-card border border-border rounded-2xl shadow-lg px-6 py-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-schedule-accent">{selected.length} Course{selected.length > 1 ? "s" : ""} Selected</span>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => setSelected([])} className="text-muted-foreground">Clear Selection</Button>
                    <motion.div whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.96 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                      <Button onClick={goToStep2} className="gap-2 rounded-xl px-7 py-5 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold text-sm shadow-[0_6px_24px_-4px_hsl(var(--schedule-accent)/0.55)] hover:shadow-[0_8px_32px_-4px_hsl(var(--schedule-accent)/0.7)] transition-all duration-200">
                        Next Step <ArrowRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );

  // ===================== STEP 2 =====================
  const sectionsSelectedCount = Object.keys(selectedSections).length;
  const step2Content = (
    <div className="flex-1 flex flex-col min-h-0">
      {isMobile ? (
        // ========== MOBILE STEP 2 ==========
        <>
          {/* Sticky Header */}
          <div className="sticky top-0 z-20 bg-card border-b border-border">
            <div className="flex items-center px-4 py-3 gap-3">
              <button onClick={() => setStep(1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-bold leading-tight text-foreground">Step 2: Section Selection</h1>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Registration Spring 2024</p>
              </div>
              <MobileMenuDrawer activePage="Schedule Builder" />
            </div>
            {/* Course Tabs */}
            <div className="px-4 overflow-x-auto pb-0">
              <div className="flex gap-6">
                {selectedCourses.map((course) => {
                  const isActive = activeTab === course.id;
                  const hasSection = !!selectedSections[course.id];
                  return (
                    <button
                      key={course.id}
                      onClick={() => { setActiveTab(course.id); setViewingInstructor(null); }}
                      className={`flex flex-col items-center justify-center pb-3 pt-2 shrink-0 border-b-2 transition-colors ${
                        isActive ? "border-schedule-accent text-schedule-accent" : "border-transparent text-muted-foreground"
                      }`}
                    >
                      <span className="text-sm font-bold">{course.code}</span>
                      <span className="text-[10px] opacity-80">{hasSection ? "Selected" : "Pending"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section Cards */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-52">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground text-base">Available Sections for {activeCourse?.code}</h2>
              <Badge className="bg-muted text-muted-foreground border-border text-xs font-medium">{currentSections.length} Options</Badge>
            </div>
            <div className="space-y-4">
              {currentSections.map((section, i) => {
                const isSelected = selectedSections[activeTab] === section.id;
                const isFull = section.status === "Full";
                const instructor = instructorsData[section.instructor];
                const sectionLetter = String.fromCharCode(64 + parseInt(section.label.replace("S", "")));
                return (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`bg-card rounded-2xl border-2 p-4 transition-all ${
                      isSelected
                        ? "border-schedule-accent shadow-[0_0_0_1px_hsl(var(--schedule-accent)/0.15)]"
                        : isFull
                        ? "border-border opacity-60"
                        : "border-border"
                    }`}
                  >
                    {/* Selected badge */}
                    {isSelected && (
                      <div className="flex justify-end mb-1">
                        <span className="text-[10px] font-bold bg-schedule-accent text-primary-foreground uppercase tracking-wider px-2.5 py-1 rounded-md">Selected</span>
                      </div>
                    )}

                    {/* Section label + Professor info */}
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <User className="w-7 h-7 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-schedule-accent uppercase tracking-wider">Section {sectionLetter}</p>
                        <p className="text-base font-bold text-foreground">{instructor?.name || section.instructor}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-stat-amber text-stat-amber" />
                          <span className="text-sm font-bold text-foreground">{instructor?.rating || "4.0"}</span>
                          <span className="text-xs text-muted-foreground">({instructor?.reviews || 0} reviews)</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{instructor?.experience || 0} yrs experience</p>
                      </div>
                    </div>

                    {/* Schedule + Room info */}
                    <div className="flex gap-3 mt-3 bg-muted/50 rounded-xl p-3">
                      <div className="flex items-start gap-2 flex-1">
                        <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{section.days}</p>
                          <p className="text-xs text-muted-foreground">{section.time}</p>
                        </div>
                      </div>
                      <div className="w-px bg-border" />
                      <div className="flex items-start gap-2 flex-1">
                        <Building2 className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">{section.room}</p>
                          <p className="text-xs text-muted-foreground">{section.building}</p>
                        </div>
                      </div>
                    </div>

                    {/* Seats + Action */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${isFull ? "bg-destructive" : section.seats <= 5 ? "bg-stat-amber" : "bg-stat-emerald"}`} />
                        <span className={`text-xs font-semibold ${isFull ? "text-destructive" : section.seats <= 5 ? "text-stat-amber" : "text-stat-emerald"}`}>
                          {section.seats}/{section.totalSeats} Seats Left
                        </span>
                      </div>
                      {isSelected ? (
                        <div className="flex items-center gap-1.5 bg-schedule-accent text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          Confirmed
                        </div>
                      ) : isFull ? (
                        <span className="text-sm text-muted-foreground font-medium px-4 py-2">Full</span>
                      ) : (
                        <button
                          onClick={() => { setSelectedSections((prev) => ({ ...prev, [activeTab]: section.id })); setViewingInstructor(section.instructor); }}
                          className="border border-schedule-accent text-schedule-accent px-4 py-2 rounded-full text-sm font-semibold hover:bg-schedule-accent/5 transition-colors"
                        >
                          Select Section
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom Progress + Next */}
          <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-6">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Progress</p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-foreground">{sectionsSelectedCount} of {selectedCourses.length} Courses Selected</p>
              </div>
              <Progress value={(sectionsSelectedCount / selectedCourses.length) * 100} className="h-2 [&>div]:bg-schedule-accent" />
            </div>
            <Button
              onClick={() => setStep(3)}
              className="w-full gap-2 rounded-xl py-5 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold text-base shadow-[0_6px_24px_-4px_hsl(var(--schedule-accent)/0.4)]"
            >
              Next Step: Course Review
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </>
      ) : (
        // ========== DESKTOP STEP 2 (Reference Design) ==========
        <>
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-10 lg:px-16 xl:px-32 py-8 pb-32">
            {/* Multi-step Progress Bar */}
            <div className="w-full max-w-4xl mx-auto flex items-center justify-between relative mb-10">
              <div className="absolute top-5 left-0 w-full h-0.5 bg-border -z-10" />
              <div className="absolute top-5 left-0 w-1/2 h-0.5 bg-primary -z-10 transition-all duration-500" />
              {[
                { num: 1, label: "Courses", done: true },
                { num: 2, label: "Sections", done: true },
                { num: 3, label: "Preferences", done: false },
                { num: 4, label: "Finalize", done: false },
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-background ${
                    s.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>{s.num}</div>
                  <span className={`text-xs font-semibold ${s.done ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Left Sidebar: Your Selection */}
              <aside className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 bg-card p-5 rounded-xl border border-border shadow-sm lg:shrink-0">
                <div className="flex flex-col mb-2">
                  <h3 className="text-lg font-bold text-foreground">Your Selection</h3>
                  <p className="text-sm text-muted-foreground">{selectedCourses.length - sectionsSelectedCount} courses remaining</p>
                </div>
                <div className="flex flex-col gap-3">
                  {selectedCourses.map((course) => {
                    const isActive = activeTab === course.id;
                    const hasSection = !!selectedSections[course.id];
                    return (
                      <button
                        key={course.id}
                        onClick={() => { setActiveTab(course.id); setViewingInstructor(null); }}
                        className={`flex items-center justify-between p-3 rounded-lg text-left group transition-all ${
                          isActive
                            ? "border-2 border-primary bg-primary/5"
                            : "border border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${
                            isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-foreground">{course.code}</p>
                            <p className="text-xs text-muted-foreground truncate">{course.title.length > 22 ? course.title.substring(0, 22) + "…" : course.title}</p>
                          </div>
                        </div>
                        {isActive ? (
                          <ChevronRight className="w-5 h-5 text-primary" />
                        ) : hasSection ? (
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/20" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <Button
                    onClick={() => setStep(3)}
                    disabled={sectionsSelectedCount < selectedCourses.length}
                    className={`w-full gap-2 rounded-lg py-3 font-bold ${
                      sectionsSelectedCount >= selectedCourses.length
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
                    }`}
                  >
                    Next: Preferences <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-[10px] text-center mt-2 text-muted-foreground uppercase tracking-widest font-bold">
                    Select all sections to continue
                  </p>
                </div>
              </aside>

              {/* Main Content: Available Sections */}
              <div className="flex-1 flex flex-col gap-6 min-w-0">
                <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-bold text-foreground">{activeCourse?.code}: {activeCourse?.title}</h2>
                  <p className="text-muted-foreground">Available sections for Spring 2024</p>
                </div>

                {/* Section Tabs */}
                <div className="flex border-b border-border gap-8">
                  <button className="border-b-2 border-primary text-primary pb-3 font-bold text-sm">Lecture Only</button>
                  <button className="border-b-2 border-transparent text-muted-foreground hover:text-foreground pb-3 font-medium text-sm transition-colors">Lab / Recitation</button>
                </div>

                {/* Section Cards */}
                <div className="grid grid-cols-1 gap-4">
                  {currentSections.map((section, i) => {
                    const isSelected = selectedSections[activeTab] === section.id;
                    const isFull = section.status === "Full";
                    const instructor = instructorsData[section.instructor];
                    const sectionNum = section.label.replace("S", "");

                    return (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => { if (!isFull) { setSelectedSections((prev) => ({ ...prev, [activeTab]: section.id })); setViewingInstructor(section.instructor); } }}
                        className={`bg-card rounded-xl p-5 relative group transition-all cursor-pointer ${
                          isSelected
                            ? "border-2 border-primary shadow-lg ring-4 ring-primary/5"
                            : isFull
                            ? "border border-border opacity-60 grayscale cursor-not-allowed"
                            : "border border-border hover:border-primary"
                        }`}
                      >
                        {/* Selected Badge */}
                        {isSelected && (
                          <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full px-4 py-1 text-xs font-bold shadow-md">
                            SELECTED
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex gap-4 flex-1 min-w-0">
                            {/* Professor Avatar */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-border shrink-0 bg-muted flex items-center justify-center">
                              <User className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
                            </div>
                            <div className="flex flex-col gap-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold px-2 py-0.5 bg-muted text-muted-foreground rounded uppercase tracking-wider shrink-0">
                                  SEC-{sectionNum.padStart(3, "0")}
                                </span>
                                <h4 className="text-base sm:text-lg font-bold text-foreground">{instructor?.name || section.instructor}</h4>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                  <span className="font-bold text-foreground">{instructor?.rating || "4.0"}</span>
                                  <span className="text-xs">({instructor?.reviews || 0} ratings)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <GraduationCap className="w-4 h-4 text-primary" />
                                  <span>{instructor?.experience || 0} yrs exp.</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Schedule Info + Seats row on mobile, column on larger */}
                          <div className="flex items-center justify-between sm:items-start sm:gap-6">
                            {/* Schedule Info */}
                            <div className="flex flex-col items-start sm:items-end gap-1">
                              <p className="text-sm font-bold text-foreground">{section.days}</p>
                              <p className="text-xs text-muted-foreground">{section.time}</p>
                              <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                                <Building2 className="w-3.5 h-3.5" />
                                <span>{section.room}, {section.building}</span>
                              </div>
                            </div>

                            {/* Seats */}
                            <div className="flex flex-col items-center justify-center px-4 border-l border-border shrink-0">
                              <div className={`font-bold text-xl leading-none ${isFull ? "text-destructive" : "text-primary"}`}>
                                {section.seats}
                              </div>
                              <div className={`text-[10px] uppercase font-bold ${isFull ? "text-destructive" : "text-muted-foreground"}`}>
                                {isFull ? "FULL" : "Seats Left"}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Bio for selected */}
                        {isSelected && instructor && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground"
                          >
                            <p className="line-clamp-2">{instructor.bio}</p>
                            <button className="text-primary text-xs font-bold mt-2 hover:underline">
                              View Professor Portfolio & Syllabi
                            </button>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Floating Bottom Summary Bar */}
          <div className="fixed bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-3 sm:px-4 z-40">
            <div className="bg-foreground text-background rounded-2xl shadow-2xl p-3 sm:p-4 flex items-center justify-between gap-3 border border-border/10">
              <div className="flex items-center gap-3 sm:gap-6 px-2 sm:px-4">
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Total Credits</span>
                  <span className="text-base sm:text-lg font-bold">{totalCredits.toFixed(1)}</span>
                </div>
                <div className="h-8 w-px bg-muted-foreground/20" />
                <div className="flex flex-col">
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Schedule Conflict</span>
                  <span className="text-base sm:text-lg font-bold text-green-400">None</span>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-4 shrink-0">
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="px-4 sm:px-6 py-2 rounded-xl bg-muted-foreground/10 hover:bg-muted-foreground/20 text-background font-bold text-sm"
                >
                  Save Draft
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  className="px-5 sm:px-8 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 text-sm"
                >
                  Review All
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  // ===================== STEP 3 =====================
  const suggestedSchedules = [
    { label: "Best Match (Morning Optimized)", icon: <Star className="w-4 h-4" />, isBest: true, days: "Sun-Thu", credits: totalCredits, avgGap: "30 mins",
      courses: selectedCourses.map((c, i) => ({ code: c.code, title: c.title, room: `Room: ${400 + i}${i + 2}, Building ${String.fromCharCode(65 + i)}`, time: ["08:30 - 10:00 (Sun, Tue)", "10:00 - 11:30 (Mon, Wed)", "11:30 - 13:00 (Sun, Tue)"][i % 3] })) },
    { label: "Variation 2 (Balanced)", icon: <Shuffle className="w-4 h-4" />, isBest: false, days: "Sun-Thu", credits: totalCredits, avgGap: "1.5 hrs",
      courses: selectedCourses.map((c, i) => ({ code: c.code, title: c.title, room: `Room: ${405 + i}${i + 2}, Building ${String.fromCharCode(65 + i)}`, time: ["11:30 - 13:00 (Sun, Tue)", "13:00 - 14:30 (Mon, Wed)", "15:30 - 17:00 (Sun, Tue)"][i % 3] })) },
    { label: "Variation 3 (Compressed)", icon: <Zap className="w-4 h-4" />, isBest: false, days: "Sun-Thu", credits: totalCredits, avgGap: "0 mins",
      courses: selectedCourses.map((c, i) => ({ code: c.code, title: c.title, room: `Room: ${400 + i}${i + 2}, Building ${String.fromCharCode(65 + i)}`, time: ["08:30 - 10:00 (Sun, Tue)", "10:00 - 11:30 (Sun, Tue)", "11:30 - 13:00 (Sun, Tue)"][i % 3] })) },
  ];

  const defaultBreaks = [
    { time: "12:00 - 13:00", label: "Lunch Break" },
    { time: "13:30 - 14:30", label: "Prayer Break" },
    { time: "17:00 - 18:00", label: "Evening Tea" },
  ];

  const shiftOptions: { value: "morning" | "evening" | "none"; label: string; subtitle: string; icon: React.ReactNode }[] = [
    { value: "morning", label: "Morning Shift", subtitle: "08:30 AM - 01:30 PM", icon: <Sun className="w-5 h-5" /> },
    { value: "evening", label: "Afternoon Shift", subtitle: "01:45 PM - 05:45 PM", icon: <Sun className="w-5 h-5" /> },
    { value: "none", label: "Evening Shift", subtitle: "06:00 PM - 09:00 PM", icon: <Moon className="w-5 h-5" /> },
  ];

  const step3Content = (
    <div className="flex-1 flex flex-col min-h-0">
      {isMobile ? (
        <>
          {/* Mobile Step 3 Header */}
          <div className="sticky top-0 z-20 bg-card border-b border-border">
            <div className="flex items-center px-4 py-3 gap-3">
              <button onClick={() => setStep(2)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-bold leading-tight text-foreground">Preferences</h1>
              </div>
              <MobileMenuDrawer activePage="Schedule Builder" />
            </div>
          </div>

          {/* Mobile Step 3 Content */}
          <div className="flex-1 overflow-y-auto px-4 pt-6 pb-40" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Progress Stepper */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-schedule-accent font-semibold text-xs uppercase tracking-wider">Step 2 of 3</p>
                  <h2 className="text-2xl font-bold text-foreground mt-1">Schedule Settings</h2>
                </div>
                <p className="text-muted-foreground text-sm font-medium">66% Complete</p>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-schedule-accent rounded-full transition-all duration-500" style={{ width: '66%' }} />
              </div>
            </div>

            {/* Preferred Shift */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-schedule-accent" />
                <h3 className="text-lg font-semibold text-foreground">Preferred Shift</h3>
              </div>
              <div className="space-y-3">
                {shiftOptions.map((option) => {
                  const isActive = shiftPref === option.value;
                  return (
                    <motion.button
                      key={option.value}
                      onClick={() => setShiftPref(option.value)}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isActive
                          ? "border-schedule-accent bg-schedule-accent/5"
                          : "border-border bg-card hover:border-muted-foreground/30"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${isActive ? "bg-schedule-accent/10 text-schedule-accent" : "bg-muted text-muted-foreground"}`}>
                          {option.icon}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-foreground">{option.label}</p>
                          <p className="text-xs text-muted-foreground">{option.subtitle}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isActive ? "border-schedule-accent" : "border-muted-foreground/30"
                      }`}>
                        {isActive && <div className="w-2.5 h-2.5 rounded-full bg-schedule-accent" />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </section>

            {/* Minimum Break Duration */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Coffee className="w-5 h-5 text-schedule-accent" />
                <h3 className="text-lg font-semibold text-foreground">Minimum Break Duration</h3>
              </div>
              <div className="bg-card p-6 rounded-xl border border-border">
                <div className="flex justify-between items-center mb-8">
                  <span className="px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground">SHORT</span>
                  <span className="text-3xl font-bold text-schedule-accent">
                    {breakDuration} <span className="text-sm font-medium text-muted-foreground">mins</span>
                  </span>
                  <span className="px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground">LONG</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="30"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-schedule-accent"
                  style={{ accentColor: 'hsl(var(--schedule-accent))' }}
                />
                <div className="flex justify-between mt-4 px-1">
                  {["30m", "60m", "90m", "120m"].map((label) => (
                    <span key={label} className="text-xs font-medium text-muted-foreground">{label}</span>
                  ))}
                </div>
              </div>
            </section>

            {/* Avoid back-to-back toggle */}
            <div className="flex items-center justify-between p-4 bg-schedule-accent/5 rounded-xl border border-schedule-accent/20 mb-8">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-5 h-5 text-schedule-accent" />
                <span className="text-sm font-medium text-foreground">Avoid back-to-back classes</span>
              </div>
              <button
                onClick={() => setAvoidBackToBack(!avoidBackToBack)}
                className={`relative w-11 h-6 rounded-full transition-colors ${avoidBackToBack ? "bg-schedule-accent" : "bg-muted"}`}
              >
                <div className={`absolute top-[2px] w-5 h-5 bg-card rounded-full shadow transition-transform ${avoidBackToBack ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
              </button>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border px-4 py-4 pb-6">
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => { setGeneratedSchedules(true); setStep(4); }}
                className="w-full gap-2 rounded-xl py-5 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold text-base shadow-[0_6px_24px_-4px_hsl(var(--schedule-accent)/0.4)]"
              >
                <Sparkles className="w-5 h-5" />
                Generate Optimized Schedules
              </Button>
            </motion.div>
          </div>
        </>
      ) : (
        <>
          {/* Desktop Step 3 */}
          <div className="px-8 pt-6 pb-2">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground transition-colors">Course Selection</button>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              <button onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground transition-colors">Section Selection</button>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-schedule-accent font-semibold">Preferences & Generation</span>
            </div>
          </div>
          <div className="px-8 pb-6">
            <h1 className="text-2xl font-bold text-foreground">Step 3: Preferences & Generation</h1>
            <p className="text-muted-foreground text-sm mt-1">Customise your learning experience. Tell us when you prefer to study and when you need a break.</p>
          </div>
          <div className="flex-1 overflow-y-auto px-8 pb-28">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-4"><Clock className="w-4 h-4 text-schedule-accent" /><h3 className="font-semibold text-schedule-accent text-sm">Shift Preference</h3></div>
                <div className="space-y-3">
                  {shiftOptions.map((option) => (
                    <button key={option.value} onClick={() => setShiftPref(option.value)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">{option.icon}<span className="text-sm text-foreground">{option.label}</span></div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shiftPref === option.value ? "border-schedule-accent" : "border-muted-foreground/30"}`}>
                        {shiftPref === option.value && <div className="w-2.5 h-2.5 rounded-full bg-schedule-accent" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-2"><Calendar className="w-4 h-4 text-schedule-accent" /><h3 className="font-semibold text-schedule-accent text-sm">Specific Break Times</h3></div>
                <p className="text-xs text-muted-foreground mb-4">Select time slots where you do NOT want any classes scheduled.</p>
                <div className="flex flex-wrap gap-2">
                  {defaultBreaks.map((b) => { const isActive = breakTimes.includes(b.time); return (
                    <button key={b.time} onClick={() => setBreakTimes((prev) => isActive ? prev.filter((t) => t !== b.time) : [...prev, b.time])}
                      className={`rounded-lg border px-3 py-2 text-center transition-all ${isActive ? "border-schedule-accent bg-schedule-accent/10 text-schedule-accent" : "border-border text-muted-foreground hover:border-muted-foreground/50"}`}>
                      <p className="text-xs font-semibold">{b.time}</p><p className="text-[10px]">{b.label}</p>
                    </button>
                  ); })}
                  <button className="rounded-lg border border-dashed border-border px-3 py-2 text-center text-muted-foreground hover:border-schedule-accent hover:text-schedule-accent transition-colors"><Plus className="w-4 h-4 mx-auto" /><p className="text-[10px]">Custom</p></button>
                </div>
              </div>
            </div>
            <div className="flex justify-center mb-8">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Button onClick={() => setGeneratedSchedules(true)} className="gap-2 rounded-xl px-8 py-5 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold shadow-[0_6px_24px_-4px_hsl(var(--schedule-accent)/0.55)] hover:shadow-[0_8px_32px_-4px_hsl(var(--schedule-accent)/0.7)] transition-all duration-200">
                  <Sparkles className="w-4 h-4" />Generate Optimized Schedules
                </Button>
              </motion.div>
            </div>
            <AnimatePresence>
              {generatedSchedules && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-foreground text-lg">Suggested Schedules</h2><span className="text-xs text-muted-foreground">{suggestedSchedules.length} variations found based on your preferences</span></div>
                  <div className="space-y-4">
                    {suggestedSchedules.map((schedule, idx) => (
                      <motion.div key={idx} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
                        className={`bg-card rounded-xl border overflow-hidden ${schedule.isBest ? "border-primary shadow-md" : "border-border"}`}>
                        <div className={`px-5 py-3 flex items-center justify-between ${schedule.isBest ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}>
                          <div className="flex items-center gap-2">{schedule.icon}<span className="text-sm font-bold">{schedule.label}</span></div>
                          <div className={`flex items-center gap-4 text-xs font-medium ${schedule.isBest ? "" : "text-muted-foreground"}`}><span>{schedule.days}</span><span className={schedule.isBest ? "" : "text-stat-blue"}>{schedule.credits} Credits</span><span>Avg Gap: {schedule.avgGap}</span></div>
                        </div>
                        <div className="divide-y divide-border">
                          {schedule.courses.map((course, ci) => (
                            <div key={ci} className="grid grid-cols-4 items-center px-5 py-3">
                              <span className="text-sm font-bold text-schedule-accent">{course.code}</span><span className="text-sm text-foreground">{course.title}</span><span className="text-xs text-muted-foreground">{course.room}</span><span className="text-sm text-foreground text-right">{course.time}</span>
                            </div>
                          ))}
                        </div>
                        <div className="px-5 py-3 flex justify-end">
                          <Button onClick={() => { setSelectedSchedule(idx); setStep(4); }} variant={selectedSchedule === idx ? "default" : "outline"}
                            className={`rounded-lg text-sm ${selectedSchedule === idx ? "bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground" : "border-schedule-accent text-schedule-accent hover:bg-schedule-accent/5"}`}>
                            {selectedSchedule === idx ? "✓ Selected" : "Select This Schedule"}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-center text-xs text-muted-foreground mt-6">Need help? <span className="text-schedule-accent cursor-pointer hover:underline">View Tutorial</span> or contact the Registrar's Office.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );

  // ===================== STEP 4 =====================
  const days = ["SUN", "MON", "TUE", "WED", "THU"];
  const timeSlots = ["08:00 AM", "09:30 AM", "11:00 AM", "12:30 PM", "02:00 PM", "03:30 PM", "05:00 PM"];
  const timetableColors = [
    { bg: "bg-stat-blue/15", border: "border-stat-blue/30", text: "text-stat-blue" },
    { bg: "bg-stat-amber/15", border: "border-stat-amber/30", text: "text-stat-amber" },
    { bg: "bg-stat-emerald/15", border: "border-stat-emerald/30", text: "text-stat-emerald" },
    { bg: "bg-stat-purple/15", border: "border-stat-purple/30", text: "text-stat-purple" },
  ];
  const selectedScheduleData = selectedSchedule !== null ? suggestedSchedules[selectedSchedule] : null;
  const timetableEntries: Array<{ code: string; title: string; room: string; day: number; startRow: number; span: number; colorIdx: number }> = [];
  if (selectedScheduleData) {
    selectedScheduleData.courses.forEach((course, ci) => {
      const timeMatch = course.time.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})\s*\(([^)]+)\)/);
      if (timeMatch) {
        const daysList = timeMatch[3].split(",").map((d) => d.trim());
        const startHour = parseInt(timeMatch[1].split(":")[0]);
        const startRow = Math.max(0, Math.floor((startHour - 8) / 1.5));
        daysList.forEach((dayStr) => {
          const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4 };
          const dayIdx = dayMap[dayStr];
          if (dayIdx !== undefined) {
            timetableEntries.push({ code: course.code, title: course.title, room: course.room.replace("Room: ", "Rm: "), day: dayIdx, startRow, span: 1, colorIdx: ci % timetableColors.length });
          }
        });
      }
    });
  }

  const [step4Filter, setStep4Filter] = useState<"all" | "morning" | "afternoon">("all");

  const step4Content = (
    <div className="flex-1 flex flex-col min-h-0">
      {isMobile ? (
        <>
          {/* Mobile Step 4: Schedule Variations */}
          <div className="sticky top-0 z-20 bg-card border-b border-border">
            <div className="flex items-center px-4 py-3 gap-3">
              <button onClick={() => setStep(3)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors">
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
              </button>
              <h1 className="text-lg font-bold leading-tight text-foreground flex-1 text-center">Schedule Variations</h1>
              <MobileMenuDrawer activePage="Schedule Builder" />
            </div>
            {/* Filter Tabs */}
            <div className="flex px-4 gap-6 border-b border-border">
              {([{ value: "all" as const, label: "All Options" }, { value: "morning" as const, label: "Morning" }, { value: "afternoon" as const, label: "Afternoon" }]).map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStep4Filter(tab.value)}
                  className={`pb-3 pt-4 text-sm font-medium border-b-[3px] transition-colors ${
                    step4Filter === tab.value
                      ? "border-schedule-accent text-schedule-accent font-bold"
                      : "border-transparent text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Variation Cards */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex items-center justify-between px-1 mb-4">
              <h3 className="text-xl font-bold text-foreground">Recommended for You</h3>
              <Badge className="bg-schedule-accent/10 text-schedule-accent border-schedule-accent/20 text-[10px] font-semibold uppercase tracking-wider">
                {suggestedSchedules.length} Variations
              </Badge>
            </div>

            <div className="space-y-5">
              {suggestedSchedules.map((schedule, idx) => {
                const variationIcons = [
                  <Sun key="sun" className="w-12 h-12 text-schedule-accent" />,
                  <Scale key="scale" className="w-12 h-12 text-schedule-accent" />,
                  <Moon key="moon" className="w-12 h-12 text-schedule-accent" />,
                ];
                const variationNames = ["Morning Optimized", "Balanced Flow", "Afternoon Peak"];
                const variationSubtitles = [
                  "Classes end by 1:30 PM",
                  "1-hour breaks between classes",
                  "Later starts for late sleepers",
                ];
                const variationSubIcons = [
                  <Clock key="clock" className="w-3.5 h-3.5" />,
                  <Coffee key="coffee" className="w-3.5 h-3.5" />,
                  <Calendar key="cal" className="w-3.5 h-3.5" />,
                ];

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-card rounded-xl border border-border overflow-hidden shadow-sm"
                  >
                    {/* Gradient hero banner */}
                    <div className={`w-full h-32 flex items-center justify-center relative ${
                      idx === 0
                        ? "bg-gradient-to-br from-schedule-accent/20 to-schedule-accent/5"
                        : "bg-gradient-to-br from-schedule-accent/10 to-schedule-accent/5"
                    }`}>
                      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--schedule-accent)) 1px, transparent 0)', backgroundSize: '20px 20px' }} />
                      {variationIcons[idx % 3]}
                      {idx === 0 && (
                        <div className="absolute top-4 right-4 bg-card/90 backdrop-blur px-3 py-1 rounded-full border border-border shadow-sm">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Best Efficiency</p>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      <div className="space-y-1">
                        <p className="text-schedule-accent text-sm font-semibold uppercase tracking-wider">Variation {idx + 1}</p>
                        <p className="text-xl font-bold text-foreground leading-tight">{variationNames[idx % 3]}</p>
                        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                          {variationSubIcons[idx % 3]} {variationSubtitles[idx % 3]}
                        </p>
                      </div>

                      {/* Course list */}
                      <div className="space-y-0 bg-muted/50 p-4 rounded-lg">
                        {schedule.courses.map((course, ci) => (
                          <div key={ci} className={`flex justify-between items-start ${ci > 0 ? "border-t border-border pt-3 mt-3" : ""}`}>
                            <div>
                              <p className="text-sm font-bold text-foreground">{course.code} {course.title}</p>
                              <p className="text-xs text-muted-foreground">{course.room}</p>
                            </div>
                            <p className="text-xs font-bold text-foreground whitespace-nowrap ml-3">
                              {course.time.split("(")[0].trim()}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Select button */}
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => { setSelectedSchedule(idx); setStep(5); }}
                        className={`w-full flex items-center justify-center rounded-xl h-12 text-base font-bold transition-all ${
                          idx === 0
                            ? "bg-schedule-accent text-primary-foreground"
                            : "bg-muted text-foreground border border-border"
                        }`}
                      >
                        Select This Schedule
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Desktop Step 4 */}
          <div className="px-8 pt-6 pb-2">
            <div className="flex items-center gap-2 text-sm flex-wrap">
              <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground transition-colors">Schedule Builder</button>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              <button onClick={() => setStep(3)} className="text-muted-foreground hover:text-foreground transition-colors">Step 3: Review</button>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-schedule-accent font-semibold">Step 4: Final Edit & Save</span>
            </div>
          </div>
          <div className="px-8 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Finalize Your Schedule</h1>
                <p className="text-muted-foreground text-sm mt-1">Drag sections to swap timings or manually add missing requirements.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="gap-2"><PlusCircle className="w-4 h-4" />Manual Add</Button>
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                  <Button onClick={handleSave} className="gap-2 rounded-xl bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold shadow-[0_6px_24px_-4px_hsl(var(--schedule-accent)/0.55)]"><Save className="w-4 h-4" />Save Schedule</Button>
                </motion.div>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-8 pb-28">
            <div className="flex gap-6">
              <div className="w-48 flex-shrink-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Selected Courses</p>
                <div className="space-y-2">
                  {selectedScheduleData?.courses.map((course, ci) => (
                    <div key={ci} className="bg-card rounded-lg border border-border p-3">
                      <p className="text-xs font-bold text-schedule-accent">{course.code}</p>
                      <p className="text-sm font-medium text-foreground">{course.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Sec 0{ci + 1} · Instructor</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex border-b border-border mb-4">
                  {(["weekly", "list", "conflicts"] as const).map((tab) => (
                    <button key={tab} onClick={() => setStep4Tab(tab)}
                      className={`flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${step4Tab === tab ? "border-schedule-accent text-schedule-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                      {tab === "weekly" ? "Weekly View" : tab === "list" ? "List View" : "Conflicts"}
                    </button>
                  ))}
                </div>
                {step4Tab === "weekly" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-border"><div />{days.map((day) => (<div key={day} className="text-center py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{day}</div>))}</div>
                    <div className="relative">
                      {timeSlots.map((time, rowIdx) => (
                        <div key={time} className="grid grid-cols-[70px_repeat(5,1fr)] border-b border-border/50">
                          <div className="py-4 pr-2 text-right text-xs text-schedule-accent font-medium">{time}</div>
                          {days.map((_, dayIdx) => { const entry = timetableEntries.find((e) => e.day === dayIdx && e.startRow === rowIdx); return (
                            <div key={dayIdx} className="relative p-1 min-h-[60px]">
                              {entry && (<motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                                className={`absolute inset-1 rounded-lg border-l-4 ${timetableColors[entry.colorIdx].bg} ${timetableColors[entry.colorIdx].border} p-2 cursor-pointer hover:shadow-md transition-shadow`}>
                                <p className={`text-[10px] font-bold ${timetableColors[entry.colorIdx].text}`}>{entry.code}</p>
                                <p className="text-xs font-semibold text-foreground leading-tight">{entry.title.length > 18 ? entry.title.substring(0, 18) + "…" : entry.title}</p>
                                <p className="text-[10px] text-muted-foreground">{entry.room}</p>
                              </motion.div>)}
                            </div>
                          ); })}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
                {step4Tab === "list" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    {selectedScheduleData?.courses.map((course, ci) => (
                      <div key={ci} className="bg-card rounded-lg border border-border p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${timetableColors[ci % timetableColors.length].bg}`}><span className={`text-xs font-bold ${timetableColors[ci % timetableColors.length].text}`}>{course.code.slice(0, 3)}</span></div>
                          <div><p className="text-sm font-semibold text-foreground">{course.code} - {course.title}</p><p className="text-xs text-muted-foreground">{course.room} · {course.time}</p></div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
                {step4Tab === "conflicts" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12">
                    <div className="w-12 h-12 rounded-full bg-stat-emerald/10 flex items-center justify-center mb-3"><CheckCircle2 className="w-6 h-6 text-stat-emerald" /></div>
                    <p className="font-semibold text-foreground">No Conflicts Detected</p>
                    <p className="text-sm text-muted-foreground mt-1 text-center max-w-md">Your schedule has no time overlaps. You're ready to save.</p>
                  </motion.div>
                )}
              </div>
            </div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="mt-6 bg-schedule-accent/5 border border-dashed border-schedule-accent/30 rounded-2xl p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-schedule-accent/10 flex items-center justify-center mx-auto mb-3"><Info className="w-5 h-5 text-schedule-accent" /></div>
              <h3 className="font-bold text-foreground">Checking for Conflicts</h3>
              <p className="text-sm text-muted-foreground mt-1">No schedule overlaps detected. You are ready to save and proceed to formal advising.</p>
            </motion.div>
            <AnimatePresence>
              {saved && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-6 bg-stat-emerald/5 border border-stat-emerald/30 rounded-2xl p-8 text-center">
                  <div className="w-14 h-14 rounded-full bg-stat-emerald/10 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-7 h-7 text-stat-emerald" /></div>
                  <h3 className="font-bold text-foreground text-lg">Schedule Saved Successfully!</h3>
                  <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Your schedule has been saved. You can now proceed to formal advising or create a new schedule.</p>
                  <div className="flex items-center justify-center gap-3 mt-5">
                    <Button variant="outline" onClick={resetAll} className="gap-2"><Plus className="w-4 h-4" />Create New Schedule</Button>
                    <Button className="gap-2 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold">Proceed to Advising<ArrowRight className="w-4 h-4" /></Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
      <div className={`border-t border-border ${isMobile ? "px-4" : "px-8"} py-3 flex items-center justify-between text-xs text-muted-foreground`}>
        <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-stat-emerald" /><span className="font-medium text-stat-emerald">System Ready</span><span className="mx-2">|</span><span>Summer 2024 Enrollment Phase 1</span></div>
        <span>Last Auto-saved: 2 mins ago</span>
      </div>
    </div>
  );

  // ===================== STEP 5 (Mobile Finalize) =====================
  const [mobileStep5Tab, setMobileStep5Tab] = useState<"weekly" | "list" | "conflicts">("weekly");

  const step5Content = (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-card border-b border-border">
        <div className="flex items-center px-4 py-3 gap-3">
          <button onClick={() => setStep(4)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight text-foreground">Final Edit & Save</h1>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Step 4 of 4</p>
          </div>
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-schedule-accent/10 text-schedule-accent">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
        {/* Tabs */}
        <div className="flex px-4 gap-6">
          {(["weekly", "list", "conflicts"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileStep5Tab(tab)}
              className={`pb-3 pt-2 text-sm font-medium border-b-[3px] transition-colors ${
                mobileStep5Tab === tab
                  ? "border-schedule-accent text-schedule-accent font-bold"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {tab === "weekly" ? "Weekly View" : tab === "list" ? "List View" : "Conflicts"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-40" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {mobileStep5Tab === "weekly" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Mobile timetable - horizontal scrollable */}
            <div className="overflow-x-auto -mx-1" style={{ scrollbarWidth: 'none' }}>
              <div className="min-w-[600px]">
                <div className="grid grid-cols-[56px_repeat(5,1fr)] border-b border-border">
                  <div />
                  {days.map((day) => (
                    <div key={day} className="text-center py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{day}</div>
                  ))}
                </div>
                <div className="relative">
                  {timeSlots.map((time, rowIdx) => (
                    <div key={time} className="grid grid-cols-[56px_repeat(5,1fr)] border-b border-border/50">
                      <div className="py-3 pr-1 text-right text-[10px] text-schedule-accent font-medium leading-tight">{time}</div>
                      {days.map((_, dayIdx) => {
                        const entry = timetableEntries.find((e) => e.day === dayIdx && e.startRow === rowIdx);
                        return (
                          <div key={dayIdx} className="relative p-0.5 min-h-[56px]">
                            {entry && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 }}
                                className={`absolute inset-0.5 rounded-lg border-l-[3px] ${timetableColors[entry.colorIdx].bg} ${timetableColors[entry.colorIdx].border} p-1.5 overflow-hidden`}
                              >
                                <p className={`text-[9px] font-bold ${timetableColors[entry.colorIdx].text}`}>{entry.code}</p>
                                <p className="text-[10px] font-semibold text-foreground leading-tight truncate">{entry.title}</p>
                                <p className="text-[9px] text-muted-foreground truncate">{entry.room}</p>
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {mobileStep5Tab === "list" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Day selector - weekly days only */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
              {["SAT", "SUN", "MON", "TUE", "WED", "THU", "FRI"].map((day, di) => {
                const isActive = di === 1;
                return (
                  <button
                    key={day}
                    className={`flex items-center justify-center min-w-[52px] py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? "bg-schedule-accent text-primary-foreground shadow-md"
                        : "bg-card border border-border text-muted-foreground"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Classes count */}
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sunday</p>
              <Badge className="bg-schedule-accent/10 text-schedule-accent border-schedule-accent/20 text-[10px] font-semibold">
                {selectedScheduleData?.courses.length || 0} Classes
              </Badge>
            </div>

            {/* Compact class cards */}
            <div className="space-y-2.5">
              {selectedScheduleData?.courses.map((course, ci) => {
                const isFirst = ci === 0;
                const timeStr = course.time.split("(")[0].trim();
                const startTime = timeStr.split("-")[0].trim();
                const color = timetableColors[ci % timetableColors.length];
                return (
                  <motion.div
                    key={ci}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: ci * 0.06 }}
                    className={`bg-card rounded-xl border px-3.5 py-3 flex items-center gap-3 ${
                      isFirst ? "border-schedule-accent/30" : "border-border"
                    }`}
                  >
                    {/* Time badge */}
                    <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl flex-shrink-0 ${
                      isFirst ? "bg-schedule-accent text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      <Clock className="w-4 h-4" />
                      <span className="text-[9px] font-bold mt-0.5">{isFirst ? "NOW" : startTime}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-[10px] font-bold uppercase tracking-wider ${color.text}`}>{course.code}</p>
                        {isFirst && (
                          <span className="text-[9px] font-bold text-stat-emerald bg-stat-emerald/10 px-1.5 py-0.5 rounded-full uppercase">Ongoing</span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-foreground leading-tight">{course.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-0.5"><User className="w-3 h-3" /> Instructor</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5"><Building2 className="w-3 h-3" /> {course.room.replace("Room: ", "")}</span>
                        <span>·</span>
                        <span>{timeStr}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* End of classes */}
            <div className="flex items-center gap-3 mt-5 mb-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">End of Classes</span>
              <div className="flex-1 h-px bg-border" />
            </div>
          </motion.div>
        )}

        {mobileStep5Tab === "conflicts" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full bg-stat-emerald/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-stat-emerald" />
            </div>
            <p className="font-semibold text-foreground">No Conflicts Detected</p>
            <p className="text-sm text-muted-foreground mt-1 text-center">Your schedule has no time overlaps. You're ready to save.</p>
          </motion.div>
        )}

        {/* Conflict check info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="mt-6 bg-schedule-accent/5 border border-dashed border-schedule-accent/30 rounded-2xl p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-schedule-accent/10 flex items-center justify-center mx-auto mb-3">
            <Info className="w-5 h-5 text-schedule-accent" />
          </div>
          <h3 className="font-bold text-foreground text-sm">Checking for Conflicts</h3>
          <p className="text-xs text-muted-foreground mt-1">No schedule overlaps detected. You are ready to save.</p>
        </motion.div>

        {/* Save success */}
        <AnimatePresence>
          {saved && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="mt-5 bg-stat-emerald/5 border border-stat-emerald/30 rounded-2xl p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-stat-emerald/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-stat-emerald" />
              </div>
              <h3 className="font-bold text-foreground text-lg">Schedule Saved!</h3>
              <p className="text-sm text-muted-foreground mt-2">Your schedule has been saved. Proceed to advising or create a new one.</p>
              <div className="flex flex-col gap-3 mt-5">
                <Button onClick={resetAll} variant="outline" className="w-full gap-2">
                  <Plus className="w-4 h-4" />Create New Schedule
                </Button>
                <Button className="w-full gap-2 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold">
                  Proceed to Advising <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Save Bar */}
      {!saved && (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border px-4 py-4 pb-6">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2">
              <PlusCircle className="w-4 h-4" />Manual Add
            </Button>
            <motion.div whileTap={{ scale: 0.97 }} className="flex-1">
              <Button onClick={handleSave} className="w-full gap-2 rounded-xl py-5 bg-schedule-accent hover:bg-schedule-accent/90 text-primary-foreground font-bold text-base shadow-[0_6px_24px_-4px_hsl(var(--schedule-accent)/0.4)]">
                <Save className="w-4 h-4" />Save Schedule
              </Button>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );

  const content = step === 1 ? step1Content : step === 2 ? step2Content : step === 3 ? step3Content : step === 4 ? step4Content : step5Content;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <style>{`
          .mobile-schedule-builder *::-webkit-scrollbar { display: none !important; }
          .mobile-schedule-builder * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        `}</style>
        <div className="mobile-schedule-builder flex-1 flex flex-col min-h-0">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activePage="Schedule Builder" />
      <main className="flex-1 flex flex-col overflow-hidden">{content}</main>
    </div>
  );
};

export default ScheduleBuilder;
