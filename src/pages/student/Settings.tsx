import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Shield, Lock, Camera, Settings2, Building2, Calendar, Info, Search, Bell, CheckCircle2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import Sidebar from "@/components/student/Sidebar";
import BottomNav from "@/components/student/BottomNav";
import MobileMenuDrawer from "@/components/student/MobileMenuDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import { useStudentSettings } from "@/hooks/useStudentSettings";

const Settings = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const { settings, loading, saving, updateSettings, changePassword } = useStudentSettings();

  const [fullName, setFullName] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState("English (US)");

  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFullName(settings.name);
      setTwoFactor(settings.twoFactorEnabled);
      setEmailAlerts(settings.emailAlerts);
      setPushNotifications(settings.pushNotifications);
      setLanguage(settings.language);
    }
  }, [settings]);

  const handleSave = async () => {
    const ok = await updateSettings({
      name: fullName,
      emailAlerts,
      pushNotifications,
      language,
      twoFactorEnabled: twoFactor,
    });
    if (ok) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleDiscard = () => {
    if (settings) {
      setFullName(settings.name);
      setTwoFactor(settings.twoFactorEnabled);
      setEmailAlerts(settings.emailAlerts);
      setPushNotifications(settings.pushNotifications);
      setLanguage(settings.language);
    }
  };

  const handlePasswordChange = async () => {
    setPwError("");
    setPwSuccess("");
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    setPwLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setPwLoading(false);
    if (result.ok) {
      setPwSuccess(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setPwDialogOpen(false);
        setPwSuccess("");
      }, 1500);
    } else {
      setPwError(result.message);
    }
  };

  const content = (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Header */}
      {isMobile ? (
        <div className="sticky top-0 z-20 bg-card border-b border-border">
          <div className="flex items-center px-4 py-3 gap-3">
            <button onClick={() => navigate(-1)} className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h1 className="text-lg font-bold leading-tight text-foreground flex-1">Settings</h1>
            <MobileMenuDrawer activePage="Settings" />
          </div>
        </div>
      ) : (
        <header className="sticky top-0 z-10 bg-card/80 backdrop-blur-md border-b border-border px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-foreground">Account Settings</h2>
            <p className="text-muted-foreground text-sm mt-0.5">Manage your profile, security, and academic preferences.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search settings..." className="pl-10 w-64 bg-card border-border rounded-xl" />
            </div>
            <button className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className={`${isMobile ? "p-4" : "p-8"} max-w-6xl mx-auto`}>
          {loading ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground">Loading settings...</div>
          ) : (
            <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-12"} gap-6`}>
              {/* Left Column: Profile & Security */}
              <div className={`${isMobile ? "" : "col-span-8"} space-y-6`}>
                {/* Profile Information */}
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <User className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">Profile Information</h3>
                  </div>
                  <div className={`flex ${isMobile ? "flex-col items-center" : "flex-row"} gap-6 md:gap-8 items-start`}>
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-muted overflow-hidden bg-accent-orange/20 flex items-center justify-center">
                        <User className="w-14 h-14 text-accent-orange/60" />
                      </div>
                      <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg border-4 border-card hover:scale-105 transition-transform">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    {/* Fields */}
                    <div className={`flex-1 grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-5 w-full`}>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
                        <Input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="bg-muted/50 border-none rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Student ID</label>
                        <Input
                          value={settings?.studentId ?? ""}
                          disabled
                          className="bg-muted border-none rounded-lg text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                      <div className={`space-y-1.5 ${isMobile ? "" : "col-span-2"}`}>
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                        <Input
                          type="email"
                          value={settings?.email ?? ""}
                          disabled
                          className="bg-muted border-none rounded-lg text-muted-foreground cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Security Section */}
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="text-xl font-bold text-foreground">Security</h3>
                  </div>
                  <div className="space-y-4">
                    {/* Password */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Lock className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">Password</p>
                          <p className="text-xs text-muted-foreground">Keep your account secure</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { setPwDialogOpen(true); setPwError(""); setPwSuccess(""); }}
                        className="px-3 py-2 text-primary font-bold text-sm hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        Change Password
                      </button>
                    </div>
                    {/* 2FA */}
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-stat-emerald/10 flex items-center justify-center text-stat-emerald">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-sm">Two-Factor Authentication</p>
                          <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setTwoFactor(!twoFactor)}
                        className={`relative w-11 h-6 rounded-full transition-colors ${twoFactor ? "bg-primary" : "bg-muted"}`}
                      >
                        <div className={`absolute top-[2px] w-5 h-5 bg-card rounded-full shadow transition-transform ${twoFactor ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
                      </button>
                    </div>
                  </div>
                </motion.section>
              </div>

              {/* Right Column: Preferences & Academic */}
              <div className={`${isMobile ? "" : "col-span-4"} space-y-6`}>
                {/* General Preferences */}
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 }}
                  className="bg-card rounded-xl p-6 border border-border shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Settings2 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">General Preferences</h3>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Language</label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-muted/50 border-none rounded-lg px-3 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none"
                      >
                        <option>English (US)</option>
                        <option>Bengali</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-medium text-foreground">Dark Mode</span>
                      <button
                        onClick={toggleTheme}
                        className={`relative w-11 h-6 rounded-full transition-colors ${theme === "dark" ? "bg-primary" : "bg-muted"}`}
                      >
                        <div className={`absolute top-[2px] w-5 h-5 bg-card rounded-full shadow transition-transform ${theme === "dark" ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
                      </button>
                    </div>
                    <div className="border-t border-border pt-4 mt-2">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Notifications</p>
                      <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <Checkbox checked={emailAlerts} onCheckedChange={(v) => setEmailAlerts(!!v)} />
                          <span className="text-sm text-foreground">Email Alerts</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                          <Checkbox checked={pushNotifications} onCheckedChange={(v) => setPushNotifications(!!v)} />
                          <span className="text-sm text-foreground">Push Notifications</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.section>

                {/* Academic Focus */}
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16 }}
                  className="bg-card rounded-xl p-6 border border-border shadow-sm"
                >
                  <div className="flex items-center gap-2 mb-6">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-bold text-foreground">Academic Focus</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Primary Department</label>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{settings?.department ?? "-"}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Semester</label>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">
                          {settings?.semester ? `Semester ${settings.semester}` : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/profile")}
                    className="w-full mt-6 py-3 bg-primary/5 text-primary rounded-xl text-sm font-bold hover:bg-primary/10 transition-colors"
                  >
                    Update Academic Profile
                  </button>
                </motion.section>

                {/* Info Banner */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-primary/80 leading-relaxed font-medium">
                      Changes to your academic focus may require advisor approval before taking effect.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          {!loading && (
            <div className={`mt-8 flex ${isMobile ? "flex-col gap-3" : "justify-end gap-4"} pb-12 items-center`}>
              {saveSuccess && (
                <span className="text-sm text-stat-emerald font-medium mr-auto">Settings saved successfully.</span>
              )}
              <Button variant="outline" onClick={handleDiscard} className={`${isMobile ? "w-full" : ""} font-bold`}>
                Discard Changes
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className={`${isMobile ? "w-full" : ""} bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20`}
              >
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Change Password Dialog */}
      <Dialog open={pwDialogOpen} onOpenChange={setPwDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Password</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            {pwError && <p className="text-sm text-destructive font-medium">{pwError}</p>}
            {pwSuccess && <p className="text-sm text-stat-emerald font-medium">{pwSuccess}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePasswordChange} disabled={pwLoading}>
              {pwLoading ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {content}
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar activePage="Settings" />
      {content}
    </div>
  );
};

export default Settings;
