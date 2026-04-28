import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { useMealPlan, WeekDay, MealType, MealItem } from "../contexts/meal-context";
import { 
  Plus, 
  Search, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Info
} from "lucide-react";

const AVAILABLE_MEALS: Omit<MealItem, 'id'>[] = [
  { name: "Grilled Chicken Bowl", calories: 450, protein: 42, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" },
  { name: "Oatmeal + Banana", calories: 320, protein: 8, image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400" },
  { name: "Avocado Toast", calories: 280, protein: 12, image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400" },
  { name: "Rice + Fish", calories: 510, protein: 38, image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400" },
  { name: "Greek Yogurt", calories: 150, protein: 15, image: "https://images.unsplash.com/photo-1618798513386-fedeb5c30d39?w=400" },
  { name: "Protein Shake", calories: 220, protein: 30, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400" },
  { name: "Pasta Salad", calories: 380, protein: 14, image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400" },
];

const DAYS: WeekDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES: MealType[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

function MealCard({ meal, onRemove }: { meal: MealItem; onRemove: () => void }) {
  return (
    <Card className="bg-white border border-gray-200 rounded-lg shadow-sm group">
      <CardContent className="p-3">
        <button 
          onClick={onRemove}
          className="absolute top-2 right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="w-3 h-3" />
        </button>
        <div className="flex gap-3">
          {meal.image && (
            <img src={meal.image} alt={meal.name} className="w-12 h-12 rounded-lg object-cover" />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">{meal.name}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-600">{meal.calories} kcal</span>
              <span className="text-xs text-green-600">{meal.protein}g protein</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MealPlanner() {
  const { weeklyPlan, addMeal, removeMeal, clearDay } = useMealPlan();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<{ day: WeekDay; type: MealType } | null>(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  const filteredMeals = AVAILABLE_MEALS.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMeal = (meal: Omit<MealItem, 'id'>) => {
    if (activeSlot) {
      addMeal(activeSlot.day, activeSlot.type, { ...meal, id: Math.random().toString(36).substr(2, 9) });
      setIsDialogOpen(false);
      setActiveSlot(null);
    }
  };

  const getDayTotals = (day: WeekDay) => {
    const safeWeeklyPlan = weeklyPlan || {};
    const dayMeals = Object.entries(safeWeeklyPlan[day] || {}).flatMap(([type, meals]) => meals || []);
    const totalCalories = dayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const totalProtein = dayMeals.reduce((sum, meal) => sum + meal.protein, 0);
    return { totalCalories, totalProtein };
  };

  // Get dates for the current week
  const getWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Adjust for Sunday
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset + (currentWeekOffset * 7));
    
    const weekDates: { [key in WeekDay]: Date } = {} as any;
    
    DAYS.forEach((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      weekDates[day] = date;
    });
    
    return weekDates;
  };

  const weekDates = getWeekDates();
  
  // Format week range for display
  const formatWeekRange = () => {
    const monday = weekDates.Monday;
    const sunday = weekDates.Sunday;
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const mondayStr = monday.toLocaleDateString('en-US', options);
    const sundayStr = sunday.toLocaleDateString('en-US', options);
    
    return `${mondayStr} - ${sundayStr}`;
  };

  const goToPreviousWeek = () => {
    setCurrentWeekOffset(prev => prev - 1);
  };

  const goToNextWeek = () => {
    setCurrentWeekOffset(prev => prev + 1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meal Planner</h1>
          <p className="text-gray-600 mt-1">Plan your meals for the week</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPreviousWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium text-gray-700">{formatWeekRange()}</span>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weekly Calendar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {DAYS.map(day => {
          const { totalCalories, totalProtein } = getDayTotals(day);
          return (
            <div key={day} className="bg-white border border-gray-200 rounded-lg">
              {/* Day Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{day.slice(0, 3)}</h3>
                    <p className="text-sm text-gray-500">{weekDates[day].getDate()}</p>
                  </div>
                  <button 
                    onClick={() => clearDay(day)}
                    className="text-xs text-gray-400 hover:text-red-500"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Meal Slots */}
              <div className="p-3 space-y-3 min-h-[400px]">
                {MEAL_TYPES.map(type => {
                  const safeWeeklyPlan = weeklyPlan || {};
                  const dayMeals = safeWeeklyPlan[day] || {};
                  const meals = dayMeals[type] || [];
                  return (
                    <div key={type} className="space-y-2">
                      <div className="text-xs font-medium text-gray-500 uppercase">{type}</div>
                      <div className="space-y-2">
                        {meals.map(meal => (
                          <MealCard 
                            key={meal.id} 
                            meal={meal} 
                            onRemove={() => removeMeal(day, type, meal.id)}
                          />
                        ))}
                        <Dialog open={isDialogOpen && activeSlot?.day === day && activeSlot?.type === type} onOpenChange={(open) => {
                          if (!open) setIsDialogOpen(false);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => { setActiveSlot({ day, type }); setIsDialogOpen(true); }}
                              className="w-full border-dashed border-gray-300 text-gray-500 hover:border-green-500 hover:text-green-600 hover:bg-green-50"
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add meal
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="rounded-lg border-gray-200 p-0 max-w-md">
                            <div className="p-6 bg-green-500 text-white">
                              <DialogHeader>
                                <DialogTitle className="text-lg font-semibold">Add {type}</DialogTitle>
                                <p className="text-green-100 text-sm">For {day}</p>
                              </DialogHeader>
                            </div>
                            <div className="p-6 space-y-4">
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input 
                                  placeholder="Search meals..." 
                                  className="pl-10 h-10 rounded-lg border-gray-200"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                {filteredMeals.length > 0 ? (
                                  filteredMeals.map((meal, i) => (
                                    <div 
                                      key={i} 
                                      onClick={() => handleAddMeal(meal)}
                                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all cursor-pointer"
                                    >
                                      <img src={meal.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                      <div className="flex-1">
                                        <p className="font-medium text-gray-900">{meal.name}</p>
                                        <div className="flex gap-3 mt-1">
                                          <span className="text-xs text-gray-600">{meal.calories} kcal</span>
                                          <span className="text-xs text-green-600">{meal.protein}g protein</span>
                                        </div>
                                      </div>
                                      <Plus className="w-5 h-5 text-gray-400" />
                                    </div>
                                  ))
                                ) : (
                                  <div className="py-8 text-center">
                                    <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">No meals found</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Daily Totals */}
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <div className="text-xs font-medium text-gray-600">
                  <div className="flex justify-between">
                    <span>Calories:</span>
                    <span className="text-gray-900">{totalCalories}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Protein:</span>
                    <span className="text-green-600">{totalProtein}g</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
