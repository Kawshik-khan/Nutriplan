import { useEffect, useState } from "react";
import { Outlet, NavLink, Link } from "react-router";
import { 
  LayoutDashboard, 
  Calendar, 
  Apple, 
  Sparkles, 
  TrendingUp, 
  ShoppingCart, 
  Settings, 
  Shield,
  Salad,
  Menu
} from "lucide-react";
import { useProfile, useLogout } from "../hooks/use-auth";
import { Button } from "../components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import { Skeleton } from "../components/ui/skeleton";

const navItems = [
  { to: ".", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "planner", icon: Calendar, label: "Meal Planner" },
  { to: "log", icon: Apple, label: "Food Log" },
  { to: "recommendations", icon: Sparkles, label: "Recommendations" },
  { to: "grocery", icon: ShoppingCart, label: "Grocery List" },
  { to: "analytics", icon: TrendingUp, label: "Analytics" },
  { to: "profile", icon: Settings, label: "Profile" },
];

function SidebarContent({ 
  userName, 
  userEmail, 
  initials, 
  onLogout,
  isLoggingOut 
}: { 
  userName: string; 
  userEmail: string; 
  initials: string;
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  return (
    <div className="flex flex-col h-full glass border-r-0 shadow-none">
      {/* Logo */}
      <div className="p-8">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-300">
            <Salad className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gradient">Nutriplan</h1>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-zinc-500">Premium Plan</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? "bg-emerald-600/10 text-emerald-700 shadow-sm border border-emerald-600/20"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              }`
            }
          >
            <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110`} />
            <span className="font-semibold text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-6 mt-auto">
        <div className="glass rounded-3xl p-4 border-zinc-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-100 to-teal-50 rounded-full flex items-center justify-center border border-emerald-200">
              <span className="text-xs font-bold text-emerald-700">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">{userName}</p>
              <p className="text-[10px] text-zinc-500 truncate">{userEmail}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-xl px-2 h-9 transition-colors"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            <Shield className="w-4 h-4" />
            <span className="text-xs font-bold">{isLoggingOut ? "Logging out..." : "Log Out"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function RootLayout() {
  const { data: user, isLoading, error } = useProfile();
  const logoutMutation = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (error) {
      window.location.href = "/login";
    }
  }, [error]);

  const userName = user?.fullName ?? "Loading...";
  const userEmail = user?.email ?? "Please wait";

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "DU";

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#F3F4F6]">
        <aside className="w-64 bg-white border-r border-[#D1D5DB] hidden lg:flex flex-col">
          <div className="p-6 border-b border-[#D1D5DB]">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div>
                <Skeleton className="h-5 w-24 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
          <div className="flex-1 p-4 space-y-3">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-10 rounded-xl" />
            ))}
          </div>
        </aside>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A] mx-auto mb-4"></div>
            <p className="text-[#6B7280]">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F3F4F6]">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-[#D1D5DB] hidden lg:flex flex-col">
        <SidebarContent 
          userName={userName}
          userEmail={userEmail}
          initials={initials}
          onLogout={handleLogout}
          isLoggingOut={logoutMutation.isPending}
        />
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#D1D5DB] z-50 flex items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#16A34A] rounded-lg flex items-center justify-center">
            <Salad className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-[#111827]">Nutriplan</span>
        </Link>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <SidebarContent 
                userName={userName}
                userEmail={userEmail}
                initials={initials}
                onLogout={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                isLoggingOut={logoutMutation.isPending}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto lg:mt-0 mt-16">
        <Outlet />
      </main>
    </div>
  );
}
