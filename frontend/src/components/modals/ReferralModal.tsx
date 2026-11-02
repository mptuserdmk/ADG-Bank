import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import { Gift, Copy, Check, Share2 } from 'lucide-react';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopySuccess?: (msg: string) => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose, onCopySuccess }) => {
  const [copied, setCopied] = useState(false);
  const code = 'ADG-REVOLUT-2026';

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    onCopySuccess?.('Реферальный код скопирован!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Приглашай друзей">
      <div className="space-y-4">
        {/* Hero Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-revolut-purple/40 to-revolut-blue/20 border border-white/[0.1] text-center shadow-glass relative overflow-hidden">
          <div className="w-14 h-14 rounded-full bg-white/[0.1] border border-white/[0.15] flex items-center justify-center text-white mx-auto mb-3 shadow-inner-light">
            <Gift className="w-7 h-7 text-purple-300" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">Получи €50 за друга</h3>
          <p className="text-xs text-revolut-platinum/90 mt-1 max-w-[280px] mx-auto leading-relaxed">
            Приглашай друзей в ADG-Bank до 26 марта и получай денежный бонус за каждого активного пользователя.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              1
            </div>
            <p className="text-xs text-white">Отправь персональную ссылку или код другу</p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              2
            </div>
            <p className="text-xs text-white">Друг заказывает карту и совершает от 3 покупок</p>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div className="w-7 h-7 rounded-full bg-white/[0.08] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              3
            </div>
            <p className="text-xs text-white font-semibold text-revolut-green">
              €50 автоматически зачисляются на твой счет
            </p>
          </div>
        </div>

        {/* Code Box */}
        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-revolut-muted block uppercase tracking-wider font-semibold">
              Твой код
            </span>
            <span className="text-sm font-mono tracking-widest font-bold text-white">{code}</span>
          </div>
          <button
            onClick={handleCopy}
            className="px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-revolut-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>

        <button
          onClick={handleCopy}
          className="w-full h-11 rounded-full bg-revolut-blue hover:bg-revolut-blueHover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-inner-light transition-all active:scale-98"
        >
          <Share2 className="w-4 h-4" />
          <span>Поделиться ссылкой с контактами</span>
        </button>
      </div>
    </ModalSheet>
  );
};
