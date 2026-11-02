import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import { Check, ArrowRight } from 'lucide-react';

export interface StockItem {
  ticker: string;
  name: string;
  price: string;
  change: string;
  isPos: boolean;
}

interface StockTradeModalProps {
  stock: StockItem | null;
  isOpen: boolean;
  onClose: () => void;
  onBuySuccess?: (msg: string) => void;
}

export const StockTradeModal: React.FC<StockTradeModalProps> = ({
  stock,
  isOpen,
  onClose,
  onBuySuccess,
}) => {
  const [shares, setShares] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!stock) return null;

  const count = parseFloat(shares) || 0;
  const singlePrice = parseFloat(stock.price) || 0;
  const totalCost = (count * singlePrice).toFixed(2);

  const handleBuy = () => {
    if (count <= 0) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      onBuySuccess?.(`Успешно куплено ${count} шт. ${stock.ticker} на $${totalCost}`);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1400);
    }, 700);
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title={`${stock.name} (${stock.ticker})`}>
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-revolut-green/20 text-revolut-green flex items-center justify-center mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white mb-1">Сделка исполнена</h4>
          <p className="text-xs text-revolut-muted font-sans tabular-nums">
            Куплено {count} шт. {stock.ticker} по цене ${stock.price}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Price Header */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
            <span className="text-xs text-revolut-muted block">Текущая котировка</span>
            <div className="text-3xl font-semibold text-white font-sans tabular-nums my-1">
              ${stock.price}
            </div>
            <span className={`text-xs font-semibold ${stock.isPos ? 'text-revolut-green' : 'text-red-400'}`}>
              {stock.change} сегодня
            </span>
          </div>

          {/* Shares input */}
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Количество акций</span>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              className="w-24 text-right bg-transparent text-white font-semibold text-sm focus:outline-none font-sans tabular-nums border-b border-white/20 pb-0.5"
            />
          </div>

          <div className="flex justify-between items-center text-xs px-1">
            <span className="text-revolut-muted">Итоговая сумма сделки</span>
            <span className="text-sm font-bold text-white font-sans tabular-nums">${totalCost}</span>
          </div>

          <button
            onClick={handleBuy}
            disabled={isSubmitting || count <= 0}
            className="w-full h-12 rounded-full bg-revolut-green hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 shadow-inner-light mt-2"
          >
            <span>{isSubmitting ? 'Исполнение ордера...' : `Купить ${stock.ticker} за $${totalCost}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </ModalSheet>
  );
};
