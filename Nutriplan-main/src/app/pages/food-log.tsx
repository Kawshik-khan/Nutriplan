import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { useMealPlan, MealType, WeekDay } from "../contexts/meal-context";
import { Skeleton } from "../components/ui/skeleton";
import { 
  Plus, 
  Search, 
  Clock, 
  Zap, 
  Utensils, 
  Camera,
  X,
  ChevronRight
} from "lucide-react";

const FOOD_LIST = [
  { name: "Grilled Chicken Bowl", calories: 450, protein: 42, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" },
  { name: "Oatmeal + Banana", calories: 320, protein: 8, image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400" },
  { name: "Avocado Toast", calories: 280, protein: 12, image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400" },
  { name: "Protein Shake", calories: 220, protein: 30, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400" },
  { name: "Greek Yogurt", calories: 150, protein: 15, image: "https://images.unsplash.com/photo-1618798513386-fedeb5c30d39?w=400" },
  { name: "Brown Rice", calories: 216, protein: 5, image: "https://images.unsplash.com/photo-1536254263969-2a6da6c3ac53?w=400" },
];

const TODAY_MEALS = [
  {
    type: "Breakfast",
    meals: [
      { name: "Oatmeal with Berries", calories: 320, protein: 8, time: "8:30 AM" },
      { name: "Greek Yogurt", calories: 150, protein: 15, time: "8:45 AM" }
    ]
  },
  {
    type: "Lunch", 
    meals: [
      { name: "Grilled Chicken Salad", calories: 450, protein: 42, time: "12:30 PM" },
      { name: "Apple", calories: 95, protein: 0, time: "1:00 PM" }
    ]
  },
  {
    type: "Snack",
    meals: [
      { name: "Protein Shake", calories: 220, protein: 30, time: "3:30 PM" }
    ]
  },
  {
    type: "Dinner",
    meals: []
  }
];

export function FoodLog() {
  const { addMeal, weeklyPlan } = useMealPlan();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }) as WeekDay;

  const handleAddFood = (food: typeof FOOD_LIST[0]) => {
    // Add to today's log logic here
    setIsAddFoodOpen(false);
  };

  // Mock foodLogs data - in real app this would come from API/hook
  // const { data: foodLogs, isLoading } = useFoodLogs();
  const foodLogs: any = null; // Simulating undefined/null state that causes the error
  
  // Normalize foodLogs to safe array with all possible data shapes
  const safeFoodLogs = 
    Array.isArray(foodLogs)
      ? foodLogs
      : Array.isArray((foodLogs as any)?.logs)
      ? (foodLogs as any).logs
      : Array.isArray((foodLogs as any)?.data)
      ? (foodLogs as any).data
      : [];

  // Debug log to check actual response shape
  console.log('foodLogs shape:', foodLogs);
  console.log('safeFoodLogs:', safeFoodLogs);

  // Add safety check for FOOD_LIST
  const safeFoodList = Array.isArray(FOOD_LIST) ? FOOD_LIST : [];
  const filteredFoods = safeFoodList.filter(f => 
    f && f.name && f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get today's meals from the meal plan with safety checks
  const getTodayMeals = () => {
    const safeWeeklyPlan = weeklyPlan || {};
    const todayMeals = safeWeeklyPlan[today] || {};
    
    return [
      { type: "Breakfast", meals: todayMeals.Breakfast || [] },
      { type: "Lunch", meals: todayMeals.Lunch || [] },
      { type: "Snack", meals: todayMeals.Snack || [] },
      { type: "Dinner", meals: todayMeals.Dinner || [] }
    ];
  };

  const todayMealsData = getTodayMeals();
  const allMeals = todayMealsData.flatMap(group => group.meals);
  
  const totalCalories = allMeals.reduce((sum, meal) => sum + (meal?.calories || 0), 0);
  const totalProtein = allMeals.reduce((sum, meal) => sum + (meal?.protein || 0), 0);
  const totalMeals = allMeals.length;

  // Loading protection
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Food Log</h1>
            <p className="text-gray-600 mt-1">Track your daily food intake</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-white border border-gray-200 rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Calories</p>
                    <p className="text-xl font-bold text-gray-900">{totalCalories.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-gray-200 rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Protein</p>
                    <p className="text-xl font-bold text-gray-900">{totalProtein}g</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white border border-gray-200 rounded-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Meals</p>
                    <p className="text-xl font-bold text-gray-900">{totalMeals}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Meals */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Today's meals</h2>
            
            {todayMealsData.map((mealGroup) => (
              <div key={mealGroup.type} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-gray-400" />
                  <h3 className="font-medium text-gray-900">{mealGroup.type}</h3>
                  <span className="text-sm text-gray-500">
                    ({mealGroup.meals.reduce((sum, meal) => sum + (meal?.calories || 0), 0)} cal)
                  </span>
                </div>
                
                <div className="space-y-2">
                  {mealGroup.meals.map((meal, index) => (
                    <Card key={meal?.id || index} className="bg-white border border-gray-200 rounded-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Utensils className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{meal?.name || 'Unknown meal'}</h4>
                              <p className="text-sm text-gray-500">Logged today</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">{meal?.calories || 0}</p>
                            <p className="text-xs text-gray-500">calories</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {mealGroup.meals.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No {mealGroup.type.toLowerCase()} logged yet
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Food Panel */}
        <div className="lg:col-span-1">
          <Card className="bg-white border border-gray-200 rounded-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Add Food</h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setIsAddFoodOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search foods..." 
                  className="pl-10 h-10 border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mb-6">
                <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                  <Camera className="w-4 h-4 mr-2" />
                  Scan Barcode
                </Button>
                <Button variant="outline" className="w-full border-gray-200">
                  <Plus className="w-4 h-4 mr-2" />
                  Custom Food
                </Button>
              </div>

              {/* Recent Foods */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Recent foods</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredFoods.map((food, index) => (
                    <div 
                      key={index}
                      onClick={() => handleAddFood(food)}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 cursor-pointer transition-colors"
                    >
                      <img src={food.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{food.name}</p>
                        <p className="text-xs text-gray-500">{food.calories} cal • {food.protein}g protein</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
