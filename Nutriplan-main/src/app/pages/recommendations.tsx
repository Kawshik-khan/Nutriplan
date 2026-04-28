import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recommendations</h1>
          <p className="text-gray-600 mt-1">Smart suggestions tailored to your goals</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <Sparkles className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">AI Analysis Active</span>
        </div>
      </div>

      {/* Hero Banner */}
      <Card className="bg-gray-900 text-white border-0 overflow-hidden">
        <CardContent className="p-6 relative">
          <div className="absolute top-4 right-4">
            <Sparkles className="w-8 h-8 text-green-400 opacity-50" />
          </div>
          <div className="space-y-3">
            <Badge className="bg-green-500 text-white border-0 px-3 py-1 rounded-full text-xs font-medium">Top Insight</Badge>
            <h2 className="text-2xl font-bold">Boost your <span className="text-green-400">Metabolism</span></h2>
            <p className="text-gray-300 max-w-lg text-sm">
              Increasing your protein intake by 15% this week could improve your muscle recovery by 22% based on your activity logs.
            </p>
            <Button className="bg-white text-gray-900 hover:bg-gray-100 font-medium">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {RECS.map((meal) => (
          <Card key={meal.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden group">
            <div className="flex flex-col md:flex-row">
              <div className="w-full md:w-48 h-48 overflow-hidden">
                <img src={meal.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt="" />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {meal.tags.map(t => (
                      <span key={t} className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">{t}</span>
                    ))}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">{meal.name}</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700">{meal.calories} <span className="text-xs text-gray-500">kcal</span></span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-700">{meal.protein}g <span className="text-xs text-gray-500">protein</span></span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                    <Info className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-green-800 italic">"{meal.reason}"</p>
                  </div>
                </div>
                <Dialog open={isDialogOpen && selectedMeal?.id === meal.id} onOpenChange={(open) => {
                  if (!open) setIsDialogOpen(false);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      onClick={() => { setSelectedMeal(meal); setIsDialogOpen(true); }}
                      className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white font-medium"
                    >
                      Add to Plan
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-lg border-gray-200 p-0 max-w-md">
                    <div className="p-6 bg-green-500 text-white">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">Add to Plan</DialogTitle>
                        <p className="text-green-100 text-sm">Targeting: {meal.name}</p>
                      </DialogHeader>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-600">Select Day</label>
                          <div className="flex flex-wrap gap-2">
                            {["Monday", "Wednesday", "Friday"].map(day => (
                              <Button 
                                key={day} 
                                variant={planDay === day ? "default" : "outline"}
                                onClick={() => setPlanDay(day as WeekDay)}
                                className={`h-8 text-xs font-medium ${planDay === day ? "bg-green-500 hover:bg-green-600" : "border-gray-200"}`}
                              >
                                {day}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-600">Meal Type</label>
                          <div className="flex flex-wrap gap-2">
                            {["Breakfast", "Lunch", "Dinner", "Snack"].map(type => (
                              <Button 
                                key={type} 
                                variant={planType === type ? "default" : "outline"}
                                onClick={() => setPlanType(type as MealType)}
                                className={`h-8 text-xs font-medium ${planType === type ? "bg-green-500 hover:bg-green-600" : "border-gray-200"}`}
                              >
                                {type}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button 
                        onClick={handleAdd}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-medium"
                      >
                        Confirm and Save
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
