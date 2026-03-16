import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, Bell, Calendar, Globe, Palette, Monitor,
  Clock, BookOpen, FileText, Mail
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

const TeacherSettingsTab = () => {
  const [autoGradeReminder, setAutoGradeReminder] = useState(true);
  const [attendanceReminder, setAttendanceReminder] = useState(true);
  const [classReminder, setClassReminder] = useState(true);
  const [studentAlerts, setStudentAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Asia/Dhaka (GMT+6)");

  const SectionCard = ({ children }: { children: React.ReactNode }) => (
    <div className="bg-card rounded-xl border border-border overflow-hidden">{children}</div>
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
      {/* Teaching Preferences */}
      <motion.div {...fadeIn}>
        <SectionCard>
          <SectionHeader icon={BookOpen} title="Teaching Preferences" desc="Configure classroom and grading workflow." />
          <div className="divide-y divide-border">
            <ToggleRow icon={FileText} label="Auto Grade Reminders" desc="Get notified before grading deadlines" checked={autoGradeReminder} onChange={setAutoGradeReminder} />
            <ToggleRow icon={Calendar} label="Attendance Reminders" desc="Daily prompt to submit attendance" checked={attendanceReminder} onChange={setAttendanceReminder} />
            <ToggleRow icon={Clock} label="Class Start Reminders" desc="15-minute alerts before classes" checked={classReminder} onChange={setClassReminder} />
            <ToggleRow icon={Bell} label="Student At-Risk Alerts" desc="Notify when students fall below thresholds" checked={studentAlerts} onChange={setStudentAlerts} />
          </div>
        </SectionCard>
      </motion.div>

      {/* Display */}
      <motion.div {...fadeIn} transition={{ delay: 0.08 }}>
        <SectionCard>
          <SectionHeader icon={Palette} title="Display & Interface" desc="Customize the dashboard appearance." />
          <div className="divide-y divide-border">
            <ToggleRow icon={Monitor} label="Dark Mode" desc="Use dark theme across the portal" checked={darkMode} onChange={setDarkMode} />
            <ToggleRow icon={Settings} label="Compact View" desc="Reduce spacing for more content" checked={compactView} onChange={setCompactView} />
            <ToggleRow icon={FileText} label="Auto-Save Drafts" desc="Automatically save unsaved changes" checked={autoSave} onChange={setAutoSave} />
          </div>
        </SectionCard>
      </motion.div>

      {/* Reports */}
      <motion.div {...fadeIn} transition={{ delay: 0.16 }}>
        <SectionCard>
          <SectionHeader icon={Mail} title="Reports & Analytics" desc="Configure automated report delivery." />
          <div className="divide-y divide-border">
            <ToggleRow icon={FileText} label="Weekly Performance Report" desc="Receive a weekly summary via email" checked={weeklyReport} onChange={setWeeklyReport} />
            <div className="py-3.5 px-5">
              <div className="flex items-center gap-3 mb-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm text-foreground">Language</p>
                  <p className="text-xs text-muted-foreground">Portal display language</p>
                </div>
              </div>
              <select className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>English</option>
                <option>বাংলা</option>
              </select>
            </div>
            <div className="py-3.5 px-5">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm text-foreground">Timezone</p>
                  <p className="text-xs text-muted-foreground">Used for scheduling and reminders</p>
                </div>
              </div>
              <select className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option>Asia/Dhaka (GMT+6)</option>
                <option>UTC (GMT+0)</option>
                <option>America/New_York (GMT-5)</option>
              </select>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      {/* Save */}
      <motion.div {...fadeIn} transition={{ delay: 0.24 }}>
        <div className="flex justify-end gap-3">
          <Button variant="outline" className="rounded-lg">Reset to Defaults</Button>
          <Button className="rounded-lg shadow-lg shadow-primary/20" onClick={() => toast.success("Settings saved successfully")}>
            Save Settings
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherSettingsTab;
