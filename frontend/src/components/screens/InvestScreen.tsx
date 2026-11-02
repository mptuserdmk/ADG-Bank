import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { StockItem } from '../modals/StockTradeModal';

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

  return (
    <div className="px-4 py-3 space-y-4 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Invest</h1>
        <p className="text-xs text-revolut-muted">Акции, ETF и драгоценные металлы</p>
      </div>

      {/* Portfolio Value Card */}
      <div 
        onClick={onExploreClick}
        className="p-4 rounded-card bg-gradient-to-br from-revolut-cardSolid to-white/[0.04] border border-white/[0.08] shadow-glass cursor-pointer hover:bg-white/[0.06] transition-all"
      >
        <span className="text-xs font-semibold text-revolut-muted">Инвестиционный портфель</span>
        <div className="flex items-baseline gap-2 my-1">
          <span className="text-3xl font-semibold text-white font-sans tabular-nums">€ 4,820.50</span>
          <span className="text-xs font-semibold text-revolut-green flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5" /> +12.4%
          </span>
        </div>
        <p className="text-[11px] text-revolut-muted mt-1 font-sans tabular-nums">+€532.10 за всё время</p>
      </div>

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

        <div className="rounded-card bg-white/[0.04] border border-white/[0.06] divide-y divide-white/[0.04]">
          {stocks.map((s) => (
            <button
              key={s.ticker}
              onClick={() => onSelectStock(s)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center font-bold text-xs text-white group-hover:scale-105 transition-transform shadow-inner-light">
                  {s.ticker[0]}
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">{s.name}</p>
                  <p className="text-[11px] text-revolut-muted font-mono">{s.ticker}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs sm:text-sm font-semibold text-white font-sans tabular-nums">
                  ${s.price}
                </p>
                <p className={`text-[11px] font-semibold font-sans tabular-nums ${s.isPos ? 'text-revolut-green' : 'text-red-400'}`}>
                  {s.change}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
