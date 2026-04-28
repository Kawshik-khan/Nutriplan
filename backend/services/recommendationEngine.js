import { prisma } from '../db.js';

class RecommendationEngine {
  // Get nutrition recommendations based on user data
  static async getNutritionRecommendations(userId) {
    try {
      // Get user's recent food logs
      const foodLogs = await this.getUserFoodLogs(userId, 7); // Last 7 days
      const nutritionGoals = await this.getUserNutritionGoals(userId);
      const preferences = await this.getUserPreferences(userId);
      
      const recommendations = [];
      
      // Analyze protein intake
      const proteinAnalysis = this.analyzeProteinIntake(foodLogs, nutritionGoals);
      if (proteinAnalysis.needsIncrease) {
        recommendations.push({
          id: 'protein_increase',
          type: 'nutrition',
          title: 'Increase Protein Intake',
          description: `Based on your activity levels, you should aim for ${proteinAnalysis.recommendedIncrease}g more protein daily. Current average: ${proteinAnalysis.currentAverage}g`,
          icon: 'Zap',
          color: 'bg-[#DBEAFE] text-[#2563EB]',
          tag: 'Nutrition',
          priority: 'high',
          data: proteinAnalysis
        });
      }
      
      // Analyze meal timing
      const mealTimingAnalysis = this.analyzeMealTiming(foodLogs);
      if (mealTimingAnalysis.needsImprovement) {
        recommendations.push({
          id: 'meal_timing',
          type: 'lifestyle',
          title: 'Meal Timing',
          description: mealTimingAnalysis.recommendation,
          icon: 'Salad',
          color: 'bg-[#DCFCE7] text-[#16A34A]',
          tag: 'Lifestyle',
          priority: 'medium',
          data: mealTimingAnalysis
        });
      }
      
      // Analyze hydration
      const hydrationAnalysis = this.analyzeHydration(foodLogs, nutritionGoals);
      if (hydrationAnalysis.needsImprovement) {
        recommendations.push({
          id: 'hydration_goal',
          type: 'habits',
          title: 'Hydration Goal',
          description: hydrationAnalysis.recommendation,
          icon: 'Target',
          color: 'bg-[#E0F2FE] text-[#0EA5E9]',
          tag: 'Habits',
          priority: 'medium',
          data: hydrationAnalysis
        });
      }
      
      return recommendations;
    } catch (error) {
      console.error('Error generating nutrition recommendations:', error);
      return [];
    }
  }
  
  // Get suggested meals based on user preferences and goals
  static async getSuggestedMeals(userId) {
    try {
      const preferences = await this.getUserPreferences(userId);
      const nutritionGoals = await this.getUserNutritionGoals(userId);
      const recentMeals = await this.getRecentMeals(userId);
      
      // Mock meal database - in real implementation, this would come from database
      const allMeals = [
        {
          id: 1,
          name: 'Quinoa Buddha Bowl',
          calories: 380,
          protein: 18,
          carbs: 45,
          fat: 12,
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
          tags: ['vegetarian', 'high-protein', 'balanced'],
          dietaryTypes: ['vegetarian', 'gluten-free']
        },
        {
          id: 2,
          name: 'Grilled Salmon with Asparagus',
          calories: 450,
          protein: 42,
          carbs: 12,
          fat: 28,
          image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
          tags: ['high-protein', 'keto-friendly', 'omega-3'],
          dietaryTypes: ['pescatarian', 'gluten-free']
        },
        {
          id: 3,
          name: 'Chicken Stir-Fry',
          calories: 420,
          protein: 35,
          carbs: 38,
          fat: 18,
          image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
          tags: ['high-protein', 'quick-meal', 'balanced'],
          dietaryTypes: ['gluten-free']
        },
        {
          id: 4,
          name: 'Mediterranean Salad',
          calories: 320,
          protein: 15,
          carbs: 28,
          fat: 18,
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
          tags: ['light', 'fresh', 'mediterranean'],
          dietaryTypes: ['vegetarian', 'gluten-free', 'vegan']
        }
      ];
      
      // Filter and score meals based on user preferences and goals
      const scoredMeals = allMeals.map(meal => ({
        ...meal,
        score: this.calculateMealScore(meal, preferences, nutritionGoals, recentMeals)
      }));
      
      // Sort by score and return top suggestions
      scoredMeals.sort((a, b) => b.score - a.score);
      
      return scoredMeals.slice(0, 6).map(meal => ({
        ...meal,
        reason: this.getMealRecommendationReason(meal, preferences, nutritionGoals)
      }));
    } catch (error) {
      console.error('Error generating meal suggestions:', error);
      return [];
    }
  }
  
  // Calculate meal score based on user preferences and goals
  static calculateMealScore(meal, preferences, goals, recentMeals) {
    let score = 0;
    
    // Nutrition alignment (40% weight)
    if (goals.proteinGoal && meal.protein >= goals.proteinGoal * 0.3) score += 40;
    if (goals.calorieGoal && meal.calories <= goals.calorieGoal * 0.4) score += 20;
    
    // Preference matching (30% weight)
    if (preferences.preferredMealTypes) {
      preferences.preferredMealTypes.forEach(pref => {
        if (meal.tags.includes(pref)) score += 10;
      });
    }
    
    // Dietary restrictions (20% weight)
    if (preferences.dietaryRestrictions) {
      const hasRestrictedIngredient = preferences.dietaryRestrictions.some(restriction => 
        !meal.dietaryTypes.includes(restriction)
      );
      if (!hasRestrictedIngredient) score += 20;
    }
    
    // Variety bonus (10% weight)
    const recentlyEaten = recentMeals.some(recent => recent.name === meal.name);
    if (!recentlyEaten) score += 10;
    
    return score;
  }
  
