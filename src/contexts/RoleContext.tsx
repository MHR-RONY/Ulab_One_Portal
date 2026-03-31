import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import axios from "axios";
import { setAccessToken, getAccessToken } from "@/lib/api";

type UserRole = "student" | "teacher" | "admin";

interface RoleContextType {
	role: UserRole;
	switchRole: (newRole: UserRole) => void;
	isStudent: boolean;
	isTeacher: boolean;
	isAdmin: boolean;
	isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5003/api";

function getRoleFromToken(): UserRole {
	const token = getAccessToken();
	if (!token) return "student";
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		if (payload.role === "teacher" || payload.role === "admin") return payload.role;
		return "student";
	} catch {
		return "student";
	}
}

export const RoleProvider = ({ children }: { children: ReactNode }) => {
	const [tick, setTick] = useState(0);
	const [isLoading, setIsLoading] = useState(true);

	// On mount, silently attempt to restore the session via the httpOnly refresh token cookie.
	// This replaces the old localStorage read and runs once per page load.
	useEffect(() => {
		const restoreSession = async () => {
			try {
				const { data } = await axios.post(
					`${BASE_URL}/auth/refresh-token`,
					{},
					{ withCredentials: true }
				);
				setAccessToken(data.data.accessToken);
				setTick((n) => n + 1);
			} catch {
				setAccessToken(null);
			} finally {
				setIsLoading(false);
			}
		};
		restoreSession();
	}, []);

	const role: UserRole = getRoleFromToken();

	const switchRole = useCallback((_newRole: UserRole) => {
		setTick((n) => n + 1);
	}, []);

	void tick;

	return (
		<RoleContext.Provider
			value={{
				role,
				switchRole,
				isStudent: role === "student",
				isTeacher: role === "teacher",
				isAdmin: role === "admin",
				isLoading,
			}}
		>
			{children}
		</RoleContext.Provider>
	);
};

export const useRole = () => {
	const context = useContext(RoleContext);
	if (!context) throw new Error("useRole must be used within RoleProvider");
	return context;
};
