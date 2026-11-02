import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-card bg-white/[0.04] border border-white/[0.06] my-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.06] text-revolut-muted mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
      <p className="text-xs text-revolut-muted max-w-[240px] mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-full bg-revolut-blue hover:bg-revolut-blueHover text-xs font-semibold text-white transition-all active:scale-95 shadow-inner-light"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
