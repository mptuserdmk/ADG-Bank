import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { CardDTO } from '../../types/api';
import { CreditCard, Check, Sparkles } from 'lucide-react';

interface OrderCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (newCard: CardDTO) => void;
}

export const OrderCardModal: React.FC<OrderCardModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const [cardType, setCardType] = useState<'PHYSICAL' | 'VIRTUAL' | 'DISPOSABLE'>('VIRTUAL');
  const [selectedGradient, setSelectedGradient] = useState<string>('linear-gradient(135deg, #4f56f1 0%, #984cff 100%)');

  const gradients = [
    { name: 'Cyber Violet', val: 'linear-gradient(135deg, #4f56f1 0%, #984cff 100%)' },
    { name: 'Neon Pink', val: 'linear-gradient(135deg, #ff7eb3 0%, #ff758c 100%)' },
    { name: 'Space Dark', val: 'linear-gradient(135deg, #1f2429 0%, #0d0f12 100%)' },
    { name: 'Emerald Wave', val: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' },
  ];

  const handleOrder = () => {
    const randomLast4 = Math.floor(1000 + Math.random() * 9000).toString();
    const newCard: CardDTO = {
      id: `card-${Date.now()}`,
      accountId: 1,
      userId: 1,
      cardNumber: `•••• •••• •••• ${randomLast4}`,
      cardHolder: 'DYLAN E.',
      expiryDate: '11/29',
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      type: cardType,
      isFrozen: false,
      spendingLimit: cardType === 'PHYSICAL' ? 2000 : 800,
      spentThisMonth: 0,
      colorGradient: selectedGradient,
    };

    onOrderSuccess(newCard);
    onClose();
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Выпуск новой карты">
      <div className="space-y-4">
        {/* Live Card Preview */}
        <div
          className="w-full h-40 rounded-2xl p-4 flex flex-col justify-between shadow-glass text-white relative transition-all"
          style={{ background: selectedGradient }}
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">
              ADG • {cardType}
            </span>
            <CreditCard className="w-5 h-5 opacity-90" />
          </div>
          <div className="text-base font-mono tracking-widest text-white/95 font-semibold">
            •••• •••• •••• 5592
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold">DYLAN E.</span>
            <span className="font-mono">11/29</span>
          </div>
        </div>

        {/* Card Type Selector */}
        <div>
          <label className="text-xs font-semibold text-revolut-muted block mb-1.5">Тип карты</label>
          <div className="grid grid-cols-3 gap-2">
            {(['VIRTUAL', 'DISPOSABLE', 'PHYSICAL'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setCardType(t)}
                className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                  cardType === t
                    ? 'bg-revolut-blue border-revolut-blue text-white shadow-inner-light'
                    : 'bg-white/[0.04] border-white/[0.08] text-revolut-muted hover:bg-white/[0.08]'
                }`}
              >
                {t === 'VIRTUAL' ? 'Virtual' : t === 'DISPOSABLE' ? 'Disposable' : 'Physical'}
              </button>
            ))}
          </div>
        </div>

        {/* Color Gradient Selector */}
        <div>
          <label className="text-xs font-semibold text-revolut-muted block mb-1.5">Цветовой стиль</label>
          <div className="flex gap-2.5">
            {gradients.map((g) => (
              <button
                key={g.name}
                onClick={() => setSelectedGradient(g.val)}
                className={`w-9 h-9 rounded-full transition-all flex items-center justify-center ${
                  selectedGradient === g.val ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                }`}
                style={{ background: g.val }}
              >
                {selectedGradient === g.val && <Check className="w-4 h-4 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleOrder}
          className="w-full h-12 rounded-full bg-revolut-blue hover:bg-revolut-blueHover text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 shadow-inner-light mt-3"
        >
          <Sparkles className="w-4 h-4" />
          <span>Выпустить карту бесплатно</span>
        </button>
      </div>
    </ModalSheet>
  );
};

