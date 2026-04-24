import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  login,
  register,
  logout,
  getMyProfile,
  updateMyProfile,
  saveSession,
  clearSession,
  type AuthResponse,
  type UserProfile,
} from "../lib/api";

// Query keys for cache management
export const authKeys = {
  all: ["auth"] as const,
  profile: () => [...authKeys.all, "profile"] as const,
};

// Hook for user profile
export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: getMyProfile,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for login mutation
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data: AuthResponse) => {
      saveSession(data);
      // Invalidate and refetch profile after login
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}

// Hook for register mutation
export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,
    onSuccess: (data: AuthResponse) => {
      saveSession(data);
      queryClient.invalidateQueries({ queryKey: authKeys.profile() });
    },
  });
}

// Hook for logout
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearSession();
      // Clear all queries from cache
      queryClient.clear();
      window.location.href = "/login";
    },
    onError: () => {
      // Still clear local state even if API fails
      clearSession();
      queryClient.clear();
      window.location.href = "/login";
    },
  });
}

// Hook for updating profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (data: UserProfile) => {
      // Update cache immediately with new data
      queryClient.setQueryData(authKeys.profile(), data);
    },
  });
}
