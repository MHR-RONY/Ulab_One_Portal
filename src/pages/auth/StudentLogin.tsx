import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	GraduationCap, AtSign, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useRole } from "@/contexts/RoleContext";
import api, { setAccessToken } from "@/lib/api";

const StudentLogin = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
	const [formError, setFormError] = useState("");
	const navigate = useNavigate();
	const { switchRole } = useRole();

	const validate = () => {
		const newErrors: { email?: string; password?: string } = {};
		if (!email) newErrors.email = "Email is required";
		else if (!email.endsWith("@ulab.edu.bd")) newErrors.email = "Must be a valid ULAB email";
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
			const { data } = await api.post("/auth/login/student", { email, password });
			setAccessToken(data.data.accessToken);
			switchRole("student");
			navigate("/");
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
						Unlock Your Potential<br />With One Portal
					</h1>
					<p className="text-lg text-white/80 font-medium leading-relaxed max-w-lg">
						Your central hub for academic resources, administrative services, and campus life at the University of Liberal Arts Bangladesh.
					</p>
				</motion.div>

				<div className="relative z-10 border-t border-white/20 pt-6">
					<p className="text-white/60 text-sm">© 2024 University of Liberal Arts Bangladesh</p>
				</div>
			</div>

			{/* Right Side: Login Form */}
			<div className="flex-1 flex items-center justify-center px-6 md:px-16 py-12 bg-secondary/30">
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2, duration: 0.5 }}
					className="max-w-md w-full bg-card rounded-2xl p-8 md:p-10 shadow-xl border border-border"
				>
					<h2 className="text-3xl font-black text-foreground tracking-tight mb-2">Student Login</h2>
					<p className="text-muted-foreground mb-8">Welcome back! Please enter your details.</p>

					<form onSubmit={handleLogin} className="space-y-6">
						{/* Inline error alert */}
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
						{/* Email */}
						<div className="space-y-2">
							<label className="text-sm font-semibold text-foreground">University Email</label>
							<div className="relative">
								<AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									type="email"
									placeholder="student@ulab.edu.bd"
									className={`rounded-xl h-12 pl-11 border-border ${errors.email ? "border-red-500" : ""}`}
									value={email}
									onChange={(e) => { setEmail(e.target.value); setFormError(""); if (errors.email) setErrors({ ...errors, email: undefined }); }}
								/>
							</div>
							{errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
						</div>

						{/* Password */}
						<div className="space-y-2">
							<label className="text-sm font-semibold text-foreground">Password</label>
							<div className="relative">
								<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
								<Input
									type={showPassword ? "text" : "password"}
									placeholder="Enter your password"
									className={`rounded-xl h-12 pl-11 pr-11 border-border ${errors.password ? "border-red-500" : ""}`}
									value={password}
									onChange={(e) => { setPassword(e.target.value); setFormError(""); if (errors.password) setErrors({ ...errors, password: undefined }); }}
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

						{/* Remember + Forgot */}
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<Switch />
								<span className="text-sm text-foreground">Remember me</span>
							</div>
							<Link to="/forgot-password" className="text-xs font-bold hover:underline text-primary">
								Forgot password?
							</Link>
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={loading}
							className="w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 text-primary-foreground bg-primary shadow-lg transition-all hover:opacity-90 disabled:opacity-60"
						>
							{loading ? (
								<><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
							) : (
								<>Sign In <ArrowRight className="w-4 h-4" /></>
							)}
						</button>
					</form>

					{/* Footer */}
					<div className="mt-8 border-t border-border pt-6 text-center">
						<p className="text-sm text-muted-foreground">
							Don't have an account yet?{" "}
							<Link to="/signup" className="font-bold text-primary hover:underline">
								Create an account
							</Link>
						</p>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default StudentLogin;
