import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import { Check, ArrowRight, AlertCircle } from 'lucide-react';

export interface CryptoCoin {
  name: string;
  symbol: string;
  price: string;
  change: string;
  isPos: boolean;
}

interface CryptoTradeModalProps {
  coin: CryptoCoin | null;
  isOpen: boolean;
  onClose: () => void;
  availableBalance?: number;
  currency?: string;
  onExecuteBuy?: (coin: CryptoCoin, eurAmount: number, cryptoAmount: number) => Promise<void>;
}

export const CryptoTradeModal: React.FC<CryptoTradeModalProps> = ({
  coin,
  isOpen,
  onClose,
  availableBalance = 1000,
  currency = 'EUR',
  onExecuteBuy,
}) => {
  const [eurAmount, setEurAmount] = useState<string>('50');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!coin) return null;

  const inputEur = parseFloat(eurAmount) || 0;
  const coinPrice = parseFloat(coin.price.replace(/,/g, '')) || 1;
  const estimatedCrypto = (inputEur / coinPrice).toFixed(6);

  const handleBuy = async () => {
    if (inputEur <= 0) return;
    if (inputEur > availableBalance) {
      setErrorMsg(`Недостаточно средств. Доступно: €${availableBalance.toFixed(2)}`);
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      if (onExecuteBuy) {
        await onExecuteBuy(coin, inputEur, parseFloat(estimatedCrypto));
      }
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1600);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка покупки криптовалюты');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title={`Покупка ${coin.name} (${coin.symbol})`}>
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-revolut-green/20 text-revolut-green flex items-center justify-center mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white mb-1">Покупка совершена</h4>
          <p className="text-sm font-semibold text-white mt-1 font-sans tabular-nums">
            Зачислено +{estimatedCrypto} {coin.symbol}
          </p>
          <p className="text-xs text-revolut-muted mt-0.5 font-sans tabular-nums">
            Списано €{inputEur.toFixed(2)} со счёта
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
            <span className="text-xs text-revolut-muted block">Курс токена</span>
            <div className="text-3xl font-semibold text-white font-sans tabular-nums my-1">
              € {coin.price}
            </div>
            <span className={`text-xs font-semibold ${coin.isPos ? 'text-revolut-green' : 'text-red-400'}`}>
              {coin.change} за 24ч
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-white block">Сумма в {currency}</span>
              <span className="text-[11px] text-revolut-muted font-sans tabular-nums">
                Доступно: €{availableBalance.toFixed(2)}
              </span>
            </div>
            <input
              type="number"
              min="5"
              step="5"
              value={eurAmount}
              onChange={(e) => setEurAmount(e.target.value)}
              className="w-24 text-right bg-transparent text-white font-semibold text-sm focus:outline-none font-sans tabular-nums border-b border-white/20 pb-0.5"
            />
          </div>

          <div className="flex justify-between items-center text-xs px-1">
            <span className="text-revolut-muted">Вы получите примерно</span>
            <span className="text-sm font-bold text-revolut-green font-mono">{estimatedCrypto} {coin.symbol}</span>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            onClick={handleBuy}
            disabled={isSubmitting || inputEur <= 0 || inputEur > availableBalance}
            className="w-full h-12 rounded-full bg-revolut-blue hover:bg-revolut-blueHover text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 shadow-inner-light mt-2"
          >
            <span>{isSubmitting ? 'Обработка ордера...' : `Купить ${coin.symbol} за €${inputEur}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </ModalSheet>
  );
};
