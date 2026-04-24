import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/theme-provider";
import { ErrorBoundary } from "./components/error-boundary";
import { MealProvider } from "./contexts/meal-context";
import { GroceryProvider } from "./contexts/grocery-context";
import { AuthProvider } from "./contexts/auth-context";
import { queryClient } from "./lib/query-client";

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <MealProvider>
              <GroceryProvider>
                <RouterProvider router={router} />
                <Toaster />
              </GroceryProvider>
            </MealProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
