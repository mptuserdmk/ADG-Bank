import React from 'react';
import { Hotel, Plane, Tag } from 'lucide-react';
import type { PerkItem } from '../modals/PerkModal';
import { motion } from 'framer-motion';

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

      {/* Hero 3D Stays Banner */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onSelectPerk(perks[0])}
        className="relative p-4 rounded-card bg-gradient-to-r from-purple-900/40 via-blue-900/30 to-transparent border border-white/[0.08] shadow-glass cursor-pointer overflow-hidden group"
      >
        <img
          src="/assets/3d/gift-box-3d.png"
          alt="Lifestyle Perks"
          className="absolute -right-3 -bottom-2 w-28 h-28 object-contain drop-shadow-[0_10px_25px_rgba(147,51,234,0.3)] pointer-events-none"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        <div className="relative z-10 max-w-[220px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Stays & Travel</span>
          <h2 className="text-base font-bold text-white mt-1">Отели со скидкой до 10%</h2>
          <p className="text-xs text-revolut-muted mt-1 leading-relaxed">
            Мгновенный кэшбэк на счёт при бронировании через ADG-Bank.
          </p>
        </div>
      </motion.div>

      {/* Perks List */}
      <div className="space-y-3">
        {perks.map((p) => {
          const Icon = getPerkIcon(p.name);
          return (
            <motion.button
              key={p.name}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPerk(p)}
              className="w-full p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] transition-all flex items-start gap-3.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-white/[0.08] flex items-center justify-center flex-shrink-0 shadow-inner-light group-hover:scale-105 transition-transform">
                <Icon className={`w-5 h-5 ${p.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                <p className="text-xs text-revolut-muted mt-1 leading-relaxed">{p.desc}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
