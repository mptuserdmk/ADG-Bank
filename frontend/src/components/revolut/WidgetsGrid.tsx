import React from 'react';
import { CreditCard, TrendingUp, PieChart, Wallet } from 'lucide-react';

interface WidgetsGridProps {
  onCardClick?: () => void;
  onAnalyticsClick?: () => void;
}

export const WidgetsGrid: React.FC<WidgetsGridProps> = ({ onCardClick, onAnalyticsClick }) => {
  return (
    <section className="px-4 py-3">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">Widgets</h2>
        <button 
          onClick={onAnalyticsClick}
          className="text-xs font-semibold text-revolut-blue hover:text-revolut-blueHover transition-colors"
        >
          Details
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Widget 1: Spend this month */}
        <div 
          onClick={onAnalyticsClick}
          className="p-3.5 rounded-widget bg-white/[0.04] border border-white/[0.08] backdrop-blur-revolut flex flex-col justify-between h-[168px] shadow-glass hover:bg-white/[0.07] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-revolut-muted">Spend this month</span>
            <div className="w-7 h-7 rounded-full bg-revolut-orange/15 flex items-center justify-center text-revolut-orange">
              <PieChart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-semibold text-white font-sans tabular-nums">
              € 128.02
            </div>
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-revolut-orange h-full rounded-full transition-all" style={{ width: '45%' }} />
            </div>
            <p className="text-[11px] text-revolut-muted mt-1.5">€5 оставшийся лимит</p>
          </div>
        </div>

        {/* Widget 2: Total Wealth */}
        <div 
          onClick={onAnalyticsClick}
          className="p-3.5 rounded-widget bg-white/[0.04] border border-white/[0.08] backdrop-blur-revolut flex flex-col justify-between h-[168px] shadow-glass hover:bg-white/[0.07] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-revolut-muted">Total wealth</span>
            <div className="w-7 h-7 rounded-full bg-revolut-green/15 flex items-center justify-center text-revolut-green">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-semibold text-white font-sans tabular-nums">
              € 139.00
            </div>
            <p className="text-[11px] text-revolut-green font-semibold mt-1">↑ +€5.00 сегодня</p>
          </div>
        </div>

        {/* Widget 3: Disposable Card (Розовый глянцевый стиль Revolut) */}
        <div 
          onClick={onCardClick}
          className="p-3.5 rounded-widget bg-gradient-to-br from-[#ff7eb3]/20 via-[#ff758c]/15 to-transparent border border-[#ff7eb3]/30 backdrop-blur-revolut flex flex-col justify-between h-[168px] shadow-glass relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-pink-200">Disposable Card</span>
            <CreditCard className="w-4 h-4 text-pink-200" />
          </div>
          <div className="relative z-10">
            {/* Card number strictly uses font-mono */}
            <div className="text-xs sm:text-sm font-mono tracking-widest text-white/95 font-medium">
              •••• 9169
            </div>
            <p className="text-[11px] font-semibold text-pink-200/90 mt-1">
              DYLAN E. (Виртуальная)
            </p>
          </div>
        </div>

        {/* Widget 4: Cash & Linked */}
        <div className="p-3.5 rounded-widget bg-white/[0.04] border border-white/[0.08] backdrop-blur-revolut flex flex-col justify-between h-[168px] shadow-glass hover:bg-white/[0.07] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-revolut-muted">Cash & Linked</span>
            <div className="w-7 h-7 rounded-full bg-revolut-purple/15 flex items-center justify-center text-revolut-purple">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-semibold text-white font-sans tabular-nums">
              € 300.00
            </div>
            <div className="flex items-center justify-between text-[11px] text-revolut-muted mt-2 border-t border-white/[0.06] pt-1.5 font-sans tabular-nums">
              <span>Cash: €100</span>
              <span>Linked: €200</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

