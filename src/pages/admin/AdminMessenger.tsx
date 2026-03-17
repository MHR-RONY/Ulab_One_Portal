import { useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare, Users, AlertTriangle, TrendingUp, Search,
  Eye, UserCog, Settings, Filter, Plus, CheckCircle, Clock,
  Shield, Lock, Bell, ChevronLeft, ChevronRight
} from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const stats = [
  { label: "Total Messages", value: "128.4K", change: "+12.5% this week", positive: true, icon: MessageSquare, color: "bg-primary/10 text-primary" },
  { label: "Active Groups", value: "452", change: "+5 groups today", positive: true, icon: Users, color: "bg-blue-500/10 text-blue-500" },
  { label: "Reported Content", value: "12", change: "3 Urgent reviews", positive: false, icon: AlertTriangle, color: "bg-destructive/10 text-destructive" },
];

const tabs = ["All Groups", "Active Now", "Reported", "Archived"];

const groups = [
  {
    code: "CS", name: "CSE101 - Intro to Programming", section: "Section 2 • Fall 2023",
    memberColors: ["bg-orange-200", "bg-blue-200", "bg-emerald-200"], extra: 42,
    activity: "High (1.2k msgs/day)", activityColor: "bg-emerald-500",
    status: "Faculty Monitored", statusStyle: "bg-blue-500/10 text-blue-600", statusIcon: <CheckCircle className="w-3 h-3" />,
    reported: false,
  },
  {
    code: "BA", name: "BUS201 - Marketing Principles", section: "Section 1 • Fall 2023",
    memberColors: ["bg-pink-200", "bg-purple-200"], extra: 28,
    activity: "Quiet (15 msgs/day)", activityColor: "bg-muted-foreground/40",
    status: "Self-Managed", statusStyle: "bg-secondary text-muted-foreground", statusIcon: <Lock className="w-3 h-3" />,
    reported: false,
  },
  {
    code: "MT", name: "MAT102 - Discrete Math", section: "Section 4 • Fall 2023",
    memberColors: ["bg-amber-200"], extra: 55,
    activity: "Active Reports (4)", activityColor: "bg-destructive animate-pulse",
    status: "Restricted", statusStyle: "bg-destructive/10 text-destructive", statusIcon: <AlertTriangle className="w-3 h-3" />,
    reported: true,
  },
];

const policies = [
  { label: "Keyword Auto-Moderation", desc: "Automatically flag and hide messages containing blacklisted academic integrity keywords.", checked: true },
  { label: "Admin-Only Media Uploads", desc: "Limit image and file sharing to assigned group administrators (Teachers/TAs).", checked: true },
  { label: "Quiet Hours Enforcement", desc: "Disable messaging between 11 PM and 6 AM for all academic sections.", checked: false },
];

const actions = [
  { time: "2 minutes ago", text: <>
    <span className="font-bold">Admin Sarah</span> added <span className="text-primary font-bold">Prof. Ahmed</span> as admin to <span className="italic font-medium">PHY101-S3</span>
  </>, color: "bg-emerald-500" },
  { time: "1 hour ago", text: <>
    <span className="font-bold">System</span> automatically suspended 2 members in <span className="italic font-medium">MAT102</span> for policy violations.
  </>, color: "bg-destructive" },
  { time: "3 hours ago", text: <>
    <span className="font-bold">Admin Mark</span> created new broadcast group <span className="text-primary font-bold">"Final Exam Updates Fall 23"</span>
  </>, color: "bg-primary" },
];

