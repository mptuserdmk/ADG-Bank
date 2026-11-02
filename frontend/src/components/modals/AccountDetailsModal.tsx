import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import type { AccountDTO } from '../../types/api';
import { Copy, Check, ShieldCheck, Landmark } from 'lucide-react';

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountDTO;
  onCopySuccess?: (text: string) => void;
}

export const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  isOpen,
  onClose,
  account,
  onCopySuccess,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const iban = `EE89 ADGB 0001 ${account.id.toString().padStart(4, '0')} 4920`;
  const swift = 'ADGBEE2X';

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text.replace(/\s+/g, ''));
    setCopiedKey(key);
    onCopySuccess?.(`Скопировано: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Реквизиты счёта">
      <div className="space-y-4">
        {/* Bank Header Card */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-white/[0.08] flex items-center justify-center text-white shadow-inner-light">
            <Landmark className="w-5 h-5 text-revolut-blue" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">ADG-Bank Europe S.A.</h4>
            <p className="text-xs text-revolut-muted flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-revolut-green" />
              <span>Лицензия ЕЦБ • Защита вкладов до €100,000</span>
            </p>
          </div>
        </div>

        {/* Requisites Details List */}
        <div className="space-y-2.5">
          {/* IBAN */}
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-revolut-muted block">Международный номер (IBAN)</span>
              <span className="text-sm font-mono tracking-wider font-semibold text-white">
                {iban}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(iban, 'iban')}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-revolut-platinum"
            >
              {copiedKey === 'iban' ? <Check className="w-4 h-4 text-revolut-green" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* BIC / SWIFT */}
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-revolut-muted block">SWIFT / BIC код</span>
              <span className="text-sm font-mono tracking-wider font-semibold text-white">
                {swift}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(swift, 'swift')}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-revolut-platinum"
            >
              {copiedKey === 'swift' ? <Check className="w-4 h-4 text-revolut-green" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Account Number */}
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-revolut-muted block">Внутренний номер счета</span>
              <span className="text-sm font-mono tracking-wider font-semibold text-white">
                {account.accountNumber}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(account.accountNumber, 'acc')}
              className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center text-revolut-platinum"
            >
              {copiedKey === 'acc' ? <Check className="w-4 h-4 text-revolut-green" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Currency and Beneficiary */}
          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-revolut-muted block">Получатель платежа</span>
              <span className="text-sm font-semibold text-white">DYLAN E.</span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-revolut-blue/20 text-revolut-blue">
              {account.currency}
            </span>
          </div>
        </div>
      </div>
    </ModalSheet>
  );
};

