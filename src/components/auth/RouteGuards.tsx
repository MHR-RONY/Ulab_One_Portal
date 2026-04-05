import { Navigate, Outlet } from "react-router-dom";
import { useRole } from "@/contexts/RoleContext";

export const StudentRoute = () => {
	const { role, isLoading } = useRole();
	if (isLoading) return null;
	if (role !== "student") return <Navigate to="/login" replace />;
	return (
		<div className="student-theme min-h-screen bg-background text-foreground">
			<Outlet />
		</div>
	);
};

export const TeacherRoute = () => {
	const { role, isLoading } = useRole();
	if (isLoading) return null;
	if (role !== "teacher") return <Navigate to="/teacher/login" replace />;
	return <Outlet />;
};

export const AdminRoute = () => {
	const { role, isLoading } = useRole();
	if (isLoading) return null;
	if (role !== "admin") return <Navigate to="/admin/login" replace />;
	return <Outlet />;
};
