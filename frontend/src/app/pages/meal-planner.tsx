import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { useMealPlan, WeekDay, MealType } from "../contexts/meal-context";
import { useNutritionStore } from "../stores/nutrition-store";
import {
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Info,
  Loader2,
  Calendar as CalendarIcon
} from "lucide-react";

const DAYS: WeekDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function MealPlanner() {
  const { weeklyPlan, addMeal, removeMeal, clearDay, isLoading, error } = useMealPlan();
  const { meals, mealsLoading, mealsError, fetchMeals, fetchPlannerMeals } = useNutritionStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<{ day: WeekDay; type: MealType } | null>(null);
  
  // State for universal add meal dialog
  const [isUniversalDialogOpen, setIsUniversalDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<WeekDay>("Monday");
  const [selectedMealType, setSelectedMealType] = useState<MealType>("Breakfast");
  
  // State for week navigation
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  
  // Calculate the dates for the current week (with offset)
  const getWeekDates = () => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    
    // Apply week offset
    monday.setDate(monday.getDate() + (currentWeekOffset * 7));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };
  
  const weekDates = getWeekDates();
  const today = new Date();
  const todayName = today.toLocaleDateString("en-US", { weekday: "long" }) as WeekDay;
  const todayDate = today.getDate();

  // Fetch meals and planner data when week changes
  useEffect(() => {
    fetchMeals(); // Remove limit parameter as it's not supported

    // Fetch current week's planner data using dynamic dates
    weekDates.forEach((date) => {
      const dateStr = date.toISOString().split('T')[0];
      fetchPlannerMeals(dateStr);
    });
  }, [fetchMeals, fetchPlannerMeals, currentWeekOffset]);

  // Week navigation functions
  const handlePreviousWeek = () => {
    setCurrentWeekOffset(prev => prev - 1);
  };

  const handleNextWeek = () => {
    setCurrentWeekOffset(prev => prev + 1);
  };

  // Format week range for header
  const formatWeekRange = () => {
    const startDate = weekDates[0];
    const endDate = weekDates[6];
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return `Week of ${startDate.toLocaleDateString('en-US', options)} - ${endDate.toLocaleDateString('en-US', options)}`;
  };

  const filteredMeals = meals.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMeal = async (foodItem: { id: number; name: string; calories: number; protein: number; image?: string }) => {
    // Handle individual slot addition (existing functionality)
    if (activeSlot) {
      try {
        await addMeal(activeSlot.day, activeSlot.type, {
          id: foodItem.id.toString(),
          name: foodItem.name,
          calories: foodItem.calories,
          protein: foodItem.protein,
          image: foodItem.image,
        });
        setIsDialogOpen(false);
        setActiveSlot(null);
      } catch (error) {
        console.error('Failed to add meal:', error);
      }
    }
    // Handle universal dialog addition (new functionality)
    else if (isUniversalDialogOpen) {
      try {
        await addMeal(selectedDay, selectedMealType, {
          id: foodItem.id.toString(),
          name: foodItem.name,
          calories: foodItem.calories,
          protein: foodItem.protein,
          image: foodItem.image,
        });
        setIsUniversalDialogOpen(false);
      } catch (error) {
        console.error('Failed to add meal:', error);
      }
    }
  };

  if (error) {
    return (
      <div className="p-8 bg-[#F3F4F6] min-h-screen">
        <Card className="p-8 bg-red-50 border-red-200 text-red-700">
          Error loading meal planner: {error}
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-full space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meal Planner</h1>
          <p className="text-gray-500 mt-1">Plan your weekly meals and track macros</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={handlePreviousWeek}>
              <ChevronLeft className="w-4 h-4 text-gray-400"/>
            </Button>
            <span className="text-xs font-bold text-gray-700 px-3">{formatWeekRange()}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={handleNextWeek}>
              <ChevronRight className="w-4 h-4 text-gray-400"/>
            </Button>
          </div>
          <Button 
            className="bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl h-10 px-6 font-bold gap-2"
            onClick={() => setIsUniversalDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Add Meal
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-4 min-w-[1000px]">
        {DAYS.map((day, index) => {
          const currentDate = weekDates[index];
          const isToday = currentDate.toDateString() === today.toDateString();
          
          return (
          <div key={day} className="space-y-4">
            {/* Day Header */}
            <div className={`p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm ${
              isToday ? "bg-[#16A34A] text-white" : "bg-white text-gray-900 border border-gray-100"
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{day.substring(0, 3)}</span>
              <span className="text-2xl font-bold mt-1">{currentDate.getDate()}</span>
              {isToday && <span className="text-[8px] font-bold uppercase mt-1 bg-white/20 px-2 py-0.5 rounded-full">Today</span>}
            </div>

            {/* Meal Slots */}
            <div className="space-y-4">
              {MEAL_TYPES.map((type) => {
                const dayPlan = weeklyPlan[day] || { Breakfast: [], Lunch: [], Dinner: [], Snack: [] };
                const dayMeals = dayPlan[type] || [];
                
                return (
                  <div key={type} className="space-y-3">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">{type}</h3>
                    
                    {dayMeals.map((meal) => (
                      <div key={meal.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm group relative">
                        <button 
                          onClick={() => removeMeal(day, type, meal.id.toString())}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        {meal.image && (
                          <img src={meal.image} className="w-full h-24 object-cover" alt="" />
                        )}
                        <div className="p-3">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{type}</p>
                          <h4 className="text-xs font-bold text-gray-900 mt-1 line-clamp-1">{meal.name}</h4>
                          <div className="flex justify-between items-center mt-2">
                             <span className="text-[10px] text-gray-500">{meal.protein}g protein</span>
                             <span className="text-[10px] font-bold text-[#16A34A]">{meal.calories} cal</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Dialog open={isDialogOpen && activeSlot?.day === day && activeSlot?.type === type} onOpenChange={(open) => {
                      if (!open) setIsDialogOpen(false);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          onClick={() => { setActiveSlot({ day, type }); setIsDialogOpen(true); }}
                          className="w-full py-6 rounded-2xl border-2 border-dashed border-gray-200 bg-white text-gray-400 hover:text-[#16A34A] hover:border-[#16A34A] hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 group h-auto shadow-none"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Add</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-3xl border-0 shadow-2xl p-0 overflow-hidden max-w-md">
                        <div className="p-6 bg-[#16A34A] text-white">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-bold">Add {type}</DialogTitle>
                            <p className="text-white/80 text-sm">For {day}</p>
                          </DialogHeader>
                        </div>
                        <div className="p-6 space-y-6">
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                              placeholder="Search meals..." 
                              className="pl-12 h-12 rounded-2xl bg-gray-50 border-gray-100 focus:ring-[#16A34A]/20"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                          <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                            {mealsLoading ? (
                              <div className="py-12 text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-[#16A34A] mx-auto mb-2" />
                                <p className="text-sm font-bold text-gray-400">Loading meals...</p>
                              </div>
                            ) : filteredMeals.length > 0 ? (
                              filteredMeals.map((meal) => (
                                <div
                                  key={meal.id}
                                  onClick={() => handleAddMeal({
  ...meal,
  image: meal.image || undefined
})}
                                  className="flex items-center gap-4 p-3 rounded-2xl border border-gray-100 hover:border-[#16A34A] hover:bg-emerald-50 transition-all cursor-pointer group"
                                >
                                  <img src={meal.image || ''} className="w-14 h-14 rounded-xl object-cover shadow-sm" alt="" />
                                  <div className="flex-1">
                                    <p className="font-bold text-gray-900">{meal.name}</p>
                                    <div className="flex gap-3 mt-1">
                                      <span className="text-[10px] font-bold text-gray-400">{meal.calories} kcal</span>
                                      <span className="text-[10px] font-bold text-[#16A34A]">{meal.protein}g protein</span>
                                    </div>
                                  </div>
                                  <Plus className="w-5 h-5 text-gray-200 group-hover:text-[#16A34A] transition-colors" />
                                </div>
                              ))
                            ) : (
                              <div className="py-12 text-center">
                                <p className="text-sm font-bold text-gray-400">No meals found</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              })}
            </div>

            {/* Daily Total */}
            <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-1">
               <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Daily Total</span>
               <p className="text-lg font-bold text-gray-900">
                 {Object.values(weeklyPlan[day] || {}).flat().reduce((sum, m) => sum + (m.calories || 0), 0)}
                 <span className="text-[10px] font-medium text-gray-400 ml-1">cal</span>
               </p>
               <p className="text-xs text-gray-500">
                 {Object.values(weeklyPlan[day] || {}).flat().reduce((sum, m) => sum + (m.protein || 0), 0)}g protein
               </p>
            </div>
          </div>
          );
        })}
      </div>

      {/* Universal Add Meal Dialog */}
      <Dialog open={isUniversalDialogOpen} onOpenChange={setIsUniversalDialogOpen}>
        <DialogContent className="rounded-3xl border-0 shadow-2xl p-0 overflow-hidden max-w-md">
          <div className="p-6 bg-[#16A34A] text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add Meal</DialogTitle>
              <p className="text-white/80 text-sm">Select day and meal type</p>
            </DialogHeader>
          </div>
          <div className="p-6 space-y-6">
            {/* Day Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Select Day</label>
              <div className="grid grid-cols-4 gap-2">
                {DAYS.map((day, index) => {
                  const currentDate = weekDates[index];
                  const isToday = currentDate.toDateString() === today.toDateString();
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        selectedDay === day
                          ? "bg-[#16A34A] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      } ${isToday ? "ring-2 ring-[#16A34A]/30" : ""}`}
                    >
                      {day.substring(0, 3)}
                      <div className="text-[10px] opacity-70">{currentDate.getDate()}</div>
                      {isToday && <div className="text-[8px] font-bold">Today</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meal Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Meal Type</label>
              <div className="grid grid-cols-2 gap-2">
                {MEAL_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMealType(type)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedMealType === type
                        ? "bg-[#16A34A] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Search and Select Meal */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Search meals..." 
                className="pl-12 h-12 rounded-2xl bg-gray-50 border-gray-100 focus:ring-[#16A34A]/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
              {mealsLoading ? (
                <div className="py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-[#16A34A] mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-400">Loading meals...</p>
                </div>
              ) : filteredMeals.length > 0 ? (
                filteredMeals.map((meal) => (
                  <div
                    key={meal.id}
                    onClick={() => handleAddMeal({
                      id: meal.id,
                      name: meal.name,
                      calories: meal.calories,
                      protein: meal.protein,
                      image: meal.image || undefined,
                    })}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{meal.name}</p>
                      <p className="text-[10px] text-gray-400">100g</p>
                    </div>
                    <div className="text-right mr-3">
                       <p className="text-[10px] text-gray-400">{meal.protein}g protein</p>
                       <p className="text-xs font-bold text-gray-700">{meal.calories} cal</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-200 group-hover:text-[#16A34A] transition-colors" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-4">No meals found</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
