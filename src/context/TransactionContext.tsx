import React, { createContext, useState, useContext, useEffect } from 'react';
import { Transaction, TransactionType, CategoryTotal } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getTransactionsByType: (type: TransactionType) => Transaction[];
  getTotalByType: (type: TransactionType) => number;
  getCategoryTotals: (type: TransactionType) => CategoryTotal[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      setTransactions([data, ...transactions]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', transaction.id);

      if (error) throw error;
      setTransactions(
        transactions.map((t) => (t.id === transaction.id ? transaction : t))
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTransactions(transactions.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const getTransactionsByType = (type: TransactionType) => {
    return transactions.filter((transaction) => transaction.type === type);
  };

  const getTotalByType = (type: TransactionType) => {
    return getTransactionsByType(type).reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getCategoryTotals = (type: TransactionType): CategoryTotal[] => {
    const filteredTransactions = getTransactionsByType(type);
    
    const categoryMap = new Map<string, number>();
    
    filteredTransactions.forEach((transaction) => {
      const currentTotal = categoryMap.get(transaction.category) || 0;
      categoryMap.set(transaction.category, currentTotal + transaction.amount);
    });
    
    return Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
    }));
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getTransactionsByType,
        getTotalByType,
        getCategoryTotals,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};