import React, { useState, useMemo } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { TransactionDTO } from '../../types/api';
import {
  TrendingDown,
  Laptop,
  ShoppingBag,
  Coffee,
  Coins,
  TrendingUp,
  ArrowRightLeft,
  Send,
  CreditCard,
  PieChart
} from 'lucide-react';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions?: TransactionDTO[];
  currency?: string;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  transactions = [],
  currency = 'EUR',
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'week'>('month');

  // Filter expenses (amount < 0) based on selected period
  const { totalSpent, categories, remainingBudget } = useMemo(() => {
    const now = Date.now();
    const periodMs = selectedPeriod === 'week' ? 7 * 86400000 : 30 * 86400000;

    const expenseTxs = transactions.filter((tx) => {
      if (tx.amount >= 0) return false;
      const txTime = new Date(tx.createdAt).getTime();
      return isNaN(txTime) || now - txTime <= periodMs;
    });

    const total = expenseTxs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    // Grouping by category
    const map: Record<string, { name: string; amount: number; icon: any; color: string }> = {};

    expenseTxs.forEach((tx) => {
      const cat = (tx.category || '').toUpperCase();
      const desc = (tx.merchantName || tx.description || '').toUpperCase();
      const amt = Math.abs(tx.amount);

      let key = 'OTHER';
      let name = 'Прочие расходы';
      let icon = CreditCard;
      let color = 'bg-gray-500';

      if (cat.includes('CRYPTO') || desc.includes('CRYPTO') || desc.includes('BTC') || desc.includes('ETH')) {
        key = 'CRYPTO';
        name = 'Криптовалюта';
        icon = Coins;
        color = 'bg-amber-500';
      } else if (cat.includes('INVEST') || desc.includes('АКЦИ') || desc.includes('AAPL') || desc.includes('NVDA')) {
        key = 'INVESTMENTS';
        name = 'Инвестиции и акции';
        icon = TrendingUp;
        color = 'bg-emerald-500';
      } else if (cat.includes('EXCHANGE') || desc.includes('ОБМЕН')) {
        key = 'EXCHANGE';
        name = 'Обмен валют';
        icon = ArrowRightLeft;
        color = 'bg-blue-500';
      } else if (cat.includes('TRANSFER') || desc.includes('ПЕРЕВОД')) {
        key = 'TRANSFER';
        name = 'Денежные переводы';
        icon = Send;
        color = 'bg-indigo-500';
      } else if (cat.includes('SUBSCRIPTION') || desc.includes('WEBFLOW') || desc.includes('SPOTIFY') || desc.includes('APPLE')) {
        key = 'SUBSCRIPTION';
        name = 'Подписки и сервисы';
        icon = Laptop;
        color = 'bg-purple-500';
      } else if (cat.includes('FOOD') || cat.includes('CAFE') || desc.includes('COFFEE') || desc.includes('STARBUCKS')) {
        key = 'FOOD';
        name = 'Кафе и рестораны';
        icon = Coffee;
        color = 'bg-orange-500';
      } else if (cat.includes('SHOPPING') || cat.includes('DESIGN') || desc.includes('UI8') || desc.includes('MARVILO')) {
        key = 'SHOPPING';
        name = 'Покупки и маркетплейсы';
        icon = ShoppingBag;
        color = 'bg-cyan-500';
      }

      if (!map[key]) {
        map[key] = { name, amount: 0, icon, color };
      }
      map[key].amount += amt;
    });

    const categoryList = Object.values(map)
      .map((item) => ({
        ...item,
        amountStr: item.amount.toFixed(2),
        pct: total > 0 ? Math.round((item.amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const monthlyBudget = 1000.0;
    const remaining = Math.max(0, monthlyBudget - total);

    return {
      totalSpent: total.toFixed(2),
      categories: categoryList,
      remainingBudget: remaining.toFixed(2),
    };
  }, [transactions, selectedPeriod]);

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Аналитика расходов">
      <div className="space-y-4">
        {/* Period toggle */}
        <div className="flex bg-white/[0.06] p-1 rounded-full border border-white/[0.08] max-w-[220px] mx-auto">
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`flex-1 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedPeriod === 'month' ? 'bg-revolut-blue text-white shadow-inner-light' : 'text-revolut-muted'
            }`}
          >
            Этот месяц
          </button>
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`flex-1 py-1 rounded-full text-xs font-semibold transition-all ${
              selectedPeriod === 'week' ? 'bg-revolut-blue text-white shadow-inner-light' : 'text-revolut-muted'
            }`}
          >
            Эта неделя
          </button>
        </div>

        {/* Spend Hero */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
          <span className="text-xs text-revolut-muted font-semibold">Всего израсходовано</span>
          <div className="flex items-baseline justify-center gap-1.5 my-1">
            <span className="text-3xl sm:text-4xl font-semibold text-white font-sans tabular-nums">
              {currency === 'RUB' ? '₽' : currency === 'USD' ? '$' : '€'} {totalSpent}
            </span>
            <span className="text-xs font-semibold text-revolut-green flex items-center">
              <TrendingDown className="w-3.5 h-3.5" /> Актуальные данные
            </span>
          </div>

          {/* Budget progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-revolut-muted mb-1 font-sans tabular-nums">
              <span>Лимит: € 1,000.00</span>
              <span>Осталось: € {remainingBudget}</span>
            </div>
            <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden flex">
              {categories.slice(0, 4).map((c) => (
                <div
                  key={c.name}
                  className={c.color}
                  style={{ width: `${Math.min(100, c.pct)}%` }}
                  title={`${c.name}: ${c.pct}%`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Categories breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-revolut-muted mb-2">Категории трат</h4>
          {categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((c) => {
                const Icon = c.icon;
                return (
                  <div
                    key={c.name}
                    className="p-3 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                        <Icon className="w-4 h-4 text-revolut-platinum" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{c.name}</p>
                        <p className="text-[10px] text-revolut-muted font-sans tabular-nums">{c.pct}% от расходов</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white font-sans tabular-nums">
                      € {c.amountStr}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-revolut-muted">
              <PieChart className="w-8 h-8 mx-auto mb-2 opacity-40 text-revolut-platinum" />
              <span>За выбранный период расходов ещё не было</span>
            </div>
          )}
        </div>
      </div>
    </ModalSheet>
  );
};
