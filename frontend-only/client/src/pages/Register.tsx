import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Loader2, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import GoogleSignInButton from "../components/GoogleSignInButton";

/** Simple password strength checker — returns 0..4 */
function calcStrength(pwd: string): number {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

const STRENGTH_LABELS = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
const STRENGTH_COLORS = [
  "bg-red-500",
  "bg-orange-400",
  "bg-yellow-400",
  "bg-green-500",
  "bg-emerald-500",
];
const STRENGTH_TEXT_COLORS = [
  "text-red-600",
  "text-orange-500",
  "text-yellow-600",
  "text-green-600",
  "text-emerald-600",
];

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const strength = useMemo(() => calcStrength(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (username.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (!/[0-9]/.test(password)) {
      toast.error("Password must contain at least one number");
      return;
    }
    if (!/[a-zA-Z]/.test(password)) {
      toast.error("Password must contain at least one letter");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await register(username.trim(), email.trim(), password);
      toast.success("Account created! Redirecting to dashboard…");
      setLocation("/dashboard");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        toast.error(detail);
      } else if (Array.isArray(detail)) {
        toast.error(detail.map((d: any) => d.msg).join(", "));
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-12">
      <Card className="w-full max-w-md border border-white/60 shadow-2xl bg-white/80 backdrop-blur-md rounded-2xl">
        <CardHeader className="text-center space-y-3 pb-6 pt-8">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              Join VerifyAI and start detecting fake news
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8 space-y-5">
          {/* ── Google Sign-Up ── */}
          <GoogleSignInButton label="Sign up with Google" redirectTo="/dashboard" />

          {/* ── Divider ── */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ── Registration Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Username */}
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="username"
                  type="text"
                  placeholder="yourname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                  autoComplete="username"
                  minLength={3}
                  maxLength={50}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password + strength meter */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters with a number"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i < strength ? STRENGTH_COLORS[strength] : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${STRENGTH_TEXT_COLORS[strength]}`}>
                    {STRENGTH_LABELS[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-10 pr-10 h-11 rounded-xl bg-gray-50 focus:bg-white transition-colors ${
                    passwordsMismatch
                      ? "border-red-400 focus:border-red-500"
                      : passwordsMatch
                      ? "border-green-400 focus:border-green-500"
                      : "border-gray-200 focus:border-blue-500"
                  }`}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="text-xs text-red-600 font-medium">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-600 font-medium">✓ Passwords match</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white text-base font-semibold rounded-xl shadow-md shadow-blue-900/20 transition-all duration-200 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account…
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* ── Footer links ── */}
          <div className="pt-2 text-center text-sm text-gray-500 space-y-2">
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setLocation("/login")}
                className="text-blue-700 font-semibold hover:text-blue-900 hover:underline transition-colors"
              >
                Sign In
              </button>
            </p>
            <p>
              <button
                onClick={() => setLocation("/")}
                className="text-gray-400 hover:text-gray-600 hover:underline transition-colors"
              >
                ← Back to Home
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
