import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { CardDTO } from '../../types/api';
import { Lock, Unlock, Eye, EyeOff, ShieldCheck, CreditCard } from 'lucide-react';

interface CardDetailsModalProps {
  card: CardDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFreeze: (cardId: string) => void;
}

export const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
  card,
  isOpen,
  onClose,
  onToggleFreeze,
}) => {
  const [showCvv, setShowCvv] = useState(false);

  if (!card) return null;

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Управление картой">
      <div className="space-y-5">
        {/* Visual Card Cardholder Widget */}
        <div 
          className="w-full h-44 rounded-2xl p-5 flex flex-col justify-between shadow-glass relative overflow-hidden text-white"
          style={{ background: card.colorGradient || 'linear-gradient(135deg, #1f2429 0%, #0d0f12 100%)' }}
        >
          {/* Card Top Row */}
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold tracking-wider uppercase opacity-80">
              ADG • {card.type}
            </span>
            <CreditCard className="w-6 h-6 opacity-80" />
          </div>

          {/* Card Number - Strictly font-mono */}
          <div className="text-lg sm:text-xl font-mono tracking-widest text-white/95 font-semibold">
            {card.cardNumber}
          </div>

          {/* Card Bottom Row */}
          <div className="flex justify-between items-end text-xs">
            <div>
              <span className="text-[10px] opacity-70 block">Держатель</span>
              <span className="font-semibold tracking-wide">{card.cardHolder}</span>
            </div>
            <div>
              <span className="text-[10px] opacity-70 block">Срок</span>
              {/* font-mono for expiration date */}
              <span className="font-mono font-medium">{card.expiryDate}</span>
            </div>
          </div>
        </div>

        {/* Card Security Controls */}
        <div className="space-y-3">
          {/* Freeze Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                card.isFrozen ? 'bg-red-500/20 text-red-400' : 'bg-white/[0.08] text-white'
              }`}>
                {card.isFrozen ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  {card.isFrozen ? 'Карта заблокирована' : 'Заморозка карты'}
                </p>
                <p className="text-[11px] text-revolut-muted">
                  {card.isFrozen ? 'Платежи временно приостановлены' : 'Мгновенная блокировка в один клик'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onToggleFreeze(card.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                card.isFrozen
                  ? 'bg-revolut-blue text-white hover:bg-revolut-blueHover'
                  : 'bg-white/[0.08] text-white hover:bg-white/[0.14]'
              }`}
            >
              {card.isFrozen ? 'Разблокировать' : 'Заморозить'}
            </button>
          </div>

          {/* CVV display */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center text-white">
                <ShieldCheck className="w-4 h-4 text-revolut-green" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">Код безопасности CVV</p>
                <p className="text-[11px] text-revolut-muted">Для безопасных покупок в сети</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-semibold text-white">
                {showCvv ? card.cvv || '842' : '•••'}
              </span>
              <button
                onClick={() => setShowCvv(!showCvv)}
                className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-revolut-muted hover:text-white"
              >
                {showCvv ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalSheet>
  );
};
