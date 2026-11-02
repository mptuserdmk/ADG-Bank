import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3200);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const Icon = toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2;
  const iconColor = toast.type === 'error' ? 'text-red-400' : toast.type === 'info' ? 'text-revolut-blue' : 'text-revolut-green';

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[390px] animate-fadeIn pointer-events-auto">
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-revolut-cardSolid/95 backdrop-blur-revolut border border-white/[0.12] shadow-float text-white">
        <div className="flex items-center gap-3 min-w-0 pr-2">
          <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{toast.title}</p>
            {toast.description && (
              <p className="text-[11px] text-revolut-muted truncate mt-0.5">{toast.description}</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center text-revolut-muted hover:text-white flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

