import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { AdminMobileMenuProvider } from "@/contexts/AdminMobileMenuContext";
import { StudentRoute, TeacherRoute, AdminRoute } from "@/components/auth/RouteGuards";
import GlobalLoader from "@/components/ui/GlobalLoader";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminStudents from "@/pages/admin/AdminStudents";
import AdminStudentDetail from "@/pages/admin/AdminStudentDetail";
import AdminTeachers from "@/pages/admin/AdminTeachers";
import AdminTeacherDetail from "@/pages/admin/AdminTeacherDetail";
import AdminSchedules from "@/pages/admin/AdminSchedules";
import AdminScheduleBuilder from "@/pages/admin/AdminScheduleBuilder";
import AdminManagement from "@/pages/admin/AdminManagement";
import AdminResources from "@/pages/admin/AdminResources";
import AdminMessenger from "@/pages/admin/AdminMessenger";
import AdminDepartmentNotes from "@/pages/admin/AdminDepartmentNotes";
import AdminAnalytics from "@/pages/admin/AdminAnalytics";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminMaintenance from "@/pages/admin/AdminMaintenance";
import AdminInfrastructure from "@/pages/admin/AdminInfrastructure";
import AdminSections from "@/pages/admin/AdminSections";
import AdminSubjects from "@/pages/admin/AdminSubjects";
import Index from "@/pages/student/Index";
import Chat from "@/pages/student/Chat";
import Attendance from "@/pages/student/Attendance";
import Profile from "@/pages/student/Profile";
import NotesLibrary from "@/pages/student/NotesLibrary";
import CourseNotes from "@/pages/student/CourseNotes";
import ScheduleBuilder from "@/pages/student/ScheduleBuilder";
import Settings from "@/pages/student/Settings";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import TeacherClasses from "@/pages/teacher/TeacherClasses";
import TeacherCourseDetail from "@/pages/teacher/TeacherCourseDetail";
import TeacherAttendance from "@/pages/teacher/TeacherAttendance";
import TeacherAnalytics from "@/pages/teacher/TeacherAnalytics";
import TeacherSettings from "@/pages/teacher/TeacherSettings";
import TeacherChat from "@/pages/teacher/TeacherChat";
import TeacherAssignments from "@/pages/teacher/TeacherAssignments";
import AdminLogin from "@/pages/auth/AdminLogin";
import TeacherLogin from "@/pages/auth/TeacherLogin";
import StudentLogin from "@/pages/auth/StudentLogin";
import StudentSignup from "@/pages/auth/StudentSignup";
import StudentForgotPassword from "@/pages/auth/StudentForgotPassword";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<ThemeProvider>
			<RoleProvider>
				<TooltipProvider>
					<Toaster />
					<Sonner />
					<BrowserRouter>
						<GlobalLoader />
						<Routes>
							{/* Student Routes */}
							<Route element={<StudentRoute />}>
								<Route path="/" element={<Index />} />
								<Route path="/chat" element={<Chat />} />
								<Route path="/attendance" element={<Attendance />} />
								<Route path="/profile" element={<Profile />} />
								<Route path="/notes" element={<NotesLibrary />} />
								<Route path="/notes/:courseId" element={<CourseNotes />} />
								<Route path="/schedule" element={<ScheduleBuilder />} />
								<Route path="/settings" element={<Settings />} />
							</Route>

							{/* Teacher Routes */}
							<Route element={<TeacherRoute />}>
								<Route path="/teacher" element={<TeacherDashboard />} />
								<Route path="/teacher/attendance" element={<TeacherAttendance />} />
								<Route path="/teacher/analytics" element={<TeacherAnalytics />} />
								<Route path="/teacher/classes" element={<TeacherClasses />} />
								<Route path="/teacher/classes/:courseCode" element={<TeacherCourseDetail />} />
								<Route path="/teacher/profile" element={<Profile />} />
								<Route path="/teacher/settings" element={<TeacherSettings />} />
								<Route path="/teacher/chat" element={<TeacherChat />} />
								<Route path="/teacher/assignments" element={<TeacherAssignments />} />
							</Route>

							{/* Admin Routes */}
							<Route element={<AdminRoute />}>
								<Route path="/admin" element={<AdminMobileMenuProvider><AdminDashboard /></AdminMobileMenuProvider>} />
								<Route path="/admin/students" element={<AdminMobileMenuProvider><AdminStudents /></AdminMobileMenuProvider>} />
								<Route path="/admin/students/:studentId" element={<AdminMobileMenuProvider><AdminStudentDetail /></AdminMobileMenuProvider>} />
								<Route path="/admin/teachers" element={<AdminMobileMenuProvider><AdminTeachers /></AdminMobileMenuProvider>} />
								<Route path="/admin/teachers/:teacherId" element={<AdminMobileMenuProvider><AdminTeacherDetail /></AdminMobileMenuProvider>} />
								<Route path="/admin/schedules" element={<AdminMobileMenuProvider><AdminSchedules /></AdminMobileMenuProvider>} />
								<Route path="/admin/schedule-builder" element={<AdminMobileMenuProvider><AdminScheduleBuilder /></AdminMobileMenuProvider>} />
								<Route path="/admin/management" element={<AdminMobileMenuProvider><AdminManagement /></AdminMobileMenuProvider>} />
								<Route path="/admin/resources" element={<AdminMobileMenuProvider><AdminResources /></AdminMobileMenuProvider>} />
								<Route path="/admin/resources/:deptId" element={<AdminMobileMenuProvider><AdminDepartmentNotes /></AdminMobileMenuProvider>} />
								<Route path="/admin/messenger" element={<AdminMobileMenuProvider><AdminMessenger /></AdminMobileMenuProvider>} />
								<Route path="/admin/analytics" element={<AdminMobileMenuProvider><AdminAnalytics /></AdminMobileMenuProvider>} />
								<Route path="/admin/settings" element={<AdminMobileMenuProvider><AdminSettings /></AdminMobileMenuProvider>} />
								<Route path="/admin/maintenance" element={<AdminMobileMenuProvider><AdminMaintenance /></AdminMobileMenuProvider>} />
								<Route path="/admin/infrastructure" element={<AdminMobileMenuProvider><AdminInfrastructure /></AdminMobileMenuProvider>} />
								<Route path="/admin/sections" element={<AdminMobileMenuProvider><AdminSections /></AdminMobileMenuProvider>} />
								<Route path="/admin/subjects" element={<AdminMobileMenuProvider><AdminSubjects /></AdminMobileMenuProvider>} />
							</Route>


							{/* Auth Routes */}
							<Route path="/login" element={<StudentLogin />} />
							<Route path="/signup" element={<StudentSignup />} />
							<Route path="/forgot-password" element={<StudentForgotPassword />} />
							<Route path="/admin/login" element={<AdminLogin />} />
							<Route path="/teacher/login" element={<TeacherLogin />} />

							{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
							<Route path="*" element={<NotFound />} />
						</Routes>
					</BrowserRouter>
				</TooltipProvider>
			</RoleProvider>
		</ThemeProvider>
	</QueryClientProvider>
);

export default App;
