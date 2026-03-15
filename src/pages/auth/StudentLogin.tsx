import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap, AtSign, Lock, Eye, EyeOff, ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useRole } from "@/contexts/RoleContext";

const StudentLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { switchRole } = useRole();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchRole("student");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
      {/* Left Side: Image & Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 text-white overflow-hidden" style={{ backgroundColor: "hsl(220 85% 55%)" }}>
        <div className="absolute inset-0 z-0">
          <img
            alt="University library"
            className="w-full h-full object-cover opacity-40"
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom right, hsl(220 85% 55% / 0.9), hsl(220 85% 55% / 0.6), transparent)" }} />
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
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">University Email</label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="student@ulab.edu.bd"
                  className="rounded-xl h-12 pl-11 border-border"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  defaultValue="password123"
                  className="rounded-xl h-12 pl-11 pr-11 border-border"
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

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch />
                <span className="text-sm text-foreground">Remember me</span>
              </div>
              <button type="button" className="text-xs font-bold hover:underline" style={{ color: "hsl(220 85% 55%)" }}>
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 text-white shadow-lg transition-all hover:opacity-90"
              style={{ backgroundColor: "hsl(220 85% 55%)" }}
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account yet?{" "}
              <Link to="/signup" className="font-bold hover:underline" style={{ color: "hsl(220 85% 55%)" }}>
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
