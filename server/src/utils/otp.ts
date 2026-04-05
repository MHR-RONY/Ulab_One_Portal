import crypto from "crypto";
import bcrypt from "bcryptjs";

const MAX_OTP_ATTEMPTS = 5;

export interface PendingRegistration {
	type: "student";
	name: string;
	email: string;
	hashedPassword: string;
	studentId: string;
	department: string;
	semester?: number;
	otp: string;
	attempts: number;
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

export const storePendingRegistration = async (
	email: string,
	data: Omit<PendingRegistration, "expiresAt" | "attempts" | "hashedPassword"> & { password: string }
): Promise<void> => {
	const salt = await bcrypt.genSalt(12);
	const hashedPassword = await bcrypt.hash(data.password, salt);
	const { password: _pw, ...rest } = data;
	void _pw;
	pendingRegistrations.set(email.toLowerCase(), {
		...rest,
		hashedPassword,
		attempts: 0,
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

export const incrementOtpAttempts = (email: string): boolean => {
	const entry = pendingRegistrations.get(email.toLowerCase());
	if (!entry) return false;
	entry.attempts += 1;
	if (entry.attempts >= MAX_OTP_ATTEMPTS) {
		pendingRegistrations.delete(email.toLowerCase());
		return false; // invalidated
	}
	return true; // still valid, but attempts incremented
};

export const deletePendingRegistration = (email: string): void => {
	pendingRegistrations.delete(email.toLowerCase());
};
