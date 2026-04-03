export interface Product {
  id: string;
  name: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  description?: string;
  imageUrl?: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  costPrice: number;
  sellPrice: number;
  workerPayment: number;
}

export type PaymentMethod = 'cash' | 'transfer' | 'split';

export interface Sale {
  id: string;
  items: SaleItem[];
  date: number;
  paymentMethod: PaymentMethod;
  cashAmount: number;
  transferAmount: number;
  totalAmount: number;
  grossProfit: number;
  // Snapshots of settings at sale time
  recoveryPct: number;
  reinvestmentPct: number;
  profitPct: number;
  netProfitPct: number;
  othersPct: number;
}

export interface Investment {
  id: string;
  name: string;
  description: string;
  capital: number;
  person: string;
  currency: string;
  date: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: number;
}

export interface AppSettings {
  appName: string;
  recoveryPct: number;
  reinvestmentPct: number;
  profitPct: number;
  netProfitPct: number;
  othersPct: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  type: 'entry' | 'exit';
  reason: string;
  date: number;
}
