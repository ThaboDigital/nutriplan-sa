import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Search, Camera, Plus, CheckCircle2, Flame, Dumbbell, AlertCircle } from 'lucide-react';
import { SA_RECIPES } from '../../data/saFoodDatabase';
import { formatCalories } from '../../utils/formatters';

export const QuickFoodLogModal: React.FC = () => {
  const { isFoodLogOpen, setIsFoodLogOpen, userProfile, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [photoRecognizedResult, setPhotoRecognizedResult] = useState<{
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
  } | null>(null);

  if (!isFoodLogOpen) return null;

  const quickCommonFoods = [
    { name: 'Boiled Egg (Large)', calories: 72, proteinG: 6, portion: '1 egg' },
    { name: 'Avocado (Half)', calories: 120, proteinG: 1.5, portion: '1/2 medium' },
    { name: 'Grilled Chicken Breast', calories: 165, proteinG: 31, portion: '150g' },
    { name: 'Braised Morogo / Spinach', calories: 45, proteinG: 3.5, portion: '1 cup' },
    { name: 'Lean Beef Mince (Cooked)', calories: 210, proteinG: 26, portion: '100g' },
    { name: 'Canned Tuna in Brine', calories: 130, proteinG: 28, portion: '1 can (120g drained)' },
    { name: 'Rooibos Tea (Black)', calories: 2, proteinG: 0, portion: '1 mug' },
    { name: 'Boerewors (Portion)', calories: 290, proteinG: 18, portion: '100g' },
  ];

  const handleSimulatePhotoRecognition = () => {
    setIsAnalyzingPhoto(true);
    setPhotoRecognizedResult(null);

    setTimeout(() => {
      setIsAnalyzingPhoto(false);
      setPhotoRecognizedResult({
        name: 'Flame-Grilled Chicken with Steamed Green Beans',
        calories: 360,
        proteinG: 38,
        carbsG: 6,
        fatG: 14
      });
      showToast('Food recognized from camera preview!', 'info');
    }, 1500);
  };

  const handleLogItem = (name: string, kcal: number) => {
    showToast(`Logged "${name}" to ${selectedMealType} (+${kcal} kcal)`, 'success');
    setIsFoodLogOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-[#E8EDE9]">
        {/* Header */}
        <div className="p-4 bg-[#FFFDF8] border-b border-[#E8EDE9] flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[#17211B]">Quick Food Diary</h3>
            <p className="text-[11px] text-[#6B756C]">Simple tracking without obsessive counting</p>
          </div>
          <button
            onClick={() => setIsFoodLogOpen(false)}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#6B756C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Type Switcher */}
        <div className="p-3 bg-[#F8F9FA] border-b border-[#E8EDE9] flex gap-1.5">
          {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map(type => (
            <button
              key={type}
              onClick={() => setSelectedMealType(type)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedMealType === type
                  ? 'bg-[#17211B] text-white shadow-2xs'
                  : 'bg-white text-[#6B756C] border border-[#E8EDE9]'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* AI Camera Recognition Simulator */}
          <div className="p-4 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#3FAE68] text-white flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-[#17211B]">AI Plate Photo Recognition</h4>
                  <p className="text-[10px] text-[#6B756C]">Snap your plate for rapid logging</p>
                </div>
              </div>

              <button
                onClick={handleSimulatePhotoRecognition}
                disabled={isAnalyzingPhoto}
                className="px-3 py-1.5 rounded-xl bg-[#17211B] text-white text-xs font-bold hover:bg-black transition active:scale-95 disabled:opacity-50"
              >
                {isAnalyzingPhoto ? 'Analyzing...' : 'Scan Plate'}
              </button>
            </div>

            {/* Recognized result box */}
            {photoRecognizedResult && (
              <div className="p-3 rounded-xl bg-white border border-[#3FAE68]/40 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-[#17211B]">
                    {photoRecognizedResult.name}
                  </span>
                  <span className="text-[10px] font-extrabold text-[#3FAE68] bg-[#EAF7EF] px-2 py-0.5 rounded-full">
                    AI Match
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-bold text-[#6B756C]">
                  <span>{photoRecognizedResult.calories} kcal</span>
                  <span className="text-[#3FAE68]">{photoRecognizedResult.proteinG}g protein</span>
                  <span>{photoRecognizedResult.carbsG}g carbs</span>
                </div>

                {/* Clear disclaimer */}
                <div className="flex items-center gap-1 text-[10px] text-[#F2A65A] italic">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Estimates only. Plate portions may vary based on cooking oils.</span>
                </div>

                <button
                  onClick={() => handleLogItem(photoRecognizedResult.name, photoRecognizedResult.calories)}
                  className="w-full py-2 rounded-xl bg-[#3FAE68] text-white text-xs font-bold hover:bg-[#369a5b] transition"
                >
                  Log This Plate
                </button>
              </div>
            )}
          </div>

          {/* Quick Common Items */}
          <div>
            <span className="text-[10px] font-bold text-[#6B756C] uppercase tracking-wider block mb-2">
              Frequent South African Foods
            </span>

            <div className="space-y-2">
              {quickCommonFoods.map((f, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-[#E8EDE9] hover:border-[#3FAE68] transition"
                >
                  <div>
                    <span className="font-bold text-xs text-[#17211B] block">{f.name}</span>
                    <span className="text-[10px] text-[#6B756C]">
                      {f.portion} ' {f.calories} kcal ' {f.proteinG}g protein
                    </span>
                  </div>

                  <button
                    onClick={() => handleLogItem(f.name, f.calories)}
                    className="p-1.5 rounded-xl bg-[#EAF7EF] text-[#2C854E] hover:bg-[#3FAE68] hover:text-white transition active:scale-90"
                    title="Log item"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
