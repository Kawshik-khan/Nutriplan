import { Navigate, useLocation } from "react-router";
import { useAuth } from "../contexts/auth-context";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login but save the current location to come back later
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
