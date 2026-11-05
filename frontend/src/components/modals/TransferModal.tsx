import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { AccountDTO, PayeeDTO, CreateTransactionRequestDTO } from '../../types/api';
import { mockPayees } from '../../api/client';
import { getCurrencyParts, getExchangeRate } from '../../utils/currency';
import { Check, Send, AlertCircle, Users, ArrowRightLeft } from 'lucide-react';

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
  const [transferMode, setTransferMode] = useState<'SELF' | 'PAYEE'>(
    preselectedPayee || accounts.length <= 1 ? 'PAYEE' : 'SELF'
  );
  const [sourceAccountId, setSourceAccountId] = useState<number>(currentAccountId || accounts[0]?.id || 1);
  const sourceAccount = accounts.find((a) => a.id === sourceAccountId) || accounts[0];

  // For SELF mode: default target to different account if available
  const otherAccounts = accounts.filter((a) => a.id !== sourceAccountId);
  const [targetAccountId, setTargetAccountId] = useState<number>(otherAccounts[0]?.id || sourceAccountId);

  // For PAYEE mode
  const [selectedPayee, setSelectedPayee] = useState<PayeeDTO>(preselectedPayee || mockPayees[0]);
  const [amountStr, setAmountStr] = useState<string>('25');
  const [description, setDescription] = useState<string>('Перевод другу');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const targetSelfAccount = accounts.find((a) => a.id === targetAccountId);
  const isSelf = transferMode === 'SELF';

  const handleTransfer = async () => {
    const val = parseFloat(amountStr);
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Введите корректную сумму');
      return;
    }
    if (sourceAccount && val > sourceAccount.balance) {
      setErrorMsg('Недостаточно средств на счете');
      return;
    }

    if (isSelf && otherAccounts.length === 0) {
      setErrorMsg('У вас пока один счет. Откройте второй счет или выберите перевод контакту.');
      return;
    }

    if (isSelf && sourceAccountId === targetAccountId) {
      setErrorMsg('Выберите другой целевой счет');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const destId = isSelf ? targetAccountId : selectedPayee.accountId;
      const desc = isSelf
        ? `Перевод между счетами (${sourceAccount?.currency} ➔ ${targetSelfAccount?.currency})`
        : (description || `Перевод для ${selectedPayee.name}`);

      await onExecuteTransfer({
        sourceAccountId,
        targetAccountId: destId,
        amount: val,
        description: desc,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка выполнения перевода');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currencySymbol = getCurrencyParts(0, sourceAccount?.currency || 'EUR').currencySymbol;

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Перевод средств">
      {isSuccess ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-revolut-green/20 text-revolut-green flex items-center justify-center mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-white mb-1">Перевод успешно отправлен</h4>
          <p className="text-xs text-revolut-muted font-sans tabular-nums">
            {amountStr} {currencySymbol} переведено {isSelf ? `на счёт ${targetSelfAccount?.accountNumber}` : `для ${selectedPayee.name}`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Transfer Mode Switcher */}
          <div className="flex bg-white/[0.06] p-1 rounded-full border border-white/[0.08]">
            <button
              type="button"
              onClick={() => setTransferMode('SELF')}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                isSelf ? 'bg-revolut-blue text-white shadow-inner-light' : 'text-revolut-muted hover:text-white'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Между своими счетами</span>
            </button>
            <button
              type="button"
              onClick={() => setTransferMode('PAYEE')}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                !isSelf ? 'bg-revolut-blue text-white shadow-inner-light' : 'text-revolut-muted hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Контакту / Другу</span>
            </button>
          </div>

          {/* Source Account Selection */}
          <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-semibold text-revolut-muted">Счёт списания</span>
              <span className="text-[11px] text-revolut-muted font-sans tabular-nums">
                Баланс: {sourceAccount?.balance.toFixed(2)} {sourceAccount?.currency}
              </span>
            </div>
            <select
              value={sourceAccountId}
              onChange={(e) => {
                const id = Number(e.target.value);
                setSourceAccountId(id);
                const nextOthers = accounts.filter((a) => a.id !== id);
                if (nextOthers.length > 0) setTargetAccountId(nextOthers[0].id);
              }}
              className="w-full bg-white/[0.06] text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-white/[0.1] focus:outline-none"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id} className="bg-revolut-cardSolid text-white">
                  {a.currency} Account ({a.accountNumber}) — {a.balance.toFixed(2)} {a.currency}
                </option>
              ))}
            </select>
          </div>

          {isSelf ? (
            /* Target Self Account */
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <span className="text-[11px] font-semibold text-revolut-muted block mb-1.5">Счёт зачисления</span>
              {otherAccounts.length > 0 ? (
                <select
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(Number(e.target.value))}
                  className="w-full bg-white/[0.06] text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-white/[0.1] focus:outline-none"
                >
                  {otherAccounts.map((a) => (
                    <option key={a.id} value={a.id} className="bg-revolut-cardSolid text-white">
                      {a.currency} Account ({a.accountNumber}) — {a.balance.toFixed(2)} {a.currency}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-revolut-orange py-1">
                  У вас только 1 открытый счёт. Откройте второй счёт в меню счетов или переключитесь на перевод контакту.
                </p>
              )}
            </div>
          ) : (
            /* Payee Selection */
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
                      type="button"
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
          )}

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
              Доступно: {sourceAccount?.balance.toFixed(2)} {currencySymbol}
            </p>
            {isSelf && targetSelfAccount && sourceAccount.currency !== targetSelfAccount.currency && (
              <p className="text-xs text-revolut-green mt-1 font-sans tabular-nums">
                ≈ {(parseFloat(amountStr || '0') * getExchangeRate(sourceAccount.currency, targetSelfAccount.currency)).toFixed(2)} {targetSelfAccount.currency} к зачислению
              </p>
            )}
          </div>

          {!isSelf && (
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
          )}

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
