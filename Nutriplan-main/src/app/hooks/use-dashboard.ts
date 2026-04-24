import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDashboardOverview,
  addWaterGlass,
  type DashboardOverview,
} from "../lib/api";

// Query keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  overview: () => [...dashboardKeys.all, "overview"] as const,
};

// Hook for dashboard overview
export function useDashboardOverview() {
  return useQuery({
    queryKey: dashboardKeys.overview(),
    queryFn: getDashboardOverview,
    staleTime: 1000 * 60 * 2, // 2 minutes - dashboard data changes frequently
    refetchOnWindowFocus: true,
  });
}

// Hook for adding water
export function useAddWater() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addWaterGlass,
    onSuccess: (data) => {
      // Optimistically update the dashboard data
      queryClient.setQueryData(
        dashboardKeys.overview(),
        (oldData: DashboardOverview | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            today: {
              ...oldData.today,
              water: {
                ...oldData.today.water,
                totalMl: data.totalMl,
                glasses: data.glasses,
              },
            },
          };
        }
      );
    },
  });
}

// Hook to prefetch dashboard data (useful for navigation)
export function usePrefetchDashboard() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: dashboardKeys.overview(),
      queryFn: getDashboardOverview,
      staleTime: 1000 * 60 * 2,
    });
  };
}
