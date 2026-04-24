import { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Input } from "../components/ui/input";
import { useGrocery } from "../contexts/grocery-context";
import { useMealPlan, MealType, WeekDay } from "../contexts/meal-context";
import { 
  Plus, 
  Trash2, 
  Utensils, 
  ShoppingCart,
  Search,
  Filter,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";

const CATEGORIES = ["Produce", "Protein", "Dairy", "Pantry"];

export function GroceryList() {
  const { groceryItems, addItem, removeItem, toggleItem } = useGrocery();
  const { addMeal } = useMealPlan();
  const [searchQuery, setSearchQuery] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Produce");
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false);
  const [itemToPlan, setItemToPlan] = useState<any>(null);
  const [planDay, setPlanDay] = useState<WeekDay>("Monday");
  const [planType, setPlanType] = useState<MealType>("Lunch");

  const filteredItems = groceryItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddItem = () => {
    if (newItemName.trim()) {
      addItem(newItemName, "1 unit", selectedCategory);
      setNewItemName("");
    }
  };

  const handlePushToPlanner = () => {
    if (itemToPlan) {
      addMeal(planDay, planType, {
        id: Math.random().toString(36).substr(2, 9),
        name: itemToPlan.name,
        calories: 100, // Mock calories
        protein: 10,  // Mock protein
      });
      setIsPlanDialogOpen(false);
      setItemToPlan(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">Grocery <span className="text-gradient">List</span></h1>
          <p className="text-zinc-500 font-medium mt-1">Manage your essentials and plan your shopping.</p>
        </div>
        <div className="flex items-center gap-2 glass p-2 rounded-2xl">
          <div className="flex items-center gap-2 px-3">
            <ShoppingCart className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-zinc-900">{groceryItems.length} Items</span>
          </div>
        </div>
      </div>

      {/* Add Item Bar */}
      <div className="glass p-3 rounded-3xl flex flex-wrap md:flex-nowrap items-center gap-3 border-zinc-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input 
            placeholder="Add new item..." 
            className="pl-12 h-12 rounded-2xl bg-zinc-50 border-0 focus:ring-0"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
          />
        </div>
        <div className="flex gap-2 p-1 bg-zinc-50 rounded-2xl overflow-hidden">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                selectedCategory === cat ? "bg-white text-emerald-600 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <Button 
          onClick={handleAddItem}
          className="h-12 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
        >
          Add
        </Button>
      </div>

      {/* List Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input 
          placeholder="Search your list..." 
          className="pl-12 h-12 rounded-2xl bg-white border-zinc-100 shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {CATEGORIES.map(cat => {
          const items = filteredItems.filter(i => i.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">{cat}</h3>
                <span className="text-[10px] font-bold text-zinc-300">{items.length} items</span>
              </div>
              <div className="space-y-3">
                {items.map(item => (
                  <div 
                    key={item.id} 
                    className={`premium-card flex items-center justify-between group p-4 border-zinc-100 transition-all ${
                      item.checked ? "opacity-50 grayscale" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox 
                        checked={item.checked} 
                        onCheckedChange={() => toggleItem(item.id)}
                        className="rounded-lg border-zinc-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                      />
                      <div>
                        <p className={`text-sm font-bold ${item.checked ? "line-through text-zinc-400" : "text-zinc-900"}`}>
                          {item.name}
                        </p>
                        <p className="text-[10px] font-semibold text-zinc-400">{item.amount}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                        onClick={() => { setItemToPlan(item); setIsPlanDialogOpen(true); }}
                      >
                        <Utensils className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Dialog */}
      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="rounded-3xl border-0 shadow-2xl p-0 overflow-hidden max-w-sm">
          <div className="p-6 bg-zinc-900 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add to Plan</DialogTitle>
              <p className="text-zinc-400 text-sm">Suggested meal for "{itemToPlan?.name}"</p>
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
              onClick={handlePushToPlanner}
              className="w-full h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Add to Planner
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
