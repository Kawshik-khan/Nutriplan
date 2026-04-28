import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Sparkles, ArrowRight, Zap, Target, Salad, Info, Loader2, AlertCircle, CheckCircle, XCircle, Settings } from "lucide-react";
import { useRecommendationStore, Recommendation, SuggestedMeal, FeedbackType } from "../stores/recommendation-store";
import PreferencesManager from "../components/preferences-manager";

// Icon mapping
const iconMap = {
  Zap,
  Target,
  Salad,
};

export default function Recommendations() {
  const {
    recommendations,
    suggestedMeals,
    loading,
    error,
    fetchRecommendations,
    fetchSuggestedMeals,
    fetchUserPreferences,
    markAsViewed,
    provideFeedback,
    addToMealPlan,
    refreshRecommendations,
    clearError
  } = useRecommendationStore();

  const [feedbackStates, setFeedbackStates] = useState<Record<string, FeedbackType | null>>({});
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Load all data on component mount
    const loadData = async () => {
      await Promise.all([
        fetchRecommendations(),
        fetchSuggestedMeals(),
        fetchUserPreferences(),
      ]);
    };
    
    loadData();
  }, [fetchRecommendations, fetchSuggestedMeals, fetchUserPreferences]);

  const handleLearnMore = async (recommendation: Recommendation) => {
    await markAsViewed(recommendation.id);
    setExpandedRecommendation(expandedRecommendation === recommendation.id ? null : recommendation.id);
  };

  const handleFeedback = async (recommendationId: string, feedbackType: FeedbackType) => {
    await provideFeedback(recommendationId, feedbackType);
    setFeedbackStates(prev => ({ ...prev, [recommendationId]: feedbackType }));
  };

  const handleAddMeal = async (meal: SuggestedMeal) => {
    await addToMealPlan(meal);
    // Could add success notification here
  };

  const handleRetry = () => {
    clearError();
    refreshRecommendations();
  };

  // Loading state
  if (loading && recommendations.length === 0) {
    return (
      <div className="p-8 bg-[#F3F4F6] min-h-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            AI Recommendations <Sparkles className="w-8 h-8 text-[#16A34A]" />
          </h1>
          <p className="text-gray-500 mt-1">Personalized nutrition and lifestyle insights powered by AI</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#16A34A] mr-3" />
          <span className="text-gray-600">Generating personalized recommendations...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 bg-[#F3F4F6] min-h-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            AI Recommendations <Sparkles className="w-8 h-8 text-[#16A34A]" />
          </h1>
          <p className="text-gray-500 mt-1">Personalized nutrition and lifestyle insights powered by AI</p>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mr-4" />
          <div className="text-center">
            <p className="text-gray-700 mb-4">Failed to load recommendations</p>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={handleRetry}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-[#F3F4F6] min-h-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            AI Recommendations <Sparkles className="w-8 h-8 text-[#16A34A]" />
          </h1>
          <p className="text-gray-500 mt-1">Personalized nutrition and lifestyle insights powered by AI</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreferences(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Preferences
          </Button>
          <Button variant="outline" onClick={refreshRecommendations} disabled={loading}>
            <Loader2 className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec) => {
          const IconComponent = iconMap[rec.icon as keyof typeof iconMap] || Zap;
          const feedback = feedbackStates[rec.id];
          const isExpanded = expandedRecommendation === rec.id;
          
          return (
            <Card key={rec.id} className={`bg-white border shadow-sm rounded-2xl p-6 flex flex-col justify-between group transition-all ${
              rec.isViewed ? 'border-gray-200' : 'border-[#16A34A]/20 hover:border-[#16A34A]'
            }`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-10 h-10 ${rec.color} rounded-xl flex items-center justify-center shadow-sm`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                    {rec.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#16A34A] transition-colors">
                  {rec.title}
                </h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{rec.description}</p>
                
                {/* Expanded details */}
                {isExpanded && rec.data && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                    <div className="font-medium mb-2">Detailed Analysis:</div>
                    {rec.data.currentAverage && (
                      <div>Current average: {rec.data.currentAverage}g</div>
                    )}
                    {rec.data.targetProtein && (
                      <div>Target: {rec.data.targetProtein}g</div>
                    )}
                    {rec.data.recommendedIncrease && (
                      <div>Recommended increase: {rec.data.recommendedIncrease}g</div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between text-gray-600 hover:text-[#16A34A] hover:bg-emerald-50 rounded-xl px-2 group/btn transition-all"
                  onClick={() => handleLearnMore(rec)}
                >
                  <span className="text-sm font-bold">
                    {isExpanded ? 'Show Less' : 'Learn More'}
                  </span>
                  <ArrowRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : 'group-hover/btn:translate-x-1'}`} />
                </Button>
                
                {/* Feedback buttons */}
                {rec.isViewed && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex-1 text-xs ${feedback === 'helpful' ? 'text-green-600 bg-green-50' : 'text-gray-500'}`}
                      onClick={() => handleFeedback(rec.id, 'helpful')}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Helpful
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex-1 text-xs ${feedback === 'not_helpful' ? 'text-red-600 bg-red-50' : 'text-gray-500'}`}
                      onClick={() => handleFeedback(rec.id, 'not_helpful')}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Not Helpful
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex-1 text-xs ${feedback === 'implemented' ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
                      onClick={() => handleFeedback(rec.id, 'implemented')}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Implemented
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Suggested Meals Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Suggested for You</h2>
          {suggestedMeals.length > 0 && (
            <span className="text-sm text-gray-500">
              Based on your preferences and goals
            </span>
          )}
        </div>
        
        {suggestedMeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedMeals.map((meal) => (
              <div key={meal.id} className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-4 items-center shadow-sm hover:border-[#16A34A] transition-all">
                <img src={meal.image} alt={meal.name} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900">{meal.name}</h4>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{meal.protein}g protein</span>
                    <span className="text-xs font-bold text-[#16A34A]">{meal.calories} cal</span>
                  </div>
                  {meal.reason && (
                    <p className="text-xs text-gray-400 mt-1 italic">{meal.reason}</p>
                  )}
                  <Button 
                    className="mt-3 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-lg h-7 px-3 text-[10px] font-bold"
                    onClick={() => handleAddMeal(meal)}
                  >
                    Add to Plan
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No meal suggestions available yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Try logging more meals to get personalized suggestions.
            </p>
          </div>
        )}
      </div>
      
      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <p className="text-xs text-blue-700 leading-relaxed">
          These recommendations are generated by an AI model and should be used for informational purposes only. Always consult with a healthcare professional before making significant changes to your diet or exercise routine.
        </p>
      </div>

      {/* Preferences Manager */}
      <PreferencesManager 
        isOpen={showPreferences} 
        onClose={() => setShowPreferences(false)} 
      />
    </div>
  );
}
