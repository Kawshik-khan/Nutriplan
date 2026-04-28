import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { useMealPlan, MealType, WeekDay } from "../contexts/meal-context";
import { useNutritionStore } from "../stores/nutrition-store";
import { 
  Plus, 
  Search, 
  Clock, 
  Zap, 
  Utensils, 
  Check,
  ChevronRight,
  Flame,
  ScanBarcode,
  MoreVertical,
  Loader2,
  Salad,
  Calendar,
  X
} from "lucide-react";
import { Switch } from "../components/ui/switch";

export default function FoodLog() {
  const { addMeal } = useMealPlan();
  const { 
    foodLogs, 
    foodLogsLoading, 
    foodLogsError, 
    fetchFoodLogs, 
    addFoodLogEntry,
    meals,
    fetchMeals,
    addPlannerMeal,
    fetchPlannerMeals
  } = useNutritionStore();
  
  const today = new Date().toISOString().split('T')[0];
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" }) as WeekDay;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeMealType, setActiveMealType] = useState<MealType>("Breakfast");
  
  // Dialog state for date/time selection
  const [showDateTimeDialog, setShowDateTimeDialog] = useState(false);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMealType, setSelectedMealType] = useState<MealType>("Breakfast");

  useEffect(() => {
    fetchFoodLogs(today);
    fetchMeals(); // Remove limit parameter as it's not supported
  }, [fetchFoodLogs, fetchMeals, today]);

  // Get today's logs from the foodLogs Record<string, DayLogs>
  const todayLogs = foodLogs[today] || {
    Breakfast: [],
    Lunch: [],
    Dinner: [],
    Snack: []
  };

  // Group food logs by meal type (already grouped by structure)
  const groupedLogs = {
    Breakfast: todayLogs.Breakfast || [],
    Lunch: todayLogs.Lunch || [],
    Dinner: todayLogs.Dinner || [],
    Snack: todayLogs.Snack || [],
  };

  // Get all logs for today as a flat array for calculations
  const allTodayLogs = Object.values(groupedLogs).flat();

  const calculateTotals = () => {
    return allTodayLogs.reduce((acc, log) => ({
      calories: acc.calories + (log.calories || 0),
      protein: acc.protein + (log.protein || 0),
    }), { calories: 0, protein: 0 });
  };

  const totals = calculateTotals();
  const calorieGoal = 2000;
  const proteinGoal = 150;

  const handleAddFood = (food: any, mealType?: MealType) => {
    setSelectedFood(food);
    setSelectedMealType(mealType || activeMealType);
    setSelectedDate(today);
    setShowDateTimeDialog(true);
  };

  const handleConfirmAddFood = async () => {
    if (!selectedFood) return;
    
    try {
      // Add to food log
      await addFoodLogEntry(
        selectedDate,             // date (required)
        selectedMealType,         // mealType (required)
        selectedFood.id,          // foodItemId (optional)
        selectedFood.name,        // foodName (optional)
        selectedFood.quantity || 1 // quantity (optional)
      );
      
      // Add directly to meal planner using the selected date
      await addPlannerMeal(
        selectedDate,             // Use the exact selected date
        selectedMealType,         // mealType
        selectedFood.id,          // foodItemId
        selectedFood.quantity || 1 // quantity
      );
      
      // Refresh the meal planner data for the selected date
      await fetchPlannerMeals(selectedDate);
      
      // Close dialog
      setShowDateTimeDialog(false);
      setSelectedFood(null);
    } catch (err) {
      console.error("Failed to add food:", err);
    }
  };

  const filteredFoods = meals.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="p-8 bg-[#F3F4F6] min-h-full space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Food Log</h1>
        <p className="text-gray-500 mt-1">Track your daily nutrition intake</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Today&apos;s Calories</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-gray-900">{totals.calories}</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div 
              className="bg-[#16A34A] h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (totals.calories / calorieGoal) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {Math.max(0, calorieGoal - totals.calories)} kcal remaining
          </p>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Protein</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-gray-900">{totals.protein}g</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div 
              className="bg-[#2563EB] h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (totals.protein / proteinGoal) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {Math.max(0, proteinGoal - totals.protein)}g remaining
          </p>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Meals Logged</p>
            <span className="text-4xl font-bold text-gray-900">
              {Object.values(groupedLogs).filter(logs => logs.length > 0).length}
            </span>
          </div>
          <p className="text-[10px] font-bold text-[#16A34A] uppercase tracking-widest mt-4">
            Great progress today!
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Food Section (moved from right panel) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Add Food</h2>
            <Button className="bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl h-9 px-4 text-xs font-bold gap-2">
              <Plus className="w-4 h-4" />
              Quick Add
            </Button>
          </div>
          
          <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search foods..." 
                className="pl-12 h-11 rounded-xl bg-gray-50 border-gray-100 focus:ring-[#16A34A]/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <Button variant="outline" className="rounded-xl border-gray-100 bg-white h-20 flex-col gap-2 shadow-none hover:border-[#16A34A] hover:bg-emerald-50 group transition-all">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-[#16A34A]/10 transition-colors">
                  <ScanBarcode className="w-4 h-4 text-gray-400 group-hover:text-[#16A34A]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-700">Scan Barcode</span>
              </Button>
              <Button variant="outline" className="rounded-xl border-gray-100 bg-white h-20 flex-col gap-2 shadow-none hover:border-[#16A34A] hover:bg-emerald-50 group transition-all">
                <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-[#16A34A]/10 transition-colors">
                  <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#16A34A]" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 group-hover:text-gray-700">Custom Food</span>
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5" />
                <span>Recent Foods</span>
              </div>
              
              <div className="space-y-1">
                {foodLogsLoading ? (
                  <div className="py-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-[#16A34A] mx-auto" />
                  </div>
                ) : filteredFoods.length > 0 ? (
                  filteredFoods.map((food, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleAddFood(food)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{food.name}</p>
                        <p className="text-[10px] text-gray-400">100g</p>
                      </div>
                      <div className="text-right mr-3">
                         <p className="text-[10px] text-gray-400">{food.protein}g protein</p>
                         <p className="text-xs font-bold text-gray-700">{food.calories} cal</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-[#16A34A] transition-colors" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">No recent foods</p>
                )}
              </div>
            </div>
          </Card>

          {/* Meal Type Quick Add Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Quick Add to Meal</h3>
            <div className="grid grid-cols-2 gap-4">
              {(["Breakfast", "Lunch", "Dinner", "Snack"] as MealType[]).map((type) => (
                <Card key={type} className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 hover:border-[#16A34A] transition-colors cursor-pointer group"
                      onClick={() => handleAddFood(null, type)}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-[#16A34A] transition-colors">{type}</h4>
                      <p className="text-xs text-gray-400">Quick add food</p>
                    </div>
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-[#16A34A] transition-colors" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Empty or can be used for other features */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Today's Summary</h2>
          <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Meals Logged Today</p>
                <p className="text-3xl font-bold text-[#16A34A]">
                  {Object.values(groupedLogs).filter(logs => logs.length > 0).length}
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Today's Total</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Calories</span>
                  <span className="font-bold text-gray-900">{totals.calories} cal</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Protein</span>
                  <span className="font-bold text-gray-900">{totals.protein}g</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>

      {/* Date/Time Selection Dialog */}
      <Dialog open={showDateTimeDialog} onOpenChange={setShowDateTimeDialog}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <DialogTitle className="text-lg font-bold text-gray-900">Add Food to Meal Plan</DialogTitle>
            <button
              onClick={() => setShowDateTimeDialog(false)}
              className="rounded-full hover:bg-gray-100 p-1 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
              />
            </div>

            {/* Meal Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Meal Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(["Breakfast", "Lunch", "Dinner", "Snack"] as MealType[]).map((mealType) => (
                  <button
                    key={mealType}
                    onClick={() => setSelectedMealType(mealType)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedMealType === mealType
                        ? "bg-[#16A34A] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {mealType}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Food Info */}
            {selectedFood && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Food Item</label>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <p className="font-medium text-gray-900">{selectedFood.name}</p>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    <span>{selectedFood.calories} cal</span>
                    <span>{selectedFood.protein}g protein</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowDateTimeDialog(false)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddFood}
                className="flex-1 px-4 py-3 bg-[#16A34A] text-white rounded-xl font-medium hover:bg-[#15803D] transition-colors"
              >
                Add to Meal Plan
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
