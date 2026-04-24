import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useMealPlan, WeekDay, MealType } from "../contexts/meal-context";
import { 
  Sparkles, 
  Plus, 
  Info,
  ChevronRight,
  Flame,
  Zap,
  Leaf
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";

const RECS = [
  {
    id: "1",
    name: "Grilled Chicken Bowl",
    calories: 450,
    protein: 42,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
    tags: ["High Protein", "Low Carb"],
    reason: "Matches your goal for muscle maintenance."
  },
  {
    id: "2",
    name: "Quinoa Buddha Bowl",
    calories: 380,
    protein: 18,
    image: "https://images.unsplash.com/photo-1587996428538-71d66749a5cb?w=600",
    tags: ["Vegan", "High Fiber"],
    reason: "Great plant-based option for your lunch."
  },
  {
    id: "3",
    name: "Salmon + Roasted Veggies",
    calories: 510,
    protein: 38,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600",
    tags: ["Heart Healthy", "Omega-3"],
    reason: "Perfect balance of healthy fats and protein."
  },
  {
    id: "4",
    name: "Greek Yogurt Parfait",
    calories: 220,
    protein: 20,
    image: "https://images.unsplash.com/photo-1618798513386-fedeb5c30d39?w=600",
    tags: ["Snack", "High Protein"],
    reason: "Quick snack to hit your protein targets."
  }
];

export function Recommendations() {
  const { addMeal } = useMealPlan();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [planDay, setPlanDay] = useState<WeekDay>("Monday");
  const [planType, setPlanType] = useState<MealType>("Lunch");

  const handleAdd = () => {
    if (selectedMeal) {
      addMeal(planDay, planType, {
        id: Math.random().toString(36).substr(2, 9),
        name: selectedMeal.name,
        calories: selectedMeal.calories,
        protein: selectedMeal.protein,
        image: selectedMeal.image,
        tags: selectedMeal.tags
      });
      setIsDialogOpen(false);
      setSelectedMeal(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">AI <span className="text-gradient">Recommendations</span></h1>
          <p className="text-zinc-500 font-medium mt-1">Smart suggestions tailored to your biology and goals.</p>
        </div>
        <div className="glass px-4 py-2 rounded-2xl flex items-center gap-2 border-emerald-100 shadow-sm">
          <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
          <span className="text-sm font-bold text-zinc-900">AI Analysis Active</span>
        </div>
      </div>

      {/* Hero Banner */}
      <Card className="premium-card bg-zinc-900 text-white border-0 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <Sparkles className="w-32 h-32 text-white" />
        </div>
        <div className="relative z-10 space-y-4">
          <Badge className="bg-emerald-600 text-white border-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">Top Insight</Badge>
          <h2 className="text-3xl font-bold">Boost your <span className="text-emerald-400">Metabolism</span></h2>
          <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
            Increasing your protein intake by 15% this week could improve your muscle recovery by 22% based on your activity logs.
          </p>
          <Button className="rounded-2xl bg-white text-zinc-900 font-bold px-8 hover:bg-emerald-50 transition-colors">
            Learn More
          </Button>
        </div>
      </Card>

      {/* Rec Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {RECS.map((meal) => (
          <div key={meal.id} className="premium-card group border-zinc-100 flex flex-col md:flex-row gap-6 p-0 overflow-hidden">
            <div className="w-full md:w-48 h-48 overflow-hidden">
              <img src={meal.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
            </div>
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {meal.tags.map(t => (
                    <span key={t} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-zinc-100 text-zinc-500 rounded-lg">{t}</span>
                  ))}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{meal.name}</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-bold text-zinc-700">{meal.calories} <span className="text-[10px] text-zinc-400 font-medium">KCAL</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-bold text-zinc-700">{meal.protein}g <span className="text-[10px] text-zinc-400 font-medium">PRO</span></span>
                  </div>
                </div>
                <div className="pt-2 flex items-start gap-2 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                  <Info className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] font-medium text-emerald-800 leading-relaxed italic">"{meal.reason}"</p>
                </div>
              </div>
              <Dialog open={isDialogOpen && selectedMeal?.id === meal.id} onOpenChange={(open) => {
                if (!open) setIsDialogOpen(false);
              }}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={() => { setSelectedMeal(meal); setIsDialogOpen(true); }}
                    className="mt-6 w-full rounded-2xl bg-zinc-900 text-white font-bold h-11 hover:bg-emerald-600 transition-all"
                  >
                    Add to Plan
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-0 shadow-2xl p-0 overflow-hidden max-w-sm">
                  <div className="p-6 bg-zinc-900 text-white">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold">Add to Plan</DialogTitle>
                      <p className="text-zinc-400 text-sm">Targeting: {meal.name}</p>
                    </DialogHeader>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Select Day</label>
                        <div className="flex flex-wrap gap-2">
                          {["Monday", "Wednesday", "Friday"].map(day => (
                            <Button 
                              key={day} 
                              variant={planDay === day ? "default" : "outline"}
                              onClick={() => setPlanDay(day as WeekDay)}
                              className="rounded-xl h-9 text-xs font-bold"
                            >
                              {day}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Meal Type</label>
                        <div className="flex flex-wrap gap-2">
                          {["Breakfast", "Lunch", "Dinner", "Snack"].map(type => (
                            <Button 
                              key={type} 
                              variant={planType === type ? "default" : "outline"}
                              onClick={() => setPlanType(type as MealType)}
                              className="rounded-xl h-9 text-xs font-bold"
                            >
                              {type}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleAdd}
                      className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      Confirm and Save
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
