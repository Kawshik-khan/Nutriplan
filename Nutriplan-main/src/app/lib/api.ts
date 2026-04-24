/// <reference types="vite/client" />

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

// CSRF Token storage
let csrfToken: string | null = null;

async function getCsrfToken(): Promise<string | null> {
  if (csrfToken) {
    return csrfToken;
  }

  const response = await fetch(`${API_BASE_URL}/csrf-token`, {
    method: "GET",
    credentials: "include", // Important: send/receive cookies
  });

  if (!response.ok) {
    throw new Error("Failed to get CSRF token.");
  }

  const data = await response.json();
  csrfToken = data.csrfToken;
  console.log("[API] CSRF token refreshed");
  return csrfToken;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  skipCsrf?: boolean;
};

export type AuthResponse = {
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  csrfToken: string;
};

export type UserProfile = {
  id: number;
  fullName: string;
  email: string;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  goal: string | null;
  preferences: string[];
  allergies: string[];
};

export type DashboardOverview = {
  user: {
    id: number;
    fullName: string;
    email: string;
  };
  today: {
    calories: {
      consumed: number;
      goal: number;
    };
    macros: {
      protein: { consumed: number; goal: number };
      carbs: { consumed: number; goal: number };
      fats: { consumed: number; goal: number };
    };
    water: {
      totalMl: number;
      glasses: number;
      goalGlasses: number;
    };
    weight: {
      currentKg: number | null;
      deltaKg: number;
    };
  };
  meals: Array<{
    id: number;
    mealType: string;
    title: string;
    image: string | null;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
    tags: string[];
  }>;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add CSRF token for state-changing operations (POST, PATCH, DELETE)
  const method = options.method ?? "GET";
  if (!options.skipCsrf && ["POST", "PATCH", "PUT", "DELETE"].includes(method.toUpperCase())) {
    try {
      const token = await getCsrfToken();
      if (token) {
        headers["X-CSRF-Token"] = token;
      }
    } catch {
      // Continue without CSRF token for non-authenticated requests
    }
  }

  console.log(`[API] ${method} ${path}`);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      credentials: "include", // Important: send/receive cookies
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });

    if (response.status === 401 && path !== "/users/me") {
      console.warn(`[API] Unauthorized: ${path}`);
      clearSession();
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = payload?.error ?? `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }

    // Store CSRF token from login/register responses
    if (path === "/auth/login" || path === "/auth/register") {
      if (payload?.csrfToken) {
        csrfToken = payload.csrfToken;
      }
    }

    return payload as T;
  } catch (err) {
    if (err instanceof TypeError && err.message === "Failed to fetch") {
      console.error("[API] Network error: Backend unreachable");
      throw new Error("Cannot connect to Nutriplan server. Please ensure the backend is running on http://localhost:4000");
    }
    throw err;
  }
}

export async function register(payload: {
  fullName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: payload,
    skipCsrf: true, // Registration doesn't need CSRF
  });
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
    skipCsrf: true, // Login doesn't need CSRF
  });
}

export async function logout(): Promise<void> {
  await apiRequest<void>("/auth/logout", {
    method: "POST",
    skipCsrf: false, // Logout needs CSRF protection
  });
  csrfToken = null;
}

export function saveSession(session: AuthResponse) {
  // Token is now stored in httpOnly cookie by the server
  // We only store user info locally
  localStorage.setItem("nutriplan_user", JSON.stringify(session.user));
  if (session.csrfToken) {
    csrfToken = session.csrfToken;
  }
}

export async function getMyProfile() {
  return apiRequest<UserProfile>("/users/me");
}

export async function updateMyProfile(payload: Partial<UserProfile>) {
  return apiRequest<UserProfile>("/users/me", {
    method: "PATCH",
    body: payload,
  });
}

export async function getDashboardOverview() {
  return apiRequest<DashboardOverview>("/dashboard/overview");
}

export async function addWaterGlass() {
  return apiRequest<{ totalMl: number; glasses: number }>("/water/log", {
    method: "POST",
    body: { amountMl: 250 },
  });
}

export function clearSession() {
  // Clear CSRF token
  csrfToken = null;
  // Clear user data
  localStorage.removeItem("nutriplan_user");
}

// Check if user has a session (token in cookie)
export function isAuthenticated(): boolean {
  // We can't check httpOnly cookie from JS, so we check if user data exists
  // The server will reject if the cookie is invalid
  return localStorage.getItem("nutriplan_user") !== null;
}
