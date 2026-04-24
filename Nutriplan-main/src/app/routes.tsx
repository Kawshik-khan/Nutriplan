import { createBrowserRouter, Navigate } from "react-router";
import { Suspense, lazy } from "react";
import { RootLayout } from "./layouts/root-layout";
import { Landing } from "./pages/landing";
import { AppErrorBoundary } from "./components/app-error-boundary";
import { Skeleton } from "./components/ui/skeleton";

// Lazy load pages for code splitting
const Login = lazy(() => import("./pages/login").then((m) => ({ default: m.Login })));
const Register = lazy(() => import("./pages/register").then((m) => ({ default: m.Register })));
const Dashboard = lazy(() => import("./pages/dashboard").then((m) => ({ default: m.Dashboard })));
const Onboarding = lazy(() => import("./pages/onboarding").then((m) => ({ default: m.Onboarding })));
const MealPlanner = lazy(() => import("./pages/meal-planner").then((m) => ({ default: m.MealPlanner })));
const FoodLog = lazy(() => import("./pages/food-log").then((m) => ({ default: m.FoodLog })));
const Recommendations = lazy(() => import("./pages/recommendations").then((m) => ({ default: m.Recommendations })));
const Analytics = lazy(() => import("./pages/analytics").then((m) => ({ default: m.Analytics })));
const GroceryList = lazy(() => import("./pages/grocery-list").then((m) => ({ default: m.GroceryList })));
const Settings = lazy(() => import("./pages/settings").then((m) => ({ default: m.Settings })));
const AdminDashboard = lazy(() => import("./pages/admin-dashboard").then((m) => ({ default: m.AdminDashboard })));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#16A34A]"></div>
      <p className="text-[#6B7280]">Loading...</p>
    </div>
  );
}

// Wrap lazy components with Suspense
function withSuspense(Component: React.ComponentType) {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </AppErrorBoundary>
  );
}

import { ProtectedRoute } from "./components/protected-route";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
    errorElement: <AppErrorBoundary children={null} />, // Standard router error element
  },
  {
    path: "/login",
    element: withSuspense(Login),
  },
  {
    path: "/register",
    element: withSuspense(Register),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <RootLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: withSuspense(Dashboard) },
      { path: "planner", element: withSuspense(MealPlanner) },
      { path: "log", element: withSuspense(FoodLog) },
      { path: "grocery", element: withSuspense(GroceryList) },
      { path: "recommendations", element: withSuspense(Recommendations) },
      { path: "analytics", element: withSuspense(Analytics) },
      { path: "profile", element: withSuspense(Settings) }, // Using Settings for Profile for now
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
