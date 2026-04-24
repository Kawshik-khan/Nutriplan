import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { useMealPlan, MealType, WeekDay } from "../contexts/meal-context";
import { 
  Plus, 
  Search, 
  Clock, 
  Zap, 
  Utensils, 
  Check,
  ChevronRight,
  Flame
} from "lucide-react";
import { Switch } from "../components/ui/switch";

const FOOD_LIST = [
  { name: "Grilled Chicken Bowl", calories: 450, protein: 42, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400" },
  { name: "Oatmeal + Banana", calories: 320, protein: 8, image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=400" },
  { name: "Avocado Toast", calories: 280, protein: 12, image: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400" },
  { name: "Protein Shake", calories: 220, protein: 30, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400" },
];

export function FoodLog() {
  const { addMeal } = useMealPlan();
  const [searchQuery, setSearchQuery] = useState("");
  const [syncToPlanner, setSyncToPlanner] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType | null>(null);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }) as WeekDay;

  const handleAddFood = (food: typeof FOOD_LIST[0]) => {
    if (activeMealType) {
      if (syncToPlanner) {
        addMeal(today, activeMealType, { ...food, id: Math.random().toString(36).substr(2, 9) });
      }
      setIsDialogOpen(false);
      setActiveMealType(null);
    }
  };

  const filteredFoods = FOOD_LIST.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">Daily <span className="text-gradient">Log</span></h1>
        <p className="text-zinc-500 font-medium mt-1">Track your consumption and stay on target.</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="premium-card bg-zinc-900 text-white border-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Calories</p>
              <p className="text-2xl font-bold">1,240 <span className="text-xs text-zinc-500">/ 2,000</span></p>
            </div>
          </div>
        </Card>
        <Card className="premium-card border-zinc-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Protein</p>
              <p className="text-2xl font-bold text-zinc-900">85g <span className="text-xs text-zinc-500">/ 150g</span></p>
            </div>
          </div>
        </Card>
        <Card className="premium-card border-zinc-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Logged</p>
              <p className="text-2xl font-bold text-zinc-900">2 <span className="text-xs text-zinc-500">Meals</span></p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Add Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(["Breakfast", "Lunch", "Dinner", "Snack"] as MealType[]).map((type) => (
          <Dialog key={type} open={isDialogOpen && activeMealType === type} onOpenChange={(open) => {
            if (!open) setIsDialogOpen(false);
          }}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => { setActiveMealType(type); setIsDialogOpen(true); }}
                className="h-28 rounded-3xl bg-white border-2 border-dashed border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center gap-2 group shadow-none text-zinc-400 hover:text-emerald-600"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                  <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">{type}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-3xl border-0 shadow-2xl p-0 overflow-hidden max-w-md">
              <div className="p-6 bg-emerald-600 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">Quick Add {type}</DialogTitle>
                  <p className="text-emerald-100 text-sm">Add food to your daily log</p>
                </DialogHeader>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between p-4 glass rounded-2xl border-emerald-100">
                  <div className="flex items-center gap-3">
                    <Check className={`w-5 h-5 ${syncToPlanner ? "text-emerald-600" : "text-zinc-300"}`} />
                    <span className="text-sm font-bold text-zinc-700">Also add to meal planner</span>
                  </div>
                  <Switch 
                    checked={syncToPlanner} 
                    onCheckedChange={setSyncToPlanner}
                    className="data-[state=checked]:bg-emerald-600"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input 
                    placeholder="Search foods..." 
                    className="pl-12 h-12 rounded-2xl bg-zinc-50 border-zinc-100 focus:ring-emerald-500/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {filteredFoods.map((food, i) => (
                    <div 
                      key={i} 
                      onClick={() => handleAddFood(food)}
                      className="flex items-center gap-4 p-3 rounded-2xl border border-zinc-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden shadow-inner">
                        <img src={food.image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-zinc-900">{food.name}</p>
                        <p className="text-[10px] font-bold text-zinc-400">{food.calories} kcal • {food.protein}g protein</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-200 group-hover:text-emerald-500 transition-all group-hover:translate-x-1" />
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Log Feed */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-zinc-900">Today&apos;s Feed</h2>
        <div className="space-y-4">
          {[
            { type: "Breakfast", time: "08:30 AM", name: "Greek Yogurt + Berries", cal: 280 },
            { type: "Lunch", time: "01:15 PM", name: "Grilled Salmon with Asparagus", cal: 450 }
          ].map((log, i) => (
            <div key={i} className="premium-card flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 shadow-inner group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                  <Utensils className="w-6 h-6 text-zinc-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{log.type}</span>
                    <span className="text-[10px] font-bold text-zinc-300">•</span>
                    <span className="text-[10px] font-bold text-zinc-400">{log.time}</span>
                  </div>
                  <h3 className="font-bold text-zinc-900 mt-0.5">{log.name}</h3>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-600">{log.cal}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Calories</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
