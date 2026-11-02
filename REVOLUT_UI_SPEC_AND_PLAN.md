# REVOLUT_UI_SPEC_AND_PLAN.md — План и спецификация воссоздания дизайна Revolut UI Kit для ИИ-агента

> **Источник дизайна**: `"C:\Users\User\Desktop\Revolut FREE UI Kit - By Marvilo (Community).fig"`  
> **Целевая система**: Frontend для микросервисного банка **ADG-Bank** (React 19, TypeScript, Tailwind CSS, Vite, TanStack Query v5, Lucide Icons).  
> **Назначение документа**: Пошаговое руководство с точными дизайн-токенами, размерами, цветовой палитрой, строгими TypeScript DTO, анатомией экранов и готовым кодом компонентов для 100% воспроизведения дизайна ИИ-агентом.

---

## 1. Сводка анализа Figma-файла (Kiwi Binary Analysis)

В результате бинарного парсинга контейнера `canvas.fig` и извлечения схем Kiwi выявлена следующая структура:
- **Разрешение базового мобильного вьюпорта**: `390px` – `425px` (высота экрана `844px` / полная высота скролла Home: `2401px`).
- **Единый Desktop Responsive Shell**:
  - На мобильных устройствах (<640px) — 100% ширины экрана с нативными safe-area отступами.
  - На десктопе (≥640px) — центрированный контейнер смартфона (`max-w-[420px] min-h-screen`) на глубокой темной подложке `#121417` с деликатной рамкой `border-x border-white/5` и тенью `shadow-2xl`.
- **Главные разделы и страницы**:
  - `Screens / Revolut Home EDITABLE FREEBEE`: Полностью редактируемый экран Home со всеми виджетами.
  - `Components`: Nav bar, Top nav - search, Action buttons, Banner MARKETING, Transactions, Widgets, Modal sheets.
  - Дополнительные экраны UI Kit: `Revolut Cards`, `Transaction details`, `Crypto`, `Investing`, `Stays / Lifestyle`.

---

## 2. Дизайн-система и токены (Design Tokens)

### 2.1. Цветовая палитра (Color Palette)

```css
:root {
  /* Базовые фоны (Dark Theme Revolut) */
  --bg-canvas: #191c1f;          /* Основной темно-серый фон приложения */
  --bg-canvas-subtle: #121417;   /* Глубокий темный фон для статус-баров и десктопной подложки */
  --bg-card-solid: #242629;      /* Непрозрачный темный фон плашек и дока */
  --bg-card: rgba(255, 255, 255, 0.08); /* Полупрозрачные карточки Glassmorphism */
  --bg-card-hover: rgba(255, 255, 255, 0.12);
  --bg-input: rgba(255, 255, 255, 0.06);

  /* Фирменные акценты Revolut */
  --accent-blue: #0666eb;        /* Revolut Core Blue */
  --accent-blue-hover: #0a84ff;
  --accent-purple-start: #984cff;/* Градиенты баннеров и виджетов */
  --accent-purple-end: #b985ff;
  --accent-pink: #e950a4;        /* Карты Disposable Virtual */
  --accent-orange: #ec7e00;      /* Предупреждения и лимиты */
  --accent-green: #10b981;       /* Пополнения и доходы (+€) */

  /* Текст и контраст */
  --text-primary: #ffffff;       /* Чистый белый заголовок и баланс */
  --text-secondary: #cdd3da;     /* Platinum-200 (второстепенные заголовки) */
  --text-muted: #75808a;         /* Platinum-500 (таймстемпы, подписи) */
  --text-subtle: rgba(255, 255, 255, 0.35);

  /* Границы и разделители */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(6, 102, 235, 0.6);
  --hairline: rgba(255, 255, 255, 0.05);

  /* Специфические градиенты карт */
  --card-physical: linear-gradient(135deg, #1f2429 0%, #0d0f12 100%);
  --card-disposable: linear-gradient(135deg, #ff7eb3 0%, #ff758c 100%);
  --card-virtual: linear-gradient(135deg, #4f56f1 0%, #984cff 100%);
}
```

### 2.2. Типографика и шрифтовая дисциплина (Typography & Font Rules)

