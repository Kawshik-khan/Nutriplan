import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Settings, Save, X } from 'lucide-react';
import { useRecommendationStore } from '../stores/recommendation-store';

interface PreferencesManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreferencesManager({ isOpen, onClose }: PreferencesManagerProps) {
  const { userPreferences, updateUserPreferences } = useRecommendationStore();
  const [localPreferences, setLocalPreferences] = useState(userPreferences);
  const [isSaving, setIsSaving] = useState(false);

  const dietaryOptions = [
    'vegetarian',
    'vegan',
    'gluten-free',
    'dairy-free',
    'keto',
    'pescatarian',
    'low-carb',
    'low-sodium'
  ];

  const mealTypeOptions = [
    'high-protein',
    'balanced',
    'low-calorie',
    'quick-meal',
    'meal-prep',
    'fresh',
    'mediterranean',
    'comfort-food'
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserPreferences(localPreferences);
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDietaryRestrictionChange = (restriction: string, checked: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      dietaryRestrictions: checked
        ? [...prev.dietaryRestrictions, restriction]
        : prev.dietaryRestrictions.filter(r => r !== restriction)
    }));
  };

  const handleMealTypeChange = (mealType: string, checked: boolean) => {
    setLocalPreferences(prev => ({
      ...prev,
      preferredMealTypes: checked
        ? [...prev.preferredMealTypes, mealType]
        : prev.preferredMealTypes.filter(t => t !== mealType)
    }));
  };

  const handleDislikedFoodChange = (index: number, value: string) => {
    setLocalPreferences(prev => ({
      ...prev,
      dislikedFoods: prev.dislikedFoods.map((food, i) => i === index ? value : food)
    }));
  };

  const addDislikedFood = () => {
    setLocalPreferences(prev => ({
      ...prev,
      dislikedFoods: [...prev.dislikedFoods, '']
    }));
  };

  const removeDislikedFood = (index: number) => {
    setLocalPreferences(prev => ({
      ...prev,
      dislikedFoods: prev.dislikedFoods.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-[#16A34A]" />
              <h2 className="text-xl font-bold text-gray-900">Nutrition Preferences</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Dietary Restrictions */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-3 block">Dietary Restrictions</Label>
              <div className="grid grid-cols-2 gap-3">
                {dietaryOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={localPreferences.dietaryRestrictions.includes(option)}
                      onCheckedChange={(checked) => handleDietaryRestrictionChange(option, checked as boolean)}
                    />
                    <Label htmlFor={option} className="text-sm text-gray-700 capitalize">
                      {option.replace('-', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferred Meal Types */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-3 block">Preferred Meal Types</Label>
              <div className="grid grid-cols-2 gap-3">
                {mealTypeOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={localPreferences.preferredMealTypes.includes(option)}
                      onCheckedChange={(checked) => handleMealTypeChange(option, checked as boolean)}
                    />
                    <Label htmlFor={option} className="text-sm text-gray-700 capitalize">
                      {option.replace('-', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Disliked Foods */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-bold text-gray-700">Disliked Foods</Label>
                <Button variant="outline" size="sm" onClick={addDislikedFood}>
                  Add Food
                </Button>
              </div>
              <div className="space-y-2">
                {localPreferences.dislikedFoods.map((food, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={food}
                      onChange={(e) => handleDislikedFoodChange(index, e.target.value)}
                      placeholder="Enter food name"
                      className="flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDislikedFood(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {localPreferences.dislikedFoods.length === 0 && (
                  <p className="text-sm text-gray-500 italic">No disliked foods added</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex-1 bg-[#16A34A] hover:bg-[#15803D]"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
