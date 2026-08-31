import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90%] max-w-sm pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#17211B] text-white shadow-xl text-sm font-medium animate-in fade-in slide-in-from-top-3 duration-200"
        >
          {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#3FAE68] shrink-0" />}
          {t.type === 'warning' && <AlertCircle className="w-5 h-5 text-[#F2A65A] shrink-0" />}
          {(!t.type || t.type === 'info') && <Info className="w-5 h-5 text-[#3FAE68] shrink-0" />}
          <span className="flex-1">{t.message}</span>
        </div>
      ))}
    </div>
  );
};
