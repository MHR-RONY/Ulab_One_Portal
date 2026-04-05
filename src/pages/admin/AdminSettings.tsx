import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, Save, History, Globe, Palette, Shield, Code,
  Image, Upload, Copy, RefreshCw, PlusCircle, CloudCog,
  KeyRound, Lock, Timer, Eye, Mail, Bell, Database,
  Users, ToggleLeft, Smartphone, Monitor, Moon, Sun,
  FileText, Webhook, AlertTriangle, Zap, Server
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

const tabs = [
  { icon: Settings, label: "General" },
  { icon: Palette, label: "Branding" },
  { icon: Shield, label: "Security" },
  { icon: Code, label: "API & Integrations" },
];

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("General");

  return (
    <div className="flex h-screen overflow-hidden bg-background admin-theme">
      <div className="hidden md:block">
        <AdminSidebar activePage="Settings" />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
          <div className="max-w-[1200px] mx-auto space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Global Settings</h1>
                <p className="text-muted-foreground text-lg mt-1">Enterprise-grade configuration suite for your academic ecosystem.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="rounded-xl h-12 px-6 gap-2 font-bold">
                  <History className="w-4 h-4" />
                  Audit Logs
                </Button>
                <Button className="rounded-xl h-12 px-6 gap-2 font-bold shadow-lg shadow-primary/25">
                  <Save className="w-4 h-4" />
                  Push Changes
                </Button>
              </div>
            </motion.div>

            {/* Tabs */}
            <div className="border-b border-border overflow-x-auto">
              <div className="flex gap-8 whitespace-nowrap min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.label}
                    onClick={() => setActiveTab(tab.label)}
                    className={`pb-4 font-bold flex items-center gap-2 text-sm transition-colors ${
                      activeTab === tab.label
                        ? "border-b-[3px] border-primary text-primary"
                        : "border-b-[3px] border-transparent text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ========== GENERAL TAB ========== */}
            {activeTab === "General" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* General Configuration */}
                <Card className="rounded-3xl shadow-sm">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-1">General Configuration</h3>
                        <p className="text-muted-foreground">Global identity and localization for the entire organization.</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-2xl">
                        <Globe className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground block">Site Name</label>
                          <Input defaultValue="ULAB One Portal - Main Hub" className="rounded-xl h-12" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground block">Default Timezone</label>
                          <select className="w-full rounded-xl border border-border bg-background h-12 px-4 text-sm focus:ring-2 focus:ring-primary">
                            <option>GMT +6 (Dhaka)</option>
                            <option>GMT +0 (London)</option>
                            <option>GMT -5 (New York)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground block">Contact Email</label>
                          <Input defaultValue="admin@ulab.edu.bd" className="rounded-xl h-12" />
                        </div>
                      </div>
                      <div className="space-y-5">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground block">Language Selection</label>
                          <select className="w-full rounded-xl border border-border bg-background h-12 px-4 text-sm focus:ring-2 focus:ring-primary">
                            <option>English (US)</option>
                            <option>English (UK)</option>
                            <option>Bengali</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-foreground block">Academic Year</label>
                          <Input defaultValue="2025-2026" className="rounded-xl h-12" />
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                          <Checkbox defaultChecked className="h-6 w-6" />
                          <div>
                            <p className="font-bold text-foreground text-sm">Enable Multi-lingual Switcher</p>
                            <p className="text-xs text-muted-foreground">Allow users to toggle language from their profile dashboard.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* System Behavior */}
                <Card className="rounded-3xl shadow-sm">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-1">System Behavior</h3>
                        <p className="text-muted-foreground">Toggle core functionality and operational modes.</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-2xl">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: "Enable Student Registration", desc: "Allow new students to self-register via the portal", icon: Users, enabled: true },
                        { label: "Maintenance Mode", desc: "Temporarily disable portal access for all users", icon: AlertTriangle, enabled: false },
                        { label: "Auto-assign Sections", desc: "Automatically assign students to available sections", icon: Database, enabled: true },
                        { label: "Enable Chat System", desc: "Allow messaging between students and teachers", icon: Mail, enabled: true },
                        { label: "Push Notifications", desc: "Send real-time alerts to users' devices", icon: Bell, enabled: true },
                        { label: "API Rate Limiting", desc: "Throttle external API requests to prevent abuse", icon: Server, enabled: true },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/20 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                              <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                          <Switch defaultChecked={item.enabled} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Email & Notifications */}
                <Card className="rounded-3xl shadow-sm">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-1">Email Configuration</h3>
                        <p className="text-muted-foreground">SMTP settings for outgoing system emails and notifications.</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-2xl">
                        <Mail className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">SMTP Host</label>
                        <Input defaultValue="smtp.ulab.edu.bd" className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">SMTP Port</label>
                        <Input defaultValue="587" className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Sender Email</label>
                        <Input defaultValue="noreply@ulab.edu.bd" className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Sender Name</label>
                        <Input defaultValue="ULAB One Portal" className="rounded-xl h-12" />
                      </div>
                    </div>
                    <div className="mt-6 flex items-center gap-3">
                      <Button variant="outline" className="rounded-xl font-bold gap-2">
                        <Mail className="w-4 h-4" /> Send Test Email
                      </Button>
                      <span className="text-xs text-muted-foreground">Sends a test email to the admin's registered address.</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ========== BRANDING TAB ========== */}
            {activeTab === "Branding" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <Card className="rounded-3xl shadow-sm">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-1">Branding & Identity</h3>
                        <p className="text-muted-foreground">Visual elements that define the portal across all devices.</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-2xl">
                        <Palette className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <div>
                          <span className="text-sm font-semibold text-foreground mb-4 block">Organization Logo</span>
                          <div className="flex items-center gap-6">
                            <div className="w-32 h-32 rounded-2xl bg-secondary flex items-center justify-center border-2 border-dashed border-border">
                              <Image className="w-10 h-10 text-muted-foreground/40" />
                            </div>
                            <div className="space-y-2">
                              <Button variant="default" size="sm" className="rounded-lg gap-2 font-bold">
                                <Upload className="w-4 h-4" />
                                Upload New
                              </Button>
                              <p className="text-xs text-muted-foreground">PNG, SVG or WEBP. Max 2MB.</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-foreground mb-4 block">Primary Brand Color</span>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary border-4 border-background shadow-lg" />
                            <Input defaultValue="#F97415" className="flex-1 rounded-xl h-12 font-mono uppercase" />
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-foreground mb-4 block">Favicon</span>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center border-2 border-dashed border-border">
                              <Image className="w-6 h-6 text-muted-foreground/40" />
                            </div>
                            <div className="space-y-1">
                              <Button variant="outline" size="sm" className="rounded-lg gap-2 font-bold">
                                <Upload className="w-3 h-3" />
                                Upload
                              </Button>
                              <p className="text-xs text-muted-foreground">ICO or PNG. 32×32px recommended.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="bg-secondary/50 rounded-2xl p-6 border border-border">
                          <h4 className="font-bold mb-4 flex items-center gap-2 text-foreground">
                            <Eye className="w-5 h-5 text-primary" />
                            UI Preview
                          </h4>
                          <div className="space-y-4">
                            <div className="h-6 w-3/4 bg-primary/30 rounded-full" />
                            <div className="h-36 w-full bg-primary/10 rounded-xl border border-primary/20 flex flex-col items-center justify-center p-4">
                              <div className="flex gap-2">
                                <div className="w-4 h-4 bg-primary rounded-full" />
                                <div className="w-4 h-4 bg-primary/50 rounded-full" />
                                <div className="w-4 h-4 bg-primary/20 rounded-full" />
                              </div>
                              <div className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold">
                                SAMPLE BUTTON
                              </div>
                            </div>
                          </div>
                        </div>
                        {/* Theme Selector */}
                        <div>
                          <span className="text-sm font-semibold text-foreground mb-3 block">Appearance Mode</span>
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { label: "Light", icon: Sun, active: true },
                              { label: "Dark", icon: Moon, active: false },
                              { label: "System", icon: Monitor, active: false },
                            ].map((theme) => (
                              <button
                                key={theme.label}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                                  theme.active
                                    ? "border-primary bg-primary/5"
                                    : "border-border hover:border-primary/30"
                                }`}
                              >
                                <theme.icon className={`w-5 h-5 ${theme.active ? "text-primary" : "text-muted-foreground"}`} />
                                <span className={`text-xs font-bold ${theme.active ? "text-primary" : "text-muted-foreground"}`}>
                                  {theme.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Custom CSS */}
                <Card className="rounded-3xl shadow-sm">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-1">Custom CSS Override</h3>
                        <p className="text-muted-foreground">Inject custom styles for advanced theming (use with caution).</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-2xl">
                        <Code className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <Textarea
                      placeholder="/* Add custom CSS here */"
                      className="rounded-xl font-mono text-sm min-h-[120px]"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Changes apply globally after saving. Test in staging first.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ========== SECURITY TAB ========== */}
            {activeTab === "Security" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <Card className="rounded-3xl shadow-sm">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-1">Security Protocols</h3>
                        <p className="text-muted-foreground">Advanced access control and credential management policies.</p>
                      </div>
                      <div className="p-3 bg-destructive/10 rounded-2xl">
                        <Shield className="w-6 h-6 text-destructive" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Password Policy */}
                      <div className="p-6 rounded-2xl border border-border hover:border-primary/30 transition-all group">
                        <div className="flex items-center gap-3 mb-5">
                          <KeyRound className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <h4 className="font-bold text-foreground">Password Policy</h4>
                        </div>
                        <div className="space-y-3">
                          {[
                            { label: "Require Special Chars", checked: true },
                            { label: "Min 12 Characters", checked: true },
                            { label: "90-Day Rotation", checked: false },
                            { label: "Prevent Password Reuse", checked: true },
                          ].map((item) => (
                            <label key={item.label} className="flex items-center gap-3">
                              <Checkbox defaultChecked={item.checked} />
                              <span className="text-sm text-foreground">{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Two-Factor Auth */}
                      <div className="p-6 rounded-2xl border border-border hover:border-primary/30 transition-all group">
                        <div className="flex items-center gap-3 mb-5">
                          <Lock className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <h4 className="font-bold text-foreground">Two-Factor Auth</h4>
                        </div>
                        <select className="w-full text-sm rounded-xl border border-border bg-background h-10 px-3 focus:ring-2 focus:ring-primary">
                          <option>Mandatory for Staff</option>
                          <option>Optional for All</option>
                          <option>Global Mandatory</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-4">Supports App-based TOTP and SMS validation.</p>
                        <div className="mt-4 pt-4 border-t border-border">
                          <label className="flex items-center gap-3">
                            <Checkbox defaultChecked />
                            <span className="text-sm text-foreground">Allow Recovery Codes</span>
                          </label>
                        </div>
                      </div>

                      {/* Session Timeout */}
                      <div className="p-6 rounded-2xl border border-border hover:border-primary/30 transition-all group">
                        <div className="flex items-center gap-3 mb-5">
                          <Timer className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <h4 className="font-bold text-foreground">Session Timeout</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input type="number" defaultValue="30" className="w-20 rounded-xl h-10" />
                          <span className="text-sm font-semibold text-foreground">Minutes</span>
                        </div>
                        <div className="space-y-3 mt-4">
                          <label className="flex items-center gap-3">
                            <Checkbox defaultChecked />
                            <span className="text-sm text-foreground">Force Re-login on IP change</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <Checkbox defaultChecked />
                            <span className="text-sm text-foreground">Concurrent session limit</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Advanced Security */}
                <Card className="rounded-3xl shadow-sm">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-1">Advanced Security</h3>
                        <p className="text-muted-foreground">Network-level protections and access restrictions.</p>
                      </div>
                      <div className="p-3 bg-destructive/10 rounded-2xl">
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { label: "IP Whitelisting", desc: "Restrict admin panel access to specific IPs", enabled: false },
                        { label: "Brute Force Protection", desc: "Lock accounts after 5 failed login attempts", enabled: true },
                        { label: "Audit Logging", desc: "Track all administrative actions with timestamps", enabled: true },
                        { label: "Data Encryption at Rest", desc: "AES-256 encryption for stored data", enabled: true },
                        { label: "CORS Policy Enforcement", desc: "Restrict cross-origin requests to allowed domains", enabled: true },
                        { label: "Content Security Policy", desc: "Block inline scripts and unauthorized resources", enabled: false },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/20 transition-all">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                          <Switch defaultChecked={item.enabled} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* ========== API & INTEGRATIONS TAB ========== */}
            {activeTab === "API & Integrations" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <Card className="rounded-3xl shadow-sm">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-1">API Integrations</h3>
                        <p className="text-muted-foreground">Connect ULAB One with third-party LMS and CRM systems.</p>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-2xl">
                        <Webhook className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      {/* Google Workspace */}
                      <div className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-secondary/50 border border-border gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center shadow-sm border border-border">
                            <CloudCog className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h5 className="font-bold text-foreground">Google Workspace Connector</h5>
                            <p className="text-xs text-muted-foreground">Last synchronized: 12 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-[10px] font-bold uppercase">Active</span>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <Settings className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Moodle LMS */}
                      <div className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-secondary/50 border border-border gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center shadow-sm border border-border">
                            <FileText className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h5 className="font-bold text-foreground">Moodle LMS Bridge</h5>
                            <p className="text-xs text-muted-foreground">Grade sync enabled · Last sync: 45 minutes ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-[10px] font-bold uppercase">Active</span>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <Settings className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* API Key */}
                      <div className="flex flex-col md:flex-row items-center justify-between p-6 rounded-2xl bg-secondary/50 border border-border gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-card rounded-xl flex items-center justify-center shadow-sm border border-border">
                            <Code className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div>
                            <h5 className="font-bold text-foreground">Global API Key (Read-Only)</h5>
                            <p className="text-xs font-mono text-muted-foreground">ulab_prod_••••••••••••••••</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Button variant="outline" size="sm" className="rounded-lg font-bold gap-1">
                            <RefreshCw className="w-3 h-3" />
                            Regenerate
                          </Button>
                          <button className="text-muted-foreground hover:text-foreground transition-colors">
                            <Copy className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Connect New */}
                      <div className="pt-4">
                        <button className="w-full py-4 border-2 border-dashed border-border rounded-2xl text-muted-foreground font-bold hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2">
                          <PlusCircle className="w-5 h-5" />
                          Connect New External Service
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Webhook Configuration */}
                <Card className="rounded-3xl shadow-sm">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-8">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-1">Webhook Configuration</h3>
                        <p className="text-muted-foreground">Configure outgoing webhooks for event-driven integrations.</p>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-2xl">
                        <Webhook className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Endpoint URL</label>
                        <Input placeholder="https://your-service.com/webhook" className="rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Secret Key</label>
                        <Input type="password" placeholder="whsec_••••••••" className="rounded-xl h-12" />
                      </div>
                    </div>
                    <div className="mt-6 space-y-3">
                      <span className="text-sm font-semibold text-foreground block">Trigger Events</span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {["User Created", "Grade Updated", "Enrollment Changed", "Payment Received", "Attendance Marked", "Course Published", "Report Generated", "Alert Triggered"].map((event) => (
                          <label key={event} className="flex items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/20 transition-all">
                            <Checkbox defaultChecked={["User Created", "Grade Updated", "Enrollment Changed"].includes(event)} />
                            <span className="text-xs font-medium text-foreground">{event}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm">© 2024 ULAB One Portal. Systems Administration v4.2.0</p>
              <div className="flex gap-6">
                <a className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors" href="#">Privacy Policy</a>
                <a className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors" href="#">Terms of Service</a>
                <a className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors" href="#">Help Center</a>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminSettings;
