import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, ShieldCheck, KeyRound, Mail, Smartphone, Bell, Lock,
  Monitor, Globe, AlertTriangle, Trash2, Ban, CheckCircle,
  Clock, MapPin, Eye, EyeOff, RotateCcw, LogOut, BookOpen,
  GraduationCap, Library, FileText, Settings, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface StudentData {
  name: string;
  email: string;
  id: string;
  department: string;
  status: string;
  phone: string;
}

interface AccountSettingsTabProps {
  student: StudentData;
}

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const AccountSettingsTab = ({ student }: AccountSettingsTabProps) => {
  const [accountActive, setAccountActive] = useState(student.status === "Active");
  const [portalAccess, setPortalAccess] = useState(true);
  const [lmsAccess, setLmsAccess] = useState(true);
  const [libraryAccess, setLibraryAccess] = useState(true);
  const [examPortal, setExamPortal] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const activityLog = [
    { action: "Logged in from Chrome / Windows", time: "Today, 9:42 AM", ip: "103.145.22.87", icon: Monitor },
    { action: "Password changed successfully", time: "Mar 2, 2026, 3:15 PM", ip: "103.145.22.87", icon: KeyRound },
    { action: "Profile photo updated", time: "Feb 28, 2026, 11:00 AM", ip: "103.145.22.90", icon: User },
    { action: "2FA disabled by admin", time: "Feb 20, 2026, 2:30 PM", ip: "Admin Panel", icon: ShieldCheck },
    { action: "Logged in from Safari / iOS", time: "Feb 18, 2026, 8:12 AM", ip: "103.145.22.91", icon: Smartphone },
  ];

  const sessions = [
    { device: "Chrome on Windows 11", location: "Dhaka, BD", lastActive: "Active now", current: true },
    { device: "Safari on iPhone 15", location: "Dhaka, BD", lastActive: "2 hours ago", current: false },
  ];

  const SectionCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-card rounded-xl border border-border overflow-hidden ${className}`}>
      {children}
    </div>
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

  const ToggleRow = ({
    icon: Icon,
    label,
    desc,
    checked,
    onChange,
    iconColor = "text-muted-foreground",
  }: {
    icon: React.ElementType;
    label: string;
    desc: string;
    checked: boolean;
    onChange: (v: boolean) => void;
    iconColor?: string;
  }) => (
    <div className="flex items-center justify-between py-3.5 px-5">
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${iconColor}`} />
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
          <SectionHeader icon={User} title="Account Identity & Status" desc="Manage account state and basic identity controls." />
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${accountActive ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`} />
                <div>
                  <p className="font-semibold text-sm text-foreground">Account Status</p>
                  <p className="text-xs text-muted-foreground">
                    {accountActive ? "Account is active and accessible" : "Account is currently deactivated"}
                  </p>
                </div>
              </div>
              <Switch checked={accountActive} onCheckedChange={setAccountActive} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Student ID</label>
                <Input value={student.id} disabled className="rounded-lg bg-muted border-none text-muted-foreground cursor-not-allowed text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Email Address</label>
                <Input value={student.email} disabled className="rounded-lg bg-muted border-none text-muted-foreground cursor-not-allowed text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Department</label>
                <Input value={student.department} disabled className="rounded-lg bg-muted border-none text-muted-foreground cursor-not-allowed text-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Account Type</label>
                <Input value="Undergraduate Student" disabled className="rounded-lg bg-muted border-none text-muted-foreground cursor-not-allowed text-sm" />
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* Security */}
      <motion.div {...fadeIn} transition={{ delay: 0.08 }}>
        <SectionCard>
          <SectionHeader icon={ShieldCheck} title="Security & Authentication" desc="Password management, 2FA, and session control." />
          <div className="divide-y divide-border">
            {/* Password */}
            <div className="flex items-center justify-between py-3.5 px-5">
              <div className="flex items-center gap-3">
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm text-foreground">Force Password Reset</p>
                  <p className="text-xs text-muted-foreground">Send a reset link to student's email</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg text-xs font-semibold"
                onClick={() => toast.success("Password reset link sent to " + student.email)}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
              </Button>
            </div>
            {/* 2FA */}
            <ToggleRow
              icon={ShieldCheck}
              label="Two-Factor Authentication"
              desc={twoFactor ? "Enabled via authenticator app" : "Not currently enabled"}
              checked={twoFactor}
              onChange={setTwoFactor}
              iconColor="text-green-500"
            />
            {/* Sessions */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-muted-foreground" />
                  <p className="font-medium text-sm text-foreground">Active Sessions</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => toast.success("All other sessions revoked")}
                >
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
                      <span className="text-[10px] font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* Access & Permissions */}
      <motion.div {...fadeIn} transition={{ delay: 0.16 }}>
        <SectionCard>
          <SectionHeader icon={Lock} title="Access & Permissions" desc="Control which systems this student can access." />
          <div className="divide-y divide-border">
            <ToggleRow icon={Globe} label="Student Portal" desc="Main university portal access" checked={portalAccess} onChange={setPortalAccess} />
            <ToggleRow icon={BookOpen} label="LMS (Learning Management)" desc="Courses, assignments, and materials" checked={lmsAccess} onChange={setLmsAccess} />
            <ToggleRow icon={Library} label="Library System" desc="Digital & physical library access" checked={libraryAccess} onChange={setLibraryAccess} />
            <ToggleRow icon={GraduationCap} label="Exam Portal" desc="Exam registration and results" checked={examPortal} onChange={setExamPortal} />
          </div>
        </SectionCard>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div {...fadeIn} transition={{ delay: 0.24 }}>
        <SectionCard>
          <SectionHeader icon={Bell} title="Notification Preferences" desc="Configure how this student receives alerts." />
          <div className="divide-y divide-border">
            <ToggleRow icon={Mail} label="Email Notifications" desc="Send notifications to student email" checked={emailNotifs} onChange={setEmailNotifs} />
            <ToggleRow icon={Smartphone} label="SMS Notifications" desc="Text message alerts to registered phone" checked={smsNotifs} onChange={setSmsNotifs} />
            <ToggleRow icon={Bell} label="Push Notifications" desc="In-app and browser push alerts" checked={pushNotifs} onChange={setPushNotifs} />
          </div>
        </SectionCard>
      </motion.div>

      {/* Activity Log */}
      <motion.div {...fadeIn} transition={{ delay: 0.32 }}>
        <SectionCard>
          <SectionHeader icon={Clock} title="Recent Activity Log" desc="Track recent account actions and login history." />
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
          <SectionHeader icon={Send} title="Quick Actions" desc="Common administrative actions for this account." />
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start rounded-lg h-auto py-3 px-4" onClick={() => toast.success("Verification email sent")}>
              <Mail className="w-4 h-4 mr-2 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium">Send Verification Email</p>
                <p className="text-[11px] text-muted-foreground">Re-send email verification link</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start rounded-lg h-auto py-3 px-4" onClick={() => toast.success("Welcome email sent")}>
              <Send className="w-4 h-4 mr-2 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium">Send Welcome Email</p>
                <p className="text-[11px] text-muted-foreground">Re-send onboarding instructions</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start rounded-lg h-auto py-3 px-4" onClick={() => toast.success("ID card generation initiated")}>
              <FileText className="w-4 h-4 mr-2 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium">Generate ID Card</p>
                <p className="text-[11px] text-muted-foreground">Create printable student ID</p>
              </div>
            </Button>
            <Button variant="outline" className="justify-start rounded-lg h-auto py-3 px-4" onClick={() => toast.success("Transcript generation started")}>
              <GraduationCap className="w-4 h-4 mr-2 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium">Generate Transcript</p>
                <p className="text-[11px] text-muted-foreground">Create official academic transcript</p>
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
              <p className="text-xs text-muted-foreground mt-0.5">Irreversible actions. Proceed with extreme caution.</p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {/* Suspend */}
            <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-xl border border-destructive/10">
              <div className="flex items-center gap-3">
                <Ban className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-semibold text-sm text-foreground">Suspend Account</p>
                  <p className="text-xs text-muted-foreground">Temporarily disable all access. Can be reversed.</p>
                </div>
              </div>
              {!showSuspendConfirm ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => setShowSuspendConfirm(true)}
                >
                  Suspend
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="rounded-lg text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={() => {
                      setAccountActive(false);
                      setShowSuspendConfirm(false);
                      toast.success("Account suspended successfully");
                    }}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs"
                    onClick={() => setShowSuspendConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            {/* Delete */}
            <div className="flex flex-col p-4 bg-destructive/5 rounded-xl border border-destructive/10 gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">Delete Account Permanently</p>
                    <p className="text-xs text-muted-foreground">Remove all data. This action cannot be undone.</p>
                  </div>
                </div>
                {!showDeleteConfirm && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete
                  </Button>
                )}
              </div>
              {showDeleteConfirm && (
                <div className="space-y-3 pt-2 border-t border-destructive/10">
                  <p className="text-xs text-destructive font-medium">
                    Type <span className="font-mono font-bold">{student.id}</span> to confirm deletion:
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={deleteInput}
                      onChange={(e) => setDeleteInput(e.target.value)}
                      placeholder={student.id}
                      className="rounded-lg text-sm flex-1"
                    />
                    <Button
                      size="sm"
                      disabled={deleteInput !== student.id}
                      className="rounded-lg text-xs font-semibold bg-destructive hover:bg-destructive/90 text-destructive-foreground disabled:opacity-40"
                      onClick={() => toast.error("Account deletion requires super-admin approval")}
                    >
                      Delete Forever
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-xs"
                      onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save Footer */}
      <motion.div {...fadeIn} transition={{ delay: 0.56 }}>
        <div className="flex justify-end gap-3 pt-2 pb-4">
          <Button variant="outline" className="rounded-xl font-semibold">
            Discard Changes
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20"
            onClick={() => toast.success("Account settings saved successfully!")}
          >
            <CheckCircle className="w-4 h-4 mr-1" /> Save All Changes
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccountSettingsTab;
