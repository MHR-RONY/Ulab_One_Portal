import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Shield, Lock, Camera, Settings2, Building2, Calendar, Info, Search, Bell, CheckCircle2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Sidebar from "@/components/student/Sidebar";
import BottomNav from "@/components/student/BottomNav";
import MobileMenuDrawer from "@/components/student/MobileMenuDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

const Settings = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { theme, toggleTheme } = useTheme();
  const [fullName, setFullName] = useState("Tanvir Ahmed");
  const [email, setEmail] = useState("tanvir.ahmed@ulab.edu.bd");
  const [twoFactor, setTwoFactor] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState("English (US)");

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
                        value="213014000"
                        disabled
                        className="bg-muted border-none rounded-lg text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <div className={`space-y-1.5 ${isMobile ? "" : "col-span-2"}`}>
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-muted/50 border-none rounded-lg"
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
                        <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <button className="px-3 py-2 text-primary font-bold text-sm hover:bg-primary/10 rounded-lg transition-colors">
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
                      <span className="text-sm font-medium text-foreground">Computer Science & Engineering</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Semester</label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">Spring 2024</span>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-6 py-3 bg-primary/5 text-primary rounded-xl text-sm font-bold hover:bg-primary/10 transition-colors">
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

          {/* Footer Actions */}
          <div className={`mt-8 flex ${isMobile ? "flex-col gap-3" : "justify-end gap-4"} pb-12`}>
            <Button variant="outline" className={`${isMobile ? "w-full" : ""} font-bold`}>
              Discard Changes
            </Button>
            <Button className={`${isMobile ? "w-full" : ""} bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20`}>
              Save Settings
            </Button>
          </div>
        </div>
      </main>
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
