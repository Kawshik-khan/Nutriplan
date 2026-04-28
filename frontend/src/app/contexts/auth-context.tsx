import React, { createContext, useContext, useEffect, useState } from "react";
import { useProfile, useLogin, useRegister, useLogout } from "../hooks/use-auth";
import { UserProfile, isAuthenticated } from "../lib/api";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isError: boolean;
  login: (payload: any, options?: any) => void;
  register: (payload: any, options?: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  
  // Use the profile query to sync with backend session
  const { 
    data: user, 
    isLoading: profileLoading, 
    isError,
    status
  } = useProfile();
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  // Wait for the first query to complete before saying we're "ready"
  useEffect(() => {
    if (status !== 'pending') {
      setIsReady(true);
      if (user) {
        console.log("[AUTH] Session verified for:", user.email);
      }
    }
  }, [status, user]);

  const value = {
    user: user ?? null,
    isLoading: !isReady || profileLoading,
    isError,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isAuthenticated: !!user && isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
