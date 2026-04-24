import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Sparkles, ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useRegister } from "../hooks/use-auth";
import { Checkbox } from "../components/ui/checkbox";

export function Register() {
  const navigate = useNavigate();
  const registerMutation = useRegister();
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!agree) {
      setError("You must agree to the terms");
      return;
    }
    
    registerMutation.mutate(
      { 
        fullName: formData.fullName, 
        email: formData.email, 
        password: formData.password 
      },
      {
        onSuccess: () => navigate("/dashboard"),
        onError: (err) => setError(err instanceof Error ? err.message : "Unable to create account")
      }
    );
  };

  const calculateStrength = (pass: string) => {
    let s = 0;
    if (pass.length > 6) s++;
    if (pass.length > 10) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    return s;
  };

  const strength = calculateStrength(formData.password);

  return (
    <div className="min-h-screen flex bg-white">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/30 to-teal-900/30" />
        <img 
          src="https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200&q=80" 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" 
          alt="" 
        />
        <div className="relative z-10 p-20 flex flex-col justify-between h-full text-white">
          <Link to="/" className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-emerald-400 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm font-bold uppercase tracking-widest text-zinc-400">Back to Home</span>
          </Link>
          <div className="max-w-md space-y-8">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10">
              <Sparkles className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-bold tracking-tight">Start your <br/><span className="text-emerald-400">transformation.</span></h1>
              <p className="text-zinc-400 font-medium text-lg leading-relaxed">
                Join thousands of users who have optimized their nutrition and reached their physical peak with Nutriplan.
              </p>
            </div>
            <div className="space-y-4">
              {["Custom AI Meal Plans", "Real-time Macro Tracking", "Smart Grocery Lists"].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-sm font-bold text-zinc-300 uppercase tracking-widest">{f}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-bold text-zinc-500 uppercase tracking-widest">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Join 10k+ Members</span>
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-20 overflow-y-auto custom-scrollbar">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm space-y-10"
        >
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-zinc-900 tracking-tight">Create <span className="text-gradient">Account</span></h2>
            <p className="text-zinc-500 font-medium">Join the next generation of nutrition.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Full Name</label>
                <Input 
                  placeholder="John Doe" 
                  className="h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:ring-emerald-500/20"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="name@company.com" 
                  className="h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:ring-emerald-500/20"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:ring-emerald-500/20"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                {formData.password && (
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? "bg-emerald-500" : "bg-zinc-100"}`} />
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Confirm Password</label>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:ring-emerald-500/20"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="agree" 
                checked={agree} 
                onCheckedChange={(c) => setAgree(c === true)}
                className="rounded-md border-zinc-200 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <label htmlFor="agree" className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest cursor-pointer select-none">
                I agree to the <a href="#" className="text-emerald-600">Terms of Service</a>
              </label>
            </div>

            {error && <p className="text-xs font-bold text-red-500 uppercase tracking-widest">{error}</p>}

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-zinc-900 text-white font-bold hover:bg-emerald-600 transition-all shadow-xl hover:shadow-emerald-100"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Already have an account?{" "}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-700">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
