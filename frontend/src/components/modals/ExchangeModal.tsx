import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { AccountDTO } from '../../types/api';
import { getExchangeRate } from '../../utils/currency';
import { ArrowDownUp, Check, RefreshCw, Sparkles } from 'lucide-react';

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountDTO[];
  onExecuteExchange: (fromAccId: number, targetCurrency: string, fromAmt: number, toAmt: number) => Promise<void>;
}

export const ExchangeModal: React.FC<ExchangeModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onExecuteExchange,
}) => {
  const allCurrencies = ['USD', 'EUR', 'RUB', 'BTC', 'GBP'];
  const [fromAccountId, setFromAccountId] = useState<number>(accounts[0]?.id || 1);

  const fromAcc = accounts.find((a) => a.id === fromAccountId) || accounts[0];
  const fromCurrency = fromAcc?.currency || 'EUR';

  // Default target currency to a different one than fromCurrency
  const initialTargetCurrency = allCurrencies.find((c) => c !== fromCurrency) || 'USD';
  const [targetCurrency, setTargetCurrency] = useState<string>(initialTargetCurrency);
  const [amountStr, setAmountStr] = useState<string>('50');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const targetAccountExists = accounts.some((a) => a.currency.toUpperCase() === targetCurrency.toUpperCase());

  const rate = getExchangeRate(fromCurrency, targetCurrency);
  const inputAmt = parseFloat(amountStr) || 0;
  const isBtc = targetCurrency === 'BTC';
  const resultAmt = isBtc ? (inputAmt * rate).toFixed(6) : (inputAmt * rate).toFixed(2);

  const handleSwap = () => {
    // If we have an account in targetCurrency, swap
    const targetAcc = accounts.find((a) => a.currency.toUpperCase() === targetCurrency.toUpperCase());
    if (targetAcc) {
      setFromAccountId(targetAcc.id);
      setTargetCurrency(fromCurrency);
    } else {
      setTargetCurrency(fromCurrency);
    }
  };

  const handleExchange = async () => {
    if (inputAmt <= 0) return;
    setIsSubmitting(true);
    try {
      await onExecuteExchange(fromAccountId, targetCurrency, inputAmt, parseFloat(resultAmt));
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1800);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Обмен валюты">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-revolut-green/20 text-revolut-green flex items-center justify-center mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white mb-1">Обмен успешно завершён</h4>
          <p className="text-sm font-semibold text-white mt-1 font-sans tabular-nums">
            -{amountStr} {fromCurrency} ➔ +{resultAmt} {targetCurrency}
          </p>
          {!targetAccountExists && (
            <p className="text-xs text-revolut-green mt-2">
              ✓ Новый мультивалютный счёт в {targetCurrency} открыт и пополнен
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Rate indicator pill */}
          <div className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px] font-semibold text-revolut-platinum mx-auto w-fit font-sans tabular-nums">
            <RefreshCw className="w-3 h-3 text-revolut-blue animate-spin" />
            <span>1 {fromCurrency} = {rate < 0.01 ? rate.toFixed(6) : rate.toFixed(4)} {targetCurrency}</span>
          </div>

          {/* From Box */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-revolut-muted">Вы отдаёте</span>
              <select
                value={fromAccountId}
                onChange={(e) => setFromAccountId(Number(e.target.value))}
                className="bg-white/[0.08] text-white text-xs font-bold rounded-lg px-2.5 py-1 border border-white/[0.1] focus:outline-none"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id} className="bg-revolut-cardSolid text-white">
                    {a.currency} ({a.balance.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-48 text-2xl sm:text-3xl font-semibold font-sans tabular-nums text-white bg-transparent focus:outline-none"
              />
              <span className="text-xs text-revolut-muted font-sans tabular-nums">
                Доступно: {fromAcc?.balance.toFixed(2)} {fromCurrency}
              </span>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwap}
              type="button"
              className="w-9 h-9 rounded-full bg-revolut-cardSolid border border-white/[0.15] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-float"
            >
              <ArrowDownUp className="w-4 h-4 text-revolut-blue" />
            </button>
          </div>

          {/* To Box */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-revolut-muted">Вы получаете</span>
              <select
                value={targetCurrency}
                onChange={(e) => setTargetCurrency(e.target.value)}
                className="bg-white/[0.08] text-white text-xs font-bold rounded-lg px-2.5 py-1 border border-white/[0.1] focus:outline-none"
              >
                {allCurrencies.map((c) => {
                  const acc = accounts.find((a) => a.currency.toUpperCase() === c.toUpperCase());
                  return (
                    <option key={c} value={c} className="bg-revolut-cardSolid text-white">
                      {c} {acc ? `(${acc.balance.toFixed(2)})` : '(Новый счёт)'}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl sm:text-3xl font-semibold font-sans tabular-nums text-revolut-green">
                {resultAmt}
              </div>
              <span className="text-xs text-revolut-muted font-sans tabular-nums">
                {targetCurrency}
              </span>
            </div>
          </div>

          {!targetAccountExists && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-revolut-blue/10 border border-revolut-blue/20 text-xs text-revolut-platinum">
              <Sparkles className="w-4 h-4 text-revolut-blue flex-shrink-0" />
              <span>У вас нет счёта в {targetCurrency}. Он будет открыт автоматически в момент обмена.</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            onClick={handleExchange}
            disabled={isSubmitting || inputAmt <= 0 || (fromAcc && inputAmt > fromAcc.balance) || fromCurrency === targetCurrency}
            className="w-full h-12 rounded-full bg-revolut-blue hover:bg-revolut-blueHover text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 shadow-inner-light mt-2"
          >
            <span>
              {isSubmitting
                ? 'Конвертация...'
                : fromCurrency === targetCurrency
                ? 'Выберите разные валюты'
                : `Обменять ${amountStr} ${fromCurrency} на ${targetCurrency}`}
            </span>
          </button>
        </div>
      )}
    </ModalSheet>
  );
};
