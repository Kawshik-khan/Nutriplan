import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate AI meal recommendations based on user profile and goals
 */
export async function generateMealRecommendations(userProfile, preferences = {}) {
  try {
    const prompt = `
      Generate a personalized meal plan for a user with the following profile:
      - Age: ${userProfile.age || 'Not specified'}
      - Weight: ${userProfile.weightKg || 'Not specified'} kg
      - Height: ${userProfile.heightCm || 'Not specified'} cm
      - Goal: ${userProfile.goal || 'Maintain weight'}
      - Dietary Preferences: ${userProfile.preferences?.join(', ') || 'None'}
      - Allergies: ${userProfile.allergies?.join(', ') || 'None'}
      
      Preferences: ${JSON.stringify(preferences)}
      
      Please provide 3 meal recommendations (breakfast, lunch, dinner) in JSON format:
      {
        "recommendations": [
          {
            "mealType": "breakfast",
            "title": "...",
            "description": "...",
            "calories": 400,
            "protein": 25,
            "carbs": 45,
            "fat": 15,
            "ingredients": ["..."],
            "prepTime": "15 min",
            "cookingInstructions": "..."
          }
        ],
        "dailyTotals": {
          "calories": 0,
          "protein": 0,
          "carbs": 0,
          "fat": 0
        },
        "aiInsights": "Brief insights about the recommendations"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a professional nutritionist AI assistant. Provide healthy, balanced meal recommendations with accurate nutritional information. Always respond in valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("AI Meal Recommendation Error:", error);
    return generateFallbackRecommendations(userProfile);
  }
}

/**
 * Generate nutrition insights based on user's eating patterns
 */
export async function generateNutritionInsights(userData, recentMeals) {
  try {
    const prompt = `
      Analyze the following user data and provide personalized nutrition insights:
      
      User Goals: ${userData.goal}
      Recent Meals: ${JSON.stringify(recentMeals)}
      Daily Targets: ${JSON.stringify(userData.targets)}
      
      Provide insights in JSON format:
      {
        "insights": [
          {
            "type": "improvement|achievement|suggestion",
            "title": "...",
            "description": "...",
            "priority": "high|medium|low"
          }
        ],
        "recommendations": [
          "..."
        ],
        "overallScore": 85
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a nutrition analysis AI. Provide personalized, actionable insights based on eating patterns and health goals. Be encouraging and constructive."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("AI Nutrition Insight Error:", error);
    return generateFallbackInsights();
  }
}

/**
 * Generate a shopping list based on meal plan
 */
export async function generateShoppingList(meals) {
  try {
    const prompt = `
      Create a consolidated shopping list from these meals:
      ${JSON.stringify(meals)}
      
      Return JSON format:
      {
        "categories": [
          {
            "name": "Produce",
            "items": [
              {
                "name": "...",
                "quantity": "...",
                "estimatedPrice": 3.50
              }
            ]
          }
        ],
        "totalEstimatedCost": 45.00,
        "storeRecommendations": ["Whole Foods", "Trader Joe's"]
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a meal planning AI. Create organized shopping lists with realistic estimates."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("AI Shopping List Error:", error);
    return { categories: [], totalEstimatedCost: 0 };
  }
}

// Fallback functions if AI is not available
function generateFallbackRecommendations(userProfile) {
  return {
    recommendations: [
      {
        mealType: "breakfast",
        title: "Greek Yogurt Parfait",
        description: "A balanced breakfast with protein and fiber",
        calories: 350,
        protein: 20,
        carbs: 40,
        fat: 12,
        ingredients: ["Greek yogurt", "Granola", "Mixed berries", "Honey"],
        prepTime: "5 min",
        cookingInstructions: "Layer yogurt, granola, and berries in a bowl. Drizzle with honey."
      },
      {
        mealType: "lunch",
        title: "Grilled Chicken Salad",
        description: "Lean protein with fresh vegetables",
        calories: 450,
        protein: 40,
        carbs: 25,
        fat: 18,
        ingredients: ["Chicken breast", "Mixed greens", "Cherry tomatoes", "Cucumber", "Olive oil"],
        prepTime: "15 min",
        cookingInstructions: "Grill chicken, chop vegetables, toss with olive oil."
      },
      {
        mealType: "dinner",
        title: "Salmon with Quinoa",
        description: "Omega-3 rich dinner with complex carbs",
        calories: 550,
        protein: 35,
        carbs: 45,
        fat: 22,
        ingredients: ["Salmon fillet", "Quinoa", "Broccoli", "Lemon", "Olive oil"],
        prepTime: "25 min",
        cookingInstructions: "Cook quinoa, bake salmon with lemon, steam broccoli."
      }
    ],
    dailyTotals: {
      calories: 1350,
      protein: 95,
      carbs: 110,
      fat: 52
    },
    aiInsights: "These balanced meals provide sustained energy throughout the day."
  };
}

function generateFallbackInsights() {
  return {
    insights: [
      {
        type: "suggestion",
        title: "Add more vegetables",
        description: "Try to include at least 5 servings of vegetables daily.",
        priority: "medium"
      },
      {
        type: "achievement",
        title: "Good hydration",
        description: "You're staying well-hydrated. Keep it up!",
        priority: "low"
      }
    ],
    recommendations: [
      "Meal prep on Sundays",
      "Keep healthy snacks available",
      "Track water intake"
    ],
    overallScore: 75
  };
}
