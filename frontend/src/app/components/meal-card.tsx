import { Plus, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface MealCardProps {
  image: string | null;
  title: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  tags?: string[];
  variant?: "compact" | "expanded";
  selected?: boolean;
  onAdd?: () => void;
  onSwap?: () => void;
}

export function MealCard({
  image,
  title,
  protein,
  carbs,
  fat,
  calories,
  tags = [],
  variant = "compact",
  selected = false,
  onAdd,
  onSwap,
}: MealCardProps) {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden transition-all ${
        selected ? "ring-2 ring-[#16A34A] shadow-lg" : "shadow-sm hover:shadow-md"
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-[#F3F4F6]">
        <img 
          src={image ?? "https://via.placeholder.com/400x225?text=No+Image"} 
          alt={title} 
          className="w-full h-full object-cover" 
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h4 className="font-semibold text-[#111827] line-clamp-2">{title}</h4>

        {/* Macros */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex flex-col">
            <span className="text-xs text-[#6B7280]">Protein</span>
            <span className="font-medium text-[#111827]">{protein}g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-[#6B7280]">Carbs</span>
            <span className="font-medium text-[#111827]">{carbs}g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-[#6B7280]">Fat</span>
            <span className="font-medium text-[#111827]">{fat}g</span>
          </div>
          <div className="flex flex-col ml-auto">
            <span className="text-xs text-[#6B7280]">Calories</span>
            <span className="font-semibold text-[#16A34A]">{calories}</span>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-[#F3F4F6] text-[#374151] hover:bg-[#D1D5DB]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        {variant === "expanded" && (
          <div className="flex gap-2 pt-2">
            {onAdd && (
              <Button
                onClick={onAdd}
                className="flex-1 bg-[#16A34A] hover:bg-[#15803D]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add to Plan
              </Button>
            )}
            {onSwap && (
              <Button
                onClick={onSwap}
                variant="outline"
                className="border-[#D1D5DB]"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
