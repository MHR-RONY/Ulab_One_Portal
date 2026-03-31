import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	GraduationCap, User, BadgeCheck, AtSign, Lock, Eye, EyeOff,
	ArrowRight, Shield, Cloud, Loader2, ArrowLeft, Mail
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRole } from "@/contexts/RoleContext";
import { useToast } from "@/hooks/use-toast";
import api, { setAccessToken } from "@/lib/api";

const departments = [
	"Computer Science & Engineering",
	"Business Administration",
	"English & Humanities",
	"Electronic & Electrical Engineering",
	"Media Studies & Journalism",
	"Law",
];

type Step = "form" | "otp";

const StudentSignup = () => {
	const [step, setStep] = useState<Step>("form");
	const [showPassword, setShowPassword] = useState(false);
	const [agreed, setAgreed] = useState(false);
	const [loading, setLoading] = useState(false);
	const [otpValue, setOtpValue] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [formData, setFormData] = useState({
		name: "",
		studentId: "",
		email: "",
		department: "",
		password: "",
	});
	const navigate = useNavigate();
	const { switchRole } = useRole();
	const { toast } = useToast();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
		if (errors[name]) {
			setErrors({ ...errors, [name]: "" });
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "Full name is required.";
		} else if (formData.name.trim().length < 3) {
			newErrors.name = "Name must be at least 3 characters.";
		}

		if (!formData.studentId.trim()) {
			newErrors.studentId = "Student ID is required.";
		}

		if (!formData.email.trim()) {
			newErrors.email = "University email is required.";
		} else if (!formData.email.trim().endsWith("@ulab.edu.bd")) {
			newErrors.email = "Email must end with @ulab.edu.bd";
		}

		if (!formData.department) {
			newErrors.department = "Please select your department.";
		}

		if (!formData.password) {
			newErrors.password = "Password is required.";
		} else if (formData.password.length < 6) {
			newErrors.password = "Password must be at least 6 characters.";
		}

		if (!agreed) {
			newErrors.agreed = "You must agree to the Terms and Privacy Policy.";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSendOtp = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		setLoading(true);
		try {
			await api.post("/auth/register/student/send-otp", formData);
			setStep("otp");
			toast({ title: "OTP Sent", description: `Verification code sent to ${formData.email}` });
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } }; code?: string };
			let message = "Something went wrong. Please try again.";

			if (err.code === "ERR_NETWORK") {
				message = "Cannot connect to server. Please make sure the server is running.";
			} else if (err.response?.data?.message) {
				message = err.response.data.message;
			}

			toast({ title: "Signup Failed", description: message, variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	const handleVerifyOtp = async (code?: string) => {
		const otp = code || otpValue;
		if (otp.length !== 6) {
			setErrors({ otp: "Please enter the 6-digit code." });
			return;
		}

		setLoading(true);
		try {
			const { data } = await api.post("/auth/register/student/verify-otp", {
				email: formData.email,
				otp,
			});
			setAccessToken(data.data.accessToken);
			switchRole("student");
			toast({ title: "Account created successfully!", description: "Welcome to ULAB One Portal." });
			navigate("/");
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } }; code?: string };
			let message = "Verification failed. Please try again.";

			if (err.code === "ERR_NETWORK") {
				message = "Cannot connect to server. Please make sure the server is running.";
			} else if (err.response?.data?.message) {
				message = err.response.data.message;
			}

			toast({ title: "Verification Failed", description: message, variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	const handleResendOtp = async () => {
		setLoading(true);
		try {
			await api.post("/auth/register/student/send-otp", formData);
			setOtpValue("");
			toast({ title: "OTP Resent", description: `New code sent to ${formData.email}` });
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } }; code?: string };
			let message = "Could not resend OTP. Please try again.";
			if (err.response?.data?.message) {
				message = err.response.data.message;
			}
			toast({ title: "Resend Failed", description: message, variant: "destructive" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="student-theme min-h-screen flex flex-col bg-secondary/30">
			{/* Top Nav */}
			<header className="w-full bg-card border-b border-border">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
					<div className="flex items-center gap-2">
						<img src="/ulaboneportallogo.png" alt="ULAB One Portal" className="h-8" />
					</div>
					<div className="flex items-center gap-6">
						<a href="#" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Help Center</a>
						<a href="#" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Student Guidelines</a>
					</div>
				</div>
			</header>

			{/* Main */}
			<div className="flex-1 flex items-center justify-center px-4 py-12">
				<AnimatePresence mode="wait">
					{step === "form" ? (
						<motion.div
							key="form"
							initial={{ opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -15 }}
							transition={{ duration: 0.3 }}
							className="w-full max-w-lg"
						>
							<div className="bg-card rounded-2xl p-8 md:p-10 shadow-xl border border-border">
								<div className="text-center mb-8">
									<h2 className="text-3xl font-black text-foreground tracking-tight">Join ULAB One</h2>
									<p className="text-muted-foreground mt-2">Create your premium student account</p>
								</div>

								<form onSubmit={handleSendOtp} className="space-y-5">
									{/* Full Name */}
									<div className="space-y-2">
										<label className="text-sm font-semibold text-foreground">Full Name</label>
										<div className="relative">
											<User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
											<Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter your full name" className={`rounded-xl h-12 pl-11 border-border ${errors.name ? "border-red-500" : ""}`} />
										</div>
										{errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
									</div>

									{/* Student ID + Email */}
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<label className="text-sm font-semibold text-foreground">Student ID</label>
											<div className="relative">
												<BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
												<Input name="studentId" value={formData.studentId} onChange={handleChange} placeholder="XX-XXXXX-X" className={`rounded-xl h-12 pl-11 border-border ${errors.studentId ? "border-red-500" : ""}`} />
											</div>
											{errors.studentId && <p className="text-xs text-red-500 mt-1">{errors.studentId}</p>}
										</div>
										<div className="space-y-2">
											<label className="text-sm font-semibold text-foreground">University Email</label>
											<div className="relative">
												<AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
												<Input name="email" value={formData.email} onChange={handleChange} placeholder="name@ulab.edu.bd" className={`rounded-xl h-12 pl-11 border-border ${errors.email ? "border-red-500" : ""}`} />
											</div>
											{errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
										</div>
									</div>

									{/* Department */}
									<div className="space-y-2">
										<label className="text-sm font-semibold text-foreground">Department</label>
										<div className="relative">
											<GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
											<select name="department" value={formData.department} onChange={handleChange} className={`w-full rounded-xl border border-border bg-background h-12 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary appearance-none ${errors.department ? "border-red-500" : ""}`}>
												<option value="" disabled>Select your department</option>
												{departments.map((dept) => (
													<option key={dept} value={dept}>{dept}</option>
												))}
											</select>
										</div>
										{errors.department && <p className="text-xs text-red-500 mt-1">{errors.department}</p>}
									</div>

									{/* Password */}
									<div className="space-y-2">
										<label className="text-sm font-semibold text-foreground">Password</label>
										<div className="relative">
											<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
											<Input
												name="password"
												value={formData.password}
												onChange={handleChange}
												type={showPassword ? "text" : "password"}
												placeholder="Create a secure password"
												className={`rounded-xl h-12 pl-11 pr-11 border-border ${errors.password ? "border-red-500" : ""}`}
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
											>
												{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
											</button>
										</div>
										{errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
									</div>

									{/* Terms */}
									<div>
										<div className="flex items-center gap-3">
											<input
												type="checkbox"
												checked={agreed}
												onChange={(e) => {
													setAgreed(e.target.checked);
													if (errors.agreed) setErrors({ ...errors, agreed: "" });
												}}
												className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
											/>
											<span className="text-sm text-muted-foreground">
												I agree to the{" "}
												<a href="#" className="font-bold hover:underline" style={{ color: "hsl(220 85% 55%)" }}>Terms of Service</a>
												{" "}and{" "}
												<a href="#" className="font-bold hover:underline" style={{ color: "hsl(220 85% 55%)" }}>Privacy Policy</a>.
											</span>
										</div>
										{errors.agreed && <p className="text-xs text-red-500 mt-1">{errors.agreed}</p>}
									</div>

									{/* Submit */}
									<button
										type="submit"
										disabled={loading}
										className="w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-60"
										style={{ backgroundColor: "hsl(220 85% 55%)" }}
									>
										{loading ? (
											<><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</>
										) : (
											<>Create Account <ArrowRight className="w-4 h-4" /></>
										)}
									</button>
								</form>

								{/* Footer */}
								<div className="mt-6 border-t border-border pt-6 text-center">
									<p className="text-sm text-muted-foreground">
										Already have an account?{" "}
										<Link to="/login" className="font-bold hover:underline" style={{ color: "hsl(220 85% 55%)" }}>
											Sign In
										</Link>
									</p>
								</div>

								{/* Trust badges */}
								<div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
									<span className="flex items-center gap-1.5">
										<Shield className="w-3.5 h-3.5" /> SECURE ACCESS
									</span>
									<span className="flex items-center gap-1.5">
										<Cloud className="w-3.5 h-3.5" /> INSTANT SYNC
									</span>
								</div>
							</div>

							{/* Bottom text */}
							<div className="text-center mt-8 space-y-3">
								<p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
									University of Liberal Arts Bangladesh
								</p>
							</div>
						</motion.div>
					) : (
						<motion.div
							key="otp"
							initial={{ opacity: 0, y: 15 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -15 }}
							transition={{ duration: 0.3 }}
							className="w-full max-w-md"
						>
							<div className="bg-card rounded-2xl p-8 md:p-10 shadow-xl border border-border">
								<div className="text-center mb-8">
									<div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "hsl(220 85% 95%)" }}>
										<Mail className="w-7 h-7" style={{ color: "hsl(220 85% 55%)" }} />
									</div>
									<h2 className="text-2xl font-black text-foreground tracking-tight">Verify Your Email</h2>
									<p className="text-muted-foreground mt-2 text-sm">
										We sent a 6-digit code to<br />
										<span className="font-semibold text-foreground">{formData.email}</span>
									</p>
								</div>

								<div className="space-y-6">
									{/* OTP Input */}
									<div className="flex flex-col items-center gap-2">
										<InputOTP
											maxLength={6}
											value={otpValue}
											onChange={(val) => {
												setOtpValue(val);
												if (errors.otp) setErrors({ ...errors, otp: "" });
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
										{errors.otp && <p className="text-xs text-red-500 mt-1">{errors.otp}</p>}
									</div>

									{/* Verify button */}
									<button
										type="button"
										onClick={handleVerifyOtp}
										disabled={loading || otpValue.length !== 6}
										className="w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-60"
										style={{ backgroundColor: "hsl(220 85% 55%)" }}
									>
										{loading ? (
											<><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
										) : (
											<>Verify & Create Account <ArrowRight className="w-4 h-4" /></>
										)}
									</button>

									{/* Resend + Back */}
									<div className="flex items-center justify-between text-sm">
										<button
											type="button"
											onClick={() => { setStep("form"); setOtpValue(""); }}
											className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
										>
											<ArrowLeft className="w-3.5 h-3.5" /> Back
										</button>
										<button
											type="button"
											onClick={handleResendOtp}
											disabled={loading}
											className="font-semibold hover:underline disabled:opacity-50"
											style={{ color: "hsl(220 85% 55%)" }}
										>
											Resend Code
										</button>
									</div>

									<p className="text-center text-xs text-muted-foreground">
										Code expires in 5 minutes
									</p>
								</div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default StudentSignup;
