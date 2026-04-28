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
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#16A34A] rounded-xl flex items-center justify-center shadow-sm">
            <Salad className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#111827]">Dietora</h1>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-gray-500">Smart Nutrition</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-[#16A34A] text-white shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 mt-auto border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-3 mb-2">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200">
            <span className="text-xs font-bold text-gray-600">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
            <p className="text-[10px] text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl h-10 border-gray-200"
          onClick={onLogout}
          disabled={isLoggingOut}
        >
          <span className="text-sm font-bold">{isLoggingOut ? "Logging out..." : "Log Out"}</span>
        </Button>
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
