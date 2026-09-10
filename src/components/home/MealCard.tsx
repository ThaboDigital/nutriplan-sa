import React from 'react';
import { PlannedMeal } from '../../types';
import { useApp } from '../../context/AppContext';
import { Clock, Flame, Dumbbell, Shuffle, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { formatZAR } from '../../utils/formatters';

interface MealCardProps {
  meal: PlannedMeal;
}

export const MealCard: React.FC<MealCardProps> = ({ meal }) => {
  const {
    userProfile,
    markMealEaten,
    setSelectedRecipeForDetail,
    setSwapModalTargetMeal,
    regenerateMeal,
  } = useApp();

  const { recipe } = meal;

  return (
    <div className={`bg-white rounded-3xl p-4 border transition-all subtle-shadow ${
      meal.isEaten ? 'border-[#3FAE68]/40 bg-[#FBFDFB]' : 'border-[#E8EDE9]'
    }`}>
      {/* Top row: Time badge, category, SA tag, and Eaten toggle */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
          <span className="px-2 py-0.5 rounded-lg bg-[#17211B] text-white text-[11px] font-black tracking-wide shrink-0">
            {meal.time}
          </span>
          <span className="text-xs font-semibold text-[#6B756C] capitalize truncate">
            {meal.category}
          </span>
          {recipe.isSouthAfricanClassic && (
            <span className="px-2 py-0.5 rounded-full bg-[#FFF2E0] text-[#D97706] text-[10px] font-bold shrink-0">
              🇿🇦 SA Classic
            </span>
          )}
        </div>

        <button
          onClick={() => markMealEaten(meal.id)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 transition active:scale-95 ${
            meal.isEaten
              ? 'bg-[#3FAE68] text-white'
              : 'bg-[#EAF7EF] text-[#2C854E] hover:bg-[#d8f1e1]'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{meal.isEaten ? 'Eaten' : 'Mark Eaten'}</span>
        </button>
      </div>

      {/* Main Content with Photo */}
      <div className="flex gap-3 sm:gap-3.5 items-center">
        <div
          onClick={() => setSelectedRecipeForDetail(recipe)}
          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 cursor-pointer group shadow-xs"
        >
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-1.5">
            <span className="text-[10px] font-bold text-white">View</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h4
            onClick={() => setSelectedRecipeForDetail(recipe)}
            className="font-bold text-xs sm:text-sm text-[#17211B] truncate hover:text-[#3FAE68] transition cursor-pointer"
          >
            {recipe.title}
          </h4>

          <p className="text-[11px] text-[#6B756C] line-clamp-1 mt-0.5">
            {recipe.subtitle || recipe.description}
          </p>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-1 mt-1.5 text-[11px] font-semibold text-[#6B756C]">
            {userProfile.trackCalories && (
              <span className="flex items-center gap-1 text-[#17211B]">
                <Flame className="w-3 h-3 text-[#F2A65A]" />
                {recipe.nutrition.calories} kcal
              </span>
            )}
            <span className="flex items-center gap-1 text-[#3FAE68]">
              <Dumbbell className="w-3 h-3" />
              {recipe.nutrition.proteinG}g protein
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#6B756C]" />
              {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m
            </span>
            {recipe.estimatedCostZAR > 0 && (
              <span className="text-[#17211B] font-bold">
                {formatZAR(recipe.estimatedCostZAR)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Smart Why this meal pill */}
      {meal.whyThisMeal && (
        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#FFFDF8] border border-[#F0EBE1] text-[11px] text-[#6B756C] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#3FAE68] shrink-0" />
          <span className="italic truncate">{meal.whyThisMeal}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#F0F2F0]">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setSwapModalTargetMeal(meal)}
            className="text-xs font-semibold text-[#17211B] hover:text-[#3FAE68] flex items-center gap-1 transition px-2 py-1 rounded-lg hover:bg-black/5"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Swap</span>
          </button>

          <button
            onClick={() => regenerateMeal(meal.id)}
            className="text-[11px] text-[#6B756C] hover:text-[#17211B] transition px-1.5 py-1 rounded-lg hover:bg-black/5"
            title="Generate a different meal automatically"
          >
            Surprise me
          </button>
        </div>

        <button
          onClick={() => setSelectedRecipeForDetail(recipe)}
          className="text-xs font-bold text-[#3FAE68] hover:text-[#2C854E] flex items-center gap-1 transition"
        >
          <span>Recipe</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
