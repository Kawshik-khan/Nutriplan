import { useState, useEffect } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Droplet, 
  Weight, 
  Zap,
  AlertCircle,
  UtensilsCrossed,
  Calendar,
  ChevronDown,
  ArrowRight,
  Info
} from "lucide-react";
import { useDashboardOverview, useAddWater } from "../hooks/use-dashboard";
import { useMealPlan, WeekDay, MealType } from "../contexts/meal-context";
import { Link } from "react-router";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../components/ui/dropdown-menu";
import { ProgressRing } from "../components/progress-ring";

const DAYS: WeekDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function StatCard({ title, value, subValue, icon: Icon, colorClass, trend, children }: any) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 h-full flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{subValue}</p>
        </div>
        <div className={`w-10 h-10 ${colorClass} rounded-full flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-[#16A34A]" />
          <span className="text-xs font-medium text-[#16A34A]">{trend}</span>
        </div>
      )}
      
      {children && <div className="mt-4">{children}</div>}
    </Card>
  );
}

export default function Dashboard() {
  console.log("Dashboard rendering...");
  
  const { data: overview, isLoading: overviewLoading, error: overviewError } = useDashboardOverview();
  const addWaterMutation = useAddWater();
  const mealPlan = useMealPlan();
  
  // Safely get weeklyPlan from context
  const currentWeeklyPlan = mealPlan?.weeklyPlan || {};
  
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }) as WeekDay;
  const [selectedDay, setSelectedDay] = useState<WeekDay>(today);

  // Safely get day meals
  const dayMeals = currentWeeklyPlan[selectedDay] || { Breakfast: [], Lunch: [], Dinner: [], Snack: [] };
  const allDayMeals = Object.entries(dayMeals).flatMap(([type, meals]) => 
    (meals || []).map((m: any) => ({ ...m, type: type as MealType }))
  );

  const calories = overview?.today?.calories ?? { consumed: 0, goal: 2000 };
  const protein = overview?.today?.macros?.protein ?? { consumed: 0, goal: 150 };
  const carbs = overview?.today?.macros?.carbs ?? { consumed: 0, goal: 225 };
  const fats = overview?.today?.macros?.fats ?? { consumed: 0, goal: 67 };
  const water = overview?.today?.water ?? { glasses: 0, goalGlasses: 8 };
  const weight = overview?.today?.weight ?? { currentKg: null, deltaKg: 0 };

  const handleAddWater = () => addWaterMutation.mutate();

  const greetingName = overview?.user?.fullName?.split(" ")[0] ?? "Kawshik";

  if (overviewError) return (
    <div className="p-8">
      <Card className="p-8 bg-red-50 border-red-200 text-red-700">
        Error: {overviewError.message}
      </Card>
    </div>
  );

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-full space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Good morning, {overviewLoading ? "..." : greetingName}! 👋
        </h1>
        <p className="text-gray-500 mt-1">Here&apos;s your nutrition overview for today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
        ) : (
          <>
            <StatCard 
              title="Calories" 
              value={calories.consumed.toLocaleString()} 
              subValue={`of ${calories.goal} kcal`}
              icon={Zap}
              colorClass="bg-[#DCFCE7] text-[#16A34A]"
              trend="On track"
            />
            <StatCard 
              title="Protein" 
              value={`${protein.consumed}g`} 
              subValue={`of ${protein.goal}g`}
              icon={TrendingUp}
              colorClass="bg-[#DBEAFE] text-[#2563EB]"
              trend="Good progress"
            />
            <StatCard 
              title="Water" 
              value={`${water.glasses}`} 
              subValue={`of ${water.goalGlasses} glasses`}
              icon={Droplet}
              colorClass="bg-[#E0F2FE] text-[#0EA5E9]"
            >
              <Button 
                onClick={handleAddWater}
                className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl h-9 text-xs font-bold gap-2"
              >
                <Droplet className="w-3 h-3" />
                Add Glass
              </Button>
            </StatCard>
            <StatCard 
              title="Weight" 
              value={weight.currentKg ? `${weight.currentKg}` : "--"} 
              subValue="kg"
              icon={Weight}
              colorClass="bg-[#FFEDD5] text-[#F97316]"
              trend={weight.deltaKg !== 0 ? `${weight.deltaKg}kg this week` : "0 kg this week"}
            >
              <Button 
                variant="outline"
                className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl h-9 text-xs font-bold"
              >
                Log Weight
              </Button>
            </StatCard>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Meal Plan & Insights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Today&apos;s Meal Plan</h2>
            <Link to="/dashboard/planner">
              <Button variant="outline" className="rounded-xl h-9 text-xs font-bold border-gray-200">
                View Full Plan
              </Button>
            </Link>
          </div>

          {/* Nutrition Insight Banner */}
          <div className="bg-[#16A34A] text-white p-6 rounded-2xl flex gap-4 items-start shadow-sm">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Nutrition Insight</h3>
              <p className="text-white/90 text-sm mt-1">
                You&apos;re under eating protein today. Consider adding a protein rich snack like Greek yogurt or nuts to meet your daily goal.
              </p>
            </div>
          </div>

          {/* Meals List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allDayMeals.length > 0 ? (
              allDayMeals.map((meal: any, i: number) => (
                <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center shadow-sm">
                  {meal.image && (
                    <img src={meal.image} alt={meal.name} className="w-16 h-16 rounded-xl object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{meal.type}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 truncate">{meal.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{meal.protein}g protein</span>
                      <span className="text-xs font-bold text-[#16A34A]">{meal.calories} cal</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 bg-white rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center text-center">
                <UtensilsCrossed className="w-12 h-12 text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-900">No meals planned yet</h3>
                <p className="text-gray-400 text-sm mt-1">Start planning your meals to see them here.</p>
                <Link to="/dashboard/planner" className="mt-4">
                  <Button className="bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl px-6">
                    Open Planner
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Macro Breakdown */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Macro Breakdown</h2>
          <Card className="bg-white border border-gray-200 shadow-sm rounded-2xl p-8">
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <ProgressRing 
                  value={calories.consumed}
                  max={calories.goal || 2000}
                  size={160} 
                  strokeWidth={12}
                  label="Daily Goal"
                  valueText={`${calories.consumed} / ${calories.goal} kcal`}
                />
              </div>

              <div className="w-full space-y-6">
                {[
                  { label: "Protein", consumed: protein.consumed, goal: protein.goal, color: "bg-[#2563EB]" },
                  { label: "Carbs", consumed: carbs.consumed, goal: carbs.goal, color: "bg-[#F97316]" },
                  { label: "Fats", consumed: fats.consumed, goal: fats.goal, color: "bg-[#0EA5E9]" },
                ].map((macro) => (
                  <div key={macro.label} className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-gray-600">{macro.label}</span>
                      <span className="text-gray-400">{macro.consumed}g / {macro.goal}g</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className={`h-full rounded-full ${macro.color}`} 
                        style={{ width: `${Math.min(100, macro.goal > 0 ? (macro.consumed / macro.goal) * 100 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
          
          <div className="mt-8">
             <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Weekly Adherence</h3>
             <div className="flex justify-between items-end h-32 gap-2">
               {[65, 80, 45, 90, 75, 60, 0].map((val, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gray-100 rounded-t-lg relative flex items-end overflow-hidden" style={{ height: '100px' }}>
                      <div className="w-full bg-[#16A34A] rounded-t-sm" style={{ height: `${val}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                    </span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
