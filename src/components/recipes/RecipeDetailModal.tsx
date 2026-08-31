import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Clock, Users, Flame, Dumbbell, Play, ShoppingBag, Heart, ArrowLeft, AlertCircle } from 'lucide-react';
import { formatZAR } from '../../utils/formatters';

export const RecipeDetailModal: React.FC = () => {
  const {
    selectedRecipeForDetail,
    setSelectedRecipeForDetail,
    setCookingRecipe,
    addCustomShoppingItem,
    showToast,
    userProfile
  } = useApp();

  if (!selectedRecipeForDetail) return null;

  const recipe = selectedRecipeForDetail;

  const handleAddAllIngredientsToShopping = () => {
    recipe.ingredients.forEach(ing => {
      addCustomShoppingItem(ing.name, ing.category, ing.quantity, ing.unit);
    });
    showToast(`Added ${recipe.ingredients.length} ingredients to shopping list!`, 'success');
  };

  const handleStartCooking = () => {
    setCookingRecipe(recipe);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#E8EDE9]">
        {/* Sticky Action Top Bar with Hero Image */}
        <div className="relative h-60 w-full overflow-hidden bg-gray-900 shrink-0">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />

          {/* Top buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={() => setSelectedRecipeForDetail(null)}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => showToast('Saved to your favourites!')}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition"
            >
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            {recipe.isSouthAfricanClassic && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#3FAE68] uppercase tracking-wider inline-block mb-1.5">
                South African Favourite
              </span>
            )}
            <h2 className="text-xl font-black leading-tight">{recipe.title}</h2>
            <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{recipe.subtitle}</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF]">
              <span className="text-[10px] font-bold text-[#6B756C] block">Time</span>
              <span className="text-xs font-black text-[#17211B] mt-0.5">
                {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF]">
              <span className="text-[10px] font-bold text-[#6B756C] block">Protein</span>
              <span className="text-xs font-black text-[#3FAE68] mt-0.5">
                {recipe.nutrition.proteinG}g
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF]">
              <span className="text-[10px] font-bold text-[#6B756C] block">Calories</span>
              <span className="text-xs font-black text-[#17211B] mt-0.5">
                {recipe.nutrition.calories}
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF]">
              <span className="text-[10px] font-bold text-[#6B756C] block">Est. Cost</span>
              <span className="text-xs font-black text-[#17211B] mt-0.5">
                {formatZAR(recipe.estimatedCostZAR)}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-extrabold text-sm text-[#17211B] mb-1">About This Meal</h4>
            <p className="text-xs text-[#6B756C] leading-relaxed">
              {recipe.description}
            </p>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-extrabold text-sm text-[#17211B]">
                Ingredients ({recipe.ingredients.length})
              </h4>
              <button
                onClick={handleAddAllIngredientsToShopping}
                className="text-xs font-bold text-[#3FAE68] hover:underline flex items-center gap-1"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>+ Add to Shopping List</span>
              </button>
            </div>

            <div className="space-y-2">
              {recipe.ingredients.map(ing => (
                <div
                  key={ing.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8F9FA] border border-[#F0F2F0] text-xs"
                >
                  <span className="font-semibold text-[#17211B]">{ing.name}</span>
                  <span className="font-bold text-[#6B756C]">
                    {ing.quantity} {ing.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Substitutions if present */}
          {recipe.substitutions && recipe.substitutions.length > 0 && (
            <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#F0EBE1] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#17211B]">
                <AlertCircle className="w-3.5 h-3.5 text-[#F2A65A]" />
                <span>Smart South African Swaps</span>
              </div>
              {recipe.substitutions.map((sub, sIdx) => (
                <div key={sIdx} className="text-xs text-[#6B756C] space-y-0.5">
                  <div>
                    <span className="line-through text-[#6B756C]">{sub.original}</span> ?{' '}
                    <strong className="text-[#17211B]">{sub.replacement}</strong>
                  </div>
                  <p className="text-[11px] italic text-[#6B756C]">{sub.note}</p>
                </div>
              ))}
            </div>
          )}

          {/* Step-by-Step Instructions */}
          <div>
            <h4 className="font-extrabold text-sm text-[#17211B] mb-2">Instructions</h4>
            <div className="space-y-3">
              {recipe.instructions.map((step, idx) => (
                <div key={idx} className="flex gap-3 text-xs leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-[#EAF7EF] text-[#2C854E] font-black text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <p className="text-[#17211B] pt-0.5">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Action: Start Cooking Mode */}
        <div className="p-4 bg-[#FFFDF8] border-t border-[#E8EDE9] flex gap-2">
          <button
            onClick={handleStartCooking}
            className="w-full py-3 rounded-2xl bg-[#3FAE68] text-white hover:bg-[#349859] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Step-by-Step Cooking Mode</span>
          </button>
        </div>
      </div>
    </div>
  );
};