> ⚠️ **Обязательное правило шрифтов**:
> - **Балансы, суммы транзакций, валюты и проценты**: оформляются гротеском с табличными пропорциональными цифрами — `font-sans tabular-nums tracking-tight`. Никакого моноширинного шрифта для цен и балансов!
> - **Моноширинный шрифт (`font-mono`)**: используется **ИСКЛЮЧИТЕЛЬНО** для технических идентификаторов: номеров карт (`•••• 9169`), IBAN счетов, UUID транзакций и CVV.

| Роль | Семейство | Классы Tailwind | Начертание | Межбуквенный | Пример из Figma |
|---|---|---|---|---|---|
| **Hero Balance** | Inter | `font-sans text-[48px] sm:text-[54px] font-medium tracking-tight tabular-nums` | 500 Medium | `-1px` | `0,01 €` / `1 250,50 €` |
| **H1 Display** | Inter | `font-sans text-2xl sm:text-3xl font-bold tracking-tight` | 700 Bold | `-0.5px` | Заголовки разделов |
| **H2 Section** | Inter | `font-sans text-lg sm:text-xl font-semibold tracking-tight` | 600 SemiBold | `-0.2px` | `Widgets`, `Transactions` |
| **Card / Banner Title**| Inter | `font-sans text-base sm:text-lg font-semibold` | 600 SemiBold | `0px` | `Invite friends, earn €50` |
| **Body Action** | Inter | `font-sans text-sm sm:text-base font-semibold` | 600 SemiBold | `0px` | `Main - EUR`, `Add money` |
| **Transaction Amount** | Inter | `font-sans text-sm sm:text-base font-semibold tabular-nums` | 600 SemiBold | `0px` | `-€27.19`, `+€150.00` |
| **Caption / Sub**| Inter | `font-sans text-xs sm:text-sm font-normal text-revolut-muted` | 400 Regular | `0px` | `29 Feb, 20:37 • Completed` |
| **Badge / Micro**| Inter | `font-sans text-[11px] sm:text-xs font-medium` | 500 Medium | `+0.2px` | `Standard`, `Pending` |
| **Card Number & IBAN** | JetBrains Mono / UI Mono | `font-mono text-xs sm:text-sm tracking-widest` | 500 Medium | `+1.5px` | `•••• 9169`, `ADG0001001` |

### 2.3. Радиусы скруглений (Corner Radii)
- `rounded-full` (`9999px`): Кнопки быстрых действий («Add money», «Exchange»), аватары, строка поиска, нижний плавающий док.
- `rounded-widget` (`28px`): Квадратные виджеты 2x2 (`190x190px`), карточки аналитики.
- `rounded-card` (`18px`): Промо-баннеры маркетинга, контейнеры списка транзакций.
- `rounded-modal` (`32px`): Верхние углы выезжающей шторки `ModalSheet`.

### 2.4. Эффекты стекла и тени (Glassmorphism & Shadows)
- **Glass Card Background**: полупрозрачный белый с размытием:
  `bg-white/[0.08] backdrop-blur-revolut border border-white/[0.08]`
- **Inner Light Highlight**: верхний световой блик для придания объема:
  `shadow-inner-light` (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16)`)
- **Floating Dock Shadow**: глубокая мягкая тень:
  `shadow-float` (`box-shadow: 0 12px 36px -8px rgba(0, 0, 0, 0.6)`)

---

## 3. Строгие TypeScript DTO контракты (API Layer)

Для взаимодействия с микросервисным бэкендом ADG-Bank (`account-service`, `transaction-service`, `user-service`) используются следующие типы:

```typescript
// src/types/api.ts

export type CurrencyCode = 'EUR' | 'USD' | 'RUB' | 'GBP';

