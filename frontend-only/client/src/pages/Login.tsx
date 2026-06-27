import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles, Loader2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import GoogleSignInButton from "../components/GoogleSignInButton";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      toast.success("Welcome back! Redirecting to dashboard…");
      setLocation("/dashboard");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string") {
        toast.error(detail);
      } else if (Array.isArray(detail)) {
        toast.error(detail.map((d: any) => d.msg).join(", "));
      } else {
        toast.error("Invalid email or password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-12">
      <Card className="w-full max-w-md border border-white/60 shadow-2xl bg-white/80 backdrop-blur-md rounded-2xl">
        <CardHeader className="text-center space-y-3 pb-6 pt-8">
          <div className="mx-auto w-14 h-14 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/30">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              Sign in to access your dashboard and history
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8 space-y-5">
          {/* ── Google Sign-In ── */}
          <GoogleSignInButton label="Sign in with Google" redirectTo="/dashboard" />

          {/* ── Divider ── */}
          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ── Email/Password Form ── */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 rounded-xl border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                  autoComplete="current-password"
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
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* ── Footer links ── */}
          <div className="pt-2 text-center text-sm text-gray-500 space-y-2">
            <p>
              Don't have an account?{" "}
              <button
                onClick={() => setLocation("/register")}
                className="text-blue-700 font-semibold hover:text-blue-900 hover:underline transition-colors"
              >
                Create one free
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
