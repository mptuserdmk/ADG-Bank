import React from 'react';
import { Hotel, Plane, Tag } from 'lucide-react';
import type { PerkItem } from '../modals/PerkModal';

interface LifestyleScreenProps {
  onSelectPerk: (perk: PerkItem) => void;
}

export const LifestyleScreen: React.FC<LifestyleScreenProps> = ({ onSelectPerk }) => {
  const perks: PerkItem[] = [
    { name: 'Stays Cashback', desc: 'До 10% кэшбэка на отели по всему миру', color: 'text-purple-400' },
    { name: 'Lounges & SmartDelay', desc: 'Бесплатный доступ в бизнес-залы при задержке рейса', color: 'text-blue-400' },
    { name: 'Revolut Perks', desc: 'Скидки у партнеров: Apple, Nike, Booking.com', color: 'text-pink-400' },
  ];

  const getPerkIcon = (name: string) => {
    if (name.includes('Stays')) return Hotel;
    if (name.includes('Lounge')) return Plane;
    return Tag;
  };

  return (
    <div className="px-4 py-3 space-y-4 animate-fadeIn">
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Lifestyle</h1>
        <p className="text-xs text-revolut-muted">Путешествия, бронирование и премиальные привилегии</p>
      </div>

      <div className="space-y-3">
        {perks.map((p) => {
          const Icon = getPerkIcon(p.name);
          return (
            <button
              key={p.name}
              onClick={() => onSelectPerk(p)}
              className="w-full p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all flex items-start gap-3.5 text-left active:scale-98 group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.08] flex items-center justify-center flex-shrink-0 shadow-inner-light group-hover:scale-105 transition-transform">
                <Icon className={`w-5 h-5 ${p.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                <p className="text-xs text-revolut-muted mt-1 leading-relaxed">{p.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
