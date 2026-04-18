import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	GraduationCap, AtSign, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
	Loader2, AlertCircle, Mail, KeyRound, CheckCircle2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";

type Step = "email" | "otp" | "reset" | "success";

const StudentForgotPassword = () => {
	const [step, setStep] = useState<Step>("email");
	const [email, setEmail] = useState("");
	const [otpValue, setOtpValue] = useState("");
	const [resetToken, setResetToken] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formError, setFormError] = useState("");
	const navigate = useNavigate();
	const { toast } = useToast();

	const handleSendOtp = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError("");

		if (!email) {
			setFormError("Email is required");
			return;
		}
		if (!email.endsWith("@ulab.edu.bd")) {
			setFormError("Must be a valid ULAB email");
			return;
		}

		setLoading(true);
		try {
			await api.post("/auth/forgot-password/student/send-otp", { email });
			setStep("otp");
			toast({ title: "OTP Sent", description: `Verification code sent to ${email}` });
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } }; code?: string };
			if (err.code === "ERR_NETWORK") {
				setFormError("Cannot connect to server. Please make sure the server is running.");
			} else if (err.response?.data?.message) {
				setFormError(err.response.data.message);
			} else {
				setFormError("Something went wrong. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOtp = async (code?: string) => {
		const otp = code || otpValue;
		if (otp.length !== 6) return;

		setLoading(true);
		setFormError("");
		try {
			const { data } = await api.post("/auth/forgot-password/student/verify-otp", { email, otp });
			setResetToken(data.data.resetToken);
			setStep("reset");
			toast({ title: "OTP Verified", description: "Please set your new password" });
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } }; code?: string };
			if (err.code === "ERR_NETWORK") {
				setFormError("Cannot connect to server.");
			} else if (err.response?.data?.message) {
				setFormError(err.response.data.message);
			} else {
				setFormError("Verification failed. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError("");

		if (!newPassword) {
			setFormError("New password is required");
			return;
		}
		if (newPassword.length < 6) {
			setFormError("Password must be at least 6 characters");
			return;
		}
		if (newPassword !== confirmPassword) {
			setFormError("Passwords do not match");
			return;
		}

		setLoading(true);
		try {
			await api.post("/auth/forgot-password/student/reset", {
				email,
				resetToken,
				newPassword,
			});
			setStep("success");
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } }; code?: string };
			if (err.code === "ERR_NETWORK") {
				setFormError("Cannot connect to server.");
			} else if (err.response?.data?.message) {
				setFormError(err.response.data.message);
			} else {
				setFormError("Password reset failed. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleResendOtp = async () => {
		setLoading(true);
		setFormError("");
		try {
			await api.post("/auth/forgot-password/student/send-otp", { email });
			setOtpValue("");
			toast({ title: "OTP Resent", description: `New code sent to ${email}` });
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } }; code?: string };
			const message = err.response?.data?.message || "Could not resend OTP. Please try again.";
			toast({ title: "Resend Failed", description: message, variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="student-theme flex min-h-screen w-full flex-col lg:flex-row bg-background">
			{/* Left Side: Image & Branding */}
			<div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 text-white overflow-hidden bg-primary">
				<div className="absolute inset-0 z-0">
					<img
						alt="University library"
						className="w-full h-full object-cover opacity-40"
						src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80"
					/>
					<div className="absolute inset-0" style={{ background: "linear-gradient(to bottom right, hsl(var(--primary) / 0.92), hsl(var(--primary) / 0.65), transparent)" }} />
				</div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5 }}
					className="relative z-10 flex items-center gap-3"
				>
					<div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
						<GraduationCap className="w-7 h-7 text-white" />
					</div>
					<span className="text-xl font-extrabold tracking-tight">ULAB One Portal</span>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.6 }}
					className="relative z-10"
				>
					<h1 className="text-5xl font-black tracking-tight leading-tight mb-6">
						Reset Your<br />Password
					</h1>
					<p className="text-lg text-white/80 font-medium leading-relaxed max-w-lg">
						Don't worry, it happens to the best of us. We'll help you get back into your account in no time.
					</p>
				</motion.div>

				<div className="relative z-10 border-t border-white/20 pt-6">
					<p className="text-white/60 text-sm">© 2024 University of Liberal Arts Bangladesh</p>
				</div>
			</div>

			{/* Right Side: Form */}
			<div className="flex-1 flex items-center justify-center px-6 md:px-16 py-12 bg-secondary/30">
				<AnimatePresence mode="wait">
					{/* Step 1: Email */}
					{step === "email" && (
						<motion.div
							key="email"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.3 }}
							className="max-w-md w-full bg-card rounded-2xl p-8 md:p-10 shadow-xl border border-border"
						>
							<div className="text-center mb-8">
								<div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
									<KeyRound className="w-7 h-7 text-primary" />
								</div>
								<h2 className="text-2xl font-black text-foreground tracking-tight">Forgot Password?</h2>
								<p className="text-muted-foreground mt-2 text-sm">
									Enter your university email and we'll send you a verification code.
								</p>
							</div>

							<form onSubmit={handleSendOtp} className="space-y-6">
								<AnimatePresence>
									{formError && (
										<motion.div
											initial={{ opacity: 0, y: -6 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -6 }}
											transition={{ duration: 0.2 }}
											className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-900/20"
										>
											<AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
											<p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
										</motion.div>
									)}
								</AnimatePresence>

								<div className="space-y-2">
									<label className="text-sm font-semibold text-foreground">University Email</label>
									<div className="relative">
										<AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input
											type="email"
											placeholder="student@ulab.edu.bd"
											className="rounded-xl h-12 pl-11 border-border"
											value={email}
											onChange={(e) => { setEmail(e.target.value); setFormError(""); }}
										/>
									</div>
								</div>

								<button
									type="submit"
									disabled={loading}
									className="w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 text-white bg-primary shadow-lg transition-all hover:opacity-90 disabled:opacity-60"
								>
									{loading ? (
										<><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
									) : (
										<>Send Verification Code <ArrowRight className="w-4 h-4" /></>
									)}
								</button>
							</form>

							<div className="mt-8 border-t border-border pt-6 text-center">
								<Link to="/login" className="text-sm font-bold hover:underline flex items-center justify-center gap-1 text-primary">
									<ArrowLeft className="w-3.5 h-3.5" /> Back to Login
								</Link>
							</div>
						</motion.div>
					)}

					{/* Step 2: OTP */}
					{step === "otp" && (
						<motion.div
							key="otp"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.3 }}
							className="max-w-md w-full bg-card rounded-2xl p-8 md:p-10 shadow-xl border border-border"
						>
							<div className="text-center mb-8">
								<div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
									<Mail className="w-7 h-7 text-primary" />
								</div>
								<h2 className="text-2xl font-black text-foreground tracking-tight">Verify Your Email</h2>
								<p className="text-muted-foreground mt-2 text-sm">
									We sent a 6-digit code to<br />
									<span className="font-semibold text-foreground">{email}</span>
								</p>
							</div>

							<div className="space-y-6">
								<AnimatePresence>
									{formError && (
										<motion.div
											initial={{ opacity: 0, y: -6 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -6 }}
											transition={{ duration: 0.2 }}
											className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-900/20"
										>
											<AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
											<p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
										</motion.div>
									)}
								</AnimatePresence>

								<div className="flex flex-col items-center gap-2">
									<InputOTP
										maxLength={6}
										value={otpValue}
										onChange={(val) => {
											setOtpValue(val);
											setFormError("");
											if (val.length === 6) {
												handleVerifyOtp(val);
											}
										}}
									>
										<InputOTPGroup className="gap-3">
											<InputOTPSlot index={0} className="w-12 h-14 text-lg font-bold rounded-lg border" />
											<InputOTPSlot index={1} className="w-12 h-14 text-lg font-bold rounded-lg border" />
											<InputOTPSlot index={2} className="w-12 h-14 text-lg font-bold rounded-lg border" />
											<InputOTPSlot index={3} className="w-12 h-14 text-lg font-bold rounded-lg border" />
											<InputOTPSlot index={4} className="w-12 h-14 text-lg font-bold rounded-lg border" />
											<InputOTPSlot index={5} className="w-12 h-14 text-lg font-bold rounded-lg border" />
										</InputOTPGroup>
									</InputOTP>
								</div>

								<button
									type="button"
									onClick={() => handleVerifyOtp()}
									disabled={loading || otpValue.length !== 6}
									className="w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 text-white bg-primary shadow-lg transition-all hover:opacity-90 disabled:opacity-60"
								>
									{loading ? (
										<><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
									) : (
										<>Verify Code <ArrowRight className="w-4 h-4" /></>
									)}
								</button>

								<div className="flex items-center justify-between text-sm">
									<button
										type="button"
										onClick={() => { setStep("email"); setOtpValue(""); setFormError(""); }}
										className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
									>
										<ArrowLeft className="w-3.5 h-3.5" /> Back
									</button>
									<button
										type="button"
										onClick={handleResendOtp}
										disabled={loading}
										className="font-semibold hover:underline disabled:opacity-50 text-primary"
									>
										Resend Code
									</button>
								</div>

								<p className="text-center text-xs text-muted-foreground">
									Code expires in 5 minutes
								</p>
							</div>
						</motion.div>
					)}

					{/* Step 3: New Password */}
					{step === "reset" && (
						<motion.div
							key="reset"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{ duration: 0.3 }}
							className="max-w-md w-full bg-card rounded-2xl p-8 md:p-10 shadow-xl border border-border"
						>
							<div className="text-center mb-8">
								<div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
									<Lock className="w-7 h-7 text-primary" />
								</div>
								<h2 className="text-2xl font-black text-foreground tracking-tight">Set New Password</h2>
								<p className="text-muted-foreground mt-2 text-sm">
									Create a new password for your account.
								</p>
							</div>

							<form onSubmit={handleResetPassword} className="space-y-6">
								<AnimatePresence>
									{formError && (
										<motion.div
											initial={{ opacity: 0, y: -6 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: -6 }}
											transition={{ duration: 0.2 }}
											className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-900/20"
										>
											<AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
											<p className="text-sm text-red-600 dark:text-red-400">{formError}</p>
										</motion.div>
									)}
								</AnimatePresence>

								<div className="space-y-2">
									<label className="text-sm font-semibold text-foreground">New Password</label>
									<div className="relative">
										<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input
											type={showPassword ? "text" : "password"}
											placeholder="Enter new password"
											className="rounded-xl h-12 pl-11 pr-11 border-border"
											value={newPassword}
											onChange={(e) => { setNewPassword(e.target.value); setFormError(""); }}
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										>
											{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-semibold text-foreground">Confirm Password</label>
									<div className="relative">
										<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
										<Input
											type={showConfirm ? "text" : "password"}
											placeholder="Confirm new password"
											className="rounded-xl h-12 pl-11 pr-11 border-border"
											value={confirmPassword}
											onChange={(e) => { setConfirmPassword(e.target.value); setFormError(""); }}
										/>
										<button
											type="button"
											onClick={() => setShowConfirm(!showConfirm)}
											className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										>
											{showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
										</button>
									</div>
								</div>

								<button
									type="submit"
									disabled={loading}
									className="w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 text-white bg-primary shadow-lg transition-all hover:opacity-90 disabled:opacity-60"
								>
									{loading ? (
										<><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</>
									) : (
										<>Reset Password <ArrowRight className="w-4 h-4" /></>
									)}
								</button>
							</form>
						</motion.div>
					)}

					{/* Step 4: Success */}
					{step === "success" && (
						<motion.div
							key="success"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.4 }}
							className="max-w-md w-full bg-card rounded-2xl p-8 md:p-10 shadow-xl border border-border"
						>
							<div className="text-center space-y-6">
								<div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "hsl(142 76% 95%)" }}>
									<CheckCircle2 className="w-8 h-8 text-green-600" />
								</div>
								<div>
									<h2 className="text-2xl font-black text-foreground tracking-tight">Password Reset!</h2>
									<p className="text-muted-foreground mt-2 text-sm">
										Your password has been reset successfully. You can now login with your new password.
									</p>
								</div>
								<button
									type="button"
									onClick={() => navigate("/login")}
									className="w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 text-white bg-primary shadow-lg transition-all hover:opacity-90"
								>
									Back to Login <ArrowRight className="w-4 h-4" />
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default StudentForgotPassword;
