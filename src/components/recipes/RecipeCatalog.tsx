import React, { useState } from 'react';
import { SA_RECIPES } from '../../data/saFoodDatabase';
import { useApp } from '../../context/AppContext';
import { Search, Clock, Dumbbell, Flame } from 'lucide-react';

export const RecipeCatalog: React.FC = () => {
  const { setSelectedRecipeForDetail, userProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const tags = ['All', 'High Protein', 'Low Carb', 'Budget', 'Quick', 'South African', 'Family Friendly'];

  const filteredRecipes = SA_RECIPES.filter(r => {
    if (selectedTag !== 'All' && !r.tags.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.ingredients.some(i => i.name.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-24 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-black text-[#17211B] tracking-tight">Recipe Discovery</h1>
        <p className="text-xs sm:text-sm font-medium text-[#6B756C]">
          Authentic, high-protein & affordable meals designed for real life
        </p>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B756C] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search hake, chicken, cabbage, gem squash..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E8EDE9] text-xs text-[#17211B] shadow-2xs outline-none focus:border-[#3FAE68]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition active:scale-95 ${
                selectedTag === tag
                  ? 'bg-[#17211B] text-white shadow-xs'
                  : 'bg-white text-[#6B756C] border border-[#E8EDE9] hover:border-[#17211B]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Recipe Cards Grid: 1 col on mobile, 2 col on tablet, 3 col on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map(recipe => (
          <div
            key={recipe.id}
            onClick={() => setSelectedRecipeForDetail(recipe)}
            className="bg-white rounded-3xl overflow-hidden border border-[#E8EDE9] subtle-shadow hover:border-[#3FAE68] transition cursor-pointer group card-hover flex flex-col justify-between"
          >
            <div>
              {/* Hero Image */}
              <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 flex gap-1">
                  {recipe.isSouthAfricanClassic && (
                    <span className="px-2.5 py-1 rounded-full bg-[#17211B]/80 backdrop-blur-md text-white text-[10px] font-extrabold tracking-wide">
                      SA Classic
                    </span>
                  )}
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-[#17211B] text-[10px] font-bold">
                    {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#3FAE68] text-white text-[10px] font-bold">
                    {recipe.difficulty}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-extrabold text-base text-[#17211B] group-hover:text-[#3FAE68] transition">
                  {recipe.title}
                </h3>
                <p className="text-xs text-[#6B756C] line-clamp-2 mt-1 leading-relaxed">
                  {recipe.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {recipe.tags.map(t => (
                    <span
                      key={t}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-[#F8F9FA] text-[#6B756C] border border-[#E8EDE9]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Macro row footer */}
            <div className="p-4 pt-0">
              <div className="flex items-center justify-between pt-3 border-t border-[#F0F2F0] text-xs font-bold">
                <div className="flex items-center gap-3">
                  {userProfile.trackCalories && (
                    <span className="flex items-center gap-1 text-[#17211B]">
                      <Flame className="w-3.5 h-3.5 text-[#F2A65A]" />
                      {recipe.nutrition.calories} kcal
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[#3FAE68]">
                    <Dumbbell className="w-3.5 h-3.5" />
                    {recipe.nutrition.proteinG}g protein
                  </span>
                </div>

                <span className="text-[#3FAE68] group-hover:translate-x-0.5 transition font-extrabold text-xs">
                  View Recipe →
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};