import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { CryptoCoin } from '../modals/CryptoTradeModal';
import { BankAPI } from '../../api/client';
import { motion } from 'framer-motion';

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

  const holdings = BankAPI.getCryptoHoldings();

  const totalEurValue = coins.reduce((acc, c) => {
    const amount = holdings[c.symbol]?.amount || 0;
    const price = parseFloat(c.price.replace(/,/g, '')) || 0;
    return acc + amount * price;
  }, 0);

  const btcAmount = holdings['BTC']?.amount || 0;

  return (
    <div className="px-4 py-3 space-y-4 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Crypto</h1>
        <p className="text-xs text-revolut-muted">Покупка, продажа и хранение криптоактивов</p>
      </div>

      {/* Crypto Balance Card with 3D graphics */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onExploreClick}
        className="relative p-4 rounded-card bg-gradient-to-br from-[#1e1b4b]/60 via-revolut-cardSolid to-transparent border border-white/[0.08] shadow-glass cursor-pointer overflow-hidden"
      >
        <img
          src="/assets/3d/crypto-coin-3d.png"
          alt="Crypto 3D Coin"
          className="absolute -right-1 -bottom-1 w-28 h-28 object-contain drop-shadow-[0_10px_25px_rgba(245,158,11,0.3)] pointer-events-none"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        <div className="relative z-10">
          <span className="text-xs font-semibold text-revolut-muted">Баланс криптовалюты</span>
          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-semibold text-white font-sans tabular-nums">
              € {totalEurValue.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-xs font-semibold text-revolut-green flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +5.2%
            </span>
          </div>
          <p className="text-[11px] text-revolut-muted font-sans tabular-nums">
            ≈ {btcAmount.toFixed(4)} BTC
          </p>
        </div>
      </motion.div>

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

        <div className="rounded-card bg-white/[0.04] border border-white/[0.06] divide-y divide-white/[0.04] overflow-hidden">
          {coins.map((c) => (
            <motion.button
              key={c.symbol}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectCoin(c)}
              className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-revolut-purple/20 border border-revolut-purple/30 flex items-center justify-center text-white font-bold text-xs">
                  {c.symbol}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-white">{c.name}</span>
                    <span className="text-[10px] text-revolut-muted font-mono">{c.symbol}</span>
                  </div>
                  <span className="text-[11px] text-revolut-muted">Крипто</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-white font-sans tabular-nums">
                  €{c.price}
                </div>
                <div className={`text-[11px] font-semibold flex items-center justify-end font-sans tabular-nums ${
                  c.isPos ? 'text-revolut-green' : 'text-red-400'
                }`}>
                  {c.isPos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {c.change}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};
