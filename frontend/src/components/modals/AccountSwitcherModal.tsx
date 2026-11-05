import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { AccountDTO } from '../../types/api';
import { getCurrencyParts } from '../../utils/currency';
import { Check, Plus, Wallet, ArrowRight } from 'lucide-react';

interface AccountSwitcherModalProps {
  accounts: AccountDTO[];
  currentAccountId: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (accountId: number) => void;
  onAddNewAccount: (currency: string) => Promise<void> | void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  accounts,
  currentAccountId,
  isOpen,
  onClose,
  onSelectAccount,
  onAddNewAccount,
}) => {
  const [isOpeningForm, setIsOpeningForm] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableCurrencies = ['USD', 'EUR', 'RUB', 'BTC', 'GBP'];

  const handleCreateAccount = async () => {
    setIsSubmitting(true);
    try {
      await onAddNewAccount(selectedCurrency);
      setIsOpeningForm(false);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Счета и балансы">
      <div className="space-y-3">
        {accounts.map((acc) => {
          const isSelected = acc.id === currentAccountId;
          const { value, currencySymbol } = getCurrencyParts(acc.balance, acc.currency);

          return (
            <button
              key={acc.id}
              onClick={() => {
                onSelectAccount(acc.id);
                onClose();
              }}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all text-left ${
                isSelected
                  ? 'bg-white/[0.09] border-revolut-blue/50 shadow-inner-light'
                  : 'bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.07]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                  <Wallet className="w-4 h-4 text-revolut-platinum" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-white">
                    {acc.currency} Account
                  </p>
                  <p className="text-[11px] text-revolut-muted font-mono">
                    {acc.accountNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white font-sans tabular-nums">
                  {value} {currencySymbol}
                </span>
                {isSelected && (
                  <Check className="w-4 h-4 text-revolut-blue" />
                )}
              </div>
            </button>
          );
        })}

        {isOpeningForm ? (
          <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] space-y-3 mt-3 animate-fadeIn">
            <span className="text-xs font-semibold text-revolut-muted block">
              Выберите валюту нового счета
            </span>
            <div className="grid grid-cols-5 gap-1.5">
              {availableCurrencies.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCurrency(c)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedCurrency === c
                      ? 'bg-revolut-blue border-revolut-blue text-white shadow-inner-light'
                      : 'bg-white/[0.04] border-white/[0.08] text-revolut-muted hover:text-white'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsOpeningForm(false)}
                className="flex-1 h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-all"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleCreateAccount}
                disabled={isSubmitting}
                className="flex-1 h-10 rounded-xl bg-revolut-blue hover:bg-revolut-blueHover text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 shadow-inner-light"
              >
                <span>{isSubmitting ? 'Открытие...' : `Открыть ${selectedCurrency}`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsOpeningForm(true)}
            className="w-full h-11 rounded-full border border-dashed border-white/20 hover:border-white/40 flex items-center justify-center gap-2 text-xs font-semibold text-revolut-platinum hover:text-white transition-all mt-3"
          >
            <Plus className="w-4 h-4" />
            <span>Открыть новый счёт</span>
          </button>
        )}
      </div>
    </ModalSheet>
  );
};
