import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, ShieldCheck, KeyRound, Mail, Smartphone, Bell, Lock,
  Monitor, Globe, AlertTriangle, Trash2, Ban,
  Clock, MapPin, RotateCcw, LogOut, BookOpen,
  GraduationCap, FileText, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface TeacherAccountTabProps {
  teacher: { name: string; email: string; id: string; department: string; status: string; phone: string };
}

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const TeacherAccountTab = ({ teacher }: TeacherAccountTabProps) => {
  const [accountActive, setAccountActive] = useState(teacher.status === "Active");
  const [portalAccess, setPortalAccess] = useState(true);
  const [lmsAccess, setLmsAccess] = useState(true);
  const [gradingAccess, setGradingAccess] = useState(true);
  const [adminPanel, setAdminPanel] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const activityLog = [
    { action: "Logged in from Chrome / Windows", time: "Today, 8:15 AM", ip: "103.145.22.87", icon: Monitor },
    { action: "Grades submitted for CS-301", time: "Mar 5, 2026, 4:00 PM", ip: "103.145.22.87", icon: GraduationCap },
    { action: "Password changed", time: "Feb 28, 2026, 10:30 AM", ip: "103.145.22.90", icon: KeyRound },
    { action: "2FA enabled", time: "Feb 20, 2026, 2:30 PM", ip: "103.145.22.87", icon: ShieldCheck },
    { action: "Logged in from Safari / macOS", time: "Feb 18, 2026, 9:00 AM", ip: "103.145.22.91", icon: Smartphone },
  ];

  const sessions = [
    { device: "Chrome on Windows 11", location: "Dhaka, BD", lastActive: "Active now", current: true },
    { device: "Safari on MacBook Pro", location: "Dhaka, BD", lastActive: "1 hour ago", current: false },
  ];

  const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-card rounded-xl border border-border overflow-hidden ${className}`}>{children}</div>
  );

  const SectionHeader = ({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) => (
    <div className="p-5 border-b border-border flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-primary" />
      </div>
      <div>
        <h3 className="font-bold text-foreground text-[15px]">{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </div>
  );

  const ToggleRow = ({ icon: Icon, label, desc, checked, onChange }: {
    icon: React.ElementType; label: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-3.5 px-5">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <div>
          <p className="font-medium text-sm text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Account Status */}
      <motion.div {...fadeIn}>
        <SectionCard>
          <SectionHeader icon={User} title="Account Identity & Status" desc="Manage teacher account state and identity." />
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${accountActive ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
                <div>
                  <p className="font-semibold text-sm text-foreground">Account Status</p>
                  <p className="text-xs text-muted-foreground">{accountActive ? "Active and accessible" : "Currently deactivated"}</p>
                </div>
              </div>
              <Switch checked={accountActive} onCheckedChange={setAccountActive} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Teacher ID</label>
                <Input value={teacher.id} disabled className="rounded-lg bg-muted border-none text-muted-foreground cursor-not-allowed text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input value={teacher.email} disabled className="rounded-lg bg-muted border-none text-muted-foreground cursor-not-allowed text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Department</label>
                <Input value={teacher.department} disabled className="rounded-lg bg-muted border-none text-muted-foreground cursor-not-allowed text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Account Type</label>
                <Input value="Faculty Member" disabled className="rounded-lg bg-muted border-none text-muted-foreground cursor-not-allowed text-sm" />
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* Security */}
      <motion.div {...fadeIn} transition={{ delay: 0.08 }}>
        <SectionCard>
          <SectionHeader icon={ShieldCheck} title="Security & Authentication" desc="Password, 2FA, and session management." />
          <div className="divide-y divide-border">
            <div className="flex items-center justify-between py-3.5 px-5">
              <div className="flex items-center gap-3">
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm text-foreground">Force Password Reset</p>
                  <p className="text-xs text-muted-foreground">Send a reset link to teacher's email</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg text-xs font-semibold"
                onClick={() => toast.success("Password reset link sent to " + teacher.email)}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
              </Button>
            </div>
            <ToggleRow icon={ShieldCheck} label="Two-Factor Authentication" desc={twoFactor ? "Enabled via authenticator" : "Not enabled"} checked={twoFactor} onChange={setTwoFactor} />
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium text-sm text-foreground">Active Sessions</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => toast.success("All other sessions revoked")}>
                  <LogOut className="w-3.5 h-3.5 mr-1" /> Revoke All
                </Button>
              </div>
              <div className="space-y-2">
                {sessions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{s.device}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {s.location} · {s.lastActive}
                        </p>
                      </div>
                    </div>
                    {s.current && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">Current</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* Access */}
      <motion.div {...fadeIn} transition={{ delay: 0.16 }}>
        <SectionCard>
          <SectionHeader icon={Lock} title="Access & Permissions" desc="Control system access for this teacher." />
          <div className="divide-y divide-border">
            <ToggleRow icon={Globe} label="Faculty Portal" desc="Main faculty portal access" checked={portalAccess} onChange={setPortalAccess} />
            <ToggleRow icon={BookOpen} label="LMS Access" desc="Course management and materials" checked={lmsAccess} onChange={setLmsAccess} />
            <ToggleRow icon={GraduationCap} label="Grading System" desc="Submit and modify grades" checked={gradingAccess} onChange={setGradingAccess} />
            <ToggleRow icon={ShieldCheck} label="Admin Panel" desc="Administrative controls access" checked={adminPanel} onChange={setAdminPanel} />
          </div>
        </SectionCard>
      </motion.div>

      {/* Notifications */}
      <motion.div {...fadeIn} transition={{ delay: 0.24 }}>
        <SectionCard>
          <SectionHeader icon={Bell} title="Notification Preferences" desc="Configure alert delivery methods." />
          <div className="divide-y divide-border">
            <ToggleRow icon={Mail} label="Email Notifications" desc="Send to teacher email" checked={emailNotifs} onChange={setEmailNotifs} />
            <ToggleRow icon={Smartphone} label="SMS Notifications" desc="Text alerts to phone" checked={smsNotifs} onChange={setSmsNotifs} />
            <ToggleRow icon={Bell} label="Push Notifications" desc="In-app and browser alerts" checked={pushNotifs} onChange={setPushNotifs} />
          </div>
        </SectionCard>
      </motion.div>

      {/* Activity Log */}
      <motion.div {...fadeIn} transition={{ delay: 0.32 }}>
        <SectionCard>
          <SectionHeader icon={Clock} title="Recent Activity Log" desc="Account actions and login history." />
          <div className="divide-y divide-border">
            {activityLog.map((entry, i) => (
              <div key={i} className="flex items-center justify-between py-3 px-5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                    <entry.icon className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{entry.action}</p>
                    <p className="text-[11px] text-muted-foreground">{entry.time}</p>
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono bg-secondary/50 px-2 py-1 rounded">{entry.ip}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </motion.div>

      {/* Quick Actions */}
      <motion.div {...fadeIn} transition={{ delay: 0.4 }}>
        <SectionCard>
          <SectionHeader icon={Send} title="Quick Actions" desc="Common administrative actions." />
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start rounded-lg h-auto py-3 px-4" onClick={() => toast.success("Verification email sent")}>
              <Mail className="w-4 h-4 mr-2 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium">Send Verification Email</p>
                <p className="text-[11px] text-muted-foreground">Re-send email verification</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start rounded-lg h-auto py-3 px-4" onClick={() => toast.success("Faculty ID card generated")}>
              <FileText className="w-4 h-4 mr-2 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium">Generate Faculty ID</p>
                <p className="text-[11px] text-muted-foreground">Create printable faculty ID</p>
              </div>
            </Button>
          </div>
        </SectionCard>
      </motion.div>

      {/* Danger Zone */}
      <motion.div {...fadeIn} transition={{ delay: 0.48 }}>
        <div className="bg-card rounded-xl border-2 border-destructive/20 overflow-hidden">
          <div className="p-5 border-b border-destructive/20 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4.5 h-4.5 text-destructive" />
            </div>
            <div>
              <h3 className="font-bold text-destructive text-[15px]">Danger Zone</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Irreversible actions. Proceed with caution.</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-xl border border-destructive/10">
              <div className="flex items-center gap-3">
                <Ban className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-semibold text-sm text-foreground">Suspend Account</p>
                  <p className="text-xs text-muted-foreground">Temporarily disable all access.</p>
                </div>
              </div>
              {!showSuspendConfirm ? (
                <Button variant="outline" size="sm" className="rounded-lg text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => setShowSuspendConfirm(true)}>Suspend</Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button size="sm" className="rounded-lg text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={() => { setAccountActive(false); setShowSuspendConfirm(false); toast.success("Account suspended"); }}>Confirm</Button>
                  <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => setShowSuspendConfirm(false)}>Cancel</Button>
                </div>
              )}
            </div>
            <div className="flex flex-col p-4 bg-destructive/5 rounded-xl border border-destructive/10 gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Delete Account Permanently</p>
                    <p className="text-xs text-muted-foreground">This cannot be undone.</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => setShowDeleteConfirm(true)}>Delete</Button>
              </div>
              {showDeleteConfirm && (
                <div className="flex items-center gap-2 mt-2">
                  <Input placeholder={`Type "${teacher.id}" to confirm`} value={deleteInput} onChange={(e) => setDeleteInput(e.target.value)}
                    className="rounded-lg text-sm flex-1" />
                  <Button size="sm" disabled={deleteInput !== teacher.id}
                    className="rounded-lg text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={() => toast.success("Account deleted")}>Confirm Delete</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherAccountTab;
