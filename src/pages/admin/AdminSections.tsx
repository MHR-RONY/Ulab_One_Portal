import { motion } from "framer-motion";
import { Layers, BookOpen, Users, GraduationCap, Plus, Search } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import ComingSoonOverlay from "@/components/ui/ComingSoonOverlay";

const mockSections = [
	{ code: "CSE-101-A", course: "Introduction to Programming", teacher: "Dr. Nasir Uddin", students: 42, room: "Room 301", schedule: "Sun, Tue, Thu 09:00" },
	{ code: "CSE-101-B", course: "Introduction to Programming", teacher: "Dr. Rina Islam", students: 38, room: "Room 302", schedule: "Mon, Wed, Fri 11:00" },
	{ code: "MAT-201-A", course: "Calculus I", teacher: "Prof. Kamal Ahmed", students: 55, room: "Auditorium A", schedule: "Sun, Tue 14:00" },
	{ code: "ENG-101-A", course: "English Composition", teacher: "Ms. Farida Khanam", students: 30, room: "Room 210", schedule: "Mon, Wed 08:00" },
	{ code: "PHY-101-A", course: "Physics I", teacher: "Dr. Rafiq Hassan", students: 47, room: "Lab 101", schedule: "Tue, Thu 13:00" },
];

const AdminSections = () => {
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
							<h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Course Sections</h1>
							<p className="text-muted-foreground text-sm mt-0.5">Manage class sections across all departments</p>
						</div>
						<button className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl active:scale-[0.98] transition-all">
							<Plus className="w-4 h-4" /> Add Section
						</button>
					</motion.div>

					{/* Search */}
					<div className="relative max-w-md">
						<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
						<input
							className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
							placeholder="Search sections..."
						/>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
						{[
							{ icon: Layers, label: "Total Sections", value: "24", color: "text-primary bg-primary/10" },
							{ icon: BookOpen, label: "Active Courses", value: "12", color: "text-stat-blue bg-stat-blue/10" },
							{ icon: Users, label: "Total Students", value: "1,284", color: "text-stat-amber bg-stat-amber/10" },
							{ icon: GraduationCap, label: "Faculty Members", value: "18", color: "text-stat-purple bg-stat-purple/10" },
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

					{/* Sections table */}
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.4 }}
						className="bg-card border border-border rounded-2xl overflow-hidden"
					>
						<div className="p-6 border-b border-border">
							<h3 className="font-bold text-lg text-foreground">All Sections</h3>
							<p className="text-xs text-muted-foreground mt-0.5">Spring Semester 2024</p>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-left">
								<thead>
									<tr className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-secondary/50">
										<th className="px-6 py-4">Section Code</th>
										<th className="px-6 py-4">Course</th>
										<th className="px-6 py-4">Teacher</th>
										<th className="px-6 py-4">Students</th>
										<th className="px-6 py-4">Room</th>
										<th className="px-6 py-4">Schedule</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border">
									{mockSections.map((s) => (
										<tr key={s.code} className="hover:bg-secondary/30 transition-all">
											<td className="px-6 py-4 font-mono text-sm font-bold text-primary">{s.code}</td>
											<td className="px-6 py-4 text-sm font-semibold text-foreground">{s.course}</td>
											<td className="px-6 py-4 text-sm text-muted-foreground">{s.teacher}</td>
											<td className="px-6 py-4 text-sm font-bold text-foreground">{s.students}</td>
											<td className="px-6 py-4 text-sm text-muted-foreground">{s.room}</td>
											<td className="px-6 py-4 text-sm text-muted-foreground">{s.schedule}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</motion.div>
				</main>
			</div>
			<ComingSoonOverlay
				icon={Layers}
				moduleName="Sections"
				progress={45}
				features={["Section creation & editing", "Teacher assignment", "Schedule builder", "Enrollment tracking"]}
			/>
		</div>
	);
};

export default AdminSections;
