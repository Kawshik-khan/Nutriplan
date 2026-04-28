import cookieParser from "cookie-parser";
import cors from "cors";
import csrf from "csrf";
import express from "express";
import morgan from "morgan";
import { z } from "zod";
import { config } from "./config/config.js";
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

// Meals API - Food Items Database
app.get("/api/meals", requireAuth, async (req, res) => {
  try {
    const { search, category, tag, limit = 50, offset = 0 } = req.query;

    const where = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (category) {
      where.category = category;
    }

    if (tag) {
      where.tags = { contains: tag };
    }

    const meals = await prisma.foodItem.findMany({
      where,
      orderBy: { name: 'asc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    return res.json(
      meals.map((meal) => ({
        id: meal.id,
        name: meal.name,
        image: meal.image,
        calories: meal.calories,
        protein: meal.proteinG,
        carbs: meal.carbsG,
        fat: meal.fatG,
        category: meal.category,
        tags: meal.tags ? JSON.parse(meal.tags) : [],
      }))
    );
  } catch (error) {
    console.error("Get meals error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.get("/api/meals/:id", requireAuth, async (req, res) => {
  try {
    const mealId = parseInt(req.params.id);
    if (isNaN(mealId)) {
      return res.status(400).json({ error: "Invalid meal ID." });
    }

    const meal = await prisma.foodItem.findUnique({
      where: { id: mealId },
    });

    if (!meal) {
      return res.status(404).json({ error: "Meal not found." });
    }

    return res.json({
      id: meal.id,
      name: meal.name,
      image: meal.image,
      calories: meal.calories,
      protein: meal.proteinG,
      carbs: meal.carbsG,
      fat: meal.fatG,
      category: meal.category,
      tags: meal.tags ? JSON.parse(meal.tags) : [],
    });
  } catch (error) {
    console.error("Get meal by ID error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Meal Planner API
app.get("/api/planner/:date", requireAuth, async (req, res) => {
  try {
    const dateParam = req.params.date;
    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid date format." });
    }

    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const plannerEntries = await prisma.plannerEntry.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        foodItem: true,
      },
      orderBy: [
        { mealType: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // Group by meal type
    const groupedMeals = {
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snack: [],
    };

    plannerEntries.forEach(entry => {
      const mealType = entry.mealType;
      groupedMeals[mealType].push({
        id: entry.id,
        foodItemId: entry.foodItemId,
        name: entry.foodItem.name,
        image: entry.foodItem.image,
        calories: entry.foodItem.calories * entry.quantity,
        protein: entry.foodItem.proteinG * entry.quantity,
        carbs: entry.foodItem.carbsG * entry.quantity,
        fat: entry.foodItem.fatG * entry.quantity,
        quantity: entry.quantity,
        mealType: entry.mealType,
        date: entry.date,
        tags: entry.foodItem.tags ? JSON.parse(entry.foodItem.tags) : [],
      });
    });

    return res.json(groupedMeals);
  } catch (error) {
    console.error("Get planner error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/planner", requireAuth, csrfProtection, async (req, res) => {
  try {
    const { foodItemId, date, mealType, quantity = 1 } = req.body;

    if (!foodItemId || !date || !mealType) {
      return res.status(400).json({ error: "foodItemId, date, and mealType are required." });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format." });
    }

    const validMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    if (!validMealTypes.includes(mealType)) {
      return res.status(400).json({ error: "Invalid meal type." });
    }

    // Check if food item exists
    const foodItem = await prisma.foodItem.findUnique({
      where: { id: parseInt(foodItemId) },
    });

    if (!foodItem) {
      return res.status(404).json({ error: "Food item not found." });
    }

    // Create planner entry
    const entry = await prisma.plannerEntry.create({
      data: {
        userId: req.user.id,
        foodItemId: parseInt(foodItemId),
        date: parsedDate,
        mealType,
        quantity: parseInt(quantity),
      },
      include: {
        foodItem: true,
      },
    });

    return res.status(201).json({
      id: entry.id,
      foodItemId: entry.foodItemId,
      name: entry.foodItem.name,
      image: entry.foodItem.image,
      calories: entry.foodItem.calories * entry.quantity,
      protein: entry.foodItem.proteinG * entry.quantity,
      carbs: entry.foodItem.carbsG * entry.quantity,
      fat: entry.foodItem.fatG * entry.quantity,
      quantity: entry.quantity,
      mealType: entry.mealType,
      date: entry.date,
      tags: entry.foodItem.tags ? JSON.parse(entry.foodItem.tags) : [],
    });
  } catch (error) {
    console.error("Add to planner error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.delete("/api/planner/:entryId", requireAuth, csrfProtection, async (req, res) => {
  try {
    const entryId = parseInt(req.params.entryId);
    if (isNaN(entryId)) {
      return res.status(400).json({ error: "Invalid entry ID." });
    }

    const entry = await prisma.plannerEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry || entry.userId !== req.user.id) {
      return res.status(404).json({ error: "Planner entry not found." });
    }

    await prisma.plannerEntry.delete({
      where: { id: entryId },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete planner entry error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Food Log API
app.get("/api/food-log/:date", requireAuth, async (req, res) => {
  try {
    const dateParam = req.params.date;
    const date = new Date(dateParam);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ error: "Invalid date format." });
    }

    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const foodLogs = await prisma.foodLog.findMany({
      where: {
        userId: req.user.id,
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      include: {
        foodItem: true,
      },
      orderBy: [
        { mealType: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    // Group by meal type
    const groupedLogs = {
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snack: [],
    };

    foodLogs.forEach(log => {
      const mealType = log.mealType;
      groupedLogs[mealType].push({
        id: log.id,
        foodItemId: log.foodItemId,
        foodName: log.foodName || log.foodItem?.name,
        image: log.foodItem?.image,
        calories: log.calories,
        protein: log.proteinG,
        carbs: log.carbsG,
        fat: log.fatG,
        quantity: log.quantity,
        mealType: log.mealType,
        date: log.date,
        tags: log.foodItem?.tags ? JSON.parse(log.foodItem.tags) : [],
      });
    });

    return res.json(groupedLogs);
  } catch (error) {
    console.error("Get food log error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.post("/api/food-log", requireAuth, csrfProtection, async (req, res) => {
  try {
    const { foodItemId, foodName, date, mealType, quantity = 1 } = req.body;

    if (!date || !mealType) {
      return res.status(400).json({ error: "date and mealType are required." });
    }

    if (!foodItemId && !foodName) {
      return res.status(400).json({ error: "Either foodItemId or foodName is required." });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format." });
    }

    const validMealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    if (!validMealTypes.includes(mealType)) {
      return res.status(400).json({ error: "Invalid meal type." });
    }

    let calories = 0, protein = 0, carbs = 0, fat = 0, foodItem = null;

    if (foodItemId) {
      foodItem = await prisma.foodItem.findUnique({
        where: { id: parseInt(foodItemId) },
      });

      if (!foodItem) {
        return res.status(404).json({ error: "Food item not found." });
      }

      calories = foodItem.calories * quantity;
      protein = foodItem.proteinG * quantity;
      carbs = foodItem.carbsG * quantity;
      fat = foodItem.fatG * quantity;
    } else {
      // For custom foods, we'd need nutrition data - for now, set defaults
      calories = 200 * quantity; // Default assumption
      protein = 10 * quantity;
      carbs = 20 * quantity;
      fat = 8 * quantity;
    }

    // Create food log entry
    const log = await prisma.foodLog.create({
      data: {
        userId: req.user.id,
        foodItemId: foodItemId ? parseInt(foodItemId) : null,
        foodName: foodName || null,
        date: parsedDate,
        mealType,
        quantity: parseInt(quantity),
        calories,
        proteinG: protein,
        carbsG: carbs,
        fatG: fat,
      },
      include: {
        foodItem: true,
      },
    });

    // Update nutrition stats for the day
    const startOfDay = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
    await prisma.nutritionStat.upsert({
      where: {
        userId_date: {
          userId: req.user.id,
          date: startOfDay,
        },
      },
      update: {
        caloriesTaken: { increment: calories },
        proteinTakenG: { increment: protein },
        carbsTakenG: { increment: carbs },
        fatsTakenG: { increment: fat },
      },
      create: {
        userId: req.user.id,
        date: startOfDay,
        caloriesTaken: calories,
        proteinTakenG: protein,
        carbsTakenG: carbs,
        fatsTakenG: fat,
      },
    });

    return res.status(201).json({
      id: log.id,
      foodItemId: log.foodItemId,
      foodName: log.foodName || log.foodItem?.name,
      image: log.foodItem?.image,
      calories: log.calories,
      protein: log.proteinG,
      carbs: log.carbsG,
      fat: log.fatG,
      quantity: log.quantity,
      mealType: log.mealType,
      date: log.date,
      tags: log.foodItem?.tags ? JSON.parse(log.foodItem.tags) : [],
    });
  } catch (error) {
    console.error("Add food log error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

app.delete("/api/food-log/:logId", requireAuth, csrfProtection, async (req, res) => {
  try {
    const logId = parseInt(req.params.logId);
    if (isNaN(logId)) {
      return res.status(400).json({ error: "Invalid log ID." });
    }

    const log = await prisma.foodLog.findUnique({
      where: { id: logId },
    });

    if (!log || log.userId !== req.user.id) {
      return res.status(404).json({ error: "Food log entry not found." });
    }

    // Update nutrition stats (subtract the values)
    const startOfDay = new Date(log.date.getFullYear(), log.date.getMonth(), log.date.getDate());
    await prisma.nutritionStat.upsert({
      where: {
        userId_date: {
          userId: req.user.id,
          date: startOfDay,
        },
      },
      update: {
        caloriesTaken: { decrement: log.calories },
        proteinTakenG: { decrement: log.proteinG },
        carbsTakenG: { decrement: log.carbsG },
        fatsTakenG: { decrement: log.fatG },
      },
      create: {
        userId: req.user.id,
        date: startOfDay,
        caloriesTaken: 0,
        proteinTakenG: 0,
        carbsTakenG: 0,
        fatsTakenG: 0,
      },
    });

    await prisma.foodLog.delete({
      where: { id: logId },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete food log error:", error);
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

    const [stat, plannerMeals, foodLogs, waterLogs, latestWeight, previousWeight] = await Promise.all([
      prisma.nutritionStat.findUnique({
        where: {
          userId_date: {
            userId: req.user.id,
            date: start,
          },
        },
      }),
      // Get today's planned meals
      prisma.plannerEntry.findMany({
        where: {
          userId: req.user.id,
          date: {
            gte: start,
            lt: end,
          },
        },
        include: {
          foodItem: true,
        },
        orderBy: [
          { mealType: 'asc' },
          { createdAt: 'asc' },
        ],
      }),
      // Get today's logged foods
      prisma.foodLog.findMany({
        where: {
          userId: req.user.id,
          date: {
            gte: start,
            lt: end,
          },
        },
        include: {
          foodItem: true,
        },
        orderBy: [
          { mealType: 'asc' },
          { createdAt: 'asc' },
        ],
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

    // Calculate nutrition from food logs (actual consumption)
    const loggedNutrition = foodLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.proteinG,
        carbs: acc.carbs + log.carbsG,
        fats: acc.fats + log.fatG,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    // Use logged nutrition if available, otherwise fall back to stats table
    const caloriesConsumed = loggedNutrition.calories || stat?.caloriesTaken || 0;
    const proteinConsumed = loggedNutrition.protein || stat?.proteinTakenG || 0;
    const carbsConsumed = loggedNutrition.carbs || stat?.carbsTakenG || 0;
    const fatsConsumed = loggedNutrition.fats || stat?.fatsTakenG || 0;

    // Group planned meals by meal type for display
    const todayMeals = {
      Breakfast: [],
      Lunch: [],
      Dinner: [],
      Snack: [],
    };

    plannerMeals.forEach(entry => {
      const mealType = entry.mealType;
      todayMeals[mealType].push({
        id: entry.id,
        name: entry.foodItem.name,
        image: entry.foodItem.image,
        calories: entry.foodItem.calories * entry.quantity,
        protein: entry.foodItem.proteinG * entry.quantity,
        carbs: entry.foodItem.carbsG * entry.quantity,
        fat: entry.foodItem.fatG * entry.quantity,
        type: entry.mealType,
        quantity: entry.quantity,
        tags: entry.foodItem.tags ? JSON.parse(entry.foodItem.tags) : [],
      });
    });

    return res.json({
      user: req.user,
      today: {
        calories: {
          consumed: caloriesConsumed,
          goal: stat?.caloriesGoal ?? 2000,
        },
        macros: {
          protein: { consumed: proteinConsumed, goal: stat?.proteinGoalG ?? 150 },
          carbs: { consumed: carbsConsumed, goal: stat?.carbsGoalG ?? 225 },
          fats: { consumed: fatsConsumed, goal: stat?.fatsGoalG ?? 67 },
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
        meals: todayMeals, // Today's planned meals
        loggedFoods: foodLogs.map(log => ({
          id: log.id,
          mealType: log.mealType,
          name: log.foodName || log.foodItem?.name,
          calories: log.calories,
          protein: log.proteinG,
          carbs: log.carbsG,
          fat: log.fatG,
          quantity: log.quantity,
        })),
      },
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

// Recommendations API
import recommendationsRouter from './routes/recommendations.js';
app.use('/api/recommendations', requireAuth, recommendationsRouter);

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
