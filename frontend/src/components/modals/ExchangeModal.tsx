import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { AccountDTO } from '../../types/api';
import { ArrowDownUp, Check, RefreshCw } from 'lucide-react';

interface ExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountDTO[];
  onExecuteExchange: (fromAccId: number, toAccId: number, fromAmt: number, toAmt: number) => Promise<void>;
}

export const ExchangeModal: React.FC<ExchangeModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onExecuteExchange,
}) => {
  const [fromAccountId, setFromAccountId] = useState<number>(accounts[0]?.id || 1);
  const [toAccountId, setToAccountId] = useState<number>(accounts[1]?.id || accounts[0]?.id || 2);
  const [amountStr, setAmountStr] = useState<string>('50');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fromAcc = accounts.find((a) => a.id === fromAccountId) || accounts[0];
  const toAcc = accounts.find((a) => a.id === toAccountId) || accounts[1] || accounts[0];

  // Dynamic currency rates
  const getRate = (fromCurr: string, toCurr: string): number => {
    if (fromCurr === toCurr) return 1;
    if (fromCurr === 'EUR' && toCurr === 'USD') return 1.085;
    if (fromCurr === 'USD' && toCurr === 'EUR') return 0.921;
    if (fromCurr === 'EUR' && toCurr === 'RUB') return 102.50;
    if (fromCurr === 'RUB' && toCurr === 'EUR') return 0.0097;
    if (fromCurr === 'USD' && toCurr === 'RUB') return 94.40;
    if (fromCurr === 'RUB' && toCurr === 'USD') return 0.0105;
    return 1;
  };

  const rate = getRate(fromAcc?.currency || 'EUR', toAcc?.currency || 'USD');
  const inputAmt = parseFloat(amountStr) || 0;
  const resultAmt = (inputAmt * rate).toFixed(2);

  const handleSwap = () => {
    setFromAccountId(toAccountId);
    setToAccountId(fromAccountId);
  };

  const handleExchange = async () => {
    if (inputAmt <= 0) return;
    setIsSubmitting(true);
    try {
      await onExecuteExchange(fromAccountId, toAccountId, inputAmt, parseFloat(resultAmt));
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1400);
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
          <p className="text-xs text-revolut-muted font-sans tabular-nums">
            {amountStr} {fromAcc?.currency} ➔ {resultAmt} {toAcc?.currency}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Rate indicator pill */}
          <div className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-full bg-white/[0.06] border border-white/[0.08] text-[11px] font-semibold text-revolut-platinum mx-auto w-fit font-sans tabular-nums">
            <RefreshCw className="w-3 h-3 text-revolut-blue animate-spin" />
            <span>1 {fromAcc?.currency} = {rate.toFixed(4)} {toAcc?.currency}</span>
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
                Баланс: {fromAcc?.balance.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button
              onClick={handleSwap}
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
                value={toAccountId}
                onChange={(e) => setToAccountId(Number(e.target.value))}
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
              <div className="text-2xl sm:text-3xl font-semibold font-sans tabular-nums text-revolut-green">
                {resultAmt}
              </div>
              <span className="text-xs text-revolut-muted font-sans tabular-nums">
                {toAcc?.currency}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            onClick={handleExchange}
            disabled={isSubmitting || inputAmt <= 0 || (fromAcc && inputAmt > fromAcc.balance)}
            className="w-full h-12 rounded-full bg-revolut-blue hover:bg-revolut-blueHover text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 shadow-inner-light mt-2"
          >
            <span>{isSubmitting ? 'Конвертация...' : `Обменять ${amountStr} ${fromAcc?.currency} на ${toAcc?.currency}`}</span>
          </button>
        </div>
      )}
    </ModalSheet>
  );
};
