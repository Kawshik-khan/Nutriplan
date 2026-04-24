import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type WeekDay =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

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

export type DayMeals = Record<MealType, MealItem[]>;

export type WeeklyPlan = Record<WeekDay, DayMeals>;

interface MealContextType {
  weeklyPlan: WeeklyPlan;
  addMeal: (day: WeekDay, mealType: MealType, meal: MealItem) => void;
  removeMeal: (day: WeekDay, mealType: MealType, mealId: string) => void;
  getMeals: (day: WeekDay) => DayMeals;
  getTodayMeals: () => DayMeals;
  clearDay: (day: WeekDay) => void;
}

const STORAGE_KEY = "nutriplan_meal_plan";

const initialPlan: WeeklyPlan = {
  Monday: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
  Tuesday: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
  Wednesday: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
  Thursday: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
  Friday: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
  Saturday: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
  Sunday: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
};

const MealContext = createContext<MealContextType | undefined>(undefined);

export function MealProvider({ children }: { children: ReactNode }) {
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse meal plan from localStorage", e);
      }
    }
    return initialPlan;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  const addMeal = (day: WeekDay, mealType: MealType, meal: MealItem) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: [...prev[day][mealType], meal],
      },
    }));
  };

  const removeMeal = (day: WeekDay, mealType: MealType, mealId: string) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: prev[day][mealType].filter((m) => m.id !== mealId),
      },
    }));
  };

  const getMeals = (day: WeekDay) => {
    return weeklyPlan[day];
  };

  const getTodayMeals = () => {
    const days: WeekDay[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayIndex = new Date().getDay();
    const today = days[todayIndex];
    return weeklyPlan[today];
  };

  const clearDay = (day: WeekDay) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      [day]: { Breakfast: [], Lunch: [], Dinner: [], Snack: [] },
    }));
  };

  return (
    <MealContext.Provider value={{ weeklyPlan, addMeal, removeMeal, getMeals, getTodayMeals, clearDay }}>
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