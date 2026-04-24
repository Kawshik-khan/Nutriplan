import cookieParser from "cookie-parser";
import cors from "cors";
import csrf from "csrf";
import express from "express";
import morgan from "morgan";
import { z } from "zod";
import { config } from "./config.js";
import { prisma } from "./db.js";
import { requireAuth } from "./middleware/auth.js";
import { signAuthToken } from "./utils/jwt.js";
import { comparePassword, hashPassword } from "./utils/password.js";
import { 
  generateMealRecommendations, 
  generateNutritionInsights,
  generateShoppingList 
} from "./services/ai-service.js";

const app = express();

// CSRF token generator
const csrfTokens = new csrf();

// CORS configuration - allow credentials for cookies
const corsOptions = {
  origin: config.corsOrigins,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = authSchema.extend({
  fullName: z.string().min(2).max(120),
});

const profileUpdateSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  age: z.number().int().positive().max(120).nullable().optional(),
  heightCm: z.number().positive().max(260).nullable().optional(),
  weightKg: z.number().positive().max(500).nullable().optional(),
  goal: z.string().max(120).nullable().optional(),
  preferences: z.array(z.string()).max(50).nullable().optional(),
  allergies: z.array(z.string()).max(50).nullable().optional(),
});

function toUserResponse(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    age: user.age,
    heightCm: user.heightCm,
    weightKg: user.weightKg,
    goal: user.goal,
    preferences: user.preferences ? JSON.parse(user.preferences) : [],
    allergies: user.allergies ? JSON.parse(user.allergies) : [],
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function issueAuthResponse(user, res) {
  const token = signAuthToken({ sub: user.id, email: user.email });

  // Set JWT as httpOnly cookie
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  console.log(`[AUTH] Issued auth_token for user ${user.id}`);

  // Generate and set CSRF token
  const csrfSecret = csrfTokens.secretSync();
  const csrfToken = csrfTokens.create(csrfSecret);
  res.cookie("csrf_secret", csrfSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return {
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    },
    csrfToken, // Send CSRF token in response body
  };
}

function getTodayRangeUtc() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

// CSRF Token endpoint
app.get("/api/csrf-token", (_req, res) => {
  const csrfSecret = csrfTokens.secretSync();
  const csrfToken = csrfTokens.create(csrfSecret);
  res.cookie("csrf_secret", csrfSecret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ csrfToken });
});

// CSRF Protection middleware for state-changing operations
function csrfProtection(req, res, next) {
  const csrfSecret = req.cookies.csrf_secret;
  const csrfToken = req.headers["x-csrf-token"];

  if (!csrfSecret || !csrfToken) {
    return res.status(403).json({ error: "CSRF token missing." });
  }

  if (!csrfTokens.verify(csrfSecret, csrfToken)) {
    return res.status(403).json({ error: "Invalid CSRF token." });
  }

  next();
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "nutriplan-backend",
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const input = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
    if (existingUser) {
      return res.status(409).json({ error: "Email already exists." });
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        passwordHash,
      },
    });

    const response = issueAuthResponse(user, res);
    return res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request body.", details: error.flatten() });
    }
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const input = authSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isValidPassword = await comparePassword(input.password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const response = issueAuthResponse(user, res);
    console.log(`[AUTH] Login successful for user: ${user.email}`);
    return res.status(200).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request body.", details: error.flatten() });
    }
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("auth_token");
  res.clearCookie("csrf_secret");
  res.json({ message: "Logged out successfully." });
});

app.get("/api/users/me", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    return res.json(toUserResponse(user));
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Apply CSRF protection to state-changing operations
app.patch("/api/users/me", requireAuth, csrfProtection, async (req, res) => {
  try {
    const input = profileUpdateSchema.parse(req.body);

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        fullName: input.fullName,
        age: input.age,
        heightCm: input.heightCm,
        weightKg: input.weightKg,
        goal: input.goal,
        preferences: input.preferences === undefined ? undefined : JSON.stringify(input.preferences ?? []),
        allergies: input.allergies === undefined ? undefined : JSON.stringify(input.allergies ?? []),
      },
    });

    return res.json(toUserResponse(updated));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: "Invalid request body.", details: error.flatten() });
    }
    console.error("Update profile error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/meals/today", requireAuth, async (req, res) => {
  try {
    const { start, end } = getTodayRangeUtc();

    const meals = await prisma.meal.findMany({
      where: {
        userId: req.user.id,
        eatenAt: {
          gte: start,
          lt: end,
        },
      },
      orderBy: {
        eatenAt: "asc",
      },
    });

    return res.json(
      meals.map((meal) => ({
        id: meal.id,
        mealType: meal.mealType,
        title: meal.title,
        image: meal.image,
        protein: meal.proteinG,
        carbs: meal.carbsG,
        fat: meal.fatG,
        calories: meal.calories,
        tags: meal.tags ? JSON.parse(meal.tags) : [],
        eatenAt: meal.eatenAt,
      }))
    );
  } catch (error) {
    console.error("Get meals error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/water/log", requireAuth, csrfProtection, async (req, res) => {
  try {
    const amountMl = Number(req.body?.amountMl ?? 250);
    if (!Number.isFinite(amountMl) || amountMl <= 0 || amountMl > 3000) {
      return res.status(400).json({ error: "amountMl must be a positive number up to 3000." });
    }

    await prisma.waterLog.create({
      data: {
        userId: req.user.id,
        amountMl,
      },
    });

    const { start, end } = getTodayRangeUtc();
    const logs = await prisma.waterLog.findMany({
      where: {
        userId: req.user.id,
        loggedAt: {
          gte: start,
          lt: end,
        },
      },
    });

    const totalMl = logs.reduce((sum, log) => sum + log.amountMl, 0);
    return res.status(201).json({ totalMl, glasses: Math.round(totalMl / 250) });
  } catch (error) {
    console.error("Water log error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/dashboard/overview", requireAuth, async (req, res) => {
  try {
    const { start, end } = getTodayRangeUtc();

    const [stat, meals, waterLogs, latestWeight, previousWeight] = await Promise.all([
      prisma.nutritionStat.findUnique({
        where: {
          userId_date: {
            userId: req.user.id,
            date: start,
          },
        },
      }),
      prisma.meal.findMany({
        where: {
          userId: req.user.id,
          eatenAt: {
            gte: start,
            lt: end,
          },
        },
        orderBy: {
          eatenAt: "asc",
        },
        take: 6,
      }),
      prisma.waterLog.findMany({
        where: {
          userId: req.user.id,
          loggedAt: {
            gte: start,
            lt: end,
          },
        },
      }),
      prisma.weightLog.findFirst({
        where: { userId: req.user.id },
        orderBy: { loggedAt: "desc" },
      }),
      prisma.weightLog.findMany({
        where: { userId: req.user.id },
        orderBy: { loggedAt: "desc" },
        take: 2,
      }),
    ]);

    const currentWeight = latestWeight?.weightKg ?? null;
    const deltaWeight =
      previousWeight.length >= 2
        ? Number((previousWeight[0].weightKg - previousWeight[1].weightKg).toFixed(1))
        : 0;

    const waterTotalMl = waterLogs.reduce((sum, log) => sum + log.amountMl, 0);

    return res.json({
      user: req.user,
      today: {
        calories: {
          consumed: stat?.caloriesTaken ?? 0,
          goal: stat?.caloriesGoal ?? 2000,
        },
        macros: {
          protein: { consumed: stat?.proteinTakenG ?? 0, goal: stat?.proteinGoalG ?? 150 },
          carbs: { consumed: stat?.carbsTakenG ?? 0, goal: stat?.carbsGoalG ?? 225 },
          fats: { consumed: stat?.fatsTakenG ?? 0, goal: stat?.fatsGoalG ?? 67 },
        },
        water: {
          totalMl: waterTotalMl,
          glasses: Math.round(waterTotalMl / 250),
          goalGlasses: 8,
        },
        weight: {
          currentKg: currentWeight,
          deltaKg: deltaWeight,
        },
      },
      meals: meals.map((meal) => ({
        id: meal.id,
        mealType: meal.mealType,
        title: meal.title,
        image: meal.image,
        protein: meal.proteinG,
        carbs: meal.carbsG,
        fat: meal.fatG,
        calories: meal.calories,
        tags: meal.tags ? JSON.parse(meal.tags) : [],
      })),
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// AI Routes
app.get("/api/ai/recommendations", requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const userProfile = {
      age: user.age,
      weightKg: user.weightKg,
      heightCm: user.heightCm,
      goal: user.goal,
      preferences: user.preferences ? JSON.parse(user.preferences) : [],
      allergies: user.allergies ? JSON.parse(user.allergies) : [],
    };

    const preferences = req.query;
    const recommendations = await generateMealRecommendations(userProfile, preferences);
    
    return res.json(recommendations);
  } catch (error) {
    console.error("AI recommendations error:", error);
    return res.status(500).json({ error: "Failed to generate recommendations." });
  }
});

app.get("/api/ai/insights", requireAuth, async (req, res) => {
  try {
    const { start, end } = getTodayRangeUtc();
    
    const [user, recentMeals, stats] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user.id } }),
      prisma.meal.findMany({
        where: {
          userId: req.user.id,
          eatenAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { eatenAt: "desc" },
        take: 20,
      }),
      prisma.nutritionStat.findMany({
        where: {
          userId: req.user.id,
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: { date: "desc" },
      }),
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const userData = {
      goal: user.goal || "maintain",
      targets: {
        calories: user.goal === "lose" ? 1500 : user.goal === "gain" ? 2500 : 2000,
        protein: user.weightKg ? user.weightKg * 1.6 : 150,
      },
    };

    const insights = await generateNutritionInsights(userData, recentMeals);
    
    return res.json(insights);
  } catch (error) {
    console.error("AI insights error:", error);
    return res.status(500).json({ error: "Failed to generate insights." });
  }
});

app.post("/api/ai/shopping-list", requireAuth, async (req, res) => {
  try {
    const { meals } = req.body;
    
    if (!meals || !Array.isArray(meals)) {
      return res.status(400).json({ error: "Meals array required." });
    }

    const shoppingList = await generateShoppingList(meals);
    
    return res.json(shoppingList);
  } catch (error) {
    console.error("AI shopping list error:", error);
    return res.status(500).json({ error: "Failed to generate shopping list." });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(config.port, () => {
  console.log(`Nutriplan backend listening on http://localhost:${config.port}`);
});
