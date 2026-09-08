import React from 'react';
import { useApp } from '../../context/AppContext';
import { Home, UtensilsCrossed, Calendar, TrendingUp, User } from 'lucide-react';
import { NavTab } from '../../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  const navItems: { id: NavTab; label: string; icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'diary', label: 'Diary', icon: UtensilsCrossed },
    { id: 'mealplan', label: 'Plan', icon: Calendar },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E8EDE9] px-2 py-1.5 safe-area-pb subtle-shadow">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`touch-target flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all active:scale-95 ${
                isActive
                  ? 'text-[#2C854E]'
                  : 'text-[#6B756C] hover:text-[#17211B]'
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-colors ${
                isActive ? 'bg-[#EAF7EF] text-[#3FAE68]' : 'text-[#6B756C]'
              }`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#3FAE68]" />
                )}
              </div>
              <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${
                isActive ? 'text-[#17211B] font-extrabold' : 'text-[#6B756C]'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