  // Get reason for meal recommendation
  static getMealRecommendationReason(meal, preferences, goals) {
    const reasons = [];
    
    if (goals.proteinGoal && meal.protein >= goals.proteinGoal * 0.3) {
      reasons.push('High in protein');
    }
    
    if (preferences.preferredMealTypes) {
      preferences.preferredMealTypes.forEach(pref => {
        if (meal.tags.includes(pref)) reasons.push(`Matches your ${pref} preference`);
      });
    }
    
    return reasons.join(' • ') || 'Balanced nutrition option';
  }
  
  // Analyze protein intake
  static analyzeProteinIntake(foodLogs, goals) {
    const dailyProtein = this.calculateDailyAverages(foodLogs, 'protein');
    const currentAverage = dailyProtein.reduce((sum, day) => sum + day, 0) / dailyProtein.length;
    const targetProtein = goals.proteinGoal || 150; // Default goal
    
    return {
      currentAverage: Math.round(currentAverage),
      targetProtein,
      needsIncrease: currentAverage < targetProtein * 0.8,
      recommendedIncrease: Math.round(targetProtein - currentAverage)
    };
  }
  
  // Analyze meal timing
  static analyzeMealTiming(foodLogs) {
    // Group meals by time of day
    const mealTimes = foodLogs.map(log => {
      const time = new Date(log.created_at).getHours();
      return time;
    });
    
    const lateMeals = mealTimes.filter(time => time >= 20).length;
    const totalMeals = mealTimes.length;
    
    return {
      needsImprovement: lateMeals / totalMeals > 0.3,
      recommendation: lateMeals / totalMeals > 0.3 
        ? 'Consider having your largest meal before 2 PM to improve metabolic rate.'
        : 'Your meal timing looks good!'
    };
  }
  
  // Analyze hydration
  static analyzeHydration(foodLogs, goals) {
    // This is a simplified analysis - in real implementation, track water intake
    const waterGoal = goals.waterGoal || 8; // Default 8 glasses
    const estimatedIntake = Math.floor(Math.random() * 6) + 3; // Mock data
    
    return {
      needsImprovement: estimatedIntake < waterGoal * 0.8,
      recommendation: estimatedIntake < waterGoal * 0.8
        ? `You've been consistently meeting ${Math.round((estimatedIntake / waterGoal) * 100)}% of your water goal. Aim for ${waterGoal} glasses.`
        : 'Great job staying hydrated!'
    };
  }
  
  // Helper methods
  static async getUserFoodLogs(userId, days) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      const query = `
        SELECT fl.*, f.name, f.protein, f.calories, f.carbs, f.fat
        FROM food_log fl
        JOIN food_items f ON fl.food_item_id = f.id
        WHERE fl.user_id = ? AND fl.date >= ? AND fl.date <= ?
        ORDER BY fl.date DESC, fl.created_at DESC
      `;
      
      const foodLogs = await prisma.$queryRawUnsafe(query, [userId, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);
      return foodLogs;
    } catch (error) {
      console.error('Error fetching user food logs:', error);
      return [];
    }
  }
  
  static async getUserNutritionGoals(userId) {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });
      
      return {
        proteinGoal: user.protein_goal || 150,
        calorieGoal: user.calorie_goal || 2000,
        waterGoal: user.water_goal || 8
      };
    } catch (error) {
      console.error('Error fetching nutrition goals:', error);
      return {
        proteinGoal: 150,
        calorieGoal: 2000,
        waterGoal: 8
      };
    }
  }
  
  static async getUserPreferences(userId) {
    try {
      const preferences = await prisma.user_preferences.findFirst({
        where: { user_id: userId }
      });
      
      if (preferences) {
        return {
          dietaryRestrictions: preferences.dietary_restrictions || [],
          preferredMealTypes: preferences.preferred_meal_types || [],
          dislikedFoods: preferences.disliked_foods || []
        };
      }
      
      // Default preferences
      return {
        dietaryRestrictions: [],
        preferredMealTypes: ['high-protein', 'balanced'],
        dislikedFoods: []
      };
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return {
        dietaryRestrictions: [],
        preferredMealTypes: ['high-protein', 'balanced'],
        dislikedFoods: []
      };
    }
  }
  
  static async getRecentMeals(userId) {
    try {
      const recentMeals = await prisma.planner_meals.findMany({
        where: { user_id: userId },
        include: {
          food_items: {
            select: {
              name: true,
              calories: true,
              protein: true
            }
          }
        },
        orderBy: { created_at: 'desc' },
        take: 10
      });
      
      return recentMeals.map(meal => meal.food_items);
    } catch (error) {
      console.error('Error fetching recent meals:', error);
      return [];
    }
  }
  
  static calculateDailyAverages(foodLogs, nutrient) {
    // Group by date and calculate daily totals
    const dailyTotals = {};
    
    foodLogs.forEach(log => {
      const date = log.date;
      if (!dailyTotals[date]) {
        dailyTotals[date] = 0;
      }
      dailyTotals[date] += log[nutrient] || 0;
    });
    
    // Return array of daily values
    return Object.values(dailyTotals);
  }
  
  // Feedback and preference methods
  static async saveFeedback(userId, recommendationId, feedbackType, notes) {
    // Save feedback to database
    console.log(`User ${userId} provided feedback: ${feedbackType} for recommendation ${recommendationId}`);
  }
  
  static async updateUserPreferences(userId, preferences) {
    // Update user preferences in database
    console.log(`Updated preferences for user ${userId}:`, preferences);
  }
  
  static async markAsViewed(userId, recommendationId) {
    // Mark recommendation as viewed in database
    console.log(`User ${userId} viewed recommendation ${recommendationId}`);
  }
}

export default RecommendationEngine;
