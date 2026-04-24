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
