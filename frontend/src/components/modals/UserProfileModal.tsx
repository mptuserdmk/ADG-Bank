import React, { useState } from 'react';
import { ModalSheet } from '../ui/ModalSheet';
import { 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  Crown, 
  KeyRound, 
  Lock, 
  LogOut, 
  CheckCircle2, 
  ChevronRight, 
  Copy, 
  Check,
  FileCheck
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenExchange?: () => void;
  onLogout?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onLogout,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isFaceIdEnabled, setIsFaceIdEnabled] = useState(true);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <ModalSheet isOpen={isOpen} onClose={onClose} title="Профиль и настройки">
      <div className="space-y-4 pb-4">
        {/* Profile Header Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.1] flex items-center gap-3.5">
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0666EB] to-[#984CFF] flex items-center justify-center text-white text-lg font-bold shadow-lg">
              DE
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-revolut-green border-2 border-[#191C1F] flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight truncate">
                Denis Evgenievich
              </h3>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-semibold text-amber-300">
                <Crown className="w-3 h-3" /> Metal
              </span>
            </div>
            <p className="text-xs text-revolut-muted mt-0.5">Клиент ID: ADG-849201</p>
            <div className="flex items-center gap-1 text-[11px] text-revolut-green mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>KYC Верификация пройдена</span>
            </div>
          </div>
        </div>

        {/* Section: Personal Info */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-revolut-muted px-1 uppercase tracking-wider">
            Личные данные
          </h4>
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-revolut-platinum">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-revolut-muted">Email</div>
                  <div className="text-xs font-medium text-white">denis.evgenievich@adgbank.com</div>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard('denis.evgenievich@adgbank.com', 'email')}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] text-revolut-muted hover:text-white transition-colors"
              >
                {copiedKey === 'email' ? <Check className="w-4 h-4 text-revolut-green" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-revolut-platinum">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-revolut-muted">Телефон</div>
                  <div className="text-xs font-medium text-white">+7 (999) 123-45-67</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                Подтверждён
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-revolut-platinum">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-revolut-muted">Документ</div>
                  <div className="text-xs font-medium text-white">Паспорт гражданина РФ •••• 8291</div>
                </div>
              </div>
              <span className="text-[10px] text-revolut-muted font-medium">Бессрочно</span>
            </div>
          </div>
        </div>

        {/* Section: Plan & Limits */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-revolut-muted px-1 uppercase tracking-wider">
            Тарифный план
          </h4>
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-blue-900/20 to-transparent border border-purple-500/30 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">ADG Metal Plan</span>
              </div>
              <p className="text-xs text-revolut-muted">
                Кэшбэк до 5% • Безлимитный бесплатный обмен валют • Выделенная поддержка
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full border border-amber-400/20">
              Активен
            </span>
          </div>
        </div>

        {/* Section: Security */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-revolut-muted px-1 uppercase tracking-wider">
            Безопасность и авторизация
          </h4>
          <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] divide-y divide-white/[0.06] overflow-hidden">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-revolut-platinum">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-white">Face ID / Touch ID</div>
                  <div className="text-[11px] text-revolut-muted">Быстрый вход и подтверждение операций</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFaceIdEnabled(!isFaceIdEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  isFaceIdEnabled ? 'bg-revolut-blue' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isFaceIdEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-revolut-platinum">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-white">Смена пароля и PIN-кода</div>
                  <div className="text-[11px] text-revolut-muted">Последнее изменение 14 дней назад</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-revolut-muted" />
            </div>
          </div>
        </div>

        {/* Section: Logout */}
        <div className="pt-2">
          <button
            onClick={() => {
              onClose();
              onLogout?.();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold text-xs transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Выйти из аккаунта</span>
          </button>
        </div>
      </div>
    </ModalSheet>
  );
};
