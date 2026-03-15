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

const Index = () => {
  return (
    <div className="flex h-screen overflow-hidden premium-bg">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop header */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Mobile header */}
        <MobileHeader />

        <main className="flex-1 overflow-y-auto">
          {/* Mobile-only content */}
          <MobileAcademicOverview />
          <MobileSchedule />
          <MobileTasks />

          {/* Desktop-only content */}
          <div className="hidden md:block p-8 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-3xl font-black text-foreground tracking-tight">Welcome back, Alex! 👋</h2>
              <p className="text-muted-foreground mt-1 font-medium">
                You have 3 assignments due this week and 2 classes remaining today.
              </p>
            </motion.div>
            <StatsGrid />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <AttendanceSummary />
                <ClassesToday />
              </div>
              <div className="space-y-8">
                <RecentResources />
                <QuickTasks />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
};

export default Index;
