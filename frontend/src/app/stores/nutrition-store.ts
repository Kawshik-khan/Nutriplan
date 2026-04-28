import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  getMeals,
  getPlannerMeals,
  addToPlanner,
  removeFromPlanner,
  getFoodLogs,
  addFoodLog,
  removeFoodLog,
  type FoodItem,
  type PlannedMeal,
  type LoggedFood
} from '../lib/api';

export type WeekDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export type DayMeals = Record<MealType, PlannedMeal[]>;
export type DayLogs = Record<MealType, LoggedFood[]>;

interface NutritionState {
  // Meals database
  meals: FoodItem[];
  mealsLoading: boolean;
  mealsError: string | null;

  // Meal planner
  plannerMeals: Record<string, DayMeals>; // date -> meals
  plannerLoading: boolean;
  plannerError: string | null;

  // Food logs
  foodLogs: Record<string, DayLogs>; // date -> logs
  foodLogsLoading: boolean;
  foodLogsError: string | null;

  // Daily nutrition totals (calculated from logs)
  dailyNutrition: Record<string, {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  }>;

  // Actions
  fetchMeals: (params?: { search?: string; category?: string; tag?: string }) => Promise<void>;
  fetchPlannerMeals: (date: string) => Promise<void>;
  addPlannerMeal: (date: string, mealType: MealType, foodItemId: number, quantity?: number) => Promise<void>;
  removePlannerMeal: (entryId: number) => Promise<void>;

  fetchFoodLogs: (date: string) => Promise<void>;
  addFoodLogEntry: (date: string, mealType: MealType, foodItemId?: number, foodName?: string, quantity?: number) => Promise<void>;
  removeFoodLogEntry: (logId: number) => Promise<void>;

  // Utility functions
  getTodayMeals: () => DayMeals;
  getTodayLogs: () => DayLogs;
  getNutritionForDate: (date: string) => { calories: number; protein: number; carbs: number; fats: number };
}

const initialDayMeals: DayMeals = {
  Breakfast: [],
  Lunch: [],
  Dinner: [],
  Snack: [],
};

const initialDayLogs: DayLogs = {
  Breakfast: [],
  Lunch: [],
  Dinner: [],
  Snack: [],
};

