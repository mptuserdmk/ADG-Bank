import React from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { TransactionDTO } from '../../types/api';
import { getCurrencyParts } from '../../utils/currency';
import { CheckCircle2, Share2, AlertTriangle } from 'lucide-react';

interface TransactionDetailsModalProps {
  transaction: TransactionDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  if (!transaction) return null;

  const isPositive = transaction.amount > 0;
  const { value, currencySymbol } = getCurrencyParts(Math.abs(transaction.amount), transaction.currency);

  const formattedDate = new Date(transaction.createdAt).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Квитанция платежа">
      <div className="space-y-5">
        {/* Top Receipt Amount Header */}
        <div className="flex flex-col items-center justify-center text-center pb-2 border-b border-white/[0.06]">
          <div className="w-12 h-12 rounded-full bg-white/[0.08] border border-white/[0.08] flex items-center justify-center text-white mb-2 shadow-inner-light">
            <CheckCircle2 className="w-6 h-6 text-revolut-green" />
          </div>
          <span className="text-xs text-revolut-muted">{transaction.merchantName || 'Перевод'}</span>
          <div className="flex items-baseline gap-1 my-1">
            <span
              className={`text-3xl sm:text-4xl font-semibold font-sans tabular-nums ${
                isPositive ? 'text-revolut-green' : 'text-white'
              }`}
            >
              {isPositive ? '+' : '-'}{value}
            </span>
            <span className="text-xl font-normal text-revolut-platinum font-sans">
              {currencySymbol}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-revolut-green/15 text-revolut-green text-[11px] font-semibold mt-1">
            {transaction.status}
          </span>
        </div>

        {/* Detailed Breakdown List */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between items-center py-1">
            <span className="text-revolut-muted">Дата и время</span>
            <span className="text-white font-medium">{formattedDate}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-revolut-muted">Категория</span>
            <span className="text-white font-medium">{transaction.category || 'Финансовые услуги'}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-revolut-muted">Комиссия банка</span>
            <span className="text-revolut-green font-semibold">0,00 € (Бесплатно)</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-revolut-muted">ID транзакции</span>
            {/* Strictly font-mono for technical transaction ID */}
            <span className="text-revolut-platinum font-mono text-[11px]">
              {transaction.idempotencyKey || `TX-${transaction.id}`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => alert('Ссылка на чек скопирована!')}
            className="h-11 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 text-revolut-platinum" />
            <span>Поделиться</span>
          </button>
          <button
            onClick={() => alert('Запрос в поддержку отправлен')}
            className="h-11 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-revolut-orange" />
            <span>Поддержка</span>
          </button>
        </div>
      </div>
    </ModalSheet>
  );
};
