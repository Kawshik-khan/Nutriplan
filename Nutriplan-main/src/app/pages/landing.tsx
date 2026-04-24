import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { 
  Sparkles, 
  ArrowRight, 
  Activity, 
  Calendar, 
  Shield, 
  Utensils, 
  Zap,
  Globe,
  Star,
  Check
} from "lucide-react";
import { motion } from "motion/react";

export function Landing() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 selection:bg-lime-100 selection:text-lime-900 overflow-x-hidden font-sans">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-zinc-100 px-8 py-5">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-lime-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-zinc-900">Nutriplan</span>
          </div>
          <div className="hidden md:flex items-center gap-10">
            <a href="#features" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest">Features</a>
            <a href="#testimonials" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest">Testimonials</a>
            <a href="#pricing" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors uppercase tracking-widest">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="font-bold text-sm rounded-xl uppercase tracking-widest">Login</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-zinc-900 text-white hover:bg-lime-500 font-bold text-sm px-8 py-6 rounded-xl transition-all shadow-xl hover:shadow-lime-200 uppercase tracking-widest">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-screen w-full flex items-center bg-white overflow-hidden">
        {/* Subtle Background Effects */}
        <div className="absolute inset-0 lime-grid opacity-10 pointer-events-none" />
        
        {/* Full-Screen Hero Image - Clean Version */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-clean.png" 
            className="w-full h-full object-cover object-right" 
            alt="Hero Background" 
          />
          {/* Responsive overlay to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/60 to-transparent md:via-white/20 md:to-transparent" />
        </div>

        {/* Content Layer - Full Width */}
        <div className="relative z-10 w-full px-8 sm:px-16 md:px-24">
          <div className="max-w-3xl space-y-8 md:space-y-12">
            {/* Heading Section */}
            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-7xl md:text-9xl font-extrabold tracking-tighter text-zinc-900 leading-[0.85]"
              >
                Nutrition <br />
                for a <span className="text-lime-600">Better You</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl md:text-2xl text-zinc-500 font-medium max-w-xl leading-relaxed"
              >
                Personalized nutrition plans, expert guidance, and healthy habits for a happier, stronger you.
              </motion.p>
            </div>

            {/* Buttons Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-6"
            >
              <Link to="/register">
                <Button className="h-16 px-12 rounded-2xl bg-lime-600 text-white font-bold text-xl hover:bg-lime-500 transition-all shadow-2xl hover:shadow-lime-300">
                  Get Your Plan
                </Button>
              </Link>
              <Button variant="outline" className="h-16 px-12 rounded-2xl border-2 border-zinc-200 bg-white/50 backdrop-blur-md text-zinc-700 font-bold text-xl hover:bg-white transition-all flex items-center gap-3">
                <Zap className="w-6 h-6 text-lime-600 fill-lime-600" />
                Watch Video
              </Button>
            </motion.div>

            {/* Features Row */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-12 pt-12 border-t border-zinc-100"
            >
              {[
                { icon: Utensils, label: "Personalized Plans" },
                { icon: Shield, label: "Expert Guidance" },
                { icon: Activity, label: "Track Your Progress" },
                { icon: Check, label: "Healthy Lifestyle" }
              ].map((f, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="w-12 h-12 bg-lime-50 rounded-2xl flex items-center justify-center">
                    <f.icon className="w-6 h-6 text-lime-600" />
                  </div>
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    {f.label}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* Rating Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-8"
            >
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-zinc-100 overflow-hidden shadow-md">
                    <img src={`https://i.pravatar.cc/100?img=${i+30}`} alt="" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm font-bold text-zinc-900 tracking-tight">4.9/5 from 3,000+ happy users</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* App Preview */}
      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="premium-shadow rounded-[32px] overflow-hidden border border-zinc-100 bg-zinc-50 p-4"
          >
            <div className="rounded-[24px] overflow-hidden shadow-inner border border-zinc-200">
              <img 
                src="https://images.unsplash.com/photo-1651129520737-7137123b7611?w=1200&q=80" 
                className="w-full h-auto" 
                alt="Nutriplan Dashboard Preview" 
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 bg-zinc-50 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-lime-100 opacity-20 blur-[100px] -z-10" />
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">Engineered for Results</h2>
            <p className="text-zinc-500 font-medium max-w-xl mx-auto">Everything you need to transform your relationship with food and achieve your physical peak.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Activity, title: "Precision Tracking", desc: "Log food with AI-powered search and real-time macro analysis.", color: "bg-blue-500" },
              { icon: Calendar, title: "Smart Planner", desc: "Automated weekly grids that adapt to your schedule and cravings.", color: "bg-lime-500" },
              { icon: Globe, title: "Global Database", desc: "Access 1M+ verified food items and restaurant menus globally.", color: "bg-indigo-500" }
            ].map((f, i) => (
              <Card key={i} className="premium-card group hover:bg-white transition-all bg-white text-zinc-900 flex flex-col gap-6 rounded-xl border border-zinc-100">
                <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center shadow-lg mb-6 transition-transform group-hover:scale-110`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3">{f.title}</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-[40px] bg-zinc-900 p-12 md:p-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-lime-600/40 to-transparent pointer-events-none" />
            <div className="relative z-10 text-center space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">Ready to rewrite <br/> your health story?</h2>
              <p className="text-zinc-400 font-medium max-w-lg mx-auto">Join the nutrition revolution today. Start your 14-day free trial, no credit card required.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button size="lg" className="h-14 px-10 rounded-2xl bg-white text-zinc-900 font-bold hover:bg-lime-50 transition-all shadow-xl">
                    Create Free Account
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest">
                  <Check className="w-4 h-4 text-lime-400" />
                  Free Forever for Basic
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-lime-400" />
              </div>
              <span className="text-lg font-bold text-zinc-900">Nutriplan</span>
            </div>
            <p className="text-zinc-400 text-sm font-medium max-w-xs leading-relaxed">
              Achieve your health goals with the most advanced AI nutrition architect ever built.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900">Product</h4>
            <ul className="space-y-2 text-sm font-medium text-zinc-500">
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Community</a></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-900">Company</h4>
            <ul className="space-y-2 text-sm font-medium text-zinc-500">
              <li><a href="#" className="hover:text-zinc-900 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-zinc-900 transition-colors">Terms</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">© 2026 Nutriplan AI. All rights reserved.</p>
          <div className="flex gap-6">
            <Globe className="w-5 h-5 text-zinc-300" />
            <Activity className="w-5 h-5 text-zinc-300" />
            <Zap className="w-5 h-5 text-zinc-300" />
          </div>
        </div>
      </footer>
    </div>
  );
}
