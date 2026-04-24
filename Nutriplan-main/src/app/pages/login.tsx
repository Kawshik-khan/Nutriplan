import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Sparkles, ShieldCheck, ArrowLeft, Check } from "lucide-react";
import { motion } from "motion/react";
import { useLogin } from "../hooks/use-auth";
import { Checkbox } from "../components/ui/checkbox";

export function Login() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => navigate("/dashboard"),
        onError: (err) => setError(err instanceof Error ? err.message : "Invalid credentials")
      }
    );
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 to-teal-900/30" />
        <img 
          src="https://images.unsplash.com/photo-1543353071-873f17a7a088?w=1200&q=80" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" 
          alt="" 
        />
        <div className="relative z-10 p-20 flex flex-col justify-between h-full text-white">
          <Link to="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-emerald-400 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">Back to Home</span>
          </Link>
          <div className="max-w-md space-y-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-5xl font-bold tracking-tight">Your health journey <br/><span className="text-emerald-400">continues here.</span></h1>
            <p className="text-zinc-400 font-medium text-lg leading-relaxed">
              Log in to access your personalized AI meal plans and track your progress toward your peak physical condition.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-zinc-500 uppercase tracking-widest">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Encrypted & Secure</span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm space-y-10"
        >
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-zinc-900 tracking-tight">Welcome <span className="text-gradient">Back</span></h2>
            <p className="text-zinc-500 font-medium">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:ring-emerald-500/20"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Password</label>
                  <a href="#" className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700">Forgot?</a>
                </div>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:ring-emerald-500/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe} 
                onCheckedChange={(c) => setRememberMe(c === true)}
                className="rounded-md border-zinc-200 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <label htmlFor="remember" className="text-xs font-bold text-zinc-500 uppercase tracking-widest cursor-pointer select-none">Remember me</label>
            </div>

            {error && <p className="text-xs font-bold text-red-500 uppercase tracking-widest">{error}</p>}

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-zinc-900 text-white font-bold hover:bg-emerald-600 transition-all shadow-xl hover:shadow-emerald-100"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Authenticating..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-emerald-600 hover:text-emerald-700">Sign Up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
