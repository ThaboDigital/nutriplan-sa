import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Calendar, BookOpen, TrendingUp, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'mealplan', label: 'Meal Plan', icon: Calendar },
    { id: 'recipes', label: 'Recipes', icon: BookOpen },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF8]/95 backdrop-blur-lg border-t border-[#E8EDE9] px-2 py-1.5 safe-area-pb">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all active:scale-90 ${
                isActive
                  ? 'text-[#3FAE68]'
                  : 'text-[#6B756C] hover:text-[#182018]'
              }`}
            >
              <div className={`relative p-1 rounded-xl transition-colors ${isActive ? 'bg-[#EAF7EF]' : ''}`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className={`text-[11px] font-semibold tracking-tight mt-0.5 ${isActive ? 'text-[#17211B]' : 'text-[#6B756C]'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
