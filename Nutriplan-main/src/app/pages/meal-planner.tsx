import { useState } from "react";
import { Card } from "../components/ui/card";
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

export function MealPlanner() {
  const { weeklyPlan, addMeal, removeMeal, clearDay } = useMealPlan();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<{ day: WeekDay; type: MealType } | null>(null);

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

  return (
    <div className="p-8 max-w-full mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">Weekly <span className="text-gradient">Planner</span></h1>
          <p className="text-zinc-500 font-medium mt-1">Organize your nutrition for the week ahead.</p>
        </div>
        <div className="flex items-center gap-3 glass p-2 rounded-2xl">
          <Button variant="ghost" size="icon" className="rounded-xl"><ChevronLeft className="w-5 h-5"/></Button>
          <span className="text-sm font-bold text-zinc-900 px-2">Apr 20 - Apr 26</span>
          <Button variant="ghost" size="icon" className="rounded-xl"><ChevronRight className="w-5 h-5"/></Button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-3xl premium-shadow">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="p-6 text-left bg-zinc-50/50 w-40"></th>
              {MEAL_TYPES.map(type => (
                <th key={type} className="p-6 text-left bg-zinc-50/50">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">{type}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map(day => (
              <tr key={day} className="border-b border-zinc-100 last:border-0 transition-colors hover:bg-zinc-50/30">
                <td className="p-6 bg-zinc-50/50">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900">{day}</span>
                    <button 
                      onClick={() => clearDay(day)}
                      className="text-[10px] font-bold text-zinc-400 hover:text-red-500 mt-1 transition-colors text-left"
                    >
                      Clear Day
                    </button>
                  </div>
                </td>
                {MEAL_TYPES.map(type => {
                  const meals = weeklyPlan[day][type];
                  return (
                    <td key={type} className="p-4 align-top min-w-[200px]">
                      <div className="space-y-3">
                        {meals.map(meal => (
                          <div key={meal.id} className="group relative glass rounded-2xl p-3 border-zinc-200 hover:border-emerald-200 hover:shadow-md transition-all">
                            <button 
                              onClick={() => removeMeal(day, type, meal.id)}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-100"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            <div className="flex gap-3">
                              {meal.image && <img src={meal.image} className="w-10 h-10 rounded-lg object-cover shadow-inner" alt="" />}
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-zinc-900 truncate">{meal.name}</p>
                                <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">{meal.calories} kcal</p>
                              </div>
                            </div>
                          </div>
                        ))}
                        <Dialog open={isDialogOpen && activeSlot?.day === day && activeSlot?.type === type} onOpenChange={(open) => {
                          if (!open) setIsDialogOpen(false);
                        }}>
                          <DialogTrigger asChild>
                            <button 
                              onClick={() => { setActiveSlot({ day, type }); setIsDialogOpen(true); }}
                              className="w-full py-3 rounded-2xl border-2 border-dashed border-zinc-100 text-zinc-300 hover:border-emerald-200 hover:text-emerald-400 hover:bg-emerald-50/30 transition-all flex items-center justify-center gap-2 group"
                            >
                              <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Add Meal</span>
                            </button>
                          </DialogTrigger>
                          <DialogContent className="rounded-3xl border-0 shadow-2xl p-0 overflow-hidden max-w-md">
                            <div className="p-6 bg-zinc-900 text-white">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">Add {type}</DialogTitle>
                                <p className="text-zinc-400 text-sm">For {day}</p>
                              </DialogHeader>
                            </div>
                            <div className="p-6 space-y-6">
                              <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                <Input 
                                  placeholder="Search meals..." 
                                  className="pl-12 h-12 rounded-2xl bg-zinc-50 border-zinc-100 focus:ring-emerald-500/20"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                />
                              </div>
                              <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
                                {filteredMeals.length > 0 ? (
                                  filteredMeals.map((meal, i) => (
                                    <div 
                                      key={i} 
                                      onClick={() => handleAddMeal(meal)}
                                      className="flex items-center gap-4 p-3 rounded-2xl border border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all cursor-pointer group"
                                    >
                                      <img src={meal.image} className="w-14 h-14 rounded-xl object-cover shadow-sm" alt="" />
                                      <div className="flex-1">
                                        <p className="font-bold text-zinc-900">{meal.name}</p>
                                        <div className="flex gap-3 mt-1">
                                          <span className="text-[10px] font-bold text-zinc-400">{meal.calories} kcal</span>
                                          <span className="text-[10px] font-bold text-emerald-600">{meal.protein}g protein</span>
                                        </div>
                                      </div>
                                      <Plus className="w-5 h-5 text-zinc-200 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                  ))
                                ) : (
                                  <div className="py-12 text-center">
                                    <Info className="w-10 h-10 text-zinc-200 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-zinc-400">No meals found</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