export const useNutritionStore = create<NutritionState>()(
  devtools(
    (set, get) => ({
      // Initial state
      meals: [],
      mealsLoading: false,
      mealsError: null,

      plannerMeals: {},
      plannerLoading: false,
      plannerError: null,

      foodLogs: {},
      foodLogsLoading: false,
      foodLogsError: null,

      dailyNutrition: {},

      // Meals actions
      fetchMeals: async (params) => {
        set({ mealsLoading: true, mealsError: null });
        try {
          const meals = await getMeals(params);
          set({ meals, mealsLoading: false });
        } catch (error) {
          set({
            mealsError: error instanceof Error ? error.message : 'Failed to fetch meals',
            mealsLoading: false
          });
        }
      },

      // Planner actions
      fetchPlannerMeals: async (date) => {
        set({ plannerLoading: true, plannerError: null });
        try {
          const dayMeals = await getPlannerMeals(date);
          set((state) => ({
            plannerMeals: { ...state.plannerMeals, [date]: dayMeals },
            plannerLoading: false,
          }));
        } catch (error) {
          set({
            plannerError: error instanceof Error ? error.message : 'Failed to fetch planner meals',
            plannerLoading: false
          });
        }
      },

      addPlannerMeal: async (date, mealType, foodItemId, quantity = 1) => {
        try {
          const newMeal = await addToPlanner({
            foodItemId,
            date,
            mealType,
            quantity,
          });

          set((state) => {
            const currentMeals = state.plannerMeals[date] || { ...initialDayMeals };
            const updatedMeals = {
              ...currentMeals,
              [mealType]: [...currentMeals[mealType], newMeal],
            };

            return {
              plannerMeals: { ...state.plannerMeals, [date]: updatedMeals },
            };
          });
        } catch (error) {
          console.error('Failed to add meal to planner:', error);
          throw error;
        }
      },

      removePlannerMeal: async (entryId) => {
        try {
          await removeFromPlanner(entryId);

          set((state) => {
            const updatedPlannerMeals = { ...state.plannerMeals };

            // Find and remove the meal from all dates
            Object.keys(updatedPlannerMeals).forEach(date => {
              const dayMeals = updatedPlannerMeals[date];
              Object.keys(dayMeals).forEach(mealType => {
                dayMeals[mealType as MealType] = dayMeals[mealType as MealType].filter(
                  meal => meal.id !== entryId
                );
              });
            });

            return { plannerMeals: updatedPlannerMeals };
          });
        } catch (error) {
          console.error('Failed to remove meal from planner:', error);
          throw error;
        }
      },

      // Food log actions
      fetchFoodLogs: async (date) => {
        set({ foodLogsLoading: true, foodLogsError: null });
        try {
          const dayLogs = await getFoodLogs(date);

          // Calculate nutrition totals for the day
          const nutrition = Object.values(dayLogs).flat().reduce(
            (acc, log) => ({
              calories: acc.calories + log.calories,
              protein: acc.protein + log.protein,
              carbs: acc.carbs + log.carbs,
              fats: acc.fats + log.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fats: 0 }
          );

          set((state) => ({
            foodLogs: { ...state.foodLogs, [date]: dayLogs },
            dailyNutrition: { ...state.dailyNutrition, [date]: nutrition },
            foodLogsLoading: false,
          }));
        } catch (error) {
          set({
            foodLogsError: error instanceof Error ? error.message : 'Failed to fetch food logs',
            foodLogsLoading: false
          });
        }
      },

      addFoodLogEntry: async (date, mealType, foodItemId, foodName, quantity = 1) => {
        try {
          const newLog = await addFoodLog({
            foodItemId,
            foodName,
            date,
            mealType,
            quantity,
          });

          set((state) => {
            const currentLogs = state.foodLogs[date] || { ...initialDayLogs };
            const updatedLogs = {
              ...currentLogs,
              [mealType]: [...currentLogs[mealType], newLog],
            };

            // Recalculate nutrition
            const nutrition = Object.values(updatedLogs).flat().reduce(
              (acc, log) => ({
                calories: acc.calories + log.calories,
                protein: acc.protein + log.protein,
                carbs: acc.carbs + log.carbs,
                fats: acc.fats + log.fat,
              }),
              { calories: 0, protein: 0, carbs: 0, fats: 0 }
            );

            return {
              foodLogs: { ...state.foodLogs, [date]: updatedLogs },
              dailyNutrition: { ...state.dailyNutrition, [date]: nutrition },
            };
          });
        } catch (error) {
          console.error('Failed to add food log entry:', error);
          throw error;
        }
      },

      removeFoodLogEntry: async (logId) => {
        try {
          await removeFoodLog(logId);

          set((state) => {
            const updatedFoodLogs = { ...state.foodLogs };

            // Find and remove the log from all dates
            Object.keys(updatedFoodLogs).forEach(date => {
              const dayLogs = updatedFoodLogs[date];
              Object.keys(dayLogs).forEach(mealType => {
                dayLogs[mealType as MealType] = dayLogs[mealType as MealType].filter(
                  log => log.id !== logId
                );
              });
            });

            // Recalculate nutrition for affected dates
            const updatedNutrition = { ...state.dailyNutrition };
            Object.keys(updatedFoodLogs).forEach(date => {
              const nutrition = Object.values(updatedFoodLogs[date]).flat().reduce(
                (acc, log) => ({
                  calories: acc.calories + log.calories,
                  protein: acc.protein + log.protein,
                  carbs: acc.carbs + log.carbs,
                  fats: acc.fats + log.fat,
                }),
                { calories: 0, protein: 0, carbs: 0, fats: 0 }
              );
              updatedNutrition[date] = nutrition;
            });

            return {
              foodLogs: updatedFoodLogs,
              dailyNutrition: updatedNutrition,
            };
          });
        } catch (error) {
          console.error('Failed to remove food log entry:', error);
          throw error;
        }
      },

      // Utility functions
      getTodayMeals: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().plannerMeals[today] || { ...initialDayMeals };
      },

      getTodayLogs: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().foodLogs[today] || { ...initialDayLogs };
      },

      getNutritionForDate: (date) => {
        return get().dailyNutrition[date] || { calories: 0, protein: 0, carbs: 0, fats: 0 };
      },
    }),
    {
      name: 'nutrition-store',
    }
  )
);