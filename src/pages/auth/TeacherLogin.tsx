import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap, AtSign, Lock, Eye, EyeOff, ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRole } from "@/contexts/RoleContext";

const TeacherLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { switchRole } = useRole();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switchRole("teacher");
    navigate("/teacher");
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-background">
      {/* Left Side: Image & Branding */}
      <div className="relative hidden lg:flex lg:w-1/2 xl:w-3/5 overflow-hidden" style={{ backgroundColor: "hsl(220 85% 55%)" }}>
        <div className="absolute inset-0 z-10 bg-gradient-to-tr from-[hsl(220_85%_45%/0.9)] to-[hsl(220_85%_55%/0.2)]" />
        <div
          className="absolute inset-0 bg-center bg-cover opacity-40"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&q=80')",
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-20 flex flex-col justify-end p-16 w-full"
        >
          <div className="max-w-xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="bg-white/15 backdrop-blur-md p-2.5 rounded-xl border border-white/20">
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
          <h2 className="text-3xl font-black text-foreground tracking-tight mb-2">Faculty Login</h2>
          <p className="text-muted-foreground mb-10">Welcome back! Please enter your credentials to access your dashboard.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Teacher ID / Email</label>
              <div className="relative">
                <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="name@ulab.edu.bd"
                  className="rounded-xl h-14 pl-11 text-base border-border"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <button type="button" className="text-xs font-bold hover:underline" style={{ color: "hsl(220 85% 55%)" }}>
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  defaultValue="password123"
                  className="rounded-xl h-14 pl-11 pr-11 text-base border-border"
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

            {/* Remember */}
            <div className="flex items-center gap-3">
              <Checkbox />
              <span className="text-sm text-foreground">Remember my login for 30 days</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-14 rounded-xl text-base font-bold flex items-center justify-center gap-2 text-white shadow-lg transition-all hover:opacity-90"
              style={{ backgroundColor: "hsl(220 85% 55%)" }}
            >
              Sign In to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 border-t border-border pt-6 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              New faculty member? <button className="font-bold hover:underline" style={{ color: "hsl(220 85% 55%)" }}>Contact IT Department</button>
            </p>
            <div className="flex justify-center gap-6 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground">Privacy Policy</a>
              <a href="#" className="hover:text-foreground">Terms of Service</a>
              <a href="#" className="hover:text-foreground">Help Center</a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherLogin;
