import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Check, Plus, Trash2, Share2, Sparkles, CheckCircle2, Circle } from 'lucide-react';
import { formatZAR } from '../../utils/formatters';
import { ShoppingItem } from '../../types';

export const ShoppingListView: React.FC = () => {
  const {
    shoppingList,
    toggleShoppingItem,
    toggleAlreadyHaveItem,
    addCustomShoppingItem,
    removeShoppingItem,
    userProfile,
    showToast
  } = useApp();

  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ShoppingItem['category']>('Vegetables');

  const categories: ShoppingItem['category'][] = [
    'Meat & Protein',
    'Vegetables',
    'Fruit',
    'Dairy',
    'Pantry',
    'Spices',
    'Other'
  ];

  const groupedItems = categories.map(cat => ({
    category: cat,
    items: shoppingList.filter(item => item.category === cat)
  })).filter(g => g.items.length > 0);

  const totalEstimatedCost = shoppingList.reduce((acc, i) => acc + (i.isAlreadyHave ? 0 : i.estimatedCostZAR), 0);

  const handleShareList = () => {
    const lines = shoppingList
      .filter(i => !i.isAlreadyHave)
      .map(i => `• ${i.name}: ${i.quantity} ${i.unit}`)
      .join('\n');

    const textToShare = `NutriPlan SA Grocery List (${userProfile.name}):\n\n${lines}\n\nEstimated Cost: ${formatZAR(totalEstimatedCost)}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToShare);
      showToast('Shopping list copied to clipboard!', 'success');
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addCustomShoppingItem(newItemName.trim(), selectedCategory, 1, 'pack');
    setNewItemName('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
      {/* Left Column: Budget & Add Item (Desktop: 5 cols) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Budget Summary Card */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8EDE9] subtle-shadow">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#6B756C]">Estimated Total</span>
              <div className="text-3xl font-black text-[#17211B] tracking-tight">
                {formatZAR(totalEstimatedCost)}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-bold text-[#6B756C]">Target Budget</span>
              <div className="text-xs font-bold text-[#3FAE68] bg-[#EAF7EF] px-3 py-1 rounded-full mt-1">
                {userProfile.weeklyBudget}
              </div>
            </div>
          </div>

          <p className="text-[11px] text-[#6B756C] italic border-t border-[#F0F2F0] pt-2 mt-2 leading-relaxed">
            *Costs reflect South African supermarket averages. Items marked "In Pantry" are excluded from your total spend.
          </p>

          <button
            onClick={handleShareList}
            className="w-full mt-4 py-3 px-4 rounded-2xl bg-[#17211B] text-white hover:bg-black text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Copy / Share List to WhatsApp</span>
          </button>
        </div>

        {/* Quick Add Custom Item Form */}
        <form onSubmit={handleAddItem} className="bg-white rounded-3xl p-5 border border-[#E8EDE9] subtle-shadow space-y-3">
          <span className="text-xs font-bold text-[#17211B] block">Add Custom Grocery Item</span>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. Rooibos tea, lemons..."
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E8EDE9] text-xs text-[#17211B] outline-none focus:border-[#3FAE68]"
            />
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value as any)}
                className="px-3 py-2.5 rounded-xl bg-[#F8F9FA] border border-[#E8EDE9] text-xs font-bold text-[#17211B] outline-none"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[#3FAE68] text-white hover:bg-[#349859] transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Right Column: Grouped Shopping Checklist (Desktop: 7 cols) */}
      <div className="lg:col-span-7 space-y-5">
        {groupedItems.map(group => (
          <div key={group.category} className="bg-white rounded-3xl p-5 border border-[#E8EDE9] subtle-shadow">
            <h3 className="font-extrabold text-xs tracking-wider uppercase text-[#6B756C] mb-3">
              {group.category} ({group.items.length})
            </h3>

            <div className="space-y-2">
              {group.items.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                    item.isChecked
                      ? 'bg-[#F8F9FA] border-transparent opacity-60'
                      : item.isAlreadyHave
                      ? 'bg-[#FFFDF8] border-[#E8EDE9]'
                      : 'bg-white border-[#F0F2F0]'
                  }`}
                >
                  <div
                    onClick={() => toggleShoppingItem(item.id)}
                    className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      item.isChecked ? 'text-[#3FAE68]' : 'text-[#6B756C]'
                    }`}>
                      {item.isChecked ? (
                        <CheckCircle2 className="w-5 h-5 fill-current" />
                      ) : (
                        <Circle className="w-5 h-5 stroke-[1.8]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className={`text-xs font-bold block truncate ${item.isChecked ? 'line-through text-[#6B756C]' : 'text-[#17211B]'}`}>
                        {item.name}
                      </span>
                      <span className="text-[10px] text-[#6B756C]">
                        {item.quantity} {item.unit} • ~{formatZAR(item.estimatedCostZAR)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <button
                      onClick={() => toggleAlreadyHaveItem(item.id)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition ${
                        item.isAlreadyHave
                          ? 'bg-[#3FAE68] text-white'
                          : 'bg-[#EAF7EF] text-[#2C854E] hover:bg-[#d4edd9]'
                      }`}
                      title="Mark whether this item is already in your fridge/pantry"
                    >
                      {item.isAlreadyHave ? 'In Pantry ✓' : 'Already have?'}
                    </button>

                    <button
                      onClick={() => removeShoppingItem(item.id)}
                      className="p-1 rounded-lg text-[#6B756C] hover:text-red-600 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};