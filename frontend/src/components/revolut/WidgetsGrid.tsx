import React from 'react';
import { CreditCard, TrendingUp, PieChart, ChevronRight, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface WidgetsGridProps {
  onCardClick?: () => void;
  onAnalyticsClick?: () => void;
  onInvestClick?: () => void;
  onCryptoClick?: () => void;
}

export const WidgetsGrid: React.FC<WidgetsGridProps> = ({
  onCardClick,
  onAnalyticsClick,
  onInvestClick,
  onCryptoClick,
}) => {
  return (
    <section className="px-4 py-3 space-y-5">
      {/* 2x2 Widgets Grid */}
      <div>
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
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
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
          </motion.div>

          {/* Widget 2: Total Wealth */}
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
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
          </motion.div>

          {/* Widget 3: Metal Space Gray Card (Authentic Figma Frame 27) */}
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCardClick}
            className="p-3.5 rounded-widget bg-white/[0.04] border border-white/[0.08] backdrop-blur-revolut flex flex-col justify-between h-[168px] shadow-glass hover:bg-white/[0.07] transition-all cursor-pointer group"
          >
            {/* Top row: Real Miniature 3D Metal Card */}
            <div className="flex items-center justify-between">
              <div className="w-[66px] h-[41px] rounded-md overflow-hidden relative shadow-md border border-white/20 bg-gradient-to-br from-[#1C1F22] to-[#121417] flex-shrink-0">
                <img
                  src="/assets/cards/card-metal.png"
                  alt="Metal Card"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0.5 left-1 font-mono text-[7px] text-white/90 font-medium">4521</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-white/70 group-hover:text-white transition-colors">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            {/* Bottom info */}
            <div>
              <span className="text-[11px] font-medium text-revolut-muted">Standard</span>
              <div className="text-sm font-semibold text-white tracking-tight">
                Metal Space Gray
              </div>
              <p className="text-[11px] font-mono text-revolut-muted mt-0.5">•••• 4521</p>
            </div>
          </motion.div>

          {/* Widget 4: Disposable Cyber Card */}
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={onCardClick}
            className="p-3.5 rounded-widget bg-white/[0.04] border border-white/[0.08] backdrop-blur-revolut flex flex-col justify-between h-[168px] shadow-glass hover:bg-white/[0.07] transition-all cursor-pointer group"
          >
            {/* Top row: Real Miniature 3D Cyber Card */}
            <div className="flex items-center justify-between">
              <div className="w-[66px] h-[41px] rounded-md overflow-hidden relative shadow-md border border-pink-400/30 bg-gradient-to-br from-pink-500 to-purple-600 flex-shrink-0">
                <img
                  src="/assets/cards/card-gradient.jpg"
                  alt="Cyber Card"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0.5 left-1 font-mono text-[7px] text-white/95 font-medium">9169</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-pink-300 group-hover:text-pink-200 transition-colors">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            {/* Bottom info */}
            <div>
              <span className="text-[11px] font-medium text-pink-300/80">Disposable</span>
              <div className="text-sm font-semibold text-white tracking-tight">
                Cyber Virtual
              </div>
              <p className="text-[11px] font-mono text-revolut-muted mt-0.5">•••• 9169</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Total Wealth Breakdown Section with 3D Graphics */}
      <div className="rounded-card bg-white/[0.04] border border-white/[0.06] p-4 shadow-glass">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">Total Wealth</h3>
            <p className="text-xs text-revolut-muted">Сбережения, активы и связанные банки</p>
          </div>
          <span className="text-base font-bold text-white font-sans tabular-nums">€ 300.00</span>
        </div>

        <div className="space-y-3">
          {/* Linked Bank */}
          <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 overflow-hidden flex items-center justify-center p-2 flex-shrink-0">
                <img
                  src="/assets/3d/linked-bank-3d.png"
                  alt="Linked"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Linked</p>
                <p className="text-[11px] text-revolut-muted">Связанные банковские счета</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-white font-sans tabular-nums">€ 200.00</span>
          </div>

          {/* Cash */}
          <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 overflow-hidden flex items-center justify-center p-2 flex-shrink-0">
                <img
                  src="/assets/3d/cash-vault-3d.png"
                  alt="Cash"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Cash</p>
                <p className="text-[11px] text-revolut-muted">Наличные и сейфы ADG</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-white font-sans tabular-nums">€ 100.00</span>
          </div>

          {/* Invest */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onInvestClick}
            className="flex items-center justify-between py-1 border-b border-white/[0.04] cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 overflow-hidden flex items-center justify-center p-2 flex-shrink-0">
                <img
                  src="/assets/3d/invest-growth-3d.png"
                  alt="Invest"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white group-hover:text-revolut-blue transition-colors">Invest</p>
                <p className="text-[11px] text-revolut-muted">Инвестиции в акции от €1</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-revolut-blue text-xs font-semibold">
              <span>Открыть</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </motion.div>

          {/* Crypto */}
          <motion.div
            whileTap={{ scale: 0.98 }}
            onClick={onCryptoClick}
            className="flex items-center justify-between py-1 cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 overflow-hidden flex items-center justify-center p-2 flex-shrink-0">
                <img
                  src="/assets/3d/crypto-coin-3d.png"
                  alt="Crypto"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">Crypto</p>
                <p className="text-[11px] text-revolut-muted">Покупка Bitcoin и 50+ токенов</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
              <span>Торговать</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Upcoming Payments with Real Merchant Logos */}
      <div className="rounded-card bg-white/[0.04] border border-white/[0.06] p-4 shadow-glass">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white tracking-tight">Upcoming payments</h3>
          <span className="text-xs text-revolut-muted">Регулярные счета</span>
        </div>

        <div className="space-y-3">
          {/* Webflow */}
          <div className="flex items-center justify-between py-1 border-b border-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1C1F22] border border-white/10 overflow-hidden flex items-center justify-center p-2 flex-shrink-0 shadow-inner">
                <img
                  src="/assets/merchants/webflow.png"
                  alt="Webflow"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Webflow</p>
                <p className="text-[11px] text-revolut-muted">One off · 15 марта</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-white font-sans tabular-nums">€ 124.00</span>
          </div>

          {/* UI8 */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1C1F22] border border-white/10 overflow-hidden flex items-center justify-center p-2 flex-shrink-0 shadow-inner">
                <img
                  src="/assets/merchants/ui8.png"
                  alt="UI8"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-white">UI8</p>
                <p className="text-[11px] text-revolut-muted">One off · 22 марта</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-white font-sans tabular-nums">€ 124.00</span>
          </div>
        </div>
      </div>
    </section>
  );
};
