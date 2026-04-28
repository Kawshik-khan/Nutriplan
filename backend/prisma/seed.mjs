import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function startOfTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const user = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {
      fullName: "John Doe",
      passwordHash,
      age: 28,
      heightCm: 175,
      weightKg: 72.5,
      goal: "maintenance",
      preferences: JSON.stringify(["High Protein", "Low Sugar"]),
      allergies: JSON.stringify(["Peanuts"]),
    },
    create: {
      fullName: "John Doe",
      email: "john@example.com",
      passwordHash,
      age: 28,
      heightCm: 175,
      weightKg: 72.5,
      goal: "maintenance",
      preferences: JSON.stringify(["High Protein", "Low Sugar"]),
      allergies: JSON.stringify(["Peanuts"]),
    },
  });

  const today = startOfTodayUtc();

  await prisma.nutritionStat.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
    update: {
      caloriesTaken: 1240,
      proteinTakenG: 85,
      carbsTakenG: 145,
      fatsTakenG: 42,
    },
    create: {
      userId: user.id,
      date: today,
      caloriesGoal: 2000,
      caloriesTaken: 1240,
      proteinGoalG: 150,
      proteinTakenG: 85,
      carbsGoalG: 225,
      carbsTakenG: 145,
      fatsGoalG: 67,
      fatsTakenG: 42,
    },
  });

  const existingMealCount = await prisma.meal.count({ where: { userId: user.id } });

  if (existingMealCount === 0) {
    await prisma.meal.createMany({
      data: [
        {
          userId: user.id,
          mealType: "Lunch",
          title: "Grilled Salmon with Asparagus",
          image: "https://images.unsplash.com/photo-1758157836016-3f3fbc5bf796?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
          proteinG: 42,
          carbsG: 15,
          fatG: 24,
          calories: 450,
          tags: JSON.stringify(["High Protein", "Omega-3"]),
        },
        {
          userId: user.id,
          mealType: "Dinner",
          title: "Quinoa Buddha Bowl",
          image: "https://images.unsplash.com/photo-1587996428538-71d66749a5cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800",
          proteinG: 18,
          carbsG: 52,
          fatG: 12,
          calories: 380,
          tags: JSON.stringify(["Vegan", "High Fiber"]),
        },
      ],
    });
  }

  const existingWaterCount = await prisma.waterLog.count({ where: { userId: user.id } });
  if (existingWaterCount === 0) {
    await prisma.waterLog.createMany({
      data: Array.from({ length: 6 }).map(() => ({
        userId: user.id,
        amountMl: 250,
      })),
    });
  }

  const existingWeightCount = await prisma.weightLog.count({ where: { userId: user.id } });
  if (existingWeightCount === 0) {
    await prisma.weightLog.createMany({
      data: [
        { userId: user.id, weightKg: 73.3 },
        { userId: user.id, weightKg: 72.9 },
        { userId: user.id, weightKg: 72.5 },
      ],
    });
  }

  // Seed food items database
  const existingFoodItemCount = await prisma.foodItem.count();
  if (existingFoodItemCount === 0) {
    await prisma.foodItem.createMany({
      data: [
        // Breakfast items
        {
          name: "Oatmeal Bowl",
          calories: 320,
          proteinG: 8,
          carbsG: 54,
          fatG: 6,
          category: "Breakfast",
          image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400",
          tags: JSON.stringify(["High Fiber", "Vegetarian"])
        },
        {
          name: "Greek Yogurt with Berries",
          calories: 220,
          proteinG: 20,
          carbsG: 25,
          fatG: 2,
          category: "Breakfast",
          image: "https://images.unsplash.com/photo-1618798513386-fedeb5c30d39?w=400",
          tags: JSON.stringify(["High Protein", "Low Fat"])
        },
        {
          name: "Avocado Toast",
          calories: 280,
          proteinG: 12,
          carbsG: 35,
          fatG: 14,
          category: "Breakfast",
          image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400",
          tags: JSON.stringify(["Vegetarian", "Healthy Fats"])
        },
        {
          name: "Eggs Benedict",
          calories: 380,
          proteinG: 18,
          carbsG: 22,
          fatG: 26,
          category: "Breakfast",
          image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400",
          tags: JSON.stringify(["High Protein"])
        },

        // Lunch items
        {
          name: "Grilled Chicken Bowl",
          calories: 450,
          proteinG: 42,
          carbsG: 35,
          fatG: 18,
          category: "Lunch",
          image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
          tags: JSON.stringify(["High Protein", "Low Carb"])
        },
        {
          name: "Quinoa Salad Bowl",
          calories: 380,
          proteinG: 14,
          carbsG: 55,
          fatG: 12,
          category: "Lunch",
          image: "https://images.unsplash.com/photo-1587996428538-71d66749a5cb?w=400",
          tags: JSON.stringify(["Vegan", "High Fiber"])
        },
        {
          name: "Tuna Salad",
          calories: 320,
          proteinG: 35,
          carbsG: 12,
          fatG: 18,
          category: "Lunch",
          image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
          tags: JSON.stringify(["High Protein", "Omega-3"])
        },
        {
          name: "Beef Stir Fry",
          calories: 480,
          proteinG: 38,
          carbsG: 25,
          fatG: 22,
          category: "Lunch",
          image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
          tags: JSON.stringify(["High Protein", "Low Carb"])
        },

        // Dinner items
        {
          name: "Grilled Salmon with Vegetables",
          calories: 510,
          proteinG: 38,
          carbsG: 15,
          fatG: 32,
          category: "Dinner",
          image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400",
          tags: JSON.stringify(["Omega-3", "Heart Healthy"])
        },
        {
          name: "Chicken Stir Fry",
          calories: 420,
          proteinG: 35,
          carbsG: 28,
          fatG: 16,
          category: "Dinner",
          image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400",
          tags: JSON.stringify(["High Protein", "Low Calorie"])
        },
        {
          name: "Lentil Soup",
          calories: 280,
          proteinG: 18,
          carbsG: 45,
          fatG: 4,
          category: "Dinner",
          image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
          tags: JSON.stringify(["Vegan", "High Fiber"])
        },
        {
          name: "Grilled Steak with Potatoes",
          calories: 550,
          proteinG: 42,
          carbsG: 30,
          fatG: 28,
          category: "Dinner",
          image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
          tags: JSON.stringify(["High Protein"])
        },

        // Snack items
        {
          name: "Protein Shake",
          calories: 220,
          proteinG: 30,
          carbsG: 15,
          fatG: 3,
          category: "Snack",
          image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400",
          tags: JSON.stringify(["High Protein", "Quick"])
        },
        {
          name: "Mixed Nuts",
          calories: 180,
          proteinG: 6,
          carbsG: 6,
          fatG: 16,
          category: "Snack",
          image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
          tags: JSON.stringify(["Healthy Fats", "High Calorie"])
        },
        {
          name: "Greek Yogurt Cup",
          calories: 150,
          proteinG: 15,
          carbsG: 12,
          fatG: 2,
          category: "Snack",
          image: "https://images.unsplash.com/photo-1488477304112-4944851de03d?w=400",
          tags: JSON.stringify(["High Protein", "Low Fat"])
        },
        {
          name: "Apple with Peanut Butter",
          calories: 240,
          proteinG: 8,
          carbsG: 25,
          fatG: 14,
          category: "Snack",
          image: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400",
          tags: JSON.stringify(["Healthy Fats", "Natural"])
        },

        // Additional common foods
        {
          name: "Rice (White)",
          calories: 130,
          proteinG: 3,
          carbsG: 28,
          fatG: 0,
          category: null,
          image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
          tags: JSON.stringify(["Carb Source", "Versatile"])
        },
        {
          name: "Chicken Breast",
          calories: 165,
          proteinG: 31,
          carbsG: 0,
          fatG: 4,
          category: null,
          image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400",
          tags: JSON.stringify(["Lean Protein", "Low Fat"])
        },
        {
          name: "Banana",
          calories: 105,
          proteinG: 1,
          carbsG: 27,
          fatG: 0,
          category: null,
          image: "https://images.unsplash.com/photo-1571771019784-3ff35f4f4277?w=400",
          tags: JSON.stringify(["Natural Sugar", "Potassium"])
        },
        {
          name: "Egg (Large)",
          calories: 70,
          proteinG: 6,
          carbsG: 1,
          fatG: 5,
          category: null,
          image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400",
          tags: JSON.stringify(["Complete Protein", "Versatile"])
        },
        {
          name: "Oats",
          calories: 307,
          proteinG: 13,
          carbsG: 55,
          fatG: 6,
          category: null,
          image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400",
          tags: JSON.stringify(["High Fiber", "Beta Glucan"])
        },
        {
          name: "Milk (2%)",
          calories: 122,
          proteinG: 8,
          carbsG: 12,
          fatG: 5,
          category: null,
          image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
          tags: JSON.stringify(["Calcium", "Vitamin D"])
        },
        {
          name: "Bread (Whole Wheat)",
          calories: 81,
          proteinG: 4,
          carbsG: 14,
          fatG: 1,
          category: null,
          image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
          tags: JSON.stringify(["Whole Grain", "Fiber"])
        },
        {
          name: "Peanut Butter",
          calories: 94,
          proteinG: 4,
          carbsG: 3,
          fatG: 8,
          category: null,
          image: "https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=400",
          tags: JSON.stringify(["Healthy Fats", "Plant Protein"])
        },
        {
          name: "Apple",
          calories: 95,
          proteinG: 0,
          carbsG: 25,
          fatG: 0,
          category: null,
          image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
          tags: JSON.stringify(["Fiber", "Antioxidants"])
        }
      ],
    });
  }

  console.log("Seed completed. Demo user: john@example.com / Password123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
