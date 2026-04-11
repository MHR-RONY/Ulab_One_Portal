import { useState } from "react";
import Sidebar from "@/components/student/Sidebar";
import BottomNav from "@/components/student/BottomNav";
import MobileMenuDrawer from "@/components/student/MobileMenuDrawer";
import { User, Database, Wifi, Brain, Code, BookOpen, CalendarCheck, CheckSquare, Search, Bell, MessageSquare, Pen, Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStudentProfile } from "@/hooks/useStudentProfile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const COURSE_ICONS = [Code, Database, Wifi, Brain, BookOpen];

const Profile = () => {
  const isMobile = useIsMobile();
  const { profile, loading, error, saving, updateProfile } = useStudentProfile();

  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: "", department: "", semester: 1, phone: "" });

  const openEdit = () => {
    if (!profile) return;
    setForm({
      name: profile.name,
      department: profile.department,
      semester: profile.semester,
      phone: profile.phone,
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    await updateProfile(form);
    setEditOpen(false);
  };

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">
        <Sidebar activePage="My Profile" />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {isMobile ? (
          <header className="sticky top-0 z-20 bg-card border-b border-border">
            <div className="flex items-center px-4 py-3 gap-3">
              <h1 className="text-lg font-bold leading-tight text-foreground flex-1">My Profile</h1>
              <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </button>
              <MobileMenuDrawer activePage="My Profile" />
            </div>
          </header>
        ) : (
          <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  className="w-full pl-10 pr-4 py-2 bg-secondary border-none rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  placeholder="Search courses, grades, documents..."
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 text-muted-foreground hover:bg-secondary rounded-lg transition-colors">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
            {loading ? (
              <div className="flex items-center justify-center h-60 text-muted-foreground gap-2 text-sm">
                <Loader2 className="w-5 h-5 animate-spin" />
                Loading profile...
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-60 text-destructive text-sm">
                {error}
              </div>
            ) : (
              <>
                {/* Profile Header Card */}
                <div className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm flex flex-col md:flex-row gap-6 md:gap-8 items-center">
                  <div className="relative">
                    <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-secondary overflow-hidden shadow-xl bg-primary/10 flex items-center justify-center">
                      {initials !== "??" ? (
                        <span className="text-4xl font-black text-primary">{initials}</span>
                      ) : (
                        <User className="w-16 h-16 text-muted-foreground" />
                      )}
                    </div>
                    <div className="absolute bottom-1 right-1 bg-stat-emerald w-6 h-6 border-4 border-card rounded-full" />
                  </div>
                  <div className="text-center md:text-left space-y-2 flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{profile?.name}</h1>
                    <p className="text-muted-foreground font-medium">{profile?.department} Department</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        Semester {profile?.semester}
                      </span>
                      <span className="bg-stat-emerald/10 text-stat-emerald px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Regular Student</span>
                    </div>
                  </div>
                  <button
                    onClick={openEdit}
                    className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-semibold hover:bg-secondary transition-colors text-foreground"
                  >
                    <Pen className="w-4 h-4" />
                    Edit Profile
                  </button>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Details */}
                  <div className="lg:col-span-1">
                    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-foreground">
                        <User className="w-5 h-5 text-primary" />
                        Details
                      </h3>
                      <div className="space-y-4">
                        {[
                          { label: "Student ID", value: profile?.studentId ?? "—" },
                          { label: "Department", value: profile?.department ?? "—" },
                          { label: "Semester", value: profile?.semester ? `Semester ${profile.semester}` : "—" },
                          { label: "Total Credits", value: profile?.totalCredits ? `${profile.totalCredits} credits` : "—" },
                        ].map((item) => (
                          <div key={item.label} className="flex justify-between items-center py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                            <span className="text-sm font-semibold text-foreground">{item.value}</span>
                          </div>
                        ))}
                        <div className="space-y-1 py-2 border-b border-border/50">
                          <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Email</span>
                          <p className="text-sm font-medium text-foreground">{profile?.email ?? "—"}</p>
                        </div>
                        <div className="space-y-1 py-2">
                          <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Phone</span>
                          <p className="text-sm font-medium text-foreground">{profile?.phone || "Not set"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enrolled Subjects + Stats */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                          <Database className="w-5 h-5 text-primary" />
                          Enrolled Subjects
                        </h3>
                      </div>
                      {profile?.enrolledCourses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No courses enrolled yet.</p>
                      ) : (
                        <div className="space-y-4">
                          {profile?.enrolledCourses.map((course, idx) => {
                            const Icon = COURSE_ICONS[idx % COURSE_ICONS.length];
                            return (
                              <div key={course.courseCode} className="p-4 rounded-xl border border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                  <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-foreground">{course.courseName}</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {course.courseCode}
                                    {course.teacher ? ` • ${course.teacher}` : ""}
                                    {` • ${course.credits} credits`}
                                  </p>
                                </div>
                                <div className="sm:text-right">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Attendance: {course.attendancePercentage}%
                                  </p>
                                  <div className="w-full sm:w-32 bg-secondary h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className="bg-primary h-full rounded-full"
                                      style={{ width: `${course.attendancePercentage}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-primary rounded-xl p-6 text-primary-foreground shadow-lg shadow-primary/20">
                        <CalendarCheck className="w-6 h-6 mb-2 opacity-80" />
                        <h4 className="text-3xl font-black mb-1">
                          {profile?.overallAttendancePercentage ?? 0}%
                        </h4>
                        <p className="text-sm opacity-80">Overall Attendance</p>
                      </div>
                      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
                        <CheckSquare className="w-6 h-6 mb-2 text-primary" />
                        <h4 className="text-3xl font-black text-foreground mb-1">
                          {profile?.enrolledCourses.length ?? 0}
                        </h4>
                        <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <BottomNav />

      {/* Edit Profile Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="student-theme sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Full Name</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Department</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Semester</label>
              <input
                type="number"
                min={1}
                max={12}
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.semester}
                onChange={(e) => setForm((f) => ({ ...f, semester: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">Phone</label>
              <input
                className="w-full px-3 py-2 rounded-lg border border-border bg-secondary text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="+880 1700-000000"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <button
              onClick={() => setEditOpen(false)}
              className="px-4 py-2 rounded-lg border border-border text-sm font-semibold hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
