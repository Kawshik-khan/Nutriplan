import { createBrowserRouter, Navigate } from "react-router";
import { Suspense, lazy } from "react";
import { RootLayout } from "./layouts/root-layout";
import Landing from "./pages/landing";
import Login from "./pages/login";
import { AppErrorBoundary } from "./components/app-error-boundary";
import { Skeleton } from "./components/ui/skeleton";

// Lazy load pages for code splitting
const Register = lazy(() => import("./pages/register"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const Onboarding = lazy(() => import("./pages/onboarding"));
const MealPlanner = lazy(() => import("./pages/meal-planner"));
const FoodLog = lazy(() => import("./pages/food-log"));
const Recommendations = lazy(() => import("./pages/recommendations"));
const Analytics = lazy(() => import("./pages/analytics"));
const GroceryList = lazy(() => import("./pages/grocery-list"));
const Settings = lazy(() => import("./pages/settings"));
const AdminDashboard = lazy(() => import("./pages/admin-dashboard"));

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
