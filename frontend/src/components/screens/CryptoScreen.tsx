import React from 'react';
import { Bitcoin, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { CryptoCoin } from '../modals/CryptoTradeModal';

interface CryptoScreenProps {
  onSelectCoin: (coin: CryptoCoin) => void;
  onExploreClick: () => void;
}

export const CryptoScreen: React.FC<CryptoScreenProps> = ({ onSelectCoin, onExploreClick }) => {
  const coins: CryptoCoin[] = [
    { name: 'Bitcoin', symbol: 'BTC', price: '64,280.00', change: '+3.4%', isPos: true },
    { name: 'Ethereum', symbol: 'ETH', price: '3,450.10', change: '+1.9%', isPos: true },
    { name: 'Solana', symbol: 'SOL', price: '142.30', change: '-2.1%', isPos: false },
    { name: 'Toncoin', symbol: 'TON', price: '5.85', change: '+5.7%', isPos: true },
  ];

  return (
    <div className="px-4 py-3 space-y-4 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Crypto</h1>
        <p className="text-xs text-revolut-muted">Покупка, продажа и хранение криптоактивов</p>
      </div>

      {/* Crypto Balance Card */}
      <div 
        onClick={onExploreClick}
        className="p-4 rounded-card bg-gradient-to-br from-[#1e1b4b]/60 via-revolut-cardSolid to-transparent border border-white/[0.08] shadow-glass cursor-pointer hover:bg-white/[0.06] transition-all"
      >
        <span className="text-xs font-semibold text-revolut-muted">Баланс криптовалюты</span>
        <div className="flex items-baseline gap-2 my-1">
          <span className="text-3xl font-semibold text-white font-sans tabular-nums">€ 950.40</span>
          <span className="text-xs font-semibold text-revolut-green flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5" /> +5.2%
          </span>
        </div>
        <p className="text-[11px] text-revolut-muted font-sans tabular-nums">≈ 0.0152 BTC</p>
      </div>

      {/* Coins List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-white">Криптовалюты</h2>
          <button 
            onClick={onExploreClick}
            className="text-xs text-revolut-blue font-semibold hover:text-revolut-blueHover"
          >
            Все токены
          </button>
        </div>

        <div className="rounded-card bg-white/[0.04] border border-white/[0.06] divide-y divide-white/[0.04]">
          {coins.map((c) => (
            <button
              key={c.symbol}
              onClick={() => onSelectCoin(c)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] transition-colors text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center text-revolut-orange group-hover:scale-105 transition-transform shadow-inner-light">
                  <Bitcoin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">{c.name}</p>
                  <p className="text-[11px] text-revolut-muted font-mono">{c.symbol}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs sm:text-sm font-semibold text-white font-sans tabular-nums">
                  €{c.price}
                </p>
                <p className={`text-[11px] font-semibold font-sans tabular-nums flex items-center justify-end ${
                  c.isPos ? 'text-revolut-green' : 'text-red-400'
                }`}>
                  {c.isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {c.change}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
