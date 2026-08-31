import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SA_RECIPES } from '../../data/saFoodDatabase';
import { Recipe } from '../../types';
import { X, Search, Check, Flame, Dumbbell, Clock } from 'lucide-react';
import { formatCalories } from '../../utils/formatters';

export const SwapMealModal: React.FC = () => {
  const { swapModalTargetMeal, setSwapModalTargetMeal, swapMeal, userProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryTag, setSelectedCategoryTag] = useState<string>('All');

  if (!swapModalTargetMeal) return null;

  const currentRecipe = swapModalTargetMeal.recipe;

  const tags = ['All', 'High Protein', 'Low Carb', 'Budget', 'Quick', 'South African'];

  const filteredRecipes = SA_RECIPES.filter(r => {
    if (r.id === currentRecipe.id) return false; // don't show the exact same recipe
    if (selectedCategoryTag !== 'All' && !r.tags.includes(selectedCategoryTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.ingredients.some(i => i.name.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[#E8EDE9]">
        {/* Header */}
        <div className="p-4 border-b border-[#E8EDE9] flex items-center justify-between bg-[#FFFDF8]">
          <div>
            <h3 className="font-extrabold text-base text-[#17211B]">Swap This Meal</h3>
            <p className="text-xs text-[#6B756C]">
              Replacing: <strong className="text-[#17211B]">{currentRecipe.title}</strong>
            </p>
          </div>
          <button
            onClick={() => setSwapModalTargetMeal(null)}
            className="p-2 rounded-full hover:bg-black/5 text-[#6B756C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter pills */}
        <div className="p-3 border-b border-[#E8EDE9] space-y-2 bg-[#F8F9FA]">
          <div className="relative">
            <Search className="w-4 h-4 text-[#6B756C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search recipes, ingredients (e.g. hake, chicken)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-[#E8EDE9] text-xs text-[#17211B] outline-none focus:border-[#3FAE68]"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {tags.map(t => (
              <button
                key={t}
                onClick={() => setSelectedCategoryTag(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition ${
                  selectedCategoryTag === t
                    ? 'bg-[#3FAE68] text-white'
                    : 'bg-white text-[#6B756C] border border-[#E8EDE9] hover:text-[#17211B]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Candidate List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredRecipes.map(recipe => (
            <div
              key={recipe.id}
              className="flex items-center gap-3 p-3 rounded-2xl border border-[#E8EDE9] hover:border-[#3FAE68] hover:bg-[#FBFDFB] transition cursor-pointer group"
              onClick={() => swapMeal(swapModalTargetMeal.id, recipe)}
            >
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-[#17211B] group-hover:text-[#3FAE68] transition truncate">
                  {recipe.title}
                </h4>
                <p className="text-[10px] text-[#6B756C] line-clamp-1 mt-0.5">
                  {recipe.description}
                </p>

                <div className="flex items-center gap-3 mt-1.5 text-[10px] font-semibold text-[#6B756C]">
                  {userProfile.trackCalories && (
                    <span className="flex items-center gap-0.5 text-[#17211B]">
                      <Flame className="w-2.5 h-2.5 text-[#F2A65A]" />
                      {recipe.nutrition.calories} kcal
                    </span>
                  )}
                  <span className="flex items-center gap-0.5 text-[#3FAE68]">
                    <Dumbbell className="w-2.5 h-2.5" />
                    {recipe.nutrition.proteinG}g
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m
                  </span>
                </div>
              </div>

              <button
                className="px-3 py-1.5 rounded-xl bg-[#EAF7EF] text-[#2C854E] group-hover:bg-[#3FAE68] group-hover:text-white font-bold text-xs transition shrink-0"
              >
                Choose
              </button>
            </div>
          ))}

          {filteredRecipes.length === 0 && (
            <div className="text-center py-8 text-[#6B756C] text-xs">
              No matching recipes found. Try a different search term.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