const AdminMessenger = () => {
  const [activeTab, setActiveTab] = useState("All Groups");

  return (
    <div className="flex min-h-screen bg-background">
      <div className="hidden lg:block">
        <AdminSidebar activePage="Messenger" />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8">
            {/* Title - mobile */}
            <h1 className="text-xl font-bold text-foreground mb-4 lg:hidden">Message Management</h1>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              {stats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="border-border/50">
                    <CardContent className="p-4 md:p-6 flex items-center gap-4">
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
                        <s.icon className="w-6 h-6 md:w-7 md:h-7" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs md:text-sm font-medium">{s.label}</p>
                        <h3 className="text-xl md:text-2xl font-bold text-foreground">{s.value}</h3>
                        <p className={`text-xs font-bold flex items-center gap-1 ${s.positive ? "text-emerald-500" : "text-destructive"}`}>
                          {s.positive ? <TrendingUp className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {s.change}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Filters */}
            <div className="mb-4 md:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="bg-secondary p-1 rounded-xl flex overflow-x-auto no-scrollbar">
                {tabs.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === t ? "bg-card shadow-sm font-bold text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <select className="bg-card border border-border rounded-xl text-sm px-3 py-2 flex-1 sm:flex-none focus:ring-primary focus:border-primary text-foreground">
                  <option>Filter by Subject</option>
                  <option>CSE - Computer Science</option>
                  <option>EEE - Electrical Engineering</option>
                  <option>BBA - Business Admin</option>
                </select>
                <Button variant="outline" size="icon" className="rounded-xl shrink-0">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Table - Desktop */}
            <Card className="border-border/50 mb-6 md:mb-8 hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase tracking-wider font-bold">
                    <tr>
                      <th className="px-6 py-4">Group / Section</th>
                      <th className="px-6 py-4">Members</th>
                      <th className="px-6 py-4">Activity</th>
                      <th className="px-6 py-4">Admin Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {groups.map((g) => (
                      <tr key={g.code} className={`transition-colors ${g.reported ? "bg-destructive/5 hover:bg-destructive/10" : "hover:bg-secondary/30"}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                              g.reported ? "bg-destructive/10 text-destructive" : g.code === "BA" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                            }`}>{g.code}</div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{g.name}</p>
                              <p className="text-xs text-muted-foreground">{g.section}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex -space-x-2">
                            {g.memberColors.map((c, i) => (
                              <div key={i} className={`w-8 h-8 rounded-full border-2 border-card ${c}`} />
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-card bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground">+{g.extra}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${g.activityColor}`} />
                            <span className={`text-sm font-medium ${g.reported ? "font-bold text-destructive" : "text-foreground"}`}>{g.activity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${g.statusStyle}`}>
                            {g.statusIcon} {g.status}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            {g.reported ? (
                              <Button size="sm" variant="destructive" className="text-xs font-bold">Review Reports</Button>
                            ) : (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8"><UserCog className="w-4 h-4" /></Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary"><Settings className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-secondary/50 px-6 py-4 border-t border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Showing 1 to 10 of 452 groups</p>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" disabled><ChevronLeft className="w-4 h-4 mr-1" />Previous</Button>
                  <Button size="sm" className="font-bold min-w-[32px]">1</Button>
                  <Button variant="outline" size="sm" className="min-w-[32px]">2</Button>
                  <Button variant="outline" size="sm" className="min-w-[32px]">3</Button>
                  <Button variant="outline" size="sm">Next<ChevronRight className="w-4 h-4 ml-1" /></Button>
                </div>
              </div>
            </Card>

            {/* Mobile Cards */}
            <div className="space-y-3 mb-6 md:hidden">
              {groups.map((g) => (
                <Card key={g.code} className={`border-border/50 ${g.reported ? "border-destructive/30 bg-destructive/5" : ""}`}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                        g.reported ? "bg-destructive/10 text-destructive" : g.code === "BA" ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                      }`}>{g.code}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{g.name}</p>
                        <p className="text-xs text-muted-foreground">{g.section}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {g.memberColors.map((c, i) => (
                          <div key={i} className={`w-7 h-7 rounded-full border-2 border-card ${c}`} />
                        ))}
                        <div className="w-7 h-7 rounded-full border-2 border-card bg-secondary flex items-center justify-center text-[9px] font-bold text-muted-foreground">+{g.extra}</div>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${g.statusStyle}`}>
                        {g.statusIcon} {g.status}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${g.activityColor}`} />
                        <span className={`text-xs font-medium ${g.reported ? "font-bold text-destructive" : "text-muted-foreground"}`}>{g.activity}</span>
                      </div>
                      <div className="flex gap-1">
                        {g.reported ? (
                          <Button size="sm" variant="destructive" className="text-[10px] h-7 px-2">Review</Button>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="w-3.5 h-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7"><UserCog className="w-3.5 h-3.5" /></Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-primary"><Settings className="w-3.5 h-3.5" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">1-10 of 452</p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 text-xs" disabled>Prev</Button>
                  <Button size="sm" className="h-7 text-xs min-w-[28px] font-bold">1</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs min-w-[28px]">2</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs">Next</Button>
                </div>
              </div>
            </div>

            {/* Bottom Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
              {/* Rules */}
              <Card className="border-border/50">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4 md:mb-6">
                    <h3 className="font-bold text-foreground flex items-center gap-2 text-sm md:text-base">
                      <Shield className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      Global Group Rules & Policies
                    </h3>
                    <button className="text-xs font-bold text-primary hover:underline">Edit Defaults</button>
                  </div>
                  <div className="space-y-3">
                    {policies.map((p) => (
                      <label key={p.label} className="flex items-start gap-3 md:gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer">
                        <Checkbox defaultChecked={p.checked} className="mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-foreground">{p.label}</p>
                          <p className="text-xs text-muted-foreground">{p.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Actions */}
              <Card className="border-border/50">
                <CardContent className="p-4 md:p-6">
                  <h3 className="font-bold text-foreground flex items-center gap-2 mb-4 md:mb-6 text-sm md:text-base">
                    <Clock className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    Recent Administrative Actions
                  </h3>
                  <div className="space-y-5">
                    {actions.map((a, i) => (
                      <div key={i} className="flex gap-3 md:gap-4">
                        <div className={`w-1 ${a.color} rounded-full shrink-0`} />
                        <div>
                          <p className="text-[10px] md:text-xs text-muted-foreground">{a.time}</p>
                          <p className="text-xs md:text-sm font-medium text-foreground">{a.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* New Group FAB - mobile */}
            <div className="fixed bottom-20 right-4 lg:hidden z-20">
              <Button className="rounded-full shadow-lg h-12 px-5 gap-2 font-bold">
                <Plus className="w-5 h-5" /> New Group
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminMessenger;
