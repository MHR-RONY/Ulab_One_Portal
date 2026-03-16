import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search, UserPlus, Eye, Pencil, CalendarDays,
  ChevronLeft, ChevronRight, ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

const departments = ["All Departments", "CSE", "BBA", "English", "MSJ", "Bangla"];

const teachersData = [
  {
    name: "Dr. Sarah Jenkins",
    email: "sarah.j@ulab.edu.bd",
    id: "T-1001",
    department: "CSE",
    status: "Active",
    avatar: "SJ",
    avatarColor: "bg-primary/15 text-primary",
  },
  {
    name: "Prof. Michael Chen",
    email: "m.chen@ulab.edu.bd",
    id: "T-1042",
    department: "BBA",
    status: "Active",
    avatar: "MC",
    avatarColor: "bg-chart-2/15 text-chart-2",
  },
  {
    name: "Emma Wilson",
    email: "emma.w@ulab.edu.bd",
    id: "T-1105",
    department: "English",
    status: "On Leave",
    avatar: "EW",
    avatarColor: "bg-destructive/15 text-destructive",
  },
  {
    name: "James Rodriguez",
    email: "james.r@ulab.edu.bd",
    id: "T-1218",
    department: "Bangla",
    status: "Active",
    avatar: "JR",
    avatarColor: "bg-chart-4/15 text-chart-4",
  },
  {
    name: "Dr. Nadia Akter",
    email: "nadia.a@ulab.edu.bd",
    id: "T-1056",
    department: "MSJ",
    status: "Active",
    avatar: "NA",
    avatarColor: "bg-chart-3/15 text-chart-3",
  },
  {
    name: "Prof. Kamal Hossain",
    email: "kamal.h@ulab.edu.bd",
    id: "T-1089",
    department: "CSE",
    status: "Active",
    avatar: "KH",
    avatarColor: "bg-primary/15 text-primary",
  },
];

const AdminTeachers = () => {
  const [activeDept, setActiveDept] = useState("All Departments");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const filteredTeachers =
    activeDept === "All Departments"
      ? teachersData
      : teachersData.filter((t) => t.department === activeDept);

  return (
    <div className="flex h-screen overflow-hidden premium-bg">
      <div className="hidden md:block">
        <AdminSidebar activePage="Teachers" />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                Teacher Directory
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Manage and monitor all faculty members across departments.
              </p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              <UserPlus className="w-4 h-4" />
              Add New Teacher
            </button>
          </motion.div>

          {/* Department Filters */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-wrap items-center gap-3 mb-6"
          >
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDept(dept)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeDept === dept
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:border-primary/40 text-foreground"
                }`}
              >
                {dept}
                {dept !== "All Departments" && (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            ))}
          </motion.div>

          {/* Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Teacher Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      ID Number
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Department
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTeachers.map((teacher, i) => (
                    <motion.tr
                      key={teacher.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 + i * 0.04, duration: 0.3 }}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${teacher.avatarColor} flex items-center justify-center font-bold text-xs`}>
                            {teacher.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {teacher.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {teacher.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">
                        {teacher.id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md bg-secondary text-foreground border border-border">
                          {teacher.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {teacher.status === "Active" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stat-emerald/10 text-stat-emerald">
                            <span className="w-1.5 h-1.5 rounded-full bg-stat-emerald" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stat-amber/10 text-stat-amber">
                            <span className="w-1.5 h-1.5 rounded-full bg-stat-amber" />
                            On Leave
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/teachers/${teacher.id}`)}
                            className="p-1.5 hover:bg-secondary rounded-lg text-primary transition-colors"
                            title="View Profile"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-secondary rounded-lg text-primary transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button
                            className="p-1.5 hover:bg-secondary rounded-lg text-primary transition-colors"
                            title="Schedule"
                          >
                            <CalendarDays className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground font-medium">
                Showing <span className="text-foreground font-bold">1 to {filteredTeachers.length}</span> of 24 teachers
              </p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-foreground disabled:opacity-50">
                  Previous
                </button>
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : "border border-border hover:bg-secondary text-foreground"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="px-3 py-1.5 border border-border rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-foreground">
                  Next
                </button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminTeachers;
