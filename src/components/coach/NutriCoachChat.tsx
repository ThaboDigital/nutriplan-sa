import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { askNutriCoachAI, CoachMessage } from '../../services/nutriCoachService';
import { X, Send, UserCheck, User, ArrowRight, RefreshCw, MessageSquare, Sparkles } from 'lucide-react';
import { SA_RECIPES } from '../../data/saFoodDatabase';

export const NutriCoachChat: React.FC = () => {
  const {
    isCoachOpen,
    setIsCoachOpen,
    userProfile,
    weeklyPlan,
    pantryItems,
    habits,
    setSelectedRecipeForDetail,
    setIsPantryOpen,
    setActiveTab,
    swapMeal,
    regenerateEntireWeek,
    showToast
  } = useApp();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'msg_initial',
      sender: 'coach',
      text: `Sawubona, ${userProfile.name}! I am NutriCoach, your AI South African nutrition advisor.\n\nAsk me about braai strategies, biltong & snack ideas, Mogodu / Maotwana budget banting, or what to cook with ingredients in your fridge. How can I help you today?`,
      timestamp: 'Just now'
    }
  ]);

  if (!isCoachOpen) return null;

  const currentMeals = weeklyPlan[0]?.meals || [];

  const quickPrompts = [
    'What can I eat at a braai?',
    'Is biltong a healthy snack?',
    'How do I cook Mogodu on budget banting?',
    'I only have eggs, cabbage and mince',
    'What can I swap for pap?',
    'Quick 15-minute high-protein meal',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: CoachMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const resp = await askNutriCoachAI(
        query,
        userProfile,
        currentMeals,
        pantryItems.map(p => p.name)
      );

      const botMsg: CoachMessage = {
        id: `bot_${Date.now()}`,
        sender: 'coach',
        text: resp.text,
        imageUrl: resp.imageUrl,
        timestamp: 'Just now',
        suggestedAction: resp.action
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'coach',
          text: "Here is your recommended nutrition advice for your current goals.",
          timestamp: 'Just now'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: CoachMessage['suggestedAction']) => {
    if (!action) return;
    
    if (action.type === 'view_recipe' && action.payload) {
      const recipeToView = SA_RECIPES.find(r => r.id === action.payload?.id || r.title === action.payload?.title) || action.payload;
      setSelectedRecipeForDetail(recipeToView);
      setIsCoachOpen(false);
    } else if (action.type === 'swap_meal' && action.payload) {
      const targetMeal = currentMeals[1] || currentMeals[0];
      const newRecipe = SA_RECIPES.find(r => r.id === action.payload?.id || r.title === action.payload?.title) || action.payload;
      if (targetMeal && newRecipe) {
        swapMeal(targetMeal.id, newRecipe);
        setIsCoachOpen(false);
      }
    } else if (action.type === 'create_meal_plan') {
      regenerateEntireWeek();
      setIsCoachOpen(false);
    } else if (action.type === 'add_pantry') {
      setIsPantryOpen(true);
      setIsCoachOpen(false);
    } else if (action.type === 'open_shopping') {
      setActiveTab('mealplan');
      setIsCoachOpen(false);
    } else {
      showToast(action.label || 'Action processed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl h-[88vh] md:h-[82vh] flex flex-col overflow-hidden shadow-2xl border border-[#E8EDE9]">
        {/* Header */}
        <div className="p-5 bg-[#17211B] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3FAE68] flex items-center justify-center text-white font-bold shadow-xs">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base">NutriCoach</h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#EAF7EF] text-[#2C854E]">
                  Nutrition Advisor
                </span>
              </div>
              <p className="text-xs text-white/70">Personalized South African nutrition & meal guidance</p>
            </div>
          </div>
          <button
            onClick={() => setIsCoachOpen(false)}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8F9FA]">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'coach' && (
                <div className="w-8 h-8 rounded-2xl bg-[#17211B] text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <UserCheck className="w-4 h-4 text-[#3FAE68]" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#3FAE68] text-white rounded-tr-xs font-medium shadow-xs'
                  : 'bg-white text-[#17211B] border border-[#E8EDE9] rounded-tl-xs shadow-2xs'
              }`}>
                {/* 16:9 South African Food Preview Card */}
                {msg.imageUrl && (
                  <div className="w-full aspect-video rounded-2xl overflow-hidden mb-3 border border-[#E8EDE9] shadow-xs relative group">
                    <img
                      src={msg.imageUrl}
                      alt="NutriPlan Food Visual"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-[#3FAE68]" />
                      <span>NutriCoach Food Visual</span>
                    </div>
                  </div>
                )}

                <div className="whitespace-pre-line">{msg.text}</div>

                {msg.suggestedAction && (
                  <button
                    onClick={() => handleActionClick(msg.suggestedAction)}
                    className="mt-3 w-full py-2.5 px-3.5 rounded-xl bg-[#EAF7EF] text-[#2C854E] hover:bg-[#d5eedf] font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98"
                  >
                    <span>{msg.suggestedAction.label}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-2xl bg-[#3FAE68] text-white flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-2xl bg-[#17211B] text-white flex items-center justify-center shrink-0 mt-1">
                <UserCheck className="w-4 h-4 text-[#3FAE68] animate-pulse" />
              </div>
              <div className="bg-white border border-[#E8EDE9] rounded-3xl p-4 text-xs text-[#6B756C] rounded-tl-xs flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#3FAE68]" />
                <span>NutriCoach is preparing advice...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-[#E8EDE9] bg-[#FFFDF8] overflow-x-auto no-scrollbar flex gap-2 shrink-0">
          {quickPrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 rounded-xl bg-[#EAF7EF] text-[#2C854E] hover:bg-[#d8f1e1] text-xs font-bold shrink-0 transition active:scale-95 border border-[#3FAE68]/20"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#E8EDE9] flex gap-2">
          <input
            type="text"
            placeholder="Ask about braais, affordable swaps, leftover ingredients..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-3 rounded-2xl bg-[#F8F9FA] border border-[#E8EDE9] text-xs sm:text-sm text-[#17211B] outline-none focus:border-[#3FAE68]"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="px-4 py-3 rounded-2xl bg-[#3FAE68] text-white hover:bg-[#349859] disabled:opacity-40 transition active:scale-95 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};