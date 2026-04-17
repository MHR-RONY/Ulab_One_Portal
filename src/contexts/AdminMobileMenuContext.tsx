import { createContext, useContext, useState, ReactNode } from "react";

interface AdminMobileMenuContextType {
	isOpen: boolean;
	open: () => void;
	close: () => void;
	toggle: () => void;
}

const AdminMobileMenuContext = createContext<AdminMobileMenuContextType>({
	isOpen: false,
	open: () => {},
	close: () => {},
	toggle: () => {},
});

export const AdminMobileMenuProvider = ({ children }: { children: ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false);
	return (
		<AdminMobileMenuContext.Provider
			value={{
				isOpen,
				open: () => setIsOpen(true),
				close: () => setIsOpen(false),
				toggle: () => setIsOpen((v) => !v),
			}}
		>
			{children}
		</AdminMobileMenuContext.Provider>
	);
};

export const useAdminMobileMenu = () => useContext(AdminMobileMenuContext);
