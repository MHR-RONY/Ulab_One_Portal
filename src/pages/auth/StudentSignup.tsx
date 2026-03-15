import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap, User, BadgeCheck, AtSign, Lock, Eye, EyeOff,
  ArrowRight, Shield, Cloud
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";

const departments = [
  "Computer Science & Engineering",
  "Business Administration",
  "English & Humanities",
  "Electronic & Electrical Engineering",
  "Media Studies & Journalism",
  "Law",
];

const StudentSignup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const { switchRole } = useRole();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    switchRole("student");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      {/* Top Nav */}
      <header className="w-full bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-primary">
              <GraduationCap className="w-7 h-7" />
            </div>
            <span className="text-lg font-extrabold text-foreground tracking-tight">ULAB One</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Help Center</a>
            <a href="#" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Student Guidelines</a>
          </div>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          <div className="bg-card rounded-2xl p-8 md:p-10 shadow-xl border border-border">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-foreground tracking-tight">Join ULAB One</h2>
              <p className="text-muted-foreground mt-2">Create your premium student account</p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Enter your full name" className="rounded-xl h-12 pl-11 border-border" />
                </div>
              </div>

              {/* Student ID + Email */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Student ID</label>
                  <div className="relative">
                    <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="XX-XXXXX-X" className="rounded-xl h-12 pl-11 border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">University Email</label>
                  <div className="relative">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="name@ulab.edu.bd" className="rounded-xl h-12 pl-11 border-border" />
                  </div>
                </div>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Department</label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select className="w-full rounded-xl border border-border bg-background h-12 pl-11 pr-4 text-sm focus:ring-2 focus:ring-primary appearance-none">
                    <option value="" disabled selected>Select your department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a secure password"
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

              {/* Terms */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">
                  I agree to the{" "}
                  <a href="#" className="font-bold hover:underline" style={{ color: "hsl(220 85% 55%)" }}>Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="font-bold hover:underline" style={{ color: "hsl(220 85% 55%)" }}>Privacy Policy</a>.
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full h-12 rounded-xl text-base font-bold flex items-center justify-center gap-2 text-white shadow-lg transition-all hover:opacity-90"
                style={{ backgroundColor: "hsl(220 85% 55%)" }}
              >
                Create Account <ArrowRight className="w-4 h-4" />
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
      </div>
    </div>
  );
};

export default StudentSignup;
