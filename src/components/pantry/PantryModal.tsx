import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Trash2, Sparkles, PackageOpen } from 'lucide-react';

export const PantryModal: React.FC = () => {
  const { isPantryOpen, setIsPantryOpen, pantryItems, addPantryItem, removePantryItem, setIsCoachOpen } = useApp();
  const [newItemName, setNewItemName] = useState('');

  if (!isPantryOpen) return null;

  const quickStaples = ['Eggs', 'Tinned Tuna', 'Cabbage', 'Onions', 'Garlic', 'Chicken breast', 'Lean mince', 'Spinach', 'Butternut', 'Rooibos'];

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItemName.trim()) return;
    addPantryItem(newItemName.trim());
    setNewItemName('');
  };

  const handleGenerateMealsFromPantry = () => {
    setIsPantryOpen(false);
    setIsCoachOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[#E8EDE9]">
        {/* Header */}
        <div className="p-4 bg-[#FFFDF8] border-b border-[#E8EDE9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EAF7EF] text-[#3FAE68] flex items-center justify-center">
              <PackageOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#17211B]">My Pantry & Fridge</h3>
              <p className="text-[11px] text-[#6B756C]">Reduce food waste & save grocery money</p>
            </div>
          </div>
          <button
            onClick={() => setIsPantryOpen(false)}
            className="p-1.5 rounded-full hover:bg-black/5 text-[#6B756C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add input */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="Add food you have (e.g. Greek yogurt, cabbage)..."
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-2xl bg-[#F8F9FA] border border-[#E8EDE9] text-xs text-[#17211B] outline-none focus:border-[#3FAE68]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-2xl bg-[#3FAE68] text-white font-bold text-xs hover:bg-[#349859] transition"
            >
              Add
            </button>
          </form>

          {/* Quick Staple Suggestions */}
          <div>
            <span className="text-[10px] font-bold text-[#6B756C] uppercase tracking-wider block mb-2">
              Common South African Staples
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickStaples.map(s => (
                <button
                  key={s}
                  onClick={() => addPantryItem(s)}
                  className="px-2.5 py-1 rounded-xl bg-[#F8F9FA] border border-[#E8EDE9] text-[11px] font-semibold text-[#17211B] hover:bg-[#EAF7EF] hover:border-[#3FAE68] transition"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          {/* Current Pantry Items */}
          <div>
            <span className="text-[10px] font-bold text-[#6B756C] uppercase tracking-wider block mb-2">
              Currently Available ({pantryItems.length})
            </span>

            <div className="space-y-1.5">
              {pantryItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-[#E8EDE9] text-xs"
                >
                  <span className="font-semibold text-[#17211B]">{item.name}</span>
                  <button
                    onClick={() => removePantryItem(item.id)}
                    className="p-1 text-[#6B756C] hover:text-red-600 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Action: Cook from Pantry */}
        <div className="p-4 bg-[#FFFDF8] border-t border-[#E8EDE9]">
          <button
            onClick={handleGenerateMealsFromPantry}
            className="w-full py-3 rounded-2xl bg-[#17211B] text-white hover:bg-black font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-[#3FAE68]" />
            <span>Generate Meals with My Pantry Items</span>
          </button>
        </div>
      </div>
    </div>
  );
};
