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
    <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{subValue}</p>
          </div>
          <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {progress !== undefined && (
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${colorClass.replace('/10', '')}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
        {trend && (
          <p className={`text-xs font-medium mt-3 flex items-center gap-1 ${trend.positive ? "text-green-600" : "text-red-600"}`}>
            {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const { data: overview, isLoading, error } = useDashboardOverview();
  const addWaterMutation = useAddWater();
  const { weeklyPlan } = useMealPlan();
  
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" }) as WeekDay;
  const [selectedDay, setSelectedDay] = useState<WeekDay>(today);

  // Add safety checks for weeklyPlan
  const safeWeeklyPlan = weeklyPlan || {};
  const dayMeals = safeWeeklyPlan[selectedDay] || {};
  const allDayMeals = Object.entries(dayMeals).flatMap(([type, meals]) => 
    (meals || []).map(m => ({ ...m, type: type as MealType }))
  );

  // Find other days with meals for the UX fix
  const otherDaysWithMeals = DAYS.filter(d => {
    const meals = safeWeeklyPlan[d] || {};
    return Object.values(meals).some(m => m && m.length > 0);
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
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Good morning, <span className="text-green-600">{isLoading ? "..." : greetingName}</span>! 👋
          </h1>
          <p className="text-gray-600 mt-1">Here's your health summary for today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/planner">
            <Button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg">
              <Calendar className="w-4 h-4 mr-2" />
              Plan Meals
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
        ) : (
          <>
            <StatCard 
              title="Calories" 
              value={calories.consumed.toLocaleString()} 
              subValue={`of ${calories.goal} kcal`}
              icon={Zap}
              progress={(calories.consumed / calories.goal) * 100}
              colorClass="bg-green-100 text-green-600"
              trend={{ label: "On track", positive: true }}
            />
            <StatCard 
              title="Protein" 
              value={`${protein.consumed}g`} 
              subValue={`of ${protein.goal}g`}
              icon={TrendingUp}
              progress={(protein.consumed / protein.goal) * 100}
              colorClass="bg-blue-100 text-blue-600"
              trend={{ label: "High intake", positive: true }}
            />
            <StatCard 
              title="Water" 
              value={`${water.glasses}`} 
              subValue={`of ${water.goalGlasses} glasses`}
              icon={Droplet}
              progress={(water.glasses / water.goalGlasses) * 100}
              colorClass="bg-cyan-100 text-cyan-600"
            />
            <StatCard 
              title="Weight" 
              value={`${weight.currentKg ?? "--"}`} 
              subValue="kg current"
              icon={Weight}
              colorClass="bg-orange-100 text-orange-600"
              trend={{ label: `${weight.deltaKg}kg this week`, positive: weight.deltaKg <= 0 }}
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Meals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">Meal Plan</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 px-2 text-gray-500 hover:text-gray-900">
                    {selectedDay === today ? "Today" : selectedDay}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="border-gray-200">
                  {DAYS.map(day => (
                    <DropdownMenuItem 
                      key={day} 
                      onClick={() => setSelectedDay(day)}
                      className="font-medium"
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
                <Card key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {meal.image && (
                        <img src={meal.image} alt={meal.name} className="w-16 h-16 rounded-lg object-cover" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900">{meal.name}</h3>
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                            {meal.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-gray-600">{meal.calories} kcal</span>
                          <span className="text-sm text-gray-600">{meal.protein}g protein</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 px-6 bg-white border border-gray-200 rounded-xl flex flex-col items-center text-center">
                <UtensilsCrossed className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">No meals planned for {selectedDay}</h3>
                
                {otherDaysWithMeals.length > 0 && selectedDay === today && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-gray-500">
                      You have meals planned on: <br/>
                      <span className="font-medium text-gray-700">{otherDaysWithMeals.join(", ")}</span>
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {otherDaysWithMeals.slice(0, 3).map(day => (
                        <Button 
                          key={day} 
                          variant="outline" 
                          size="sm" 
                          className="border-gray-200 text-sm font-medium"
                          onClick={() => setSelectedDay(day)}
                        >
                          View {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <Link to="/dashboard/planner" className="mt-6">
                  <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg">
                    Open Planner
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Quick Log</h2>
          <Card className="bg-green-500 text-white border-0">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Water Tracker</h3>
                  <p className="text-sm text-white/80">{water.glasses} of {water.goalGlasses} glasses</p>
                </div>
              </div>
              <Button 
                className="w-full bg-white text-green-600 hover:bg-gray-50 rounded-lg font-medium"
                onClick={handleAddWater}
              >
                + Add Glass
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-xl">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">AI Recommendations</h3>
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={i} className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg">
                      <Skeleton className="w-full h-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-green-600 transition-colors">High Protein Bowl</p>
                      <p className="text-xs text-gray-500">Recommended for your goal</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 transition-transform group-hover:translate-x-1" />
                  </div>
                ))}
              </div>
              <Link to="/dashboard/recommendations">
                <Button variant="ghost" className="w-full mt-4 text-green-600 font-medium text-sm hover:bg-green-50 rounded-lg">
                  View All Suggestions
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
