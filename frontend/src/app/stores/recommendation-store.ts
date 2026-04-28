import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types
export interface Recommendation {
  id: string;
  type: 'nutrition' | 'lifestyle' | 'habits';
  title: string;
  description: string;
  icon: string;
  color: string;
  tag: string;
  priority: 'high' | 'medium' | 'low';
  data?: any;
  isViewed?: boolean;
}

export interface SuggestedMeal {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image: string;
  tags: string[];
  dietaryTypes: string[];
  score: number;
  reason: string;
}

export interface UserPreferences {
  dietaryRestrictions: string[];
  preferredMealTypes: string[];
  dislikedFoods: string[];
}

export interface NutritionGoals {
  proteinGoal: number;
  calorieGoal: number;
  waterGoal: number;
}

export type FeedbackType = 'helpful' | 'not_helpful' | 'implemented';

interface RecommendationStore {
  // State
  recommendations: Recommendation[];
  suggestedMeals: SuggestedMeal[];
  userPreferences: UserPreferences;
  nutritionGoals: NutritionGoals;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchRecommendations: () => Promise<void>;
  fetchSuggestedMeals: () => Promise<void>;
  fetchUserPreferences: () => Promise<void>;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  markAsViewed: (recommendationId: string) => Promise<void>;
  provideFeedback: (recommendationId: string, feedbackType: FeedbackType, notes?: string) => Promise<void>;
  addToMealPlan: (meal: SuggestedMeal) => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  clearError: () => void;
}

const API_BASE = '/api/recommendations';

export const useRecommendationStore = create<RecommendationStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      recommendations: [],
      suggestedMeals: [],
      userPreferences: {
        dietaryRestrictions: [],
        preferredMealTypes: [],
        dislikedFoods: []
      },
      nutritionGoals: {
        proteinGoal: 150,
        calorieGoal: 2000,
        waterGoal: 8
      },
      loading: false,
      error: null,

      // Fetch nutrition recommendations
      fetchRecommendations: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE}/nutrition`);
          if (!response.ok) {
            throw new Error('Failed to fetch recommendations');
          }
          
          const data = await response.json();
          set({ recommendations: data, loading: false });
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false });
        }
      },

      // Fetch suggested meals
      fetchSuggestedMeals: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`${API_BASE}/meals`);
          if (!response.ok) {
            throw new Error('Failed to fetch meal suggestions');
          }
          
          const data = await response.json();
          set({ suggestedMeals: data, loading: false });
        } catch (error) {
          console.error('Error fetching meal suggestions:', error);
          set({ error: error instanceof Error ? error.message : 'An error occurred', loading: false });
        }
      },

      // Fetch user preferences
      fetchUserPreferences: async () => {
        try {
          const response = await fetch(`${API_BASE}/preferences`);
          if (!response.ok) {
            throw new Error('Failed to fetch preferences');
          }
          
          const data = await response.json();
          set({ userPreferences: data });
        } catch (error) {
          console.error('Error fetching preferences:', error);
          // Don't set error for preferences - it's not critical
        }
      },

      // Update user preferences
      updateUserPreferences: async (preferences) => {
        try {
          const response = await fetch(`${API_BASE}/preferences`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences),
          });
          
          if (!response.ok) {
            throw new Error('Failed to update preferences');
          }
          
          // Update local state
          set(state => ({
            userPreferences: { ...state.userPreferences, ...preferences }
          }));
          
          // Refresh recommendations with new preferences
          get().fetchRecommendations();
          get().fetchSuggestedMeals();
        } catch (error) {
          console.error('Error updating preferences:', error);
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        }
      },

      // Mark recommendation as viewed
      markAsViewed: async (recommendationId) => {
        try {
          await fetch(`${API_BASE}/viewed/${recommendationId}`, {
            method: 'POST',
          });
          
          // Update local state
          set(state => ({
            recommendations: state.recommendations.map(rec =>
              rec.id === recommendationId ? { ...rec, isViewed: true } : rec
            )
          }));
        } catch (error) {
          console.error('Error marking as viewed:', error);
        }
      },

      // Provide feedback on recommendation
      provideFeedback: async (recommendationId, feedbackType, notes) => {
        try {
          const response = await fetch(`${API_BASE}/feedback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recommendationId, feedbackType, notes }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to save feedback');
          }
        } catch (error) {
          console.error('Error providing feedback:', error);
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        }
      },

      // Add meal to meal plan
      addToMealPlan: async (meal) => {
        try {
          // Get today's date
          const today = new Date().toISOString().split('T')[0];
          const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
          
          // Get CSRF token from cookies
          const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return undefined;
          };
          
          const csrfToken = getCookie('csrf_secret');
          
          // Add to meal planner using existing API
          const response = await fetch('/api/planner', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(csrfToken && { 'x-csrf-token': csrfToken }),
            },
            body: JSON.stringify({
              foodItemId: meal.id,
              date: today,
              mealType: 'Lunch', // Default to lunch, could be enhanced
              quantity: 1
            }),
          });
          
          if (!response.ok) {
            throw new Error('Failed to add meal to plan');
          }
          
          // Show success feedback (could be enhanced with toast notification)
          console.log(`Added ${meal.name} to meal plan`);
        } catch (error) {
          console.error('Error adding meal to plan:', error);
          set({ error: error instanceof Error ? error.message : 'An error occurred' });
        }
      },

      // Refresh all recommendations
      refreshRecommendations: async () => {
        await Promise.all([
          get().fetchRecommendations(),
          get().fetchSuggestedMeals(),
        ]);
      },

      // Clear error
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'recommendation-store',
    }
  )
);
