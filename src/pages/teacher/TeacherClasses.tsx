import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserCheck, ClipboardList,
  Download, Plus, X, Search, BookOpen, Loader2,
  UserMinus, UserPlus, ChevronDown, ChevronUp,
} from "lucide-react";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import TeacherHeader from "@/components/teacher/TeacherHeader";
import { useIsMobile } from "@/hooks/use-mobile";
import TeacherBottomNav from "@/components/teacher/TeacherBottomNav";
import { useTeacherCourses, ICourse, IEnrolledStudent } from "@/hooks/useTeacherCourses";
import { useTeacherProfile } from "@/hooks/useTeacherProfile";
import api from "@/lib/api";

const DAYS = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"] as const;

interface CreateForm {
  courseCode: string;
  name: string;
  section: string;
  credits: string;
  department: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface SearchStudent {
  _id: string;
  name: string;
  studentId: string;
  email: string;
  department: string;
}

const defaultForm: CreateForm = {
  courseCode: "",
  name: "",
  section: "",
  credits: "3",
  department: "",
  day: "Monday",
  startTime: "",
  endTime: "",
  room: "",
};

const ACTIVITY_COLORS = [
  "bg-primary/10 text-primary",
  "bg-stat-purple/10 text-stat-purple",
  "bg-stat-emerald/10 text-stat-emerald",
  "bg-stat-amber/10 text-stat-amber",
];

const TeacherClasses = () => {
  const isMobile = useIsMobile();
  const { courses, loading, refetch } = useTeacherCourses();
  const { profile } = useTeacherProfile();

  // Create class dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateForm>(defaultForm);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Manage students dialog
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<ICourse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchStudent[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<IEnrolledStudent[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Pre-fill department from profile
  useEffect(() => {
    if (profile && !form.department) {
      setForm((prev) => ({ ...prev, department: profile.department }));
    }
  }, [profile, form.department]);

  // Search students with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/teacher/students/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(data.data ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const openManage = (course: ICourse) => {
    setSelectedCourse(course);
    setEnrolledStudents(course.enrolledStudents);
    setSearchQuery("");
    setSearchResults([]);
    setManageOpen(true);
  };

  const handleCreate = async () => {
    setCreateError("");
    if (!form.courseCode || !form.name || !form.section || !form.credits || !form.department) {
      setCreateError("All fields except schedule are required.");
      return;
    }
    setCreating(true);
    try {
      const scheduleSlots =
        form.day && form.startTime && form.endTime && form.room
          ? [{ day: form.day, startTime: form.startTime, endTime: form.endTime, room: form.room }]
          : [];
      await api.post("/teacher/courses", {
        courseCode: form.courseCode,
        name: form.name,
        section: form.section,
        credits: Number(form.credits),
        department: form.department,
        scheduleSlots,
      });
      setCreateOpen(false);
      setForm({ ...defaultForm, department: profile?.department ?? "" });
      refetch();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setCreateError(msg ?? "Failed to create course. Course code may already exist.");
    } finally {
      setCreating(false);
    }
  };

  const handleAddStudent = async (student: SearchStudent) => {
    if (!selectedCourse) return;
    setAddingId(student._id);
    try {
      await api.post(`/teacher/courses/${selectedCourse._id}/students`, {
        studentMongoId: student._id,
      });
      const newStudent: IEnrolledStudent = {
        _id: student._id,
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        department: student.department,
      };
      setEnrolledStudents((prev) => [...prev, newStudent]);
      setSearchResults((prev) => prev.filter((s) => s._id !== student._id));
      refetch();
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      alert(msg ?? "Failed to add student.");
    } finally {
      setAddingId(null);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    if (!selectedCourse) return;
    setRemovingId(studentId);
    try {
      await api.delete(`/teacher/courses/${selectedCourse._id}/students/${studentId}`);
      setEnrolledStudents((prev) => prev.filter((s) => s._id !== studentId));
      refetch();
    } catch {
      alert("Failed to remove student.");
    } finally {
      setRemovingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalStudents = courses.reduce((acc, c) => acc + c.enrolledStudents.length, 0);

  const content = (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">My Classes</h2>
          <p className="text-muted-foreground font-medium text-sm">
            {loading ? "Loading..." : `Managing ${courses.length} active course${courses.length !== 1 ? "s" : ""} this semester.`}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setForm({ ...defaultForm, department: profile?.department ?? "" });
              setCreateError("");
              setCreateOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/15 hover:shadow-xl active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" /> Create Class
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary transition-all">
            <Download className="w-4 h-4" /> Export Reports
          </button>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {[
          { icon: BookOpen, label: "Active Courses", value: loading ? "-" : String(courses.length), bgClass: "bg-primary/10 text-primary" },
          { icon: Users, label: "Total Students", value: loading ? "-" : String(totalStudents), bgClass: "bg-stat-purple/10 text-stat-purple" },
          { icon: ClipboardList, label: "Total Credits", value: loading ? "-" : String(courses.reduce((acc, c) => acc + c.credits, 0)), bgClass: "bg-stat-emerald/10 text-stat-emerald" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
            className="bg-card p-6 rounded-2xl border border-border"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgClass}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-muted-foreground text-sm font-semibold">{stat.label}</p>
            <h3 className="text-2xl font-extrabold text-foreground mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Course Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : courses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground"
        >
          <BookOpen className="w-12 h-12 opacity-30" />
          <p className="text-lg font-semibold">No classes yet</p>
          <p className="text-sm">Click "Create Class" to add your first course.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {courses.map((course, i) => {
            const isExpanded = expandedCards.has(course._id);
            const slot = course.scheduleSlots[0];
            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 bg-secondary rounded-lg text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {course.section}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-1">{course.name}</h4>
                  <p className="text-muted-foreground text-sm font-medium mb-4">
                    {course.courseCode} • {slot ? `${slot.day} ${slot.startTime}` : "No schedule"}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Students</p>
                      <p className="text-lg font-bold text-foreground">{course.enrolledStudents.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">Credits</p>
                      <p className="text-lg font-bold text-foreground">{course.credits}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-secondary/50 p-4 border-t border-border flex gap-2">
                  <button
                    onClick={() => openManage(course)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
                  >
                    <UserPlus className="w-4 h-4" /> Manage Students
                  </button>
                  <button
                    onClick={() => toggleExpand(course._id)}
                    className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-card transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    Students
                  </button>
                </div>

                {/* Inline student list */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-border"
                    >
                      <div className="p-4 space-y-2 max-h-56 overflow-y-auto">
                        {course.enrolledStudents.length === 0 ? (
                          <p className="text-xs text-muted-foreground text-center py-2">No students enrolled.</p>
                        ) : (
                          course.enrolledStudents.map((s) => (
                            <div key={s._id} className="flex items-center justify-between text-sm">
                              <div>
                                <p className="font-semibold text-foreground">{s.name}</p>
                                <p className="text-[10px] text-muted-foreground">{s.studentId}</p>
                              </div>
                              <UserCheck className="w-4 h-4 text-stat-emerald" />
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bottom Row: Enrollment by Course + Course Overview */}
      {!loading && courses.length > 0 && (() => {
        const maxStudents = Math.max(...courses.map((c) => c.enrolledStudents.length), 1);
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Enrollment by Course */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="bg-card p-6 md:p-8 rounded-2xl border border-border"
            >
              <div className="mb-8">
                <h4 className="text-lg font-bold text-foreground">Enrollment by Course</h4>
                <p className="text-muted-foreground text-sm">Student enrollment across all your courses</p>
              </div>
              <div className="relative h-64 flex items-end justify-between px-2 gap-3">
                {courses.map((course, i) => {
                  const pct = maxStudents === 0 ? 0 : Math.round((course.enrolledStudents.length / maxStudents) * 100);
                  return (
                    <motion.div
                      key={course._id}
                      className="flex flex-col items-center gap-2 group flex-1 min-w-0"
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      transition={{ delay: 0.7 + i * 0.08, duration: 0.5 }}
                      style={{ transformOrigin: "bottom" }}
                    >
                      <span className="text-xs font-bold text-primary">{course.enrolledStudents.length}</span>
                      <div className="w-full bg-secondary rounded-t-lg h-32 relative overflow-hidden group-hover:bg-primary/10 transition-all">
                        <motion.div
                          className="absolute bottom-0 w-full rounded-t-lg bg-primary"
                          initial={{ height: 0 }}
                          animate={{ height: `${pct}%` }}
                          transition={{ delay: 0.8 + i * 0.1, duration: 0.6, ease: "easeOut" }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground truncate w-full text-center">{course.courseCode}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Course Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              className="bg-card p-6 md:p-8 rounded-2xl border border-border"
            >
              <h4 className="text-lg font-bold text-foreground mb-6">Course Overview</h4>
              <div className="space-y-5">
                {courses.map((course, i) => {
                  const slot = course.scheduleSlots[0];
                  return (
                    <motion.div
                      key={course._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.06, duration: 0.3 }}
                      className="flex gap-4"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${ACTIVITY_COLORS[i % ACTIVITY_COLORS.length]}`}>
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-foreground font-semibold truncate">{course.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.courseCode} • {course.section} • {course.enrolledStudents.length} student{course.enrolledStudents.length !== 1 ? "s" : ""}
                          {slot ? ` • ${slot.day} ${slot.startTime}` : ""}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        );
      })()}
    </div>
  );

  // ---- Create Class Dialog ----
  const createDialog = (
    <AnimatePresence>
      {createOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setCreateOpen(false); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="bg-card rounded-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-bold text-foreground">Create New Class</h3>
              <button onClick={() => setCreateOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Course Name", key: "name" as const, placeholder: "e.g. Data Structures" },
                { label: "Course Code", key: "courseCode" as const, placeholder: "e.g. CSE-201" },
                { label: "Section", key: "section" as const, placeholder: "e.g. Section A" },
                { label: "Department", key: "department" as const, placeholder: "e.g. Computer Science" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">{label}</label>
                  <input
                    value={form[key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase mb-1.5">Credits</label>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={form.credits}
                  onChange={(e) => setForm((prev) => ({ ...prev, credits: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="pt-2">
                <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Schedule Slot (optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">Day</label>
                    <select
                      value={form.day}
                      onChange={(e) => setForm((prev) => ({ ...prev, day: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {DAYS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">Room</label>
                    <input
                      value={form.room}
                      onChange={(e) => setForm((prev) => ({ ...prev, room: e.target.value }))}
                      placeholder="e.g. Room 301"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">Start Time</label>
                    <input
                      value={form.startTime}
                      onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
                      placeholder="e.g. 10:00 AM"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-muted-foreground mb-1">End Time</label>
                    <input
                      value={form.endTime}
                      onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
                      placeholder="e.g. 11:30 AM"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
              </div>
              {createError && (
                <p className="text-destructive text-sm font-medium">{createError}</p>
              )}
            </div>
            <div className="p-6 pt-0 flex gap-3">
              <button
                onClick={() => setCreateOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                {creating ? "Creating..." : "Create Class"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ---- Manage Students Dialog ----
  const manageDialog = (
    <AnimatePresence>
      {manageOpen && selectedCourse && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setManageOpen(false); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="bg-card rounded-2xl border border-border w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
              <div>
                <h3 className="text-lg font-bold text-foreground">Manage Students</h3>
                <p className="text-xs text-muted-foreground">{selectedCourse.name} — {selectedCourse.section}</p>
              </div>
              <button onClick={() => setManageOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-border shrink-0">
              <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Add Student</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, student ID, or email..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {(searching || searchResults.length > 0) && (
                <div className="mt-2 rounded-xl border border-border bg-background max-h-40 overflow-y-auto">
                  {searching ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    searchResults.map((s) => {
                      const alreadyIn = enrolledStudents.some((e) => e._id === s._id);
                      return (
                        <div key={s._id} className="flex items-center justify-between px-4 py-2.5 hover:bg-secondary/60 transition-colors">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.studentId} • {s.department}</p>
                          </div>
                          {alreadyIn ? (
                            <span className="text-xs text-stat-emerald font-bold">Enrolled</span>
                          ) : (
                            <button
                              onClick={() => handleAddStudent(s)}
                              disabled={addingId === s._id}
                              className="flex items-center gap-1 px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-60"
                            >
                              {addingId === s._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserPlus className="w-3 h-3" />}
                              Add
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Enrolled students list */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-muted-foreground uppercase">Enrolled Students</p>
                <span className="text-xs font-bold text-primary">{enrolledStudents.length}</span>
              </div>
              {enrolledStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
                  <Users className="w-8 h-8 opacity-30" />
                  <p className="text-sm">No students enrolled yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {enrolledStudents.map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.studentId} • {student.email}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveStudent(student._id)}
                        disabled={removingId === student._id}
                        className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                        title="Remove student"
                      >
                        {removingId === student._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 pt-0 shrink-0">
              <button
                onClick={() => setManageOpen(false)}
                className="w-full py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-secondary transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <TeacherHeader />
        <main className="pb-28">{content}</main>
        <TeacherBottomNav />
        {createDialog}
        {manageDialog}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden premium-bg">
      <div className="hidden md:block">
        <TeacherSidebar activePage="My Classes" />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TeacherHeader />
        <main className="flex-1 overflow-y-auto">{content}</main>
      </div>
      {createDialog}
      {manageDialog}
    </div>
  );
};

export default TeacherClasses;
