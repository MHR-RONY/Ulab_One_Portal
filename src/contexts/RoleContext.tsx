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

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem("ulab-role");
    if (saved === "teacher") return "teacher";
    if (saved === "admin") return "admin";
    return "student";
  });

  const switchRole = useCallback((newRole: UserRole) => {
    setRole(newRole);
    localStorage.setItem("ulab-role", newRole);
  }, []);

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
