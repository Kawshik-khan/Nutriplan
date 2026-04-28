import { createContext, useContext, ReactNode } from "react";
import { useNutritionStore, type WeekDay, type MealType, type DayMeals } from "../stores/nutrition-store";

export type {
  WeekDay,
  MealType,
  DayMeals,
};

export interface MealItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  image?: string;
  tags?: string[];
}

export type WeeklyPlan = Record<WeekDay, DayMeals>;

interface MealContextType {
  weeklyPlan: WeeklyPlan;
  addMeal: (day: WeekDay, mealType: MealType, meal: MealItem) => Promise<void>;
  removeMeal: (day: WeekDay, mealType: MealType, mealId: string) => Promise<void>;
  getMeals: (day: WeekDay) => DayMeals;
  getTodayMeals: () => DayMeals;
  clearDay: (day: WeekDay) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const MealContext = createContext<MealContextType | undefined>(undefined);

export function MealProvider({ children }: { children: ReactNode }) {
  const {
    plannerMeals,
    addPlannerMeal,
    removePlannerMeal,
    fetchPlannerMeals,
    plannerLoading,
    plannerError,
  } = useNutritionStore();

  // Convert date-based storage to week-based for backward compatibility
  const getWeeklyPlan = (): WeeklyPlan => {
    const plan: WeeklyPlan = {
      Monday: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
      Tuesday: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
      Wednesday: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
      Thursday: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
      Friday: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
      Saturday: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
      Sunday: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
    };

    // Get current week dates
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1); // Start of week (Monday)

    const weekDays: WeekDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayMeals = plannerMeals[dateStr];

      if (dayMeals) {
        weekDays.forEach(dayName => {
          if (i === weekDays.indexOf(dayName)) {
            plan[dayName] = dayMeals;
          }
        });
      }
    }

    return plan;
  };

  const addMeal = async (day: WeekDay, mealType: MealType, meal: MealItem) => {
    // Convert day name to date
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const weekDays: WeekDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dayIndex = weekDays.indexOf(day);
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + dayIndex);
    const dateStr = targetDate.toISOString().split('T')[0];

    await addPlannerMeal(dateStr, mealType, parseInt(meal.id), 1);
    // Refresh the data
    await fetchPlannerMeals(dateStr);
  };

  const removeMeal = async (day: WeekDay, mealType: MealType, mealId: string) => {
    await removePlannerMeal(parseInt(mealId));

    // Refresh current week's data
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      await fetchPlannerMeals(dateStr);
    }
  };

  const getMeals = (day: WeekDay) => {
    const plan = getWeeklyPlan();
    return plan[day];
  };

  const getTodayMeals = () => {
    const days: WeekDay[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayIndex = new Date().getDay();
    const today = days[todayIndex];
    const plan = getWeeklyPlan();
    return plan[today];
  };

  const clearDay = async (day: WeekDay) => {
    // Get all meals for this day and remove them
    const dayMeals = getMeals(day);
    const allMeals = Object.values(dayMeals).flat();

    for (const meal of allMeals) {
      await removePlannerMeal(meal.id);
    }

    // Refresh data
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const weekDays: WeekDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dayIndex = weekDays.indexOf(day);
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + dayIndex);
    const dateStr = targetDate.toISOString().split('T')[0];
    await fetchPlannerMeals(dateStr);
  };

  const contextValue: MealContextType = {
    weeklyPlan: getWeeklyPlan(),
    addMeal,
    removeMeal,
    getMeals,
    getTodayMeals,
    clearDay,
    isLoading: plannerLoading,
    error: plannerError,
  };

  return (
    <MealContext.Provider value={contextValue}>
      {children}
    </MealContext.Provider>
  );
}

export function useMealPlan() {
  const context = useContext(MealContext);
  if (!context) {
    throw new Error("useMealPlan must be used within MealProvider");
  }
  return context;
}