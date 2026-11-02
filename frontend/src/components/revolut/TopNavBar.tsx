import React from 'react';
import { Search, BarChart3, QrCode } from 'lucide-react';

interface TopNavBarProps {
  userInitials?: string;
  searchQuery?: string;
  isBackendConnected?: boolean;
  onSearch?: (query: string) => void;
  onOpenAnalytics?: () => void;
  onOpenQR?: () => void;
  onProfileClick?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  userInitials = 'DE',
  searchQuery = '',
  isBackendConnected = false,
  onSearch,
  onOpenAnalytics,
  onOpenQR,
  onProfileClick,
}) => {
  return (
    <header className="flex items-center justify-between gap-2.5 px-4 py-3 sticky top-0 z-30 bg-revolut-canvas/90 backdrop-blur-revolut border-b border-white/[0.04]">
      {/* Profile avatar with backend connection indicator */}
      <button 
        onClick={onProfileClick}
        title={isBackendConnected ? 'Подключено к Spring Cloud Gateway (:8080)' : 'Демо-режим (Бэкенд оффлайн)'}
        aria-label="Профиль пользователя"
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-revolut-purple to-revolut-blue text-white font-semibold text-xs shadow-inner-light transition-transform active:scale-95 flex-shrink-0"
      >
        <span>{userInitials}</span>
        {/* Green dot if real backend online, orange if mock demo */}
        <span 
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-revolut-canvas ${
            isBackendConnected ? 'bg-revolut-green' : 'bg-revolut-orange'
          }`} 
        />
      </button>

      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-revolut-muted" />
        <input
          type="text"
          value={searchQuery}
          placeholder="Поиск по счетам..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full h-10 pl-9 pr-3 bg-white/[0.06] hover:bg-white/[0.09] border border-white/[0.08] rounded-full text-xs sm:text-sm text-white placeholder-revolut-muted focus:outline-none focus:border-revolut-blue focus:ring-1 focus:ring-revolut-blue transition-all"
        />
      </div>

      {/* Analytics & QR icons */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button 
          onClick={onOpenAnalytics}
          aria-label="Аналитика расходов"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.06] text-revolut-platinum transition-colors active:scale-95"
        >
          <BarChart3 className="w-4 h-4" />
        </button>
        <button 
          onClick={onOpenQR}
          aria-label="Сканировать QR"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.06] text-revolut-platinum transition-colors active:scale-95"
        >
          <QrCode className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
