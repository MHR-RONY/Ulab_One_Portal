import { useState } from "react";
import { motion } from "framer-motion";
import {
	Search, Download, UserPlus, Eye, Pencil, KeyRound,
	ChevronLeft, ChevronRight, SlidersHorizontal, ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

const departments = ["All Departments", "CSE", "BBA", "English", "MSJ", "Bangla"];

const studentsData = [
	{
		name: "Rahat Chowdhury",
		email: "rahat.chowdhury@ulab.edu.bd",
		id: "211014022",
		department: "CSE",
		semester: "Fall 2023",
		status: "Active",
		avatar: "RC",
	},
	{
		name: "Sumaiya Akhter",
		email: "sumaiya.a@ulab.edu.bd",
		id: "203011045",
		department: "BBA",
		semester: "Spring 2021",
		status: "Suspended",
		avatar: "SA",
	},
	{
		name: "Zubair Hassan",
		email: "zubair.hassan@ulab.edu.bd",
		id: "222015099",
		department: "MSJ",
		semester: "Summer 2022",
		status: "Active",
		avatar: "ZH",
	},
	{
		name: "Faria Tasnim",
		email: "faria.tasnim@ulab.edu.bd",
		id: "193014112",
		department: "English",
		semester: "Fall 2019",
		status: "Active",
		avatar: "FT",
	},
	{
		name: "Mehedi Hasan",
		email: "mehedi.hasan@ulab.edu.bd",
		id: "211014088",
		department: "CSE",
		semester: "Fall 2023",
		status: "Active",
		avatar: "MH",
	},
	{
		name: "Nusrat Jahan",
		email: "nusrat.j@ulab.edu.bd",
		id: "203011078",
		department: "BBA",
		semester: "Spring 2022",
		status: "Active",
		avatar: "NJ",
	},
	{
		name: "Tanvir Ahmed",
		email: "tanvir.ahmed@ulab.edu.bd",
		id: "213016055",
		department: "Bangla",
		semester: "Fall 2023",
		status: "Active",
		avatar: "TA",
	},
	{
		name: "Mithila Rahman",
		email: "mithila.r@ulab.edu.bd",
		id: "203016032",
		department: "Bangla",
		semester: "Spring 2021",
		status: "Active",
		avatar: "MR",
	},
];

const AdminStudents = () => {
	const [activeDept, setActiveDept] = useState("All Departments");
	const [currentPage, setCurrentPage] = useState(1);
	const navigate = useNavigate();

	const filteredStudents =
		activeDept === "All Departments"
			? studentsData
			: studentsData.filter((s) => s.department === activeDept);

	return (
		<div className="flex h-screen overflow-hidden premium-bg admin-theme">
			<div className="hidden md:block">
				<AdminSidebar activePage="Students" />
			</div>
			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				<AdminHeader />
				<main className="flex-1 overflow-y-auto p-4 md:p-8">
					{/* Page Header */}
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.4 }}
						className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
					>
						<div>
							<h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
								Student Directory
							</h2>
							<p className="text-muted-foreground text-sm mt-1">
								Total: 12,482 active students across all programs.
							</p>
						</div>
						<div className="flex items-center gap-3">
							<button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-bold hover:bg-secondary transition-colors">
								<Download className="w-4 h-4" />
								Export CSV
							</button>
							<button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
								<UserPlus className="w-4 h-4" />
								Add New Student
							</button>
						</div>
					</motion.div>

					{/* Filters */}
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
								className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeDept === dept
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
						<div className="ml-auto flex items-center gap-2 text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
							<SlidersHorizontal className="w-4 h-4" />
							More Filters
						</div>
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
											Name
										</th>
										<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
											Student ID
										</th>
										<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
											Department
										</th>
										<th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
											Semester
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
									{filteredStudents.map((student, i) => (
										<motion.tr
											key={student.id}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.25 + i * 0.04, duration: 0.3 }}
											className="hover:bg-secondary/30 transition-colors cursor-pointer"
											onClick={() => navigate(`/admin/students/${student.id}`)}
										>
											<td className="px-6 py-4">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
														{student.avatar}
													</div>
													<div>
														<p className="text-sm font-bold text-foreground">
															{student.name}
														</p>
														<p className="text-[11px] text-muted-foreground">
															{student.email}
														</p>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 text-sm font-medium text-foreground">
												{student.id}
											</td>
											<td className="px-6 py-4">
												<span className="px-2 py-1 text-[11px] font-bold rounded bg-secondary text-foreground">
													{student.department}
												</span>
											</td>
											<td className="px-6 py-4 text-sm text-foreground">
												{student.semester}
											</td>
											<td className="px-6 py-4">
												{student.status === "Active" ? (
													<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stat-emerald/10 text-stat-emerald">
														<span className="w-1.5 h-1.5 rounded-full bg-stat-emerald" />
														Active
													</span>
												) : (
													<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-stat-amber/10 text-stat-amber">
														<span className="w-1.5 h-1.5 rounded-full bg-stat-amber" />
														Suspended
													</span>
												)}
											</td>
											<td className="px-6 py-4 text-right">
												<div className="flex items-center justify-end gap-2">
													<button
														onClick={(e) => { e.stopPropagation(); navigate(`/admin/students/${student.id}`); }}
														className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
														title="View Profile"
													>
														<Eye className="w-5 h-5" />
													</button>
													<button
														className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
														title="Edit"
													>
														<Pencil className="w-5 h-5" />
													</button>
													<button
														className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground transition-colors"
														title="Reset Password"
													>
														<KeyRound className="w-5 h-5" />
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
								Showing <span className="text-foreground font-bold">1 to 10</span> of
								12,482 students
							</p>
							<div className="flex items-center gap-2">
								<button className="p-2 border border-border rounded-lg hover:bg-secondary transition-colors disabled:opacity-50">
									<ChevronLeft className="w-5 h-5" />
								</button>
								{[1, 2, 3].map((page) => (
									<button
										key={page}
										onClick={() => setCurrentPage(page)}
										className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${currentPage === page
												? "bg-primary text-primary-foreground"
												: "hover:bg-secondary text-foreground"
											}`}
									>
										{page}
									</button>
								))}
								<span className="text-muted-foreground">...</span>
								<button
									onClick={() => setCurrentPage(1248)}
									className="w-auto px-2 h-8 flex items-center justify-center rounded-lg hover:bg-secondary text-xs font-bold transition-colors text-foreground"
								>
									1,248
								</button>
								<button className="p-2 border border-border rounded-lg hover:bg-secondary transition-colors">
									<ChevronRight className="w-5 h-5" />
								</button>
							</div>
						</div>
					</motion.div>
				</main>
			</div>
		</div>
	);
};

export default AdminStudents;
