import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Search,
  Camera,
  Star,
  Clock,
  BookOpen,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import { MealCategory, FoodItem, Recipe } from '../../types';
import { SA_FOODS_DATABASE } from '../../data/saFoodsList';
import { SA_RECIPES } from '../../data/saFoodDatabase';

export const FoodLogModal: React.FC = () => {
  const {
    isFoodLogOpen,
    setIsFoodLogOpen,
    foodLogModalInitialMeal,
    selectedDiaryDate,
    recentFoods,
    favouriteFoodIds,
    toggleFavouriteFood,
    logFoodItem,
    showToast
  } = useApp();

  const [selectedMeal, setSelectedMeal] = useState<MealCategory>(foodLogModalInitialMeal || 'lunch');
  const [activeTab, setActiveTab] = useState<'search' | 'recent' | 'favourites' | 'recipes' | 'quick' | 'photo'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [servingQuantity, setServingQuantity] = useState<number>(1);

  // Quick Add manual state
  const [quickName, setQuickName] = useState('');
  const [quickCalories, setQuickCalories] = useState('');
  const [quickProtein, setQuickProtein] = useState('');

  // AI Camera Photo state
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState(false);
  const [aiPlateResult, setAiPlateResult] = useState<{
    name: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    serving: string;
  } | null>(null);

  // Reset meal when modal opens with new initial meal
  React.useEffect(() => {
    if (isFoodLogOpen) {
      setSelectedMeal(foodLogModalInitialMeal || 'lunch');
      setSelectedFood(null);
      setServingQuantity(1);
    }
  }, [isFoodLogOpen, foodLogModalInitialMeal]);

  // Filter foods for search tab
  const filteredFoods = useMemo(() => {
    if (!searchQuery.trim()) {
      return SA_FOODS_DATABASE.slice(0, 15);
    }
    const q = searchQuery.toLowerCase().trim();
    return SA_FOODS_DATABASE.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Favourite foods list
  const favouriteFoods = useMemo(() => {
    return SA_FOODS_DATABASE.filter(f => favouriteFoodIds.includes(f.id));
  }, [favouriteFoodIds]);

  if (!isFoodLogOpen) return null;

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setServingQuantity(1);
  };

  const handleConfirmLogFood = () => {
    if (!selectedFood) return;

    const qty = Math.max(0.1, servingQuantity);
    logFoodItem({
      date: selectedDiaryDate,
      mealType: selectedMeal,
      foodName: selectedFood.name,
      servingQuantity: qty,
      servingUnit: selectedFood.servingSize,
      calories: Math.round(selectedFood.calories * qty),
      proteinG: Number((selectedFood.proteinG * qty).toFixed(1)),
      carbsG: Number((selectedFood.carbsG * qty).toFixed(1)),
      fatG: Number((selectedFood.fatG * qty).toFixed(1)),
    });

    setSelectedFood(null);
    setIsFoodLogOpen(false);
  };

  const handleLogRecipe = (recipe: Recipe) => {
    logFoodItem({
      date: selectedDiaryDate,
      mealType: selectedMeal,
      foodName: recipe.title,
      servingQuantity: 1,
      servingUnit: '1 prepared recipe serving',
      calories: recipe.nutrition.calories,
      proteinG: recipe.nutrition.proteinG,
      carbsG: recipe.nutrition.carbsG,
      fatG: recipe.nutrition.fatG,
      isRecipe: true,
      recipeId: recipe.id,
    });
    setIsFoodLogOpen(false);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const kcal = parseInt(quickCalories);
    if (!quickName.trim() || isNaN(kcal)) {
      showToast('Please provide food name and calories', 'warning');
      return;
    }

    logFoodItem({
      date: selectedDiaryDate,
      mealType: selectedMeal,
      foodName: quickName.trim(),
      servingQuantity: 1,
      servingUnit: 'custom serving',
      calories: kcal,
      proteinG: parseFloat(quickProtein) || 0,
      carbsG: 0,
      fatG: 0,
    });

    setQuickName('');
    setQuickCalories('');
    setQuickProtein('');
    setIsFoodLogOpen(false);
  };

  const handleSimulatePhotoRecognition = () => {
    setIsAnalyzingPhoto(true);
    setAiPlateResult(null);

    setTimeout(() => {
      setIsAnalyzingPhoto(false);
      setAiPlateResult({
        name: 'Flame-Grilled Chicken Breast with Steamed Morogo',
        calories: 320,
        proteinG: 44,
        carbsG: 6,
        fatG: 12,
        serving: '1 balanced plate',
      });
      showToast('South African plate recognized!', 'success');
    }, 1300);
  };

  const handleLogAiPlate = () => {
    if (!aiPlateResult) return;
    logFoodItem({
      date: selectedDiaryDate,
      mealType: selectedMeal,
      foodName: aiPlateResult.name,
      servingQuantity: 1,
      servingUnit: aiPlateResult.serving,
      calories: aiPlateResult.calories,
      proteinG: aiPlateResult.proteinG,
      carbsG: aiPlateResult.carbsG,
      fatG: aiPlateResult.fatG,
    });
    setAiPlateResult(null);
    setIsFoodLogOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg h-[92vh] sm:h-[84vh] flex flex-col overflow-hidden shadow-2xl border border-[#E8EDE9]">
        {/* 1. Modal Top Bar */}
        <div className="p-4 bg-[#17211B] text-white flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight">Log Food</h2>
            <p className="text-xs text-white/70">
              Adding to <strong className="text-[#3FAE68] capitalize">{selectedMeal}</strong>
            </p>
          </div>
          <button
            onClick={() => setIsFoodLogOpen(false)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Target Meal Switcher */}
        <div className="p-2.5 bg-[#F8F9FA] border-b border-[#E8EDE9] flex gap-1 shrink-0">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(meal => (
            <button
              key={meal}
              onClick={() => setSelectedMeal(meal)}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition active:scale-95 ${
                selectedMeal === meal
                  ? 'bg-[#17211B] text-white shadow-xs'
                  : 'bg-white text-[#6B756C] border border-[#E8EDE9] hover:text-[#17211B]'
              }`}
            >
              {meal}
            </button>
          ))}
        </div>

        {/* 3. Navigation Tabs (Search, Recent, Favourites, Recipes, Quick Add, AI Photo) */}
        <div className="flex gap-1.5 p-2 bg-white border-b border-[#E8EDE9] overflow-x-auto no-scrollbar shrink-0">
          {[
            { id: 'search' as const, label: 'Search', icon: Search },
            { id: 'recent' as const, label: 'Recent', icon: Clock },
            { id: 'favourites' as const, label: 'Favourites', icon: Star },
            { id: 'recipes' as const, label: 'Recipes', icon: BookOpen },
            { id: 'quick' as const, label: 'Quick Add', icon: Plus },
            { id: 'photo' as const, label: 'AI Photo', icon: Camera },
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  setSelectedFood(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition ${
                  isActive
                    ? 'bg-[#EAF7EF] text-[#2C854E] border border-[#3FAE68]/30 font-extrabold'
                    : 'text-[#6B756C] hover:bg-[#F8F9FA] hover:text-[#17211B]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* 4. Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* A: SEARCH TAB */}
          {activeTab === 'search' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#6B756C] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search boerewors, eggs, hake, morogo, oats..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E8EDE9] text-xs sm:text-sm text-[#17211B] outline-none focus:border-[#3FAE68] focus:bg-white"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                {filteredFoods.map(food => {
                  const isFav = favouriteFoodIds.includes(food.id);
                  const isSelected = selectedFood?.id === food.id;

                  return (
                    <div
                      key={food.id}
                      onClick={() => handleSelectFood(food)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-[#EAF7EF]/60 border-[#3FAE68]'
                          : 'bg-white border-[#E8EDE9] hover:border-[#3FAE68]/40 hover:bg-[#FBFDFB]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-[#17211B] truncate">
                            {food.name}
                          </span>
                          {food.isSouthAfricanClassic && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-[#FFFDF8] border border-[#F2A65A]/40 text-[#C45E16]">
                              SA Classic
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#6B756C]">
                          <span>{food.servingSize}</span>
                          <span>•</span>
                          <span className="text-[#3FAE68] font-bold">{food.proteinG}g protein</span>
                          <span>•</span>
                          <span>{food.calories} kcal</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavouriteFood(food.id);
                          }}
                          className={`p-1.5 rounded-xl transition ${
                            isFav ? 'text-[#F2A65A]' : 'text-gray-300 hover:text-gray-500'
                          }`}
                          title="Favorite food"
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectFood(food)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            isSelected
                              ? 'bg-[#3FAE68] text-white'
                              : 'bg-[#EAF7EF] text-[#2C854E] hover:bg-[#3FAE68] hover:text-white'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Add'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* B: RECENT TAB */}
          {activeTab === 'recent' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#6B756C] block">
                Recently Logged Foods
              </span>

              {recentFoods.map(food => (
                <div
                  key={food.id}
                  onClick={() => handleSelectFood(food)}
                  className="p-3 rounded-2xl bg-white border border-[#E8EDE9] hover:border-[#3FAE68] transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-xs text-[#17211B] block">{food.name}</span>
                    <span className="text-[11px] text-[#6B756C]">
                      {food.servingSize} • {food.calories} kcal • {food.proteinG}g protein
                    </span>
                  </div>

                  <button
                    onClick={() => handleSelectFood(food)}
                    className="p-1.5 rounded-xl bg-[#EAF7EF] text-[#2C854E] hover:bg-[#3FAE68] hover:text-white transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* C: FAVOURITES TAB */}
          {activeTab === 'favourites' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#6B756C] block">
                Your Starred / Favourite Foods ({favouriteFoods.length})
              </span>

              {favouriteFoods.length === 0 ? (
                <div className="text-center py-8 text-[#6B756C] text-xs">
                  No favourite foods yet. Star any food in the Search tab to pin it here.
                </div>
              ) : (
                favouriteFoods.map(food => (
                  <div
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="p-3 rounded-2xl bg-white border border-[#E8EDE9] hover:border-[#3FAE68] transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-[#17211B] block">{food.name}</span>
                      <span className="text-[11px] text-[#6B756C]">
                        {food.servingSize} • {food.calories} kcal • {food.proteinG}g protein
                      </span>
                    </div>

                    <button
                      onClick={() => handleSelectFood(food)}
                      className="p-1.5 rounded-xl bg-[#EAF7EF] text-[#2C854E] hover:bg-[#3FAE68] hover:text-white transition"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* D: RECIPES TAB */}
          {activeTab === 'recipes' && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-[#6B756C] block">
                NutriPlan SA Whole Food Recipes
              </span>

              {SA_RECIPES.map(recipe => (
                <div
                  key={recipe.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#E8EDE9] hover:border-[#3FAE68] transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={recipe.imageUrl}
                      alt={recipe.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-[#17211B] block truncate">
                        {recipe.title}
                      </span>
                      <span className="text-[10px] text-[#6B756C]">
                        {recipe.nutrition.calories} kcal • {recipe.nutrition.proteinG}g protein
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleLogRecipe(recipe)}
                    className="px-3 py-1.5 rounded-xl bg-[#17211B] text-white hover:bg-black text-xs font-bold transition shrink-0 ml-2"
                  >
                    Log Meal
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* E: QUICK ADD TAB */}
          {activeTab === 'quick' && (
            <form onSubmit={handleQuickAdd} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#17211B]">Food or Dish Description</label>
                <input
                  type="text"
                  placeholder="e.g. Braai chop & salad, cappuccino..."
                  value={quickName}
                  onChange={e => setQuickName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E8EDE9] text-xs sm:text-sm text-[#17211B] outline-none focus:border-[#3FAE68]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#17211B]">Calories (kcal)</label>
                  <input
                    type="number"
                    placeholder="e.g. 350"
                    value={quickCalories}
                    onChange={e => setQuickCalories(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E8EDE9] text-xs sm:text-sm text-[#17211B] outline-none focus:border-[#3FAE68]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#17211B]">Protein (grams, optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 25"
                    value={quickProtein}
                    onChange={e => setQuickProtein(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E8EDE9] text-xs sm:text-sm text-[#17211B] outline-none focus:border-[#3FAE68]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-[#3FAE68] text-white hover:bg-[#349859] font-black text-xs sm:text-sm transition shadow-xs active:scale-95"
              >
                Log to {selectedMeal}
              </button>
            </form>
          )}

          {/* F: AI PHOTO TAB */}
          {activeTab === 'photo' && (
            <div className="space-y-4 pt-1">
              <div className="p-5 rounded-3xl bg-[#F8FBF9] border border-[#EAF7EF] text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#EAF7EF] text-[#3FAE68] flex items-center justify-center mx-auto">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#17211B]">AI Plate Photo Recognition</h4>
                  <p className="text-xs text-[#6B756C] mt-0.5 max-w-xs mx-auto leading-relaxed">
                    Snap or upload a photo of your South African plate to estimate macros in seconds.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSimulatePhotoRecognition}
                  disabled={isAnalyzingPhoto}
                  className="px-6 py-2.5 rounded-2xl bg-[#17211B] text-white hover:bg-black font-bold text-xs transition active:scale-95 disabled:opacity-50"
                >
                  {isAnalyzingPhoto ? 'Analyzing Plate with AI...' : 'Scan Plate Photo'}
                </button>
              </div>

              {aiPlateResult && (
                <div className="p-4 rounded-2xl bg-white border border-[#3FAE68]/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-[#17211B]">{aiPlateResult.name}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EAF7EF] text-[#2C854E]">
                      AI Match
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold text-[#6B756C]">
                    <span className="text-[#17211B]">{aiPlateResult.calories} kcal</span>
                    <span className="text-[#3FAE68]">{aiPlateResult.proteinG}g protein</span>
                    <span>{aiPlateResult.carbsG}g carbs</span>
                    <span>{aiPlateResult.fatG}g fat</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogAiPlate}
                    className="w-full py-2.5 rounded-xl bg-[#3FAE68] text-white hover:bg-[#349859] font-black text-xs transition shadow-xs active:scale-95"
                  >
                    Log This Plate to {selectedMeal}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. Serving Controls Footer Drawer (When food is selected) */}
        {selectedFood && (
          <div className="p-4 bg-[#FFFDF8] border-t border-[#E8EDE9] space-y-3 shrink-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-2">
                <span className="font-black text-sm text-[#17211B] block truncate">
                  {selectedFood.name}
                </span>
                <span className="text-[11px] text-[#6B756C]">
                  Base serving: {selectedFood.servingSize}
                </span>
              </div>

              {/* Quantity Stepper (Section 8) */}
              <div className="flex items-center gap-2 bg-white border border-[#E8EDE9] rounded-2xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setServingQuantity(prev => Math.max(0.25, Number((prev - 0.25).toFixed(2))))}
                  className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-[#F8F9FA] text-[#17211B] font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-black text-[#17211B] min-w-[36px] text-center">
                  {servingQuantity}x
                </span>
                <button
                  type="button"
                  onClick={() => setServingQuantity(prev => Number((prev + 0.25).toFixed(2)))}
                  className="w-7 h-7 rounded-xl flex items-center justify-center hover:bg-[#F8F9FA] text-[#17211B] font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Live Recalculated Macros */}
            <div className="flex items-center justify-between text-xs font-bold text-[#6B756C] bg-white p-2.5 rounded-xl border border-[#F0F2F0]">
              <span className="text-[#17211B] font-black">
                {Math.round(selectedFood.calories * servingQuantity)} kcal
              </span>
              <span className="text-[#3FAE68]">
                {(selectedFood.proteinG * servingQuantity).toFixed(1)}g protein
              </span>
              <span>
                {(selectedFood.carbsG * servingQuantity).toFixed(1)}g carbs
              </span>
              <span>
                {(selectedFood.fatG * servingQuantity).toFixed(1)}g fat
              </span>
            </div>

            {/* Confirm Log Button */}
            <button
              type="button"
              onClick={handleConfirmLogFood}
              className="w-full py-3 rounded-2xl bg-[#3FAE68] text-white hover:bg-[#349859] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Add to {selectedMeal}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
