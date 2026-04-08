import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RoleProvider } from "@/contexts/RoleContext";
import { StudentRoute, TeacherRoute, AdminRoute } from "@/components/auth/RouteGuards";
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
import AdminLogin from "@/pages/auth/AdminLogin";
import TeacherLogin from "@/pages/auth/TeacherLogin";
import StudentLogin from "@/pages/auth/StudentLogin";
import StudentSignup from "@/pages/auth/StudentSignup";
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
							</Route>

							{/* Admin Routes */}
							<Route element={<AdminRoute />}>
								<Route path="/admin" element={<AdminDashboard />} />
								<Route path="/admin/students" element={<AdminStudents />} />
								<Route path="/admin/students/:studentId" element={<AdminStudentDetail />} />
								<Route path="/admin/teachers" element={<AdminTeachers />} />
								<Route path="/admin/teachers/:teacherId" element={<AdminTeacherDetail />} />
								<Route path="/admin/schedules" element={<AdminSchedules />} />
								<Route path="/admin/schedule-builder" element={<AdminScheduleBuilder />} />
								<Route path="/admin/management" element={<AdminManagement />} />
								<Route path="/admin/resources" element={<AdminResources />} />
								<Route path="/admin/resources/:deptId" element={<AdminDepartmentNotes />} />
								<Route path="/admin/messenger" element={<AdminMessenger />} />
								<Route path="/admin/analytics" element={<AdminAnalytics />} />
								<Route path="/admin/settings" element={<AdminSettings />} />
								<Route path="/admin/maintenance" element={<AdminMaintenance />} />
								<Route path="/admin/infrastructure" element={<AdminInfrastructure />} />
							</Route>


							{/* Auth Routes */}
							<Route path="/login" element={<StudentLogin />} />
							<Route path="/signup" element={<StudentSignup />} />
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
