import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { CardDTO } from '../../types/api';
import { Check } from 'lucide-react';

interface CardLimitsModalProps {
  card: CardDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveLimits: (cardId: string, newLimit: number) => void;
}

export const CardLimitsModal: React.FC<CardLimitsModalProps> = ({
  card,
  isOpen,
  onClose,
  onSaveLimits,
}) => {
  const [limit, setLimit] = useState<number>(card?.spendingLimit || 2000);
  const [onlinePay, setOnlinePay] = useState(true);
  const [atm, setAtm] = useState(true);
  const [contactless, setContactless] = useState(true);

  if (!card) return null;

  const handleSave = () => {
    onSaveLimits(card.id, limit);
    onClose();
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Лимиты и безопасность">
      <div className="space-y-4">
        {/* Spending limit slider */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-revolut-muted">Месячный лимит расходов</span>
            <span className="text-sm font-semibold text-white font-sans tabular-nums">€ {limit}</span>
          </div>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-revolut-blue mt-3"
          />
          <div className="flex justify-between text-[10px] text-revolut-muted mt-2 font-sans tabular-nums">
            <span>€100</span>
            <span>€5,000</span>
            <span>€10,000</span>
          </div>
        </div>

        {/* Security toggles */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div>
              <p className="text-xs font-semibold text-white">Интернет-платежи</p>
              <p className="text-[10px] text-revolut-muted">Оплата в интернет-магазинах</p>
            </div>
            <button
              onClick={() => setOnlinePay(!onlinePay)}
              className={`w-11 h-6 rounded-full transition-all relative ${
                onlinePay ? 'bg-revolut-blue' : 'bg-white/20'
              }`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                onlinePay ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div>
              <p className="text-xs font-semibold text-white">Бесконтактная оплата</p>
              <p className="text-[10px] text-revolut-muted">Apple Pay, Google Pay и терминалы</p>
            </div>
            <button
              onClick={() => setContactless(!contactless)}
              className={`w-11 h-6 rounded-full transition-all relative ${
                contactless ? 'bg-revolut-blue' : 'bg-white/20'
              }`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                contactless ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div>
              <p className="text-xs font-semibold text-white">Снятие в банкоматах</p>
              <p className="text-[10px] text-revolut-muted">Выдача наличных без комиссии</p>
            </div>
            <button
              onClick={() => setAtm(!atm)}
              className={`w-11 h-6 rounded-full transition-all relative ${
                atm ? 'bg-revolut-blue' : 'bg-white/20'
              }`}
            >
              <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${
                atm ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full h-12 rounded-full bg-revolut-blue hover:bg-revolut-blueHover text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 shadow-inner-light mt-2"
        >
          <Check className="w-4 h-4" />
          <span>Сохранить настройки</span>
        </button>
      </div>
    </ModalSheet>
  );
};
