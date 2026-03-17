import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Lock, Bell, Palette, Camera, ShieldCheck, KeyRound,
  Sun, Moon, ArrowLeft, CheckCircle2, Mail, Smartphone, MessageSquare,
  Globe, Monitor, Info
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import TeacherSidebar from "@/components/teacher/TeacherSidebar";
import TeacherHeader from "@/components/teacher/TeacherHeader";
import TeacherBottomNav from "@/components/teacher/TeacherBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import { toast } from "sonner";

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "display", label: "Display", icon: Palette },
] as const;

type TabId = (typeof tabs)[number]["id"];

const accentColors = [
  { name: "Blue", value: "hsl(222, 85%, 50%)", class: "bg-primary" },
  { name: "Emerald", value: "hsl(160, 84%, 39%)", class: "bg-stat-emerald" },
  { name: "Purple", value: "hsl(262, 83%, 58%)", class: "bg-stat-purple" },
  { name: "Rose", value: "hsl(350, 89%, 60%)", class: "bg-destructive" },
  { name: "Amber", value: "hsl(38, 92%, 50%)", class: "bg-stat-amber" },
];

const TeacherSettings = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [fullName, setFullName] = useState("Dr. Sarah Mitchell");
  const [email, setEmail] = useState("sarah.m@ulab.edu");
  const [bio, setBio] = useState(
    "Senior Professor in Computer Science with a focus on Human-Computer Interaction and AI ethics. Serving ULAB for over 10 years."
  );
  const [twoFactor, setTwoFactor] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(false);
  const [studentMessages, setStudentMessages] = useState(true);
  const [gradeAlerts, setGradeAlerts] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [selectedAccent, setSelectedAccent] = useState(0);

  const handleSave = () => {
    toast.success("Settings saved successfully!");
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <div
        className={`absolute top-[2px] w-5 h-5 bg-card rounded-full shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );

  const renderProfile = () => (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-border">
      <div>
        <h3 className="text-lg font-bold text-foreground">Profile Information</h3>
        <p className="text-sm text-muted-foreground mt-1">Update your public profile and bio.</p>
      </div>
      <div className="md:col-span-2 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-4 border-card shadow-sm flex items-center justify-center">
              <User className="w-10 h-10 text-primary/50" />
            </div>
            <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">Avatar Image</h4>
            <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size 2MB.</p>
          </div>
        </div>
        {/* Name / Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Full Name</label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-xl bg-secondary/50 border-border" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Work Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="rounded-xl bg-secondary/50 border-border" />
          </div>
        </div>
        {/* Bio */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Bio</label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="rounded-xl bg-secondary/50 border-border resize-y"
          />
        </div>
        {/* Department & Role (read-only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Department</label>
            <Input value="Computer Science & Engineering" disabled className="rounded-xl bg-muted border-none text-muted-foreground cursor-not-allowed" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Role</label>
            <Input value="Senior Professor" disabled className="rounded-xl bg-muted border-none text-muted-foreground cursor-not-allowed" />
          </div>
        </div>
      </div>
    </section>
  );

  const renderSecurity = () => (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-border">
      <div>
        <h3 className="text-lg font-bold text-foreground">Account Security</h3>
        <p className="text-sm text-muted-foreground mt-1">Keep your account secure with a strong password and 2FA.</p>
      </div>
      <div className="md:col-span-2 space-y-4">
        {/* Password */}
        <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Password</p>
              <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl font-semibold">
            Change
          </Button>
        </div>
        {/* 2FA */}
        <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-stat-emerald/10 flex items-center justify-center text-stat-emerald">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">
                {twoFactor ? "Currently enabled via Email" : "Not enabled"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTwoFactor(!twoFactor)}
            className={`rounded-xl font-semibold ${twoFactor ? "text-destructive border-destructive/30 hover:bg-destructive/10" : "text-primary"}`}
          >
            {twoFactor ? "Disable" : "Enable"}
          </Button>
        </div>
        {/* Active Sessions */}
        <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-stat-blue/10 flex items-center justify-center text-stat-blue">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Active Sessions</p>
              <p className="text-xs text-muted-foreground">2 devices currently logged in</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl font-semibold">
            Manage
          </Button>
        </div>
      </div>
    </section>
  );

  const notifItems = [
    { label: "Email Notifications", desc: "Receive summaries of course activities", icon: Mail, checked: emailNotifs, onChange: () => setEmailNotifs(!emailNotifs) },
    { label: "Push Notifications", desc: "Get instant alerts on your mobile device", icon: Smartphone, checked: pushNotifs, onChange: () => setPushNotifs(!pushNotifs) },
    { label: "Student Messages", desc: "Notifications for direct messages", icon: MessageSquare, checked: studentMessages, onChange: () => setStudentMessages(!studentMessages) },
    { label: "Grade Submission Alerts", desc: "Reminders when grades are due", icon: CheckCircle2, checked: gradeAlerts, onChange: () => setGradeAlerts(!gradeAlerts) },
    { label: "Attendance Flags", desc: "Alert when student attendance drops below threshold", icon: Bell, checked: attendanceAlerts, onChange: () => setAttendanceAlerts(!attendanceAlerts) },
  ];

  const renderNotifications = () => (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10 border-b border-border">
      <div>
        <h3 className="text-lg font-bold text-foreground">Notification Preferences</h3>
        <p className="text-sm text-muted-foreground mt-1">Manage how you receive updates and alerts.</p>
      </div>
      <div className="md:col-span-2 space-y-1">
        {notifItems.map((item, i) => (
          <div
            key={item.label}
            className={`flex items-center justify-between py-4 ${i > 0 ? "border-t border-border" : ""}`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-sm text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
            <Toggle checked={item.checked} onChange={item.onChange} />
          </div>
        ))}
      </div>
    </section>
  );

  const renderDisplay = () => (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10">
      <div>
        <h3 className="text-lg font-bold text-foreground">Portal Display</h3>
        <p className="text-sm text-muted-foreground mt-1">Customize the look and feel of your portal.</p>
      </div>
      <div className="md:col-span-2 space-y-6">
        {/* Theme toggle */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => theme === "dark" && toggleTheme()}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              theme === "light"
                ? "border-primary ring-4 ring-primary/10 bg-card"
                : "border-border bg-secondary/30 hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <Sun className={`w-5 h-5 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
              <span className="font-semibold text-sm text-foreground">Light Mode</span>
            </div>
            <div className="w-full h-12 bg-secondary rounded-lg overflow-hidden flex gap-1 p-1">
              <div className="w-1/3 bg-card rounded-sm border border-border" />
              <div className="w-2/3 bg-card rounded-sm border border-border" />
            </div>
          </button>
          <button
            onClick={() => theme === "light" && toggleTheme()}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              theme === "dark"
                ? "border-primary ring-4 ring-primary/10 bg-card"
                : "border-border bg-secondary/30 hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <Moon className={`w-5 h-5 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
              <span className="font-semibold text-sm text-foreground">Dark Mode</span>
            </div>
            <div className="w-full h-12 bg-[hsl(220,20%,15%)] rounded-lg overflow-hidden flex gap-1 p-1">
              <div className="w-1/3 bg-[hsl(220,20%,10%)] rounded-sm border border-[hsl(220,15%,25%)]" />
              <div className="w-2/3 bg-[hsl(220,20%,10%)] rounded-sm border border-[hsl(220,15%,25%)]" />
            </div>
          </button>
        </div>
        {/* Accent Color */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Accent Color</p>
          <div className="flex gap-4">
            {accentColors.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setSelectedAccent(i)}
                className={`w-8 h-8 rounded-full ${c.class} transition-all ${
                  selectedAccent === i ? "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110" : "hover:scale-105"
                }`}
                title={c.name}
              />
            ))}
          </div>
        </div>
        {/* Language */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Language</label>
          <select className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 outline-none">
            <option>English (US)</option>
            <option>Bengali</option>
          </select>
        </div>
      </div>
    </section>
  );

  const tabContent: Record<TabId, () => React.JSX.Element> = {
    profile: renderProfile,
    security: renderSecurity,
    notifications: renderNotifications,
    display: renderDisplay,
  };

  const content = (
    <div className={`${isMobile ? "p-4" : "p-8"} max-w-5xl mx-auto space-y-8`}>
      {/* Page Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your profile, security, and portal preferences.</p>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-border overflow-x-auto">
        <div className="flex gap-6 md:gap-8 whitespace-nowrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary font-bold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active Section */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tabContent[activeTab]()}
      </motion.div>

      {/* Info Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-primary/80 leading-relaxed font-medium">
            Some changes may require administrator approval. Contact IT support if you need assistance.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className={`flex ${isMobile ? "flex-col gap-3" : "justify-end gap-3"} pt-6 border-t border-border pb-8`}>
        <Button variant="outline" className={`${isMobile ? "w-full" : ""} rounded-xl font-semibold`}>
          Discard Changes
        </Button>
        <Button
          onClick={handleSave}
          className={`${isMobile ? "w-full" : ""} bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20`}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <div className="sticky top-0 z-20 bg-card border-b border-border">
          <div className="flex items-center px-4 py-3 gap-3">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground flex-1">Settings</h1>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto pb-20">{content}</div>
        <TeacherBottomNav />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden premium-bg">
      <div className="hidden md:block">
        <TeacherSidebar activePage="Settings" />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TeacherHeader />
        <main className="flex-1 overflow-y-auto">{content}</main>
      </div>
    </div>
  );
};

export default TeacherSettings;
