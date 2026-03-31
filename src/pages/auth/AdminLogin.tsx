import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
	GraduationCap, AtSign, Lock, Eye, EyeOff, ArrowRight,
	KeyRound, HelpCircle, Landmark, Loader2, AlertCircle,
	ShieldCheck, User
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRole } from "@/contexts/RoleContext";
import api, { setAccessToken } from "@/lib/api";

const AdminLogin = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [checkingSetup, setCheckingSetup] = useState(true);
	const [isSetup, setIsSetup] = useState(true);
	const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
	const [formError, setFormError] = useState("");
	const [formSuccess, setFormSuccess] = useState("");
	const navigate = useNavigate();
	const { switchRole } = useRole();

	useEffect(() => {
		const checkSetup = async () => {
			try {
				const { data } = await api.get("/auth/admin/check-setup");
				setIsSetup(data.data.isSetup);
			} catch {
				setIsSetup(true);
			} finally {
				setCheckingSetup(false);
			}
		};
		checkSetup();
	}, []);

	const validateLogin = () => {
		const newErrors: { email?: string; password?: string } = {};
		if (!email) newErrors.email = "Email is required";
		if (!password) newErrors.password = "Password is required";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const validateSetup = () => {
		const newErrors: { name?: string; email?: string; password?: string } = {};
		if (!name.trim()) newErrors.name = "Name is required";
		if (!email) newErrors.email = "Email is required";
		if (!password) newErrors.password = "Password is required";
		else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSetup = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError("");
		setFormSuccess("");
		if (!validateSetup()) return;
		setLoading(true);
		try {
			await api.post("/auth/admin/setup", { name, email, password });
			setFormSuccess("Admin account created successfully! Please log in with your new credentials.");
			setTimeout(() => {
				setIsSetup(true);
				setName("");
				setEmail("");
				setPassword("");
				setFormSuccess("");
				setErrors({});
			}, 2000);
		} catch (error: unknown) {
			const err = error as { response?: { data?: { message?: string } }; code?: string };
			if (err.code === "ERR_NETWORK") {
				setFormError("Cannot connect to server. Please make sure the server is running.");
			} else if (err.response?.data?.message) {
				setFormError(err.response.data.message);
			} else {
				setFormError("Setup failed. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError("");
		if (!validateLogin()) return;
		setLoading(true);
		try {
			const { data } = await api.post("/auth/login/admin", { email, password });
			setAccessToken(data.data.accessToken);
			switchRole("admin");
			navigate("/admin");
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

	const clearFieldError = (field: "name" | "email" | "password") => {
		if (errors[field]) setErrors({ ...errors, [field]: undefined });
		setFormError("");
	};

	if (checkingSetup) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-secondary/50">
				<Loader2 className="w-8 h-8 animate-spin text-primary" />
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center min-h-screen bg-secondary/50 p-0 md:p-6">
			<div className="flex flex-col md:flex-row w-full max-w-[1200px] min-h-[800px] bg-card shadow-2xl rounded-none md:rounded-xl overflow-hidden border border-border">
				{/* Left Side: Branding */}
				<div className="hidden md:flex flex-1 relative bg-primary overflow-hidden items-center justify-center p-12">
					<div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_white,_transparent_70%)]" />
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="relative z-10 text-primary-foreground max-w-md"
					>
						<div className="mb-8 bg-primary-foreground/10 backdrop-blur-md w-16 h-16 rounded-xl flex items-center justify-center border border-primary-foreground/20">
							<Landmark className="w-8 h-8" />
						</div>
						<h1 className="text-5xl font-black tracking-tight leading-tight mb-6">
							{!isSetup ? "Initial Admin Setup" : "Streamlining University Operations"}
						</h1>
						<p className="text-lg text-primary-foreground/80 font-medium leading-relaxed mb-8">
							{!isSetup
								? "Welcome to ULAB One Portal. Create your administrator account to get started with managing the university platform."
								: "Access the central nervous system of ULAB. Manage academic schedules, faculty resources, and student records with precision and security."}
						</p>
						<div className="flex items-center gap-4">
							<div className="flex -space-x-3">
								{["AR", "SJ", "TA"].map((initials, i) => (
									<div
										key={i}
										className="w-10 h-10 rounded-full bg-primary-foreground/20 border-2 border-primary flex items-center justify-center text-primary-foreground text-xs font-bold backdrop-blur-sm"
									>
										{initials}
									</div>
								))}
							</div>
							<span className="text-primary-foreground/90 text-sm font-semibold">
								Trusted by 200+ admin staff
							</span>
						</div>
					</motion.div>
				</div>

				{/* Right Side: Setup or Login Form */}
				<div className="flex-1 flex flex-col justify-center px-8 md:px-16 py-12">
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.5 }}
						className="max-w-md mx-auto w-full"
					>
						{/* Logo */}
						<div className="flex items-center gap-3 mb-10">
							<div className="bg-primary/10 p-2 rounded-lg">
								<GraduationCap className="w-6 h-6 text-primary" />
							</div>
							<span className="text-xl font-extrabold text-foreground tracking-tight">ULAB One Portal</span>
						</div>

						{!isSetup ? (
							<>
								{/* ─── First-Time Setup Card ─── */}
								<div className="flex items-center gap-2 mb-2">
									<ShieldCheck className="w-5 h-5 text-primary" />
									<h2 className="text-3xl font-black text-foreground tracking-tight">Create Admin Account</h2>
								</div>
								<p className="text-muted-foreground mb-8">
									No admin account exists yet. Set up your credentials to access the admin dashboard.
								</p>

								<form onSubmit={handleSetup} className="space-y-5">
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
										{formSuccess && (
											<motion.div
												initial={{ opacity: 0, y: -6 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -6 }}
												transition={{ duration: 0.2 }}
												className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900/50 dark:bg-green-900/20"
											>
												<ShieldCheck className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
												<p className="text-sm text-green-600 dark:text-green-400">{formSuccess}</p>
											</motion.div>
										)}
									</AnimatePresence>

									{/* Name */}
									<div className="space-y-2">
										<label className="text-sm font-semibold text-foreground">Full Name</label>
										<div className="relative">
											<User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
											<Input
												type="text"
												placeholder="Enter your full name"
												className={`rounded-xl h-12 pl-11 ${errors.name ? "border-red-500" : ""}`}
												value={name}
												onChange={(e) => { setName(e.target.value); clearFieldError("name"); }}
											/>
										</div>
										{errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
									</div>

									{/* Email */}
									<div className="space-y-2">
										<label className="text-sm font-semibold text-foreground">Admin Email</label>
										<div className="relative">
											<AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
											<Input
												type="email"
												placeholder="admin@ulab.edu.bd"
												className={`rounded-xl h-12 pl-11 ${errors.email ? "border-red-500" : ""}`}
												value={email}
												onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
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
												placeholder="Minimum 6 characters"
												className={`rounded-xl h-12 pl-11 pr-11 ${errors.password ? "border-red-500" : ""}`}
												value={password}
												onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
											>
												{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
											</button>
										</div>
										{errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
									</div>

									{/* Submit */}
									<Button
										type="submit"
										disabled={loading}
										className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/25"
									>
										{loading ? (
											<><Loader2 className="w-4 h-4 animate-spin" /> Creating Account...</>
										) : (
											<><ShieldCheck className="w-4 h-4" /> Create Admin Account</>
										)}
									</Button>
								</form>
							</>
						) : (
							<>
								{/* ─── Login Form ─── */}
								<h2 className="text-3xl font-black text-foreground tracking-tight mb-2">Welcome Back</h2>
								<p className="text-muted-foreground mb-8">Please enter your administrative credentials.</p>

								<form onSubmit={handleLogin} className="space-y-6">
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
												placeholder="admin@ulab.edu.bd"
												className={`rounded-xl h-12 pl-11 ${errors.email ? "border-red-500" : ""}`}
												value={email}
												onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
											/>
										</div>
										{errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
									</div>

									{/* Password */}
									<div className="space-y-2">
										<div className="flex justify-between items-center">
											<label className="text-sm font-semibold text-foreground">Password</label>
											<button type="button" className="text-xs font-bold text-primary hover:underline">
												Forgot password?
											</button>
										</div>
										<div className="relative">
											<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
											<Input
												type={showPassword ? "text" : "password"}
												placeholder="Enter your password"
												className={`rounded-xl h-12 pl-11 pr-11 ${errors.password ? "border-red-500" : ""}`}
												value={password}
												onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
											>
												{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
											</button>
										</div>
										{errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
									</div>

									{/* Remember Me */}
									<div className="flex items-center gap-3">
										<Switch />
										<span className="text-sm text-foreground">Remember me</span>
									</div>

									{/* Submit */}
									<Button
										type="submit"
										disabled={loading}
										className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/25"
									>
										{loading ? (
											<><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
										) : (
											<>Sign In to Dashboard <ArrowRight className="w-4 h-4" /></>
										)}
									</Button>
								</form>

								{/* Help */}
								<div className="mt-8 text-center">
									<p className="text-sm text-muted-foreground">
										Need assistance? <button className="text-primary font-bold hover:underline">Contact IT Support</button>
									</p>
								</div>

								<div className="mt-6 border-t border-border pt-6">
									<div className="grid grid-cols-2 gap-3">
										<Button variant="outline" className="rounded-xl h-11 gap-2 font-bold">
											<KeyRound className="w-4 h-4" /> SSO
										</Button>
										<Button variant="outline" className="rounded-xl h-11 gap-2 font-bold">
											<HelpCircle className="w-4 h-4" /> Guide
										</Button>
									</div>
								</div>
							</>
						)}

						<p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest mt-8 font-semibold">
							&copy; 2024 University of Liberal Arts Bangladesh. All rights reserved.
						</p>
					</motion.div>
				</div>
			</div>
		</div>
	);
};

export default AdminLogin;
