import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import { Tag, Check, Copy, ExternalLink } from 'lucide-react';

export interface PerkItem {
  name: string;
  desc: string;
  color: string;
}

interface PerkModalProps {
  perk: PerkItem | null;
  isOpen: boolean;
  onClose: () => void;
  onActivateSuccess?: (msg: string) => void;
}

export const PerkModal: React.FC<PerkModalProps> = ({
  perk,
  isOpen,
  onClose,
  onActivateSuccess,
}) => {
  const [copied, setCopied] = useState(false);

  if (!perk) return null;

  const promoCode = 'REVOLUT-VIP-2026';

  const handleCopy = () => {
    navigator.clipboard?.writeText(promoCode);
    setCopied(true);
    onActivateSuccess?.('Промокод привилегии скопирован в буфер');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title={perk.name}>
      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
          <div className="w-12 h-12 rounded-full bg-white/[0.08] flex items-center justify-center text-white mx-auto mb-2 shadow-inner-light">
            <Tag className="w-6 h-6 text-pink-400" />
          </div>
          <h3 className="text-base font-semibold text-white">{perk.name}</h3>
          <p className="text-xs text-revolut-muted mt-1 leading-relaxed">{perk.desc}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-revolut-muted block uppercase">Промокод</span>
            <span className="text-sm font-mono tracking-widest font-bold text-white">{promoCode}</span>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-white flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-revolut-green" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>

        <button
          onClick={() => {
            onActivateSuccess?.(`Привилегия «${perk.name}» успешно активирована для аккаунта!`);
            onClose();
          }}
          className="w-full h-12 rounded-full bg-revolut-blue hover:bg-revolut-blueHover text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 active:scale-98 shadow-inner-light mt-2"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Активировать привилегию</span>
        </button>
      </div>
    </ModalSheet>
  );
};

