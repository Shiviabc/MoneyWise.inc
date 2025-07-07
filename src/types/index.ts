export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: TransactionType;
  category: string;
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  period: 'weekly' | 'monthly';
  start_date: string;
  category?: string;
}

export interface IncomeSource {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually';
  source_type: 'manual' | 'bank' | 'employer';
  bank_account_id?: string;
  is_active: boolean;
  next_payment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  user_id: string;
  bank_name: string;
  account_name: string;
  account_type: 'checking' | 'savings' | 'credit';
  account_number_masked: string;
  is_connected: boolean;
  last_sync: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  budgetRemaining: number;
  spendingByCategory: CategoryTotal[];
  recentTransactions: Transaction[];
}

export interface CategoryTotal {
  category: string;
  amount: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
}