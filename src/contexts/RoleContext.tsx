import { createContext, useContext, useState, ReactNode, useCallback } from "react";

type UserRole = "student" | "teacher" | "admin";

interface RoleContextType {
	role: UserRole;
	switchRole: (newRole: UserRole) => void;
	isStudent: boolean;
	isTeacher: boolean;
	isAdmin: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function getRoleFromToken(): UserRole {
	const token = localStorage.getItem("accessToken");
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
	// Force re-render counter — incremented by switchRole after login sets the token
	const [tick, setTick] = useState(0);
	// Derive role from the JWT token, not from a user-controllable localStorage key
	const role: UserRole = getRoleFromToken();

	// switchRole is called by login pages after they store the accessToken.
	// Its only job is to trigger a re-render so the role is re-derived from the new token.
	const switchRole = useCallback((_newRole: UserRole) => {
		setTick((n) => n + 1);
	}, []);

	// tick is consumed to satisfy the linter — the value itself drives re-renders
	void tick;

	return (
		<RoleContext.Provider
			value={{
				role,
				switchRole,
				isStudent: role === "student",
				isTeacher: role === "teacher",
				isAdmin: role === "admin",
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
