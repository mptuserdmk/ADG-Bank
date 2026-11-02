import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { AccountDTO } from '../../types/api';
import { getCurrencyParts } from '../../utils/currency';
import { CreditCard, Landmark, Apple, Check, ArrowRight } from 'lucide-react';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountDTO;
  onConfirmAddMoney: (amount: number) => Promise<void>;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  isOpen,
  onClose,
  account,
  onConfirmAddMoney,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('100');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'applepay' | 'sepa'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const quickAmounts = [20, 50, 100, 250];

  const handleSelectQuick = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount(amt.toString());
  };

  const handleCustomChange = (val: string) => {
    setCustomAmount(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed)) setSelectedAmount(parsed);
  };

  const handleSubmit = async () => {
    const val = parseFloat(customAmount);
    if (isNaN(val) || val <= 0) return;
    setIsSubmitting(true);
    try {
      await onConfirmAddMoney(val);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1400);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { currencySymbol } = getCurrencyParts(0, account.currency);

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Пополнение счёта">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-revolut-green/20 text-revolut-green flex items-center justify-center mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white mb-1">Счёт успешно пополнен</h4>
          <p className="text-xs text-revolut-muted font-sans tabular-nums">
            + {customAmount} {currencySymbol} зачислено на {account.accountNumber}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Amount Display */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
            <span className="text-xs text-revolut-muted block mb-1">Сумма пополнения</span>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-3xl sm:text-4xl font-semibold text-revolut-platinum font-sans">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="1"
                min="1"
                value={customAmount}
                onChange={(e) => handleCustomChange(e.target.value)}
                className="w-36 text-3xl sm:text-4xl font-semibold font-sans tabular-nums text-white bg-transparent text-center focus:outline-none"
              />
            </div>

            {/* Quick buttons */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleSelectQuick(amt)}
                  className={`py-1.5 rounded-full text-xs font-semibold font-sans tabular-nums transition-all ${
                    selectedAmount === amt
                      ? 'bg-revolut-blue text-white shadow-inner-light'
                      : 'bg-white/[0.06] text-revolut-platinum hover:bg-white/[0.1]'
                  }`}
                >
                  +{amt} {currencySymbol}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-revolut-muted mb-2 block">
              Способ оплаты
            </label>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedMethod('card')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  selectedMethod === 'card'
                    ? 'bg-white/[0.09] border-revolut-blue/50 text-white'
                    : 'bg-white/[0.04] border-white/[0.06] text-revolut-platinum hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">Банковская карта</p>
                    <p className="text-[10px] text-revolut-muted font-mono">Mastercard •••• 4521</p>
                  </div>
                </div>
                {selectedMethod === 'card' && <Check className="w-4 h-4 text-revolut-blue" />}
              </button>

              <button
                onClick={() => setSelectedMethod('applepay')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  selectedMethod === 'applepay'
                    ? 'bg-white/[0.09] border-revolut-blue/50 text-white'
                    : 'bg-white/[0.04] border-white/[0.06] text-revolut-platinum hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                    <Apple className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">Apple Pay / Google Pay</p>
                    <p className="text-[10px] text-revolut-muted">Мгновенно без комиссии</p>
                  </div>
                </div>
                {selectedMethod === 'applepay' && <Check className="w-4 h-4 text-revolut-blue" />}
              </button>

              <button
                onClick={() => setSelectedMethod('sepa')}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                  selectedMethod === 'sepa'
                    ? 'bg-white/[0.09] border-revolut-blue/50 text-white'
                    : 'bg-white/[0.04] border-white/[0.06] text-revolut-platinum hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white">Банковский перевод SEPA</p>
                    <p className="text-[10px] text-revolut-muted font-mono">{account.accountNumber}</p>
                  </div>
                </div>
                {selectedMethod === 'sepa' && <Check className="w-4 h-4 text-revolut-blue" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !parseFloat(customAmount)}
            className="w-full h-12 rounded-full bg-revolut-blue hover:bg-revolut-blueHover text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 shadow-inner-light mt-3"
          >
            <span>{isSubmitting ? 'Обработка...' : `Пополнить на ${customAmount} ${currencySymbol}`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </ModalSheet>
  );
};

