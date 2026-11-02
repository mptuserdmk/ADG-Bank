import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { AccountDTO, PayeeDTO, CreateTransactionRequestDTO } from '../../types/api';
import { mockPayees } from '../../api/client';
import { getCurrencyParts } from '../../utils/currency';
import { Check, Send, AlertCircle } from 'lucide-react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountDTO[];
  currentAccountId: number;
  onExecuteTransfer: (req: CreateTransactionRequestDTO) => Promise<void>;
  preselectedPayee?: PayeeDTO | null;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  accounts,
  currentAccountId,
  onExecuteTransfer,
  preselectedPayee,
}) => {
  const currentAccount = accounts.find((a) => a.id === currentAccountId) || accounts[0];
  const [selectedPayee, setSelectedPayee] = useState<PayeeDTO>(preselectedPayee || mockPayees[0]);
  const [amountStr, setAmountStr] = useState<string>('25');
  const [description, setDescription] = useState<string>('Перевод другу');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleTransfer = async () => {
    const val = parseFloat(amountStr);
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Введите корректную сумму');
      return;
    }
    if (currentAccount && val > currentAccount.balance) {
      setErrorMsg('Недостаточно средств на счете');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await onExecuteTransfer({
        sourceAccountId: currentAccount.id,
        targetAccountId: selectedPayee.accountId,
        amount: val,
        description: description || `Перевод для ${selectedPayee.name}`,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка выполнения перевода');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currencySymbol = getCurrencyParts(0, currentAccount?.currency || 'EUR').currencySymbol;

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Перевод средств">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-revolut-green/20 text-revolut-green flex items-center justify-center mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white mb-1">Перевод успешно отправлен</h4>
          <p className="text-xs text-revolut-muted">
            {amountStr} {currencySymbol} переведено для {selectedPayee.name}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Payee Selection */}
          <div>
            <label className="text-xs font-semibold text-revolut-muted mb-2 block">
              Получатель
            </label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {mockPayees.map((p) => {
                const isSelected = selectedPayee.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPayee(p)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all text-xs font-semibold flex-shrink-0 ${
                      isSelected
                        ? 'bg-revolut-blue text-white border-revolut-blue'
                        : 'bg-white/[0.06] text-revolut-platinum border-white/[0.08] hover:bg-white/[0.1]'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">
                      {p.initials}
                    </span>
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount input with large display */}
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
            <span className="text-xs text-revolut-muted block mb-1">Сумма перевода</span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-3xl sm:text-4xl font-semibold text-revolut-platinum font-sans">
                {currencySymbol}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                className="w-40 text-3xl sm:text-4xl font-semibold font-sans tabular-nums text-white bg-transparent text-center focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-revolut-muted mt-2 font-sans tabular-nums">
              Доступно: {currentAccount?.balance.toFixed(2)} {currencySymbol}
            </p>
          </div>

          {/* Note / Description */}
          <div>
            <label className="text-xs font-semibold text-revolut-muted mb-1 block">
              Назначение платежа
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Например: Оплата счёта"
              className="w-full h-11 px-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-sm text-white placeholder-revolut-muted focus:outline-none focus:border-revolut-blue"
            />
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            onClick={handleTransfer}
            disabled={isSubmitting}
            className="w-full h-12 rounded-full bg-revolut-blue hover:bg-revolut-blueHover text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 shadow-inner-light mt-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Отправка...' : 'Отправить перевод'}</span>
          </button>
        </div>
      )}
    </ModalSheet>
  );
};
