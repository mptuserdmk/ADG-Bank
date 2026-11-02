import React from 'react';
import type { TransactionDTO } from '../../types/api';
import { getCurrencyParts } from '../../utils/currency';
import { ShoppingBag, ArrowDownLeft, ArrowUpRight, Coffee, Laptop, Gift } from 'lucide-react';
import { TransactionListSkeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { motion } from 'framer-motion';

interface TransactionsSectionProps {
  transactions: TransactionDTO[];
  isLoading?: boolean;
  onSelectTransaction: (tx: TransactionDTO) => void;
  onSeeAllClick: () => void;
  searchFilter?: string;
}

const getMerchantLogo = (merchant = '', category = ''): string | null => {
  const text = (merchant + ' ' + category).toLowerCase();
  if (text.includes('webflow')) return '/assets/merchants/webflow.png';
  if (text.includes('ui8')) return '/assets/merchants/ui8.png';
  if (text.includes('marvilo') || text.includes('uiscreens')) return '/assets/merchants/marvilo.png';
  if (text.includes('spotify')) return '/assets/merchants/spotify.svg';
  if (text.includes('apple')) return '/assets/merchants/apple.svg';
  if (text.includes('netflix')) return '/assets/merchants/netflix.svg';
  if (text.includes('starbucks')) return '/assets/merchants/starbucks.svg';
  if (text.includes('deliveroo')) return '/assets/merchants/deliveroo.svg';
  return null;
};

export const TransactionsSection: React.FC<TransactionsSectionProps> = ({
  transactions,
  isLoading = false,
  onSelectTransaction,
  onSeeAllClick,
  searchFilter = '',
}) => {
  const filtered = transactions.filter((tx) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      tx.merchantName?.toLowerCase().includes(q) ||
      tx.description?.toLowerCase().includes(q) ||
      tx.category?.toLowerCase().includes(q)
    );
  });

  const getMerchantIcon = (category = '', merchant = '') => {
    const text = (category + ' ' + merchant).toLowerCase();
    if (text.includes('webflow') || text.includes('laptop') || text.includes('software')) return Laptop;
    if (text.includes('coffee') || text.includes('cafe')) return Coffee;
    if (text.includes('reward') || text.includes('bonus')) return Gift;
    if (text.includes('deposit') || text.includes('top-up')) return ArrowDownLeft;
    if (text.includes('transfer')) return ArrowUpRight;
    return ShoppingBag;
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    } catch {
      return 'Недавно';
    }
  };

  return (
    <section className="px-4 py-3">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">Transactions</h2>
        <button 
          onClick={onSeeAllClick}
          className="text-xs font-semibold text-revolut-blue hover:text-revolut-blueHover transition-colors"
        >
          See all
        </button>
      </div>

      {/* Content */}
      <div className="rounded-card bg-white/[0.04] border border-white/[0.06] overflow-hidden divide-y divide-white/[0.04]">
        {isLoading ? (
          <TransactionListSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Нет транзакций"
            description="Совершите первый перевод или пополните баланс счёта"
            actionLabel="Пополнить счёт"
            onAction={onSeeAllClick}
          />
        ) : (
          filtered.slice(0, 5).map((tx) => {
            const isPositive = tx.amount > 0;
            const logoSrc = getMerchantLogo(tx.merchantName, tx.category);
            const Icon = getMerchantIcon(tx.category, tx.merchantName);
            const { value, currencySymbol } = getCurrencyParts(Math.abs(tx.amount), tx.currency);

            return (
              <motion.button
                key={tx.id}
                whileTap={{ scale: 0.99, backgroundColor: 'rgba(255,255,255,0.06)' }}
                onClick={() => onSelectTransaction(tx)}
                className="w-full flex items-center justify-between p-3.5 hover:bg-white/[0.04] transition-colors text-left group"
              >
                {/* Icon / Brand Logo & Details */}
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-10 h-10 rounded-full bg-[#1C1F22] border border-white/10 overflow-hidden flex items-center justify-center text-white flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner-light">
                    {logoSrc ? (
                      <img
                        src={logoSrc}
                        alt={tx.merchantName || 'Merchant'}
                        className={`w-full h-full ${logoSrc.includes('marvilo') ? 'object-cover' : 'object-contain p-2'}`}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Icon className="w-4 h-4 text-revolut-platinum" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate">
                      {tx.merchantName || 'Перевод'}
                    </p>
                    <p className="text-[11px] text-revolut-muted truncate mt-0.5">
                      {formatDate(tx.createdAt)} • {tx.category || 'Платеж'} • <span className="text-revolut-green">{tx.status}</span>
                    </p>
                  </div>
                </div>

                {/* Amount with tabular proportional numbers */}
                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-xs sm:text-sm font-semibold font-sans tabular-nums ${
                      isPositive ? 'text-revolut-green' : 'text-white'
                    }`}
                  >
                    {isPositive ? '+' : '-'}{value} {currencySymbol}
                  </span>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </section>
  );
};
