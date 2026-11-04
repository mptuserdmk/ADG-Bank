import axios from 'axios';
import type { AccountDTO, TransactionDTO, CreateTransactionRequestDTO, CardDTO, PayeeDTO } from '../types/api';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Idempotency-Key generator
export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const TOKEN_KEY = 'adg_auth_token';
const USER_KEY = 'adg_user_profile';

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string, user?: any) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const clearStoredAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Automatic handshake to register/login demo customerDylan on live backend
export const ensureAuthenticated = async (): Promise<string | null> => {
  const existing = getStoredToken();
  if (existing) return existing;

  try {
    const loginRes = await axios.post('/api/users/login', {
      usernameOrEmail: 'dylan',
      password: 'DylanPassword123!',
    });
    if (loginRes.data?.token) {
      setStoredToken(loginRes.data.token, loginRes.data);
      return loginRes.data.token;
    }
  } catch (err: any) {
    // If user does not exist yet (401 or 404), register automatically
    try {
      const regRes = await axios.post('/api/users/register', {
        username: 'dylan',
        email: 'dylan@adgbank.com',
        password: 'DylanPassword123!',
        fullName: 'Dylan E.',
      });
      if (regRes.data?.token) {
        setStoredToken(regRes.data.token, regRes.data);
        return regRes.data.token;
      }
    } catch {
      // Backend offline or unreachable
      return null;
    }
  }
  return null;
};

// Request interceptor: attaches Bearer token & Idempotency Key
apiClient.interceptors.request.use(async (config) => {
  let token = getStoredToken();
  const url = config.url || '';
  if (!token && !url.includes('/users/login') && !url.includes('/users/register')) {
    token = await ensureAuthenticated();
  }
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }

  if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
    if (!config.headers.get('X-Idempotency-Key')) {
      config.headers.set('X-Idempotency-Key', generateUUID());
    }
  }
  return config;
});

