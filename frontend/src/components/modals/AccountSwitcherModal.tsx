import React from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { AccountDTO } from '../../types/api';
import { getCurrencyParts } from '../../utils/currency';
import { Check, Plus, Wallet } from 'lucide-react';

interface AccountSwitcherModalProps {
  accounts: AccountDTO[];
  currentAccountId: number;
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (accountId: number) => void;
  onAddNewAccount: () => void;
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  accounts,
  currentAccountId,
  isOpen,
  onClose,
  onSelectAccount,
  onAddNewAccount,
}) => {
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

        <button
          onClick={() => {
            onAddNewAccount();
            onClose();
          }}
          className="w-full h-11 rounded-full border border-dashed border-white/20 hover:border-white/40 flex items-center justify-center gap-2 text-xs font-semibold text-revolut-platinum hover:text-white transition-all mt-3"
        >
          <Plus className="w-4 h-4" />
          <span>Открыть новый счёт</span>
        </button>
      </div>
    </ModalSheet>
  );
};
