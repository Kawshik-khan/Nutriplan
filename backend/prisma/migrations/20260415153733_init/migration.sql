-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "age" INTEGER,
    "heightCm" REAL,
    "weightKg" REAL,
    "goal" TEXT,
    "preferences" TEXT,
    "allergies" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Meal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "mealType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "image" TEXT,
    "proteinG" INTEGER NOT NULL,
    "carbsG" INTEGER NOT NULL,
    "fatG" INTEGER NOT NULL,
    "calories" INTEGER NOT NULL,
    "tags" TEXT,
    "eatenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Meal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NutritionStat" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "caloriesGoal" INTEGER NOT NULL DEFAULT 2000,
    "caloriesTaken" INTEGER NOT NULL DEFAULT 0,
    "proteinGoalG" INTEGER NOT NULL DEFAULT 150,
    "proteinTakenG" INTEGER NOT NULL DEFAULT 0,
    "carbsGoalG" INTEGER NOT NULL DEFAULT 225,
    "carbsTakenG" INTEGER NOT NULL DEFAULT 0,
    "fatsGoalG" INTEGER NOT NULL DEFAULT 67,
    "fatsTakenG" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "NutritionStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WaterLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "amountMl" INTEGER NOT NULL DEFAULT 250,
    "loggedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WaterLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeightLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "weightKg" REAL NOT NULL,
    "loggedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WeightLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Meal_userId_eatenAt_idx" ON "Meal"("userId", "eatenAt");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionStat_userId_date_key" ON "NutritionStat"("userId", "date");

-- CreateIndex
CREATE INDEX "WaterLog_userId_loggedAt_idx" ON "WaterLog"("userId", "loggedAt");

-- CreateIndex
CREATE INDEX "WeightLog_userId_loggedAt_idx" ON "WeightLog"("userId", "loggedAt");