// Response interceptor: auto-retry once on 401 by refreshing token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      clearStoredAuth();
      const newToken = await ensureAuthenticated();
      if (newToken) {
        originalRequest.headers.set('Authorization', `Bearer ${newToken}`);
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

// --- In-Memory Mock Store used ONLY when backend services are offline ---
let isBackendOnline = false;

let mockAccounts: AccountDTO[] = [
  {
    id: 1,
    userId: 1,
    accountNumber: 'ADG0001001',
    balance: 1250.50,
    currency: 'EUR',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 1,
    accountNumber: 'ADG0001002',
    balance: 350.00,
    currency: 'USD',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    userId: 1,
    accountNumber: 'ADG0001003',
    balance: 45000.00,
    currency: 'RUB',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
  }
];

let mockTransactions: TransactionDTO[] = [
  {
    id: 101,
    idempotencyKey: 'tx-101',
    sourceAccountId: 1,
    targetAccountId: 2,
    amount: -27.19,
    currency: 'EUR',
    status: 'COMPLETED',
    merchantName: 'To Marvilo',
    category: 'UIScreens',
    description: 'Design Assets & Kit',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 102,
    idempotencyKey: 'tx-102',
    sourceAccountId: 1,
    targetAccountId: 3,
    amount: -124.00,
    currency: 'EUR',
    status: 'COMPLETED',
    merchantName: 'Webflow',
    category: 'Subscription',
    description: 'Monthly Cloud Hosting',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 103,
    idempotencyKey: 'tx-103',
    sourceAccountId: 2,
    targetAccountId: 1,
    amount: 500.00,
    currency: 'EUR',
    status: 'COMPLETED',
    merchantName: 'From Dylan E.',
    category: 'Transfer',
    description: 'Split dinner bill',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 104,
    idempotencyKey: 'tx-104',
    sourceAccountId: 1,
    targetAccountId: 4,
    amount: -124.00,
    currency: 'EUR',
    status: 'COMPLETED',
    merchantName: 'UI8 Marketplace',
    category: 'Design Assets',
    description: 'Mobile Kit UI Bundle',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 105,
    idempotencyKey: 'tx-105',
    sourceAccountId: 1,
    targetAccountId: 5,
    amount: 50.00,
    currency: 'EUR',
    status: 'COMPLETED',
    merchantName: 'Revolut Referral',
    category: 'Bonus',
    description: 'Invite friend reward',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

export const mockCards: CardDTO[] = [
  {
    id: 'card-1',
    accountId: 1,
    userId: 1,
    cardNumber: '•••• •••• •••• 4521',
    cardHolder: 'DYLAN E.',
    expiryDate: '12/28',
    cvv: '193',
    type: 'PHYSICAL',
    isFrozen: false,
    spendingLimit: 2000,
    spentThisMonth: 640.50,
    colorGradient: 'linear-gradient(135deg, #1f2429 0%, #0d0f12 100%)',
  },
  {
    id: 'card-2',
    accountId: 1,
    userId: 1,
    cardNumber: '•••• •••• •••• 9169',
    cardHolder: 'DYLAN E.',
    expiryDate: '08/29',
    cvv: '842',
    type: 'DISPOSABLE',
    isFrozen: false,
    spendingLimit: 500,
    spentThisMonth: 128.02,
    colorGradient: 'linear-gradient(135deg, #ff7eb3 0%, #ff758c 100%)',
  },
  {
    id: 'card-3',
    accountId: 2,
    userId: 1,
    cardNumber: '•••• •••• •••• 7740',
    cardHolder: 'DYLAN E.',
    expiryDate: '03/30',
    cvv: '502',
    type: 'VIRTUAL',
    isFrozen: false,
    spendingLimit: 1000,
    spentThisMonth: 45.00,
    colorGradient: 'linear-gradient(135deg, #4f56f1 0%, #984cff 100%)',
  }
];

export const mockPayees: PayeeDTO[] = [
  { id: 'p1', name: 'Mario', initials: 'M', accountNumber: 'ADG0001004', accountId: 4 },
  { id: 'p2', name: 'Dylan', initials: 'D', accountNumber: 'ADG0001005', accountId: 5 },
  { id: 'p3', name: 'Louis', initials: 'L', accountNumber: 'ADG0001006', accountId: 6 },
  { id: 'p4', name: 'Christoph', initials: 'C', accountNumber: 'ADG0001007', accountId: 7 },
  { id: 'p5', name: 'Edvin', initials: 'E', accountNumber: 'ADG0001008', accountId: 8 },
];

// --- High Level Banking API with Automatic Online/Offline Handshake ---
export const BankAPI = {
  isBackendConnected: () => isBackendOnline,

  // Get Accounts of user
  getAccounts: async (userId = 1): Promise<AccountDTO[]> => {
    try {
      const res = await apiClient.get<AccountDTO[]>(`/accounts/user/${userId}`);
      if (res.status === 200 && Array.isArray(res.data)) {
        isBackendOnline = true;
        // If user is new and has no accounts on backend yet, create a default EUR account
        if (res.data.length === 0) {
          try {
            const created = await apiClient.post<AccountDTO>('/accounts', {
              userId,
              currency: 'EUR',
              initialBalance: 1250.50,
            });
            return [created.data];
          } catch {
            return res.data;
          }
        }
        return res.data;
      }
    } catch {
      isBackendOnline = false;
    }
    return mockAccounts;
  },

  // Get Transactions for account
  getTransactions: async (accountId = 1): Promise<TransactionDTO[]> => {
    try {
      const res = await apiClient.get<TransactionDTO[]>(`/transactions/account/${accountId}`);
      if (res.status === 200 && Array.isArray(res.data)) {
        isBackendOnline = true;
        return res.data;
      }
    } catch {
      isBackendOnline = false;
    }
    return mockTransactions;
  },

  // Execute Transfer
  transfer: async (req: CreateTransactionRequestDTO): Promise<TransactionDTO> => {
    const key = generateUUID();
    try {
      const res = await apiClient.post<TransactionDTO>('/transactions', req, {
        headers: { 'X-Idempotency-Key': key }
      });
      if (res.status === 200 || res.status === 201) {
        isBackendOnline = true;
        return res.data;
      }
    } catch (error: any) {
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        const message = error.response.data?.message || 'Ошибка валидации банковской операции';
        throw new Error(message);
      }
      isBackendOnline = false;
    }

    // Mock execution fallback only if network/server is completely down
    const sourceAcc = mockAccounts.find((a) => a.id === req.sourceAccountId);
    if (sourceAcc) {
      sourceAcc.balance = Math.max(0, sourceAcc.balance - req.amount);
    }
    const newTx: TransactionDTO = {
      id: Date.now(),
      idempotencyKey: key,
      sourceAccountId: req.sourceAccountId,
      targetAccountId: req.targetAccountId,
      amount: -req.amount,
      currency: sourceAcc ? sourceAcc.currency : 'EUR',
      status: 'COMPLETED',
      merchantName: req.description || 'Transfer',
      category: 'Transfer',
      description: req.description || 'Direct Transfer',
      createdAt: new Date().toISOString(),
    };
    mockTransactions = [newTx, ...mockTransactions];
    return newTx;
  },

  // Quick Top-Up / Add Money
  addMoney: async (accountId: number, amount: number): Promise<AccountDTO> => {
    const key = generateUUID();
    try {
      const res = await apiClient.put<AccountDTO>(`/accounts/${accountId}/balance`, {
        amount,
        operationType: 'CREDIT',
        referenceId: key,
      });
      if (res.status === 200) {
        isBackendOnline = true;
        return res.data;
      }
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data?.message || 'Ошибка пополнения счета');
      }
      isBackendOnline = false;
    }

    const acc = mockAccounts.find((a) => a.id === accountId);
    if (acc) {
      acc.balance += amount;
      mockTransactions = [
        {
          id: Date.now(),
          idempotencyKey: key,
          sourceAccountId: accountId,
          amount,
          currency: acc.currency,
          status: 'COMPLETED',
          merchantName: 'Top-Up via Card',
          category: 'Deposit',
          description: 'Instant Card Top-up',
          createdAt: new Date().toISOString(),
        },
        ...mockTransactions,
      ];
      return { ...acc };
    }
    throw new Error('Account not found');
  },

  // Toggle freeze card
  toggleFreezeCard: async (cardId: string): Promise<CardDTO> => {
    const card = mockCards.find((c) => c.id === cardId);
    if (!card) throw new Error('Card not found');
    card.isFrozen = !card.isFrozen;
    return { ...card };
  }
};
