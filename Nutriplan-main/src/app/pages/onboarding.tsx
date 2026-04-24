import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Checkbox } from "../components/ui/checkbox";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Salad, ArrowRight, ArrowLeft } from "lucide-react";

const TOTAL_STEPS = 5;

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    goal: "",
    preferences: [] as string[],
    allergies: [] as string[],
  });

  const progress = (step / TOTAL_STEPS) * 100;

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      navigate("/");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const togglePreference = (pref: string) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(pref)
        ? prev.preferences.filter((p) => p !== pref)
        : [...prev.preferences, pref],
    }));
  };

  const toggleAllergy = (allergy: string) => {
    setFormData((prev) => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter((a) => a !== allergy)
        : [...prev.allergies, allergy],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F3F4F6] via-white to-[#F3F4F6] flex items-center justify-center p-8">
      <Card className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#16A34A] to-[#15803D] p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Salad className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Welcome to Nutriplan</h1>
              <p className="text-white/90 text-sm">Let's personalize your nutrition plan</p>
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-white/20" />
          <p className="text-sm text-white/80 mt-2">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#111827] mb-2">
                  Tell us about yourself
                </h2>
                <p className="text-[#6B7280]">
                  This helps us calculate your nutritional needs accurately
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="bg-[#F3F4F6] border-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="font-normal">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="font-normal">Female</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="175"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="bg-[#F3F4F6] border-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="bg-[#F3F4F6] border-0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Goals */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#111827] mb-2">
                  What's your primary goal?
                </h2>
                <p className="text-[#6B7280]">
                  We'll tailor your meal plans to help you achieve it
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { value: "weight-loss", label: "Weight Loss", desc: "Reduce body weight with a calorie deficit" },
                  { value: "muscle-gain", label: "Muscle Gain", desc: "Build muscle with high protein intake" },
                  { value: "maintenance", label: "Maintain Weight", desc: "Keep your current weight and stay healthy" },
                  { value: "health", label: "General Health", desc: "Improve overall nutrition and wellness" },
                ].map((goal) => (
                  <Card
                    key={goal.value}
                    className={`p-4 cursor-pointer transition-all border-2 ${
                      formData.goal === goal.value
                        ? "border-[#16A34A] bg-[#16A34A]/5"
                        : "border-[#D1D5DB] hover:border-[#16A34A]/50"
                    }`}
                    onClick={() => setFormData({ ...formData, goal: goal.value })}
                  >
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={goal.value} checked={formData.goal === goal.value} />
                      <div>
                        <h3 className="font-semibold text-[#111827]">{goal.label}</h3>
                        <p className="text-sm text-[#6B7280]">{goal.desc}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Preferences */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#111827] mb-2">
                  Dietary preferences
                </h2>
                <p className="text-[#6B7280]">
                  Select all that apply to you
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Vegan", "Vegetarian", "Halal", "Kosher", "Gluten-Free", "Dairy-Free", "Low-Carb", "Keto"].map(
                  (pref) => (
                    <Card
                      key={pref}
                      className={`p-4 cursor-pointer transition-all border-2 ${
                        formData.preferences.includes(pref)
                          ? "border-[#16A34A] bg-[#16A34A]/5"
                          : "border-[#D1D5DB] hover:border-[#16A34A]/50"
                      }`}
                      onClick={() => togglePreference(pref)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={formData.preferences.includes(pref)} />
                        <span className="font-medium text-[#111827]">{pref}</span>
                      </div>
                    </Card>
                  )
                )}
              </div>
            </div>
          )}

          {/* Step 4: Allergies */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#111827] mb-2">
                  Allergies & restrictions
                </h2>
                <p className="text-[#6B7280]">
                  Help us keep you safe with allergen-free recommendations
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Peanuts", "Tree Nuts", "Shellfish", "Dairy", "Eggs", "Soy", "Wheat", "Fish"].map(
                  (allergy) => (
                    <Card
                      key={allergy}
                      className={`p-4 cursor-pointer transition-all border-2 ${
                        formData.allergies.includes(allergy)
                          ? "border-[#DC2626] bg-[#DC2626]/5"
                          : "border-[#D1D5DB] hover:border-[#DC2626]/50"
                      }`}
                      onClick={() => toggleAllergy(allergy)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox checked={formData.allergies.includes(allergy)} />
                        <span className="font-medium text-[#111827]">{allergy}</span>
                      </div>
                    </Card>
                  )
                )}
              </div>
            </div>
          )}

          {/* Step 5: Summary */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold text-[#111827] mb-2">
                  You're all set! 🎉
                </h2>
                <p className="text-[#6B7280]">
                  Here's a summary of your profile
                </p>
              </div>

              <div className="space-y-4">
                <Card className="p-4 bg-[#F3F4F6] border-0">
                  <h3 className="font-semibold text-[#111827] mb-3">Personal Details</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-[#6B7280]">Age:</span> <span className="text-[#111827] font-medium">{formData.age} years</span></div>
                    <div><span className="text-[#6B7280]">Gender:</span> <span className="text-[#111827] font-medium">{formData.gender}</span></div>
                    <div><span className="text-[#6B7280]">Height:</span> <span className="text-[#111827] font-medium">{formData.height} cm</span></div>
                    <div><span className="text-[#6B7280]">Weight:</span> <span className="text-[#111827] font-medium">{formData.weight} kg</span></div>
                  </div>
                </Card>

                <Card className="p-4 bg-[#F3F4F6] border-0">
                  <h3 className="font-semibold text-[#111827] mb-2">Goal</h3>
                  <p className="text-sm text-[#111827]">{formData.goal}</p>
                </Card>

                {formData.preferences.length > 0 && (
                  <Card className="p-4 bg-[#F3F4F6] border-0">
                    <h3 className="font-semibold text-[#111827] mb-2">Preferences</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.preferences.map((pref) => (
                        <span key={pref} className="px-3 py-1 bg-[#16A34A] text-white text-xs rounded-full">
                          {pref}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}

                {formData.allergies.length > 0 && (
                  <Card className="p-4 bg-[#DC2626]/5 border border-[#DC2626]/20">
                    <h3 className="font-semibold text-[#DC2626] mb-2">⚠️ Allergies</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.allergies.map((allergy) => (
                        <span key={allergy} className="px-3 py-1 bg-[#DC2626] text-white text-xs rounded-full">
                          {allergy}
                        </span>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 border-[#D1D5DB]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className="flex-1 bg-[#16A34A] hover:bg-[#15803D]"
            >
              {step === TOTAL_STEPS ? "Get Started" : "Continue"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
