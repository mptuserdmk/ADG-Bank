import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import { QrCode, Copy, Check, Camera, Share2 } from 'lucide-react';

interface QRReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopySuccess?: (msg: string) => void;
}

export const QRReceiveModal: React.FC<QRReceiveModalProps> = ({ isOpen, onClose, onCopySuccess }) => {
  const [activeTab, setActiveTab] = useState<'qr' | 'scan'>('qr');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard?.writeText('https://adg-bank.revolut.me/@dylan');
    setCopied(true);
    onCopySuccess?.('Персональная ссылка на перевод скопирована');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="QR и переводы">
      <div className="space-y-4">
        {/* Tab Toggle */}
        <div className="flex bg-white/[0.06] p-1 rounded-full border border-white/[0.08] max-w-[220px] mx-auto">
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'qr' ? 'bg-revolut-blue text-white shadow-inner-light' : 'text-revolut-muted'
            }`}
          >
            Мой QR-код
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-1 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'scan' ? 'bg-revolut-blue text-white shadow-inner-light' : 'text-revolut-muted'
            }`}
          >
            Сканировать
          </button>
        </div>

        {activeTab === 'qr' ? (
          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
            {/* Simulated Vector QR Pattern */}
            <div className="w-48 h-48 rounded-2xl bg-white p-3 flex items-center justify-center shadow-lg relative">
              <div className="w-full h-full border-4 border-dashed border-black/80 rounded-xl flex items-center justify-center">
                <QrCode className="w-32 h-32 text-black" />
              </div>
            </div>

            <h4 className="text-base font-semibold text-white mt-4 font-mono">@dylan.adgbank</h4>
            <p className="text-xs text-revolut-muted mt-0.5">Покажите код для мгновенного получения средств</p>

            <div className="flex gap-2 w-full mt-5">
              <button
                onClick={handleCopyLink}
                className="flex-1 h-10 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-revolut-green" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Скопировано' : 'Копировать'}</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="flex-1 h-10 rounded-full bg-revolut-blue hover:bg-revolut-blueHover text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-inner-light"
              >
                <Share2 className="w-4 h-4" />
                <span>Поделиться</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-center">
            <div className="w-48 h-48 rounded-2xl border-2 border-dashed border-revolut-blue/80 flex flex-col items-center justify-center relative overflow-hidden bg-black/40">
              <Camera className="w-8 h-8 text-revolut-blue mb-2 animate-pulse" />
              <span className="text-[11px] text-revolut-muted">Наведите камеру на QR-код</span>
              {/* Laser scan line animation */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-revolut-blue shadow-[0_0_8px_#0666EB] animate-bounce" />
            </div>
          </div>
        )}
      </div>
    </ModalSheet>
  );
};

