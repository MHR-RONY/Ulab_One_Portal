import { Navigate, Outlet } from "react-router-dom";

type TRole = "student" | "teacher" | "admin";

// Decode the JWT payload to read the role field.
// The signature is verified server-side on every request — this is only used for UI routing.
function getJwtRole(): TRole | null {
	const token = localStorage.getItem("accessToken");
	if (!token) return null;
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		if (payload.role === "student" || payload.role === "teacher" || payload.role === "admin") {
			return payload.role as TRole;
		}
		return null;
	} catch {
		return null;
	}
}

export const StudentRoute = () => {
	const role = getJwtRole();
	if (role !== "student") return <Navigate to="/login" replace />;
	return (
		<div className="student-theme min-h-screen bg-background text-foreground">
			<Outlet />
		</div>
	);
};

export const TeacherRoute = () => {
	const role = getJwtRole();
	if (role !== "teacher") return <Navigate to="/teacher/login" replace />;
	return <Outlet />;
};

export const AdminRoute = () => {
	const role = getJwtRole();
	if (role !== "admin") return <Navigate to="/admin/login" replace />;
	return <Outlet />;
};
