import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { TransactionDTO } from '../../types/api';
import { getCurrencyParts } from '../../utils/currency';
import { Download, Search } from 'lucide-react';

interface StatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: TransactionDTO[];
  onSelectTx: (tx: TransactionDTO) => void;
  onExportSuccess?: (msg: string) => void;
}

export const StatementModal: React.FC<StatementModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onSelectTx,
  onExportSuccess,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [search, setSearch] = useState('');

  const filtered = transactions.filter((tx) => {
    if (filterType === 'income' && tx.amount <= 0) return false;
    if (filterType === 'expense' && tx.amount >= 0) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        tx.merchantName?.toLowerCase().includes(q) ||
        tx.description?.toLowerCase().includes(q) ||
        tx.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleExportPdf = () => {
    // Generate text/csv statement blob
    const rows = [
      ['ID', 'Дата', 'Мерчант', 'Сумма', 'Валюта', 'Статус'],
      ...filtered.map((t) => [
        t.id.toString(),
        t.createdAt,
        t.merchantName || 'Перевод',
        t.amount.toString(),
        t.currency,
        t.status,
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ADG-Bank-Statement-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onExportSuccess?.('Официальная банковская выписка успешно выгружена');
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="История и выписка">
      <div className="space-y-3.5">
        {/* Search & Export Toolbar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-3.5 h-3.5 text-revolut-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по истории..."
              className="w-full h-9 pl-8 pr-3 rounded-full bg-white/[0.06] border border-white/[0.08] text-xs text-white placeholder-revolut-muted focus:outline-none focus:border-revolut-blue"
            />
          </div>
          <button
            onClick={handleExportPdf}
            className="px-3 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.08] text-xs font-semibold text-white flex items-center gap-1.5 transition-all flex-shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-revolut-platinum" />
            <span>Экспорт</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 pb-1">
          {(['all', 'income', 'expense'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                filterType === t
                  ? 'bg-revolut-blue text-white shadow-inner-light'
                  : 'bg-white/[0.04] text-revolut-muted hover:bg-white/[0.08]'
              }`}
            >
              {t === 'all' ? 'Все' : t === 'income' ? 'Пополнения' : 'Списания'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.06] divide-y divide-white/[0.04] max-h-[380px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-revolut-muted">Транзакций не найдено</div>
          ) : (
            filtered.map((tx) => {
              const isPositive = tx.amount > 0;
              const { value, currencySymbol } = getCurrencyParts(Math.abs(tx.amount), tx.currency);
              const dateStr = new Date(tx.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
              });

              return (
                <button
                  key={tx.id}
                  onClick={() => {
                    onClose();
                    onSelectTx(tx);
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-white/[0.04] transition-colors text-left"
                >
                  <div>
                    <p className="text-xs font-semibold text-white">{tx.merchantName || 'Перевод'}</p>
                    <p className="text-[10px] text-revolut-muted mt-0.5">
                      {dateStr} • {tx.category || 'Платеж'}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold font-sans tabular-nums ${
                      isPositive ? 'text-revolut-green' : 'text-white'
                    }`}
                  >
                    {isPositive ? '+' : '-'}{value} {currencySymbol}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </ModalSheet>
  );
};
