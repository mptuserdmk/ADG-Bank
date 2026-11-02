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

export interface PayeeDTO {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  accountNumber: string;
  accountId: number;
}

