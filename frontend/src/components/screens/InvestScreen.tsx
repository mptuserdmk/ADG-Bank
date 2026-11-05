import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { StockItem } from '../modals/StockTradeModal';
import { BankAPI } from '../../api/client';
import { motion } from 'framer-motion';

interface InvestScreenProps {
  onSelectStock: (stock: StockItem) => void;
  onExploreClick: () => void;
}

export const InvestScreen: React.FC<InvestScreenProps> = ({ onSelectStock, onExploreClick }) => {
  const stocks: StockItem[] = [
    { ticker: 'AAPL', name: 'Apple Inc.', price: '189.45', change: '+1.84%', isPos: true },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', price: '875.20', change: '+4.20%', isPos: true },
    { ticker: 'TSLA', name: 'Tesla Inc.', price: '172.60', change: '-0.95%', isPos: false },
    { ticker: 'MSFT', name: 'Microsoft', price: '420.55', change: '+0.75%', isPos: true },
  ];

  const holdings = BankAPI.getStockHoldings();

  const totalPortfolioValue = stocks.reduce((acc, s) => {
    const shares = holdings[s.ticker]?.shares || 0;
    const price = parseFloat(s.price) || 0;
    return acc + shares * price;
  }, 0);

  return (
    <div className="px-4 py-3 space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Invest</h1>
          <p className="text-xs text-revolut-muted">Акции, ETF и драгоценные металлы</p>
        </div>
      </div>

      {/* Portfolio Value Card with 3D graphic banner */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onExploreClick}
        className="relative p-4 rounded-card bg-gradient-to-br from-revolut-cardSolid to-white/[0.04] border border-white/[0.08] shadow-glass cursor-pointer overflow-hidden"
      >
        <img
          src="/assets/3d/invest-growth-3d.png"
          alt="Investing 3D"
          className="absolute -right-2 -bottom-2 w-28 h-28 object-contain drop-shadow-[0_10px_25px_rgba(16,185,129,0.25)] pointer-events-none"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        <div className="relative z-10">
          <span className="text-xs font-semibold text-revolut-muted">Инвестиционный портфель</span>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-semibold text-white font-sans tabular-nums">
              $ {totalPortfolioValue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-revolut-green flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.4%
            </span>
          </div>
          <p className="text-[11px] text-revolut-muted mt-1 font-sans tabular-nums">+€532.10 за всё время</p>
        </div>
      </motion.div>

      {/* Watchlist */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-white">Популярные активы</h2>
          <button 
            onClick={onExploreClick}
            className="text-xs text-revolut-blue font-semibold hover:text-revolut-blueHover"
          >
            Все акции
          </button>
        </div>

        <div className="rounded-card bg-white/[0.04] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
          {stocks.map((s) => (
            <motion.button
              key={s.ticker}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectStock(s)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white font-bold text-xs">
                  {s.ticker.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white">{s.name}</span>
                    <span className="text-[10px] text-revolut-muted font-mono">{s.ticker}</span>
                  </div>
                  <span className="text-[11px] text-revolut-muted">1 акция</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-white font-sans tabular-nums">
                  €{s.price}
                </div>
                <div className={`text-[11px] font-semibold font-sans tabular-nums ${
                  s.isPos ? 'text-revolut-green' : 'text-red-400'
                }`}>
                  {s.change}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
