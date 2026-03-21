import { Navigate, Outlet } from "react-router-dom";

const getToken = () => localStorage.getItem("accessToken");
const getRole = () => localStorage.getItem("ulab-role");

export const StudentRoute = () => {
  if (!getToken() || getRole() !== "student") {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export const TeacherRoute = () => {
  if (!getToken() || getRole() !== "teacher") {
    return <Navigate to="/teacher/login" replace />;
  }
  return <Outlet />;
};

export const AdminRoute = () => {
  if (!getToken() || getRole() !== "admin") {
    return <Navigate to="/admin/login" replace />;
  }
  return <Outlet />;
};