export interface UserDTO {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

export interface AccountDTO {
  id: number;
  userId: number;
  accountNumber: string;
  balance: number;
  currency: CurrencyCode | string;
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED';
  createdAt: string;
}

export interface TransactionDTO {
  id: number;
  idempotencyKey?: string;
  sourceAccountId: number;
  targetAccountId?: number;
  amount: number;
  currency: CurrencyCode | string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  description?: string;
  merchantName?: string;
  category?: string;
  createdAt: string;
}

export interface CreateAccountRequestDTO {
  userId: number;
  currency: CurrencyCode | string;
}

export interface CreateTransactionRequestDTO {
  sourceAccountId: number;
  targetAccountId: number;
  amount: number;
  description?: string;
}

export interface CardDTO {
  id: string;
  accountId: number;
  userId: number;
  cardNumber: string;      // '•••• •••• •••• 9169'
  cardHolder: string;      // 'DYLAN E.'
  expiryDate: string;      // '12/28'
  cvv?: string;
  type: 'PHYSICAL' | 'VIRTUAL' | 'DISPOSABLE';
  isFrozen: boolean;
  spendingLimit?: number;
  spentThisMonth?: number;
  colorGradient?: string;
}
```

---

## 4. Конфигурация Tailwind CSS (`tailwind.config.js`)

Чтобы классы прозрачности (такие как `bg-revolut-cardSolid/90`, `bg-revolut-canvas/80`, `bg-white/[0.08]`) работали без конфликтов с синтаксисом Tailwind, цвета палитры объявляются в виде HEX-кодов:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        revolut: {
          canvas: '#191C1F',
          dark: '#121417',
          cardSolid: '#242629',
          blue: '#0666EB',
          blueHover: '#0A84FF',
          purple: '#984CFF',
          purpleLight: '#B985FF',
          pink: '#E950A4',
          orange: '#EC7E00',
          green: '#10B981',
          muted: '#75808A',
          platinum: '#CDD3DA',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        'widget': '28px',
        'card': '18px',
        'modal': '32px',
        'pill': '9999px',
      },
      boxShadow: {
        'glass': '0 4px 20px rgba(0, 0, 0, 0.25)',
        'inner-light': 'inset 0 1px 0 rgba(255, 255, 255, 0.16)',
        'float': '0 12px 36px -8px rgba(0, 0, 0, 0.6)',
      },
      backdropBlur: {
        'revolut': '20px',
      }
    },
  },
  plugins: [],
}
```

---

## 5. Готовые шаблоны ключевых компонентов

### 5.1. Утилита универсального форматирования валют (`currency.ts`)

```typescript
// src/utils/currency.ts

export interface CurrencyFormatParts {
  value: string;
  currencySymbol: string;
  fullFormatted: string;
}

export const getCurrencyParts = (
  amount: number,
  currency = 'EUR',
  locale = 'ru-RU'
): CurrencyFormatParts => {
  const safeCurrency = currency.toUpperCase();
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const parts = formatter.formatToParts(amount);
    const currencySymbol = parts.find((p) => p.type === 'currency')?.value || safeCurrency;
    const value = parts
      .filter((p) => p.type !== 'currency')
      .map((p) => p.value)
      .join('')
      .trim();

    return {
      value,
      currencySymbol,
      fullFormatted: formatter.format(amount),
    };
  } catch (error) {
    const fallbackSymbols: Record<string, string> = {
      EUR: '€',
      USD: '$',
      RUB: '₽',
      GBP: '£',
    };
    const symbol = fallbackSymbols[safeCurrency] || safeCurrency;
    const num = amount.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return {
      value: num,
      currencySymbol: symbol,
      fullFormatted: `${num} ${symbol}`,
    };
  }
};
```

---

### 5.2. Главный Hero-баланс и быстрые действия (`AccountHero.tsx`)

```tsx
// src/components/revolut/AccountHero.tsx
import React from 'react';
import { Plus, ArrowLeftRight, Info, MoreHorizontal, ChevronDown } from 'lucide-react';
import { getCurrencyParts } from '../../utils/currency';

interface AccountHeroProps {
  balance: number;
  currency?: string;
  accountName?: string;
  onAddMoney: () => void;
  onExchange: () => void;
  onDetails: () => void;
  onMore: () => void;
}

export const AccountHero: React.FC<AccountHeroProps> = ({
  balance,
  currency = 'EUR',
  accountName = 'Main - EUR',
  onAddMoney,
  onExchange,
  onDetails,
  onMore,
}) => {
  const { value, currencySymbol } = getCurrencyParts(balance, currency);

  return (
    <section className="flex flex-col items-center justify-center pt-3 pb-6 px-4 text-center">
      {/* Селектор аккаунтов */}
      <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] text-xs font-semibold text-revolut-platinum mb-2 transition-all active:scale-95">
        <span>Accounts</span>
        <ChevronDown className="w-3.5 h-3.5 text-revolut-muted" />
      </button>

      {/* Главный баланс с табличными цифрами */}
      <div className="flex items-baseline justify-center gap-1.5 my-1">
        <span className="text-[48px] sm:text-[54px] font-medium tracking-tight text-white font-sans tabular-nums leading-none">
          {value}
        </span>
        <span className="text-[32px] sm:text-[36px] font-normal text-revolut-platinum font-sans">
          {currencySymbol}
        </span>
      </div>

      {/* Метка счёта */}
      <p className="text-xs sm:text-sm font-medium text-revolut-muted mb-6 tracking-wide">
        {accountName}
      </p>

      {/* 4 кнопки быстрых действий (Revolut Buttons Pill Layout) */}
      <div className="grid grid-cols-4 gap-3 sm:gap-6 w-full max-w-sm">
        <ActionButton icon={<Plus className="w-5 h-5" />} label="Add money" onClick={onAddMoney} />
        <ActionButton icon={<ArrowLeftRight className="w-5 h-5" />} label="Exchange" onClick={onExchange} />
        <ActionButton icon={<Info className="w-5 h-5" />} label="Details" onClick={onDetails} />
        <ActionButton icon={<MoreHorizontal className="w-5 h-5" />} label="More" onClick={onMore} />
      </div>
    </section>
  );
};

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({
  icon,
  label,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="group flex flex-col items-center gap-2 focus:outline-none"
  >
    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-white/[0.08] group-hover:bg-white/[0.14] border border-white/[0.08] text-white shadow-inner-light transition-all active:scale-95">
      {icon}
    </div>
    <span className="text-xs font-semibold text-revolut-platinum group-hover:text-white transition-colors">
      {label}
    </span>
  </button>
);
```

---

### 5.3. Нижний плавающий док навигации (`BottomTabBar.tsx`)

```tsx
// src/components/revolut/BottomTabBar.tsx
import React from 'react';
import { Home, LineChart, ArrowLeftRight, Bitcoin, Compass } from 'lucide-react';

export type TabKey = 'home' | 'invest' | 'transfers' | 'crypto' | 'lifestyle';

interface BottomTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'invest', label: 'Invest', icon: LineChart },
    { key: 'transfers', label: 'Transfers', icon: ArrowLeftRight },
    { key: 'crypto', label: 'Crypto', icon: Bitcoin },
    { key: 'lifestyle', label: 'Lifestyle', icon: Compass },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none pb-4">
      <div className="w-full max-w-[420px] px-4 pointer-events-auto">
        <div className="flex items-center justify-around h-16 rounded-full bg-revolut-cardSolid/90 backdrop-blur-revolut border border-white/[0.08] shadow-float px-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onSelectTab(t.key)}
                className={`flex flex-col items-center justify-center flex-1 h-full rounded-full transition-all active:scale-95 ${
                  isActive ? 'text-white' : 'text-revolut-muted hover:text-revolut-platinum'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'text-white' : 'text-revolut-muted'}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
```

---

### 5.4. Всплывающая нижняя шторка (`ModalSheet.tsx`)

```tsx
// src/components/ui/ModalSheet.tsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const ModalSheet: React.FC<ModalSheetProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      />

