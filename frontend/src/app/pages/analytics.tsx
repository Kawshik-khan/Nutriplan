import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Calendar,
  Zap,
  Info,
  ChevronRight
} from "lucide-react";

const weightData = [
  { date: "W1", weight: 75.2 },
  { date: "W2", weight: 74.8 },
  { date: "W3", weight: 74.3 },
  { date: "W4", weight: 73.9 },
  { date: "W5", weight: 73.4 },
  { date: "W6", weight: 73.0 },
  { date: "W7", weight: 72.5 },
];

const caloriesData = [
  { day: "Mon", calories: 1850, target: 2000 },
  { day: "Tue", calories: 1920, target: 2000 },
  { day: "Wed", calories: 2100, target: 2000 },
  { day: "Thu", calories: 1780, target: 2000 },
  { day: "Fri", calories: 1950, target: 2000 },
  { day: "Sat", calories: 2200, target: 2000 },
  { day: "Sun", calories: 1890, target: 2000 },
];

const macrosData = [
  { day: "Mon", protein: 128, carbs: 185, fat: 62 },
  { day: "Tue", protein: 142, carbs: 195, fat: 58 },
  { day: "Wed", protein: 135, carbs: 210, fat: 72 },
  { day: "Thu", protein: 118, carbs: 172, fat: 55 },
  { day: "Fri", protein: 145, carbs: 188, fat: 65 },
  { day: "Sat", protein: 152, carbs: 220, fat: 78 },
  { day: "Sun", protein: 138, carbs: 192, fat: 68 },
];

export default function Analytics() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">Analytics & <span className="text-gradient">Progress</span></h1>
          <p className="text-zinc-500 font-medium mt-1">Deep dive into your nutrition and physical evolution.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-zinc-200">
            <Calendar className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button className="rounded-xl bg-zinc-900 text-white font-bold px-6">Export</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="premium-card border-zinc-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Total Weight Lost</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-zinc-900">-2.7kg</span>
            <span className="text-xs font-bold text-emerald-600 mb-1 flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" />
              On Track
            </span>
          </div>
        </Card>
        <Card className="premium-card border-zinc-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Avg. Adherence</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-zinc-900">92%</span>
            <span className="text-xs font-bold text-emerald-600 mb-1 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +5%
            </span>
          </div>
        </Card>
        <Card className="premium-card border-zinc-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Calorie Consistency</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-zinc-900">High</span>
            <span className="text-xs font-bold text-zinc-400 mb-1">Excellent</span>
          </div>
        </Card>
        <Card className="premium-card border-zinc-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Goal Reach Date</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-zinc-900">Jun 12</span>
            <span className="text-xs font-bold text-zinc-400 mb-1">Estimated</span>
          </div>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="premium-card border-zinc-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-zinc-900">Weight Evolution</h3>
            <Badge className="bg-zinc-100 text-zinc-500 border-0">Weekly</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#A1A1AA' }} dy={10} />
              <YAxis hide domain={[70, 78]} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#10B981" 
                strokeWidth={4} 
                dot={{ fill: '#10B981', r: 4, strokeWidth: 0 }} 
                activeDot={{ r: 6, strokeWidth: 0 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="premium-card border-zinc-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-zinc-900">Macro Breakdown</h3>
            <Badge className="bg-zinc-100 text-zinc-500 border-0">Daily</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={macrosData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#A1A1AA' }} dy={10} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="protein" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.8} />
              <Area type="monotone" dataKey="carbs" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.8} />
              <Area type="monotone" dataKey="fat" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.8} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Insights Banner */}
      <Card className="premium-card bg-zinc-900 text-white border-0 overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp className="w-48 h-48 text-white" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Behavioral Insight</span>
            </div>
            <h2 className="text-3xl font-bold">Your energy peaks on <span className="text-emerald-400">Tuesdays.</span></h2>
            <p className="text-zinc-400 max-w-md text-sm leading-relaxed">
              Based on your adherence score, you perform best early in the week. We recommend scheduling your most challenging meals for then.
            </p>
          </div>
          <Button className="rounded-2xl bg-white text-zinc-900 font-bold px-8 h-12 hover:bg-emerald-50 shrink-0">
            View All Insights
          </Button>
        </div>
      </Card>
    </div>
  );
}
