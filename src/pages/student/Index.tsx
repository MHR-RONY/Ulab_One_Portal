import Sidebar from "@/components/student/Sidebar";
import Header from "@/components/student/Header";
import StatsGrid from "@/components/student/StatsGrid";
import AttendanceSummary from "@/components/student/AttendanceSummary";
import ClassesToday from "@/components/student/ClassesToday";
import RecentResources from "@/components/student/RecentResources";
import QuickTasks from "@/components/student/QuickTasks";
import BottomNav from "@/components/student/BottomNav";
import MobileHeader from "@/components/student/MobileHeader";
import MobileAcademicOverview from "@/components/student/MobileAcademicOverview";
import MobileSchedule from "@/components/student/MobileSchedule";
import MobileTasks from "@/components/student/MobileTasks";
import { motion } from "framer-motion";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";

const Index = () => {
	const { data, loading } = useStudentDashboard();

	const firstName = data?.student.name?.split(" ")[0] ?? "there";

	return (
		<div className="flex h-screen overflow-hidden premium-bg">
			{/* Desktop sidebar */}
			<div className="hidden md:block">
				<Sidebar />
			</div>

			<div className="flex-1 flex flex-col min-w-0 overflow-hidden">
				{/* Desktop header */}
				<div className="hidden md:block">
					<Header student={data?.student ?? null} />
				</div>

				{/* Mobile header */}
				<MobileHeader studentName={data?.student.name} />

				<main className="flex-1 overflow-y-auto">
					{/* Mobile-only content */}
					<MobileAcademicOverview attendance={data?.attendance} semester={data?.student.semester} loading={loading} />
					<MobileSchedule classes={data?.todaysClasses} loading={loading} />
					<MobileTasks />

					{/* Desktop-only content */}
					<div className="hidden md:block p-8 space-y-8">
						{loading ? (
							<div className="space-y-8 animate-pulse">
								{/* Heading skeleton */}
								<div className="space-y-2">
									<div className="h-8 w-72 bg-muted rounded-lg" />
									<div className="h-4 w-56 bg-muted/60 rounded-lg" />
								</div>
								{/* Stats grid skeleton */}
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
									{Array.from({ length: 4 }).map((_, i) => (
										<div key={i} className="bg-card rounded-2xl border border-border p-6 space-y-4">
											<div className="flex justify-between">
												<div className="w-10 h-10 rounded-xl bg-muted" />
												<div className="w-16 h-4 bg-muted rounded" />
											</div>
											<div className="h-3 w-24 bg-muted/70 rounded" />
											<div className="h-7 w-20 bg-muted rounded-lg" />
										</div>
									))}
								</div>
								{/* Content grid skeleton */}
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
									<div className="lg:col-span-2 space-y-8">
										<div className="bg-card rounded-2xl border border-border p-6 h-48" />
										<div className="bg-card rounded-2xl border border-border p-6 h-48" />
									</div>
									<div className="space-y-8">
										<div className="bg-card rounded-2xl border border-border p-6 h-40" />
										<div className="bg-card rounded-2xl border border-border p-6 h-40" />
									</div>
								</div>
							</div>
						) : (
							<>
								<motion.div
									initial={{ opacity: 0, y: 15 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4 }}
								>
									<h2 className="text-3xl font-black text-foreground tracking-tight">
										Welcome back, {firstName}!
									</h2>
									<p className="text-muted-foreground mt-1 font-medium">
										{data?.stats.upcomingClassesCount
											? `You have ${data.stats.upcomingClassesCount} class${data.stats.upcomingClassesCount > 1 ? "es" : ""} remaining today.`
											: "You have no more classes today."}
									</p>
								</motion.div>
								<StatsGrid stats={data?.stats ?? null} />
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
									<div className="lg:col-span-2 space-y-8">
										<AttendanceSummary attendance={data?.attendance ?? []} />
										<ClassesToday classes={data?.todaysClasses ?? []} />
									</div>
									<div className="space-y-8">
										<RecentResources />
										<QuickTasks />
									</div>
								</div>
							</>
						)}
					</div>
				</main>
			</div>

			{/* Mobile bottom nav */}
			<BottomNav />
		</div>
	);
};

export default Index;
