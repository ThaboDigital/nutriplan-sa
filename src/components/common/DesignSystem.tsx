import React from 'react';
import { LucideIcon } from 'lucide-react';

// ==========================================
// 1. STAT BADGE / DIETARY TAG
// ==========================================
interface StatBadgeProps {
  label: string;
  variant?: 'green' | 'dark' | 'amber' | 'neutral' | 'accent';
  size?: 'sm' | 'md';
  icon?: LucideIcon;
}

export const StatBadge: React.FC<StatBadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'sm',
  icon: Icon
}) => {
  const variantStyles = {
    green: 'bg-[#EAF7EF] text-[#2C854E] border border-[#3FAE68]/30',
    dark: 'bg-[#17211B] text-white border border-[#17211B]',
    amber: 'bg-[#FEF6EE] text-[#C45E16] border border-[#F2A65A]/40',
    neutral: 'bg-[#F4F6F4] text-[#4A554D] border border-[#E8EDE9]',
    accent: 'bg-[#3FAE68] text-white',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-bold rounded-lg',
    md: 'text-xs px-2.5 py-1 font-extrabold rounded-xl',
  };

  return (
    <span className={`inline-flex items-center gap-1 shrink-0 ${variantStyles[variant]} ${sizeStyles[size]} tracking-tight transition`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span>{label}</span>
    </span>
  );
};

// ==========================================
// 2. MACRO PROGRESS BAR
// ==========================================
interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color?: 'green' | 'amber' | 'blue' | 'purple' | 'slate';
  showPercentage?: boolean;
}

export const MacroBar: React.FC<MacroBarProps> = ({
  label,
  current,
  target,
  unit = 'g',
  color = 'green',
  showPercentage = false,
}) => {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  const colorMap = {
    green: { fill: 'bg-[#3FAE68]', bg: 'bg-[#EAF7EF]', text: 'text-[#2C854E]' },
    amber: { fill: 'bg-[#F2A65A]', bg: 'bg-[#FEF6EE]', text: 'text-[#C45E16]' },
    blue: { fill: 'bg-[#3B82F6]', bg: 'bg-[#EFF6FF]', text: 'text-[#1D4ED8]' },
    purple: { fill: 'bg-[#8B5CF6]', bg: 'bg-[#F5F3FF]', text: 'text-[#6D28D9]' },
    slate: { fill: 'bg-[#17211B]', bg: 'bg-[#E8EDE9]', text: 'text-[#17211B]' },
  };

  const c = colorMap[color];

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-[#4A554D]">{label}</span>
        <div className="flex items-center gap-1 font-bold">
          <span className="text-[#17211B]">{Math.round(current)}{unit}</span>
          <span className="text-[#6B756C] font-normal">/ {target}{unit}</span>
          {showPercentage && (
            <span className={`text-[10px] font-extrabold ml-1 ${c.text}`}>({pct}%)</span>
          )}
        </div>
      </div>
      <div className={`w-full h-2 rounded-full overflow-hidden ${c.bg}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${c.fill}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

// ==========================================
// 3. ACCESSIBLE TOUCH BUTTON
// ==========================================
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled,
  className = '',
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-[#3FAE68] text-white hover:bg-[#349859] active:bg-[#2C854E] shadow-xs',
    secondary: 'bg-[#EAF7EF] text-[#2C854E] hover:bg-[#d8f1e1] active:bg-[#c6e9d2] border border-[#3FAE68]/30',
    dark: 'bg-[#17211B] text-white hover:bg-black active:bg-[#0E1511] shadow-xs',
    outline: 'bg-white text-[#17211B] border border-[#E8EDE9] hover:border-[#17211B] hover:bg-[#F8F9FA]',
    ghost: 'bg-transparent text-[#4A554D] hover:bg-black/5 hover:text-[#17211B]',
    danger: 'bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FCA5A5] active:bg-[#EF4444] hover:text-white',
  };

  const sizeStyles = {
    sm: 'text-xs py-2 px-3 min-h-[38px] rounded-xl font-bold',
    md: 'text-xs sm:text-sm py-2.5 px-4 min-h-[44px] rounded-2xl font-bold',
    lg: 'text-sm sm:text-base py-3.5 px-6 min-h-[50px] rounded-2xl font-black',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`touch-target inline-flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.985] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 ${
        variantStyles[variant]
      } ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};

// ==========================================
// 4. NUTRIENT PILL
// ==========================================
interface NutrientPillProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export const NutrientPill: React.FC<NutrientPillProps> = ({
  label,
  value,
  highlight = false,
}) => (
  <div className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1 shrink-0 ${
    highlight
      ? 'bg-[#EAF7EF] text-[#2C854E] font-bold border border-[#3FAE68]/30'
      : 'bg-[#F8F9FA] text-[#6B756C] border border-[#E8EDE9]'
  }`}>
    <span className="opacity-80">{label}:</span>
    <span className="font-bold text-[#17211B]">{value}</span>
  </div>
);

// ==========================================
// 5. SECTION HEADER
// ==========================================
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  const ActionIcon = action?.icon;
  return (
    <div className="flex items-center justify-between gap-2 pb-1">
      <div>
        <h2 className="text-base sm:text-lg font-black text-[#17211B] tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-[#6B756C] mt-0.5">{subtitle}</p>}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs font-bold text-[#3FAE68] hover:text-[#2C854E] flex items-center gap-1 transition p-1"
        >
          <span>{action.label}</span>
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
};

// ==========================================
// 6. EMPTY STATE (Section 21)
// ==========================================
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}) => (
  <div className={`bg-white rounded-3xl border border-[#E8EDE9] text-center subtle-shadow flex flex-col items-center justify-center ${
    compact ? 'p-6' : 'p-8 sm:p-10'
  }`}>
    <div className="w-12 h-12 rounded-2xl bg-[#F8FBF9] border border-[#EAF7EF] text-[#3FAE68] flex items-center justify-center mb-3">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-extrabold text-sm sm:text-base text-[#17211B]">{title}</h3>
    <p className="text-xs text-[#6B756C] mt-1 max-w-sm leading-relaxed">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-4 px-5 py-2.5 rounded-2xl bg-[#3FAE68] text-white hover:bg-[#349859] font-bold text-xs shadow-xs transition active:scale-95"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// ==========================================
// 7. SKELETON LOADER (Section 22)
// ==========================================
export const SkeletonLoader: React.FC<{ rows?: number; heightClass?: string }> = ({
  rows = 3,
  heightClass = 'h-16',
}) => (
  <div className="space-y-3 w-full animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div
        key={i}
        className={`w-full rounded-2xl bg-[#F0F2F0] ${heightClass}`}
      />
    ))}
  </div>
);