      {/* Sheet Container */}
      <div className="relative w-full max-w-[420px] max-h-[85vh] bg-revolut-cardSolid rounded-t-modal border-t border-x border-white/[0.08] shadow-float z-10 flex flex-col overflow-hidden animate-slideUp">
        {/* Drag handle pill */}
        <div className="w-full pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06]">
          <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-revolut-muted hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body with custom scroll */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
```

---

### 5.5. Состояния загрузки (`Skeleton.tsx`) и пустого состояния (`EmptyState.tsx`)

```tsx
// src/components/ui/Skeleton.tsx
import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`bg-white/[0.08] animate-pulse rounded-xl ${className}`} />
  );
};

export const TransactionListSkeleton: React.FC = () => (
  <div className="space-y-3 p-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex items-center justify-between gap-3 p-2">
        <Skeleton className="w-11 h-11 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
    ))}
  </div>
);
```

```tsx
// src/components/ui/EmptyState.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-card bg-white/[0.04] border border-white/[0.06] my-3">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/[0.06] text-revolut-muted mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
      <p className="text-xs text-revolut-muted max-w-[240px] mb-4">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-full bg-revolut-blue hover:bg-revolut-blueHover text-xs font-semibold text-white transition-all active:scale-95 shadow-inner-light"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
```

---

## 6. Пошаговый план реализации для ИИ-агента

### Этап 1: Инициализация проекта и стек стилей
1. Развернуть React 19 + TypeScript + Vite в папке `frontend/`.
2. Установить зависимости:
   ```bash
   npm install lucide-react clsx tailwind-merge @tanstack/react-query axios
   npm install -D tailwindcss postcss autoprefixer
   ```
3. Сконфигурировать `tailwind.config.js` в соответствии с Разделом 4 данного документа.
4. Добавить шрифт **Inter** и настроить глобальные CSS стили в `src/index.css` (включая анимации `fadeIn` и `slideUp`).

### Этап 2: Desktop Responsive Shell и базовый лейаут
1. Создать компонент-оболочку `DesktopShell.tsx`:
   - На экранах десктопа: контейнер смартфона `max-w-[420px] min-h-screen bg-revolut-canvas text-white relative shadow-2xl border-x border-white/5 mx-auto` на подложке `#121417`.
   - В мобильном окне: 100% ширины.
