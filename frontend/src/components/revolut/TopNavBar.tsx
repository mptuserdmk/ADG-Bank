import React from 'react';
import { Search, BarChart3, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        onClick={onProfileClick}
        title={isBackendConnected ? 'Подключено к Spring Cloud Gateway (:8080)' : 'Демо-режим (Бэкенд оффлайн)'}
        aria-label="Профиль пользователя"
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-revolut-purple to-revolut-blue text-white shadow-inner-light flex-shrink-0"
      >
        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center relative bg-gradient-to-tr from-[#0666EB] to-[#984CFF]">
          <span className="font-bold text-xs tracking-tight text-white select-none">
            {userInitials || 'DE'}
          </span>
        </div>
        {/* Green dot if real backend online, orange if mock demo */}
        <span 
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-revolut-canvas z-10 ${
            isBackendConnected ? 'bg-revolut-green' : 'bg-revolut-orange'
          }`} 
        />
      </motion.button>

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
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={onOpenAnalytics}
          aria-label="Аналитика расходов"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.06] text-revolut-platinum transition-colors"
        >
          <BarChart3 className="w-4 h-4" />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={onOpenQR}
          aria-label="Сканировать QR"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.06] text-revolut-platinum transition-colors"
        >
          <QrCode className="w-4 h-4" />
        </motion.button>
      </div>
    </header>
  );
};
