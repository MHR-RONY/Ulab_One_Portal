import { motion } from "framer-motion";
import { BookMarked, Hash, GraduationCap, Clock, Plus, Search } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import ComingSoonOverlay from "@/components/ui/ComingSoonOverlay";

const mockSubjects = [
	{ code: "CSE-101", name: "Introduction to Programming", dept: "CSE", credits: 3, type: "Core", sections: 3, students: 120 },
	{ code: "CSE-201", name: "Data Structures", dept: "CSE", credits: 3, type: "Core", sections: 2, students: 80 },
	{ code: "CSE-301", name: "Algorithms", dept: "CSE", credits: 3, type: "Core", sections: 2, students: 65 },
	{ code: "MAT-101", name: "Calculus I", dept: "Math", credits: 3, type: "Core", sections: 4, students: 200 },
	{ code: "MAT-201", name: "Linear Algebra", dept: "Math", credits: 3, type: "Elective", sections: 2, students: 90 },
	{ code: "ENG-101", name: "English Composition", dept: "English", credits: 2, type: "Core", sections: 5, students: 210 },
	{ code: "PHY-101", name: "Physics I", dept: "Physics", credits: 3, type: "Core", sections: 3, students: 145 },
];

const deptColors: Record<string, string> = {
	CSE: "bg-primary/10 text-primary",
	Math: "bg-stat-blue/10 text-stat-blue",
	English: "bg-stat-amber/10 text-stat-amber",
	Physics: "bg-stat-purple/10 text-stat-purple",
};

const AdminSubjects = () => {
	return (
		<div className="flex h-screen overflow-hidden premium-bg admin-theme">
			<div className="hidden md:block">
				<AdminSidebar activePage="Management" />
			</div>
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<AdminHeader />
				<main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
					{/* Header */}
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						className="flex flex-col md:flex-row md:items-center justify-between gap-4"
					>
						<div>
							<h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Subjects</h1>
							<p className="text-muted-foreground text-sm mt-0.5">Browse and manage all academic subjects across departments</p>
						</div>
						<button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl active:scale-[0.98] transition-all">
							<Plus className="w-4 h-4" /> Add Subject
						</button>
					</motion.div>

					{/* Search */}
					<div className="relative max-w-md">
						<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<input
							className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
							placeholder="Search subjects..."
						/>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						{[
							{ icon: BookMarked, label: "Total Subjects", value: "34", color: "text-primary bg-primary/10" },
							{ icon: Hash, label: "Departments", value: "6", color: "text-stat-blue bg-stat-blue/10" },
							{ icon: GraduationCap, label: "Core Subjects", value: "22", color: "text-stat-amber bg-stat-amber/10" },
							{ icon: Clock, label: "Total Credits", value: "108", color: "text-stat-purple bg-stat-purple/10" },
						].map((s, i) => (
							<motion.div
								key={s.label}
								initial={{ opacity: 0, y: 16 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.06, duration: 0.4 }}
								className="bg-card border border-border rounded-2xl p-5"
							>
								<div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
									<s.icon className="w-5 h-5" />
								</div>
								<p className="text-muted-foreground text-xs font-semibold">{s.label}</p>
								<p className="text-2xl font-extrabold text-foreground mt-0.5">{s.value}</p>
							</motion.div>
						))}
					</div>

					{/* Subject cards */}
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.4 }}
						className="bg-card border border-border rounded-2xl overflow-hidden"
					>
						<div className="p-6 border-b border-border">
							<h3 className="font-bold text-lg text-foreground">All Subjects</h3>
							<p className="text-xs text-muted-foreground mt-0.5">Spring Semester 2024 • 7 subjects shown</p>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-left">
								<thead>
									<tr className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/50">
										<th className="px-6 py-4">Code</th>
										<th className="px-6 py-4">Subject Name</th>
										<th className="px-6 py-4">Department</th>
										<th className="px-6 py-4">Credits</th>
										<th className="px-6 py-4">Type</th>
										<th className="px-6 py-4">Sections</th>
										<th className="px-6 py-4">Students</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{mockSubjects.map((s) => (
										<tr key={s.code} className="hover:bg-secondary/30 transition-all">
											<td className="px-6 py-4 font-mono text-sm font-bold text-primary">{s.code}</td>
											<td className="px-6 py-4 text-sm font-semibold text-foreground">{s.name}</td>
											<td className="px-6 py-4">
												<span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${deptColors[s.dept] ?? "bg-secondary text-foreground"}`}>
													{s.dept}
												</span>
											</td>
											<td className="px-6 py-4 text-sm font-bold text-foreground">{s.credits}</td>
											<td className="px-6 py-4">
												<span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${s.type === "Core" ? "bg-stat-emerald/10 text-stat-emerald" : "bg-secondary text-muted-foreground"}`}>
													{s.type}
												</span>
											</td>
											<td className="px-6 py-4 text-sm text-muted-foreground">{s.sections}</td>
											<td className="px-6 py-4 text-sm text-muted-foreground">{s.students}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</motion.div>
				</main>
			</div>
			<ComingSoonOverlay
				icon={BookMarked}
				moduleName="Subjects"
				progress={40}
				features={["Subject creation & editing", "Department mapping", "Credit management", "Section linking"]}
			/>
		</div>
	);
};

export default AdminSubjects;
