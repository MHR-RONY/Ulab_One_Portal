import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	GraduationCap, AtSign, Lock, Eye, EyeOff, ArrowRight,
	Loader2, AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useRole } from "@/contexts/RoleContext";
import api, { setAccessToken } from "@/lib/api";

const TeacherLogin = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
	const [formError, setFormError] = useState("");
	const [showForgotNotice, setShowForgotNotice] = useState(false);
	const navigate = useNavigate();
	const { switchRole } = useRole();

	const validate = () => {
		const newErrors: { email?: string; password?: string } = {};
		if (!email) newErrors.email = "Email is required";
		if (!password) newErrors.password = "Password is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError("");
		if (!validate()) return;
		setLoading(true);
		try {
			const { data } = await api.post("/auth/login/teacher", { email, password });
			setAccessToken(data.data.accessToken);
			switchRole("teacher");
			navigate("/teacher");
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } }; code?: string };
			if (err.code === "ERR_NETWORK") {
				setFormError("Cannot connect to server. Please make sure the server is running.");
			} else if (err.response?.data?.message) {
				setFormError(err.response.data.message);
			} else {
				setFormError("Login failed. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	const clearFieldError = (field: "email" | "password") => {
		if (errors[field]) setErrors({ ...errors, [field]: undefined });
		setFormError("");
	};

	return (
		<div className="teacher-theme flex min-h-screen w-full flex-col lg:flex-row bg-background">
			{/* Left Side: Image & Branding */}
			<div className="relative hidden lg:flex lg:w-1/2 xl:w-3/5 overflow-hidden bg-primary">
				<div className="absolute inset-0 z-10 bg-gradient-to-tr from-primary/95 via-primary/70 to-primary/30" />
				<div
					className="absolute inset-0 bg-center bg-cover opacity-30"
					style={{
						backgroundImage: "url('https://res.cloudinary.com/dreby3qi3/image/upload/v1774648057/ULAB-GED-f43d0ebb97796c509db641adde6c12eb_srbxwz.webp')",
					}}
				/>
				{/* Decorative circles */}
				<div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
				<div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-black/10 translate-y-1/2 -translate-x-1/4" />

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="relative z-20 flex flex-col justify-end p-16 w-full"
				>
					<div className="max-w-xl">
						<div className="mb-8 flex items-center gap-3">
							<div className="bg-white/15 backdrop-blur-md p-2.5 rounded-xl border border-white/20 shadow-lg">
								<GraduationCap className="w-7 h-7 text-white" />
							</div>
							<span className="text-white text-xl font-extrabold tracking-tight">ULAB One Portal</span>
						</div>
						<h1 className="text-5xl font-black text-white tracking-tight leading-tight mb-6">
							Empowering educators with a sophisticated digital workspace.
						</h1>
						<p className="text-lg text-white/80 font-medium leading-relaxed mb-8">
							Access your courses, manage student progress, and collaborate with faculty peers in one unified, secure environment designed for the modern academic landscape.
						</p>
						{/* Stats pills */}
						<div className="flex flex-wrap gap-3 mb-8">
							{[
								{ label: "Active Courses", value: "120+" },
								{ label: "Faculty Members", value: "500+" },
								{ label: "Students Enrolled", value: "4,200+" },
							].map((s) => (
								<div key={s.label} className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5">
									<span className="text-white font-black text-sm">{s.value}</span>
									<span className="text-white/70 text-xs">{s.label}</span>
								</div>
							))}
						</div>
						<div className="flex items-center gap-4">
							<div className="flex -space-x-3">
								{["AI", "NK", "RS"].map((initials, i) => (
									<div
										key={i}
										className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-xs font-bold backdrop-blur-sm"
									>
										{initials}
									</div>
								))}
							</div>
							<span className="text-white/90 text-sm font-semibold">
								Joined by 500+ Faculty Members
							</span>
						</div>
					</div>
				</motion.div>
			</div>

			{/* Right Side: Login Form */}
			<div className="flex-1 flex items-center justify-center px-6 md:px-16 py-12 bg-card">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.5 }}
					className="max-w-md w-full"
				>
					{/* Mobile logo */}
					<div className="flex lg:hidden items-center gap-2 mb-8">
						<div className="p-2 rounded-xl bg-primary/10">
							<GraduationCap className="w-5 h-5 text-primary" />
						</div>
						<span className="text-sm font-extrabold text-foreground tracking-tight">ULAB One Portal</span>
					</div>

					<div className="mb-8">
						<div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
							<div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
							<span className="text-xs font-bold text-primary">Faculty Portal</span>
						</div>
						<h2 className="text-3xl font-black text-foreground tracking-tight mb-2">Welcome back</h2>
						<p className="text-muted-foreground">Please enter your credentials to access your dashboard.</p>
					</div>

					<form onSubmit={handleLogin} className="space-y-5">
						{/* Inline error alert */}
						<AnimatePresence>
							{formError && (
								<motion.div
									initial={{ opacity: 0, y: -6 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -6 }}
									transition={{ duration: 0.2 }}
									className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3"
								>
									<AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
									<p className="text-sm text-destructive">{formError}</p>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Email */}
						<div className="space-y-2">
							<label className="text-sm font-semibold text-foreground">Teacher ID / Email</label>
							<div className="relative">
								<AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									type="email"
									placeholder="name@ulab.edu.bd"
									className={`rounded-xl h-14 pl-11 text-base border-border bg-secondary/30 focus-visible:ring-primary/30 ${errors.email ? "border-destructive" : ""}`}
									value={email}
									onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
								/>
							</div>
							{errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
						</div>

						{/* Password */}
						<div className="space-y-2">
							<div className="flex justify-between items-center">
								<label className="text-sm font-semibold text-foreground">Password</label>
								<button
									type="button"
									onClick={() => setShowForgotNotice(true)}
									className="text-xs font-bold text-primary hover:text-primary/80 transition-colors hover:underline"
								>
									Forgot Password?
								</button>
							</div>
							<div className="relative">
								<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									className={`rounded-xl h-14 pl-11 pr-11 text-base border-border bg-secondary/30 focus-visible:ring-primary/30 ${errors.password ? "border-destructive" : ""}`}
									value={password}
									onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								>
									{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
								</button>
							</div>
							{errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
							<AnimatePresence>
								{showForgotNotice && (
									<motion.div
										initial={{ opacity: 0, y: -4 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -4 }}
										transition={{ duration: 0.2 }}
										className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/8 px-4 py-3 mt-1"
									>
										<AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
										<div className="flex-1">
											<p className="text-sm font-semibold text-primary">Password reset not available</p>
											<p className="text-xs text-muted-foreground mt-0.5">Please contact the system administrator to reset your password.</p>
										</div>
										<button onClick={() => setShowForgotNotice(false)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
											<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
										</button>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* Remember */}
						<div className="flex items-center gap-3">
							<Checkbox className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
							<span className="text-sm text-foreground">Remember my login for 30 days</span>
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={loading}
							className="w-full h-14 rounded-xl text-base font-bold flex items-center justify-center gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{loading ? (
								<><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
							) : (
								<>Sign In to Dashboard <ArrowRight className="w-4 h-4" /></>
							)}
						</button>
					</form>

					{/* Footer */}
					<div className="mt-8 border-t border-border pt-6 text-center space-y-4">
						<p className="text-sm text-muted-foreground">
							Your account is created by the admin. Contact the administrator if you don't have access.
						</p>
						<div className="flex justify-center gap-6 text-xs text-muted-foreground">
							<a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
							<a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
							<a href="#" className="hover:text-primary transition-colors">Help Center</a>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default TeacherLogin;
