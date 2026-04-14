import { useState } from "react";
import { Search, Upload, Bookmark, Filter, ArrowLeft, Cpu, BookOpen, Zap, Newspaper } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNoteRepositories } from "@/hooks/useStudentNotes";
import MobileMenuDrawer from "@/components/student/MobileMenuDrawer";

const courseIcons: Record<string, React.ReactNode> = {
	CSE: <Cpu className="w-5 h-5 text-primary" />,
	BBA: <BookOpen className="w-5 h-5 text-primary" />,
	EEE: <Zap className="w-5 h-5 text-primary" />,
	MSJ: <Newspaper className="w-5 h-5 text-primary" />,
};

const tabs = ["Courses", "Recents", "Bookmarks"];

const MobileNotesLibrary = () => {
	const [activeTab, setActiveTab] = useState("Courses");
	const [searchQuery, setSearchQuery] = useState("");
	const navigate = useNavigate();
	const { repos, loading } = useNoteRepositories();

	const filteredCourses = repos.filter(
		(repo) =>
			searchQuery === "" ||
			repo.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			repo.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
	);

	return (
		<div className="flex flex-col h-screen bg-secondary/30">
			{/* Header */}
			<div className="flex items-center bg-card p-4 pb-2 justify-between sticky top-0 z-10 border-b border-border">
				<button
					onClick={() => navigate(-1)}
					className="flex items-center justify-center rounded-full w-10 h-10 text-primary hover:bg-primary/10 transition-colors"
				>
					<ArrowLeft className="w-5 h-5" />
				</button>
				<h2 className="text-primary text-lg font-bold tracking-tight flex-1 text-center">
					Notes Library
				</h2>
				<MobileMenuDrawer activePage="Notes Library" />
			</div>

			{/* Search Bar */}
			<div className="px-4 py-4 bg-card">
				<div className="flex items-center h-12 w-full rounded-xl bg-primary/5 border border-primary/10 px-4 gap-2">
					<Search className="w-5 h-5 text-muted-foreground shrink-0" />
					<input
						className="flex-1 bg-transparent text-base focus:outline-none placeholder:text-muted-foreground"
						placeholder="Search courses or topics"
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			{/* Tabs */}
			<div className="bg-card border-b border-border">
				<div className="flex px-4 gap-8">
					{tabs.map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`flex flex-col items-center justify-center pb-3 pt-4 border-b-[3px] transition-colors ${activeTab === tab
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground"
								}`}
						>
							<span className="text-sm font-bold tracking-wide">{tab}</span>
						</button>
					))}
				</div>
			</div>

			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto pb-24">
				<AnimatePresence mode="wait">
					{activeTab === "Courses" && (
						<motion.div
							key="courses"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
						>
							{/* Enrolled Courses */}
							<div className="px-4 py-6">
								<h3 className="text-primary text-xl font-bold mb-4">Your Enrolled Courses</h3>
								{loading ? (
									<div className="grid gap-3">
										{Array.from({ length: 4 }).map((_, i) => (
											<div key={i} className="bg-card p-4 rounded-xl border border-border animate-pulse">
												<div className="h-5 w-2/3 bg-secondary rounded mb-2" />
												<div className="h-4 w-1/3 bg-secondary rounded mb-4" />
												<div className="h-10 bg-secondary rounded-lg" />
											</div>
										))}
									</div>
								) : (
									<div className="grid gap-3">
										{filteredCourses.map((course, index) => (
											<motion.div
												key={course._id}
												initial={{ opacity: 0, y: 12 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ delay: index * 0.05, duration: 0.3 }}
												className="bg-card p-4 rounded-xl shadow-sm border border-border"
											>
												<div className="flex justify-between items-start mb-4">
													<div>
														<h4 className="text-foreground font-bold text-lg leading-tight">
															{course.courseName}
														</h4>
														<p className="text-muted-foreground text-sm mt-1">
															{course.courseCode} &bull; {course.noteCount} Notes
														</p>
													</div>
													<div className="bg-primary/10 p-2.5 rounded-lg">
														{courseIcons[course.department] || <BookOpen className="w-5 h-5 text-primary" />}
													</div>
												</div>
												<div className="flex gap-2">
													<button
														onClick={() => navigate(`/notes/${course._id}`)}
														className="flex-1 bg-primary text-primary-foreground py-2.5 px-4 rounded-lg font-semibold text-sm active:scale-[0.97] transition-all"
													>
														View Library
													</button>
													<button className="flex items-center justify-center w-12 bg-primary/10 text-primary py-2.5 rounded-lg active:scale-[0.95] transition-all">
														<Upload className="w-5 h-5" />
													</button>
												</div>
											</motion.div>
										))}
										{filteredCourses.length === 0 && (
											<div className="text-center py-8 text-muted-foreground">
												<p className="font-semibold text-foreground">No courses found</p>
												<p className="text-sm mt-1">Try a different search query.</p>
											</div>
										)}
									</div>
								)}
							</div>

						</motion.div>
					)}

					{activeTab === "Recents" && (
						<motion.div
							key="recents"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="px-4 py-12 text-center text-muted-foreground"
						>
							<BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
							<p className="font-bold text-foreground">No recent notes</p>
							<p className="text-sm mt-1">Notes you view will appear here.</p>
						</motion.div>
					)}

					{activeTab === "Bookmarks" && (
						<motion.div
							key="bookmarks"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="px-4 py-12 text-center text-muted-foreground"
						>
							<Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
							<p className="font-bold text-foreground">No bookmarked notes</p>
							<p className="text-sm mt-1">Save notes to find them quickly later.</p>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default MobileNotesLibrary;
