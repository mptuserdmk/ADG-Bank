import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import { Check, ArrowRight, AlertCircle } from 'lucide-react';

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
  availableBalance?: number;
  currency?: string;
  onExecuteBuy?: (stock: StockItem, shares: number, totalCost: number) => Promise<void>;
}

export const StockTradeModal: React.FC<StockTradeModalProps> = ({
  stock,
  isOpen,
  onClose,
  availableBalance = 1000,
  currency = 'EUR',
  onExecuteBuy,
}) => {
  const [shares, setShares] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!stock) return null;

  const count = parseFloat(shares) || 0;
  const singlePrice = parseFloat(stock.price) || 0;
  const totalCost = parseFloat((count * singlePrice).toFixed(2));

  const handleBuy = async () => {
    if (count <= 0) return;
    if (totalCost > availableBalance) {
      setErrorMsg(`Недостаточно средств. Доступно: €${availableBalance.toFixed(2)}`);
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      if (onExecuteBuy) {
        await onExecuteBuy(stock, count, totalCost);
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка исполнения ордера');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title={`${stock.name} (${stock.ticker})`}>
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-revolut-green/20 text-revolut-green flex items-center justify-center mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white mb-1">Сделка исполнена</h4>
          <p className="text-sm font-semibold text-white mt-1 font-sans tabular-nums">
            Куплено +{count} шт. {stock.ticker}
          </p>
          <p className="text-xs text-revolut-muted mt-0.5 font-sans tabular-nums">
            Списано €{totalCost.toFixed(2)} со счёта
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
            <div>
              <span className="text-xs font-semibold text-white block">Количество акций</span>
              <span className="text-[11px] text-revolut-muted font-sans tabular-nums">
                Баланс: {currency === 'RUB' ? '₽' : currency === 'USD' ? '$' : '€'}{availableBalance.toFixed(2)}
              </span>
            </div>
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
            <span className="text-sm font-bold text-white font-sans tabular-nums">${totalCost.toFixed(2)}</span>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            onClick={handleBuy}
            disabled={isSubmitting || count <= 0 || totalCost > availableBalance}
            className="w-full h-12 rounded-full bg-revolut-green hover:bg-emerald-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 shadow-inner-light mt-2"
          >
            <span>{isSubmitting ? 'Исполнение ордера...' : `Купить ${stock.ticker} за $${totalCost.toFixed(2)}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </ModalSheet>
  );
};
