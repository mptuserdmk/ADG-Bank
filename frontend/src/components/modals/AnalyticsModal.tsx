import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import { TrendingDown, Laptop, ShoppingBag, Coffee } from 'lucide-react';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'week'>('month');

  const categories = [
    { name: 'Подписки и сервисы', amount: '124.00', pct: 60, icon: Laptop, color: 'bg-purple-500' },
    { name: 'Покупки и маркетплейсы', amount: '54.38', pct: 25, icon: ShoppingBag, color: 'bg-blue-500' },
    { name: 'Кафе и рестораны', amount: '32.10', pct: 15, icon: Coffee, color: 'bg-orange-500' },
  ];

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
              € {selectedPeriod === 'month' ? '210.48' : '45.19'}
            </span>
            <span className="text-xs font-semibold text-revolut-green flex items-center">
              <TrendingDown className="w-3.5 h-3.5" /> -8.5% к прошлому периоду
            </span>
          </div>

          {/* Budget progress bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-revolut-muted mb-1 font-sans tabular-nums">
              <span>Лимит: € 500.00</span>
              <span>Осталось: € 289.52</span>
            </div>
            <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden flex">
              <div className="bg-revolut-orange h-full" style={{ width: '42%' }} />
              <div className="bg-revolut-blue h-full" style={{ width: '18%' }} />
            </div>
          </div>
        </div>

        {/* Categories breakdown */}
        <div>
          <h4 className="text-xs font-semibold text-revolut-muted mb-2">Категории трат</h4>
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
                    € {c.amount}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ModalSheet>
  );
};
