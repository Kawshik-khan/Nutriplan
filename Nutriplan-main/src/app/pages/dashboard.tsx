import { useState } from "react";
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
  ArrowRight
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

const DAYS: WeekDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function StatCard({ title, value, subValue, icon: Icon, progress, colorClass, trend }: any) {
  return (
    <Card className="premium-card border-0">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-zinc-900">{value}</p>
          <p className="text-[10px] font-medium text-zinc-500 mt-1">{subValue}</p>
        </div>
        <div className={`w-12 h-12 ${colorClass} rounded-2xl flex items-center justify-center shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {progress !== undefined && (
        <div className="w-full bg-zinc-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${colorClass.replace('/10', '')}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {trend && (
        <p className={`text-[10px] font-bold mt-2 flex items-center gap-1 ${trend.positive ? "text-emerald-600" : "text-red-600"}`}>
          {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend.label}
        </p>
      )}
    </Card>
  );
}

export function Dashboard() {
  const { data: overview, isLoading, error } = useDashboardOverview();
  const addWaterMutation = useAddWater();
  const { weeklyPlan } = useMealPlan();
  
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }) as WeekDay;
  const [selectedDay, setSelectedDay] = useState<WeekDay>(today);

  const dayMeals = weeklyPlan[selectedDay];
  const allDayMeals = Object.entries(dayMeals).flatMap(([type, meals]) => 
    meals.map(m => ({ ...m, type: type as MealType }))
  );

  // Find other days with meals for the UX fix
  const otherDaysWithMeals = DAYS.filter(d => {
    const meals = weeklyPlan[d];
    return Object.values(meals).some(m => m.length > 0);
  });

  const calories = overview?.today.calories ?? { consumed: 1240, goal: 2000 };
  const protein = overview?.today.macros.protein ?? { consumed: 85, goal: 150 };
  const water = overview?.today.water ?? { glasses: 6, goalGlasses: 8 };
  const weight = overview?.today.weight ?? { currentKg: 72.5, deltaKg: -0.8 };

  const handleAddWater = () => addWaterMutation.mutate();

  const greetingName = overview?.user.fullName?.split(" ")[0] ?? "there";

  if (error) return (
    <div className="p-8"><Card className="p-8 bg-red-50 border-red-200 text-red-700">Error: {error.message}</Card></div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">
            Good morning, <span className="text-gradient">{isLoading ? "..." : greetingName}</span>! 👋
          </h1>
          <p className="text-zinc-500 font-medium mt-1">Here&apos;s your health summary for today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/planner">
            <Button className="rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white px-6">
              <Calendar className="w-4 h-4 mr-2" />
              Plan Meals
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)
        ) : (
          <>
            <StatCard 
              title="Calories" 
              value={calories.consumed.toLocaleString()} 
              subValue={`of ${calories.goal} kcal`}
              icon={Zap}
              progress={(calories.consumed / calories.goal) * 100}
              colorClass="bg-emerald-500/10 text-emerald-600"
              trend={{ label: "On track", positive: true }}
            />
            <StatCard 
              title="Protein" 
              value={`${protein.consumed}g`} 
              subValue={`of ${protein.goal}g`}
              icon={TrendingUp}
              progress={(protein.consumed / protein.goal) * 100}
              colorClass="bg-blue-500/10 text-blue-600"
              trend={{ label: "High intake", positive: true }}
            />
            <StatCard 
              title="Water" 
              value={`${water.glasses}`} 
              subValue={`of ${water.goalGlasses} glasses`}
              icon={Droplet}
              progress={(water.glasses / water.goalGlasses) * 100}
              colorClass="bg-cyan-500/10 text-cyan-600"
            />
            <StatCard 
              title="Weight" 
              value={`${weight.currentKg ?? "--"}`} 
              subValue="kg current"
              icon={Weight}
              colorClass="bg-orange-500/10 text-orange-600"
              trend={{ label: `${weight.deltaKg}kg this week`, positive: weight.deltaKg <= 0 }}
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Meals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-zinc-900">Meal Plan</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="rounded-xl h-8 px-2 text-zinc-500 hover:text-zinc-900">
                    {selectedDay === today ? "Today" : selectedDay}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="rounded-xl border-zinc-200">
                  {DAYS.map(day => (
                    <DropdownMenuItem 
                      key={day} 
                      onClick={() => setSelectedDay(day)}
                      className="rounded-lg font-medium"
                    >
                      {day} {day === today && "(Today)"}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allDayMeals.length > 0 ? (
              allDayMeals.map((meal, i) => (
                <div key={i} className="premium-card group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      {meal.type}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    {meal.image && (
                      <img src={meal.image} alt={meal.name} className="w-16 h-16 rounded-xl object-cover shadow-sm" />
                    )}
                    <div>
                      <h3 className="font-bold text-zinc-900 group-hover:text-emerald-600 transition-colors">{meal.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-semibold text-zinc-500">{meal.calories} kcal</span>
                        <span className="text-xs font-semibold text-zinc-500">{meal.protein}g protein</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 px-6 glass rounded-3xl border-dashed border-zinc-300 flex flex-col items-center text-center">
                <UtensilsCrossed className="w-12 h-12 text-zinc-300 mb-4" />
                <h3 className="text-lg font-bold text-zinc-900">No meals planned for {selectedDay}</h3>
                
                {otherDaysWithMeals.length > 0 && selectedDay === today && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-zinc-500">
                      You have meals planned on: <br/>
                      <span className="font-bold text-zinc-700">{otherDaysWithMeals.join(", ")}</span>
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {otherDaysWithMeals.slice(0, 3).map(day => (
                        <Button 
                          key={day} 
                          variant="outline" 
                          size="sm" 
                          className="rounded-xl border-zinc-200 text-xs font-bold"
                          onClick={() => setSelectedDay(day)}
                        >
                          View {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <Link to="/dashboard/planner" className="mt-6">
                  <Button className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                    Open Planner
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-zinc-900">Quick Log</h2>
          <Card className="premium-card bg-emerald-600 text-white border-0">
            <CardContent className="p-0 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold">Water Tracker</h3>
                  <p className="text-xs text-white/80">{water.glasses} of {water.goalGlasses} glasses</p>
                </div>
              </div>
              <Button 
                className="w-full bg-white text-emerald-600 hover:bg-emerald-50 rounded-xl font-bold"
                onClick={handleAddWater}
              >
                + Add Glass
              </Button>
            </CardContent>
          </Card>

          <Card className="premium-card border-zinc-200">
            <h3 className="font-bold text-zinc-900 mb-4">AI Recommendations</h3>
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 group cursor-pointer">
                  <div className="w-12 h-12 bg-zinc-100 rounded-xl overflow-hidden shadow-inner">
                    <Skeleton className="w-full h-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate group-hover:text-emerald-600 transition-colors">High Protein Bowl</p>
                    <p className="text-[10px] font-semibold text-zinc-500">Recommended for your goal</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1" />
                </div>
              ))}
            </div>
            <Link to="/dashboard/recommendations">
              <Button variant="ghost" className="w-full mt-4 text-emerald-600 font-bold text-xs hover:bg-emerald-50 rounded-xl">
                View All Suggestions
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
