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

// ─── Password Reset OTP ───────────────────────────────────────

export interface PendingPasswordReset {
	email: string;
	otp: string;
	attempts: number;
	expiresAt: number;
	verified: boolean;
	resetToken: string | null;
}

const pendingPasswordResets = new Map<string, PendingPasswordReset>();

// Cleanup expired reset entries every 5 minutes
setInterval(() => {
	const now = Date.now();
	for (const [key, value] of pendingPasswordResets) {
		if (value.expiresAt < now) {
			pendingPasswordResets.delete(key);
		}
	}
}, 5 * 60 * 1000);

export const storePasswordReset = (email: string, otp: string): void => {
	pendingPasswordResets.set(email.toLowerCase(), {
		email: email.toLowerCase(),
		otp,
		attempts: 0,
		expiresAt: Date.now() + 5 * 60 * 1000,
		verified: false,
		resetToken: null,
	});
};

export const getPasswordReset = (email: string): PendingPasswordReset | undefined => {
	const entry = pendingPasswordResets.get(email.toLowerCase());
	if (!entry) return undefined;
	if (entry.expiresAt < Date.now()) {
		pendingPasswordResets.delete(email.toLowerCase());
		return undefined;
	}
	return entry;
};

export const incrementResetOtpAttempts = (email: string): boolean => {
	const entry = pendingPasswordResets.get(email.toLowerCase());
	if (!entry) return false;
	entry.attempts += 1;
	if (entry.attempts >= MAX_OTP_ATTEMPTS) {
		pendingPasswordResets.delete(email.toLowerCase());
		return false;
	}
	return true;
};

export const markResetVerified = (email: string): string => {
	const entry = pendingPasswordResets.get(email.toLowerCase());
	if (!entry) throw new Error("No pending reset");
	const resetToken = crypto.randomBytes(32).toString("hex");
	entry.verified = true;
	entry.resetToken = resetToken;
	entry.expiresAt = Date.now() + 10 * 60 * 1000; // 10 min to set new password
	return resetToken;
};

export const validateResetToken = (email: string, token: string): boolean => {
	const entry = pendingPasswordResets.get(email.toLowerCase());
	if (!entry) return false;
	if (entry.expiresAt < Date.now()) {
		pendingPasswordResets.delete(email.toLowerCase());
		return false;
	}
	return entry.verified && entry.resetToken === token;
};

export const deletePasswordReset = (email: string): void => {
	pendingPasswordResets.delete(email.toLowerCase());
};
