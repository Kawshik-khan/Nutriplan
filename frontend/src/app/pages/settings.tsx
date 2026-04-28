import { useEffect, useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { 
  User, 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  LogOut,
  Camera,
  Mail,
  Target,
  Zap,
  Check
} from "lucide-react";
import { clearSession, getMyProfile, updateMyProfile } from "../lib/api";

export default function Settings() {
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    age: "",
    heightCm: "",
    weightKg: "",
    goal: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    getMyProfile()
      .then((user) => {
        setProfile({
          fullName: user.fullName,
          email: user.email,
          age: user.age?.toString() ?? "",
          heightCm: user.heightCm?.toString() ?? "",
          weightKg: user.weightKg?.toString() ?? "",
          goal: user.goal ?? "",
        });
      })
      .catch((err) => setErrorMessage(err instanceof Error ? err.message : "Failed to load profile"))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setErrorMessage("");
      setStatusMessage("");

      await updateMyProfile({
        fullName: profile.fullName,
        age: profile.age ? Number(profile.age) : null,
        heightCm: profile.heightCm ? Number(profile.heightCm) : null,
        weightKg: profile.weightKg ? Number(profile.weightKg) : null,
        goal: profile.goal || null,
      });

      setStatusMessage("Profile updated successfully.");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Unable to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    window.location.href = "/login";
  };

  const initials = profile.fullName.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-[32px] flex items-center justify-center text-3xl font-bold text-white shadow-xl">
              {initials || <User className="w-10 h-10" />}
            </div>
            <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-zinc-900 text-white rounded-2xl flex items-center justify-center border-4 border-zinc-50 hover:bg-emerald-600 transition-colors shadow-lg">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{profile.fullName || "Your Name"}</h1>
            <p className="text-zinc-500 font-medium flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {profile.email}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="rounded-2xl bg-zinc-900 text-white font-bold px-8 hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-100"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 text-emerald-700 text-sm font-bold animate-in fade-in slide-in-from-top-4">
          <Check className="w-5 h-5" />
          {statusMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Personal Data */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="premium-card border-zinc-200">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Full Name</Label>
                <Input 
                  value={profile.fullName} 
                  onChange={e => setProfile({...profile, fullName: e.target.value})}
                  className="h-12 rounded-xl bg-zinc-50 border-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Current Goal</Label>
                <Input 
                  value={profile.goal} 
                  onChange={e => setProfile({...profile, goal: e.target.value})}
                  className="h-12 rounded-xl bg-zinc-50 border-zinc-100"
                  placeholder="e.g. Muscle Gain"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Age</Label>
                <Input 
                  type="number"
                  value={profile.age} 
                  onChange={e => setProfile({...profile, age: e.target.value})}
                  className="h-12 rounded-xl bg-zinc-50 border-zinc-100"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Weight (KG)</Label>
                <Input 
                  type="number"
                  value={profile.weightKg} 
                  onChange={e => setProfile({...profile, weightKg: e.target.value})}
                  className="h-12 rounded-xl bg-zinc-50 border-zinc-100"
                />
              </div>
            </div>
          </Card>

          <Card className="premium-card border-zinc-200">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notification Settings
            </h3>
            <div className="space-y-6">
              {[
                { label: "Meal Reminders", desc: "Get notified when it's time to eat.", checked: true },
                { label: "Goal Progress", desc: "Weekly summaries of your performance.", checked: true },
                { label: "AI Suggestions", desc: "Daily new meal recommendations.", checked: false }
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between p-4 glass rounded-2xl border-zinc-100">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-zinc-900">{n.label}</p>
                    <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">{n.desc}</p>
                  </div>
                  <Switch defaultChecked={n.checked} className="data-[state=checked]:bg-emerald-600" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Account & Security */}
        <div className="space-y-6">
          <Card className="premium-card bg-emerald-600 text-white border-0">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold">Premium Plan</h3>
              </div>
              <p className="text-sm text-emerald-50">You are currently on the Lifetime Elite plan. Enjoy all features!</p>
              <Button className="w-full bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50">
                View Subscription
              </Button>
            </div>
          </Card>

          <Card className="premium-card border-zinc-200">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start text-zinc-600 font-bold text-xs rounded-xl hover:bg-zinc-50">
                <Shield className="w-4 h-4 mr-2" />
                Two-Factor Auth
              </Button>
              <Button variant="ghost" className="w-full justify-start text-zinc-600 font-bold text-xs rounded-xl hover:bg-zinc-50">
                <Download className="w-4 h-4 mr-2" />
                Download Data
              </Button>
              <div className="pt-4 mt-4 border-t border-zinc-100 space-y-2">
                <Button 
                  onClick={handleLogout}
                  variant="ghost" 
                  className="w-full justify-start text-red-500 font-bold text-xs rounded-xl hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
                <Button variant="ghost" className="w-full justify-start text-zinc-400 font-bold text-xs rounded-xl hover:bg-zinc-50">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
