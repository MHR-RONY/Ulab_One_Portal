import crypto from "crypto";

export interface PendingRegistration {
	type: "student";
	name: string;
	email: string;
	password: string;
	studentId: string;
	department: string;
	semester?: number;
	otp: string;
	expiresAt: number;
}

const pendingRegistrations = new Map<string, PendingRegistration>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
	const now = Date.now();
	for (const [key, value] of pendingRegistrations) {
		if (value.expiresAt < now) {
			pendingRegistrations.delete(key);
		}
	}
}, 5 * 60 * 1000);

export const generateOtp = (): string => {
	return crypto.randomInt(100000, 999999).toString();
};

export const storePendingRegistration = (
	email: string,
	data: Omit<PendingRegistration, "expiresAt">
): void => {
	pendingRegistrations.set(email.toLowerCase(), {
		...data,
		expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
	});
};

export const getPendingRegistration = (
	email: string
): PendingRegistration | undefined => {
	const entry = pendingRegistrations.get(email.toLowerCase());
	if (!entry) return undefined;
	if (entry.expiresAt < Date.now()) {
		pendingRegistrations.delete(email.toLowerCase());
		return undefined;
	}
	return entry;
};

export const deletePendingRegistration = (email: string): void => {
	pendingRegistrations.delete(email.toLowerCase());
};
