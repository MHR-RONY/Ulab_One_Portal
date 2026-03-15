import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap, AtSign, Lock, Eye, EyeOff, ArrowRight,
  KeyRound, HelpCircle, Landmark
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useRole } from "@/contexts/RoleContext";

const AdminLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { switchRole } = useRole();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchRole("admin");
    navigate("/admin");
  };

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
              Streamlining University Operations
            </h1>
            <p className="text-lg text-primary-foreground/80 font-medium leading-relaxed mb-8">
              Access the central nervous system of ULAB. Manage academic schedules, faculty resources, and student records with precision and security.
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

        {/* Right Side: Login Form */}
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

            <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">Welcome Back</h2>
            <p className="text-muted-foreground mb-8">Please enter your administrative credentials.</p>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">University Email</label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@ulab.edu.bd"
                    className="rounded-xl h-12 pl-11"
                  />
                </div>
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
                    defaultValue="password123"
                    className="rounded-xl h-12 pl-11 pr-11"
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

              {/* Remember Me */}
              <div className="flex items-center gap-3">
                <Switch />
                <span className="text-sm text-foreground">Remember me</span>
              </div>

              {/* Submit */}
              <Button type="submit" className="w-full h-12 rounded-xl text-base font-bold gap-2 shadow-lg shadow-primary/25">
                Sign In to Dashboard <ArrowRight className="w-4 h-4" />
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

            <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest mt-8 font-semibold">
              © 2024 University of Liberal Arts Bangladesh. All rights reserved.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