2. Подключить `TopNavBar.tsx` и `BottomTabBar.tsx`.

### Этап 3: Сборка экранов интерфейса
1. **Экран Home**:
   - `AccountHero`: форматированный баланс через `getCurrencyParts`, кнопки быстрых действий.
   - `MarketingBanner`: промо-слайдер с индикатором страниц.
   - `TransactionsSection`: список проводок со скелетонами загрузки и `EmptyState`.
   - `WidgetsGrid`: сетка 2x2 (Spend this month, Total wealth, Disposable Card, Cash & Linked).
   - `RecentPayees`: горизонтальный скролл контактов с аватарами.
2. **Экран Cards (`Revolut Cards`)**:
   - Карусель дебетовых карт (Physical Platinum, Virtual Blue, Disposable Pink с градиентами).
   - Быстрые переключатели: «Freeze card», «Show PIN», «Online transactions», «Limits».
3. **Модальное окно перевода (`TransferModal`)**:
   - Открытие через `ModalSheet.tsx`.
   - Выбор получателя из `Recent payees` или ввод номера счёта.
   - Цифровая клавиатура ввода суммы.
   - Подтверждение с автоматической генерацией `X-Idempotency-Key`.
4. **Модальное окно чека транзакции (`TransactionDetailsModal`)**:
   - Полная квитанция: статус, дата, категория, комиссия, кнопка «Поделиться чеком».

### Этап 4: Интеграция с бэкендом ADG-Bank
- Связать с `api-gateway` (:8080) с автоматическим фолбэком на реалистичный Mock-слой при выключенном бэкенде:
  - Баланс счетов: `GET /api/accounts/user/{userId}`
  - Список транзакций: `GET /api/transactions/account/{accountId}`
  - Перевод средств: `POST /api/transactions/transfer` (с идемпотентным ключом)
  - Создание счёта / карты: `POST /api/accounts`
- Подключить TanStack Query для реактивного обновления баланса без перезагрузки экрана при успешном переводе.

### Этап 5: Верификация и тестирование
- Проверить совпадение всех шрифтовых размеров, паддингов и радиусов скруглений по `figma_summary.json`.
- Протестировать адаптивность на мобильном (390px) и десктопном экранах.
- Проверить сборку проекта через `npm run build` без ошибок TypeScript и линтера.
