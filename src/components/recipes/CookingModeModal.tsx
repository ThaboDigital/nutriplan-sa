import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CookingModeModal: React.FC = () => {
  const { cookingRecipe, setCookingRecipe, showToast } = useApp();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!cookingRecipe) return null;

  const totalSteps = cookingRecipe.instructions.length;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const handleFinish = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
    showToast('Delicious! Meal cooked successfully.', 'success');
    setCookingRecipe(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#17211B] text-white flex flex-col justify-between p-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <span className="text-xs uppercase font-extrabold text-[#3FAE68] tracking-wider">
            Hands-Free Cooking Mode
          </span>
          <h2 className="text-lg font-black truncate max-w-[280px]">
            {cookingRecipe.title}
          </h2>
        </div>
        <button
          onClick={() => setCookingRecipe(null)}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Step Display with Huge Readable Text */}
      <div className="flex-1 flex flex-col justify-center my-6 max-w-lg mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-full bg-[#3FAE68] text-white text-xs font-black">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <div className="flex items-center gap-1 text-xs text-white/60">
            <Clock className="w-3.5 h-3.5" />
            <span>Est. ~{cookingRecipe.cookTimeMinutes}m total cook</span>
          </div>
        </div>

        {/* Big Step Instruction Box */}
        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 backdrop-blur-md">
          <p className="text-xl sm:text-2xl font-bold leading-relaxed text-white">
            {cookingRecipe.instructions[currentStepIndex]}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {cookingRecipe.instructions.map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentStepIndex
                  ? 'w-8 bg-[#3FAE68]'
                  : idx < currentStepIndex
                  ? 'w-2 bg-white/60'
                  : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center gap-4 max-w-lg mx-auto w-full">
        <button
          onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
          disabled={currentStepIndex === 0}
          className="flex-1 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-white font-bold text-sm flex items-center justify-center gap-1 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {isLastStep ? (
          <button
            onClick={handleFinish}
            className="flex-1 py-3.5 rounded-2xl bg-[#3FAE68] hover:bg-[#349859] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#3FAE68]/40 transition active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Finish Cooking</span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentStepIndex(prev => Math.min(totalSteps - 1, prev + 1))}
            className="flex-1 py-3.5 rounded-2xl bg-[#3FAE68] hover:bg-[#349859] text-white font-black text-sm flex items-center justify-center gap-1 shadow-lg shadow-[#3FAE68]/40 transition active:scale-95"
          >
            <span>Next Step</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
