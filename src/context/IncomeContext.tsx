import React, { createContext, useState, useContext, useEffect } from 'react';
import { IncomeSource, BankAccount } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface IncomeContextType {
  incomeSources: IncomeSource[];
  bankAccounts: BankAccount[];
  addIncomeSource: (incomeSource: Omit<IncomeSource, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateIncomeSource: (incomeSource: IncomeSource) => Promise<void>;
  deleteIncomeSource: (id: string) => Promise<void>;
  addBankAccount: (bankAccount: Omit<BankAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateBankAccount: (bankAccount: BankAccount) => Promise<void>;
  deleteBankAccount: (id: string) => Promise<void>;
  connectBankAccount: (id: string) => Promise<void>;
  syncBankAccount: (id: string) => Promise<void>;
  getTotalMonthlyIncome: () => number;
  getActiveIncomeSources: () => IncomeSource[];
}

const IncomeContext = createContext<IncomeContextType | undefined>(undefined);

export const IncomeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchIncomeSources();
      fetchBankAccounts();
    }
  }, [user]);

  const fetchIncomeSources = async () => {
    try {
      const { data, error } = await supabase
        .from('income_sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncomeSources(data || []);
    } catch (error) {
      console.error('Error fetching income sources:', error);
    }
  };

  const fetchBankAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBankAccounts(data || []);
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    }
  };

  const addIncomeSource = async (incomeSource: Omit<IncomeSource, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('income_sources')
        .insert([{ ...incomeSource, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      setIncomeSources([data, ...incomeSources]);
    } catch (error) {
      console.error('Error adding income source:', error);
      throw error;
    }
  };

  const updateIncomeSource = async (incomeSource: IncomeSource) => {
    try {
      const { error } = await supabase
        .from('income_sources')
        .update(incomeSource)
        .eq('id', incomeSource.id);

      if (error) throw error;
      setIncomeSources(incomeSources.map((source) => (source.id === incomeSource.id ? incomeSource : source)));
    } catch (error) {
      console.error('Error updating income source:', error);
      throw error;
    }
  };

  const deleteIncomeSource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('income_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setIncomeSources(incomeSources.filter((source) => source.id !== id));
    } catch (error) {
      console.error('Error deleting income source:', error);
      throw error;
    }
  };

  const addBankAccount = async (bankAccount: Omit<BankAccount, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert([{ ...bankAccount, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      setBankAccounts([data, ...bankAccounts]);
    } catch (error) {
      console.error('Error adding bank account:', error);
      throw error;
    }
  };

  const updateBankAccount = async (bankAccount: BankAccount) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .update(bankAccount)
        .eq('id', bankAccount.id);

      if (error) throw error;
      setBankAccounts(bankAccounts.map((account) => (account.id === bankAccount.id ? bankAccount : account)));
    } catch (error) {
      console.error('Error updating bank account:', error);
      throw error;
    }
  };

  const deleteBankAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBankAccounts(bankAccounts.filter((account) => account.id !== id));
    } catch (error) {
      console.error('Error deleting bank account:', error);
      throw error;
    }
  };

  const connectBankAccount = async (id: string) => {
    try {
      // In a real implementation, this would integrate with Plaid, Yodlee, or similar service
      // For now, we'll simulate the connection
      const { error } = await supabase
        .from('bank_accounts')
        .update({ 
          is_connected: true, 
          last_sync: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;
      
      setBankAccounts(bankAccounts.map((account) => 
        account.id === id 
          ? { ...account, is_connected: true, last_sync: new Date().toISOString() }
          : account
      ));
    } catch (error) {
      console.error('Error connecting bank account:', error);
      throw error;
    }
  };

  const syncBankAccount = async (id: string) => {
    try {
      // In a real implementation, this would fetch latest transactions from the bank
      // For now, we'll just update the last sync time
      const { error } = await supabase
        .from('bank_accounts')
        .update({ last_sync: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      setBankAccounts(bankAccounts.map((account) => 
        account.id === id 
          ? { ...account, last_sync: new Date().toISOString() }
          : account
      ));
    } catch (error) {
      console.error('Error syncing bank account:', error);
      throw error;
    }
  };

  const getTotalMonthlyIncome = () => {
    return incomeSources
      .filter(source => source.is_active)
      .reduce((total, source) => {
        let monthlyAmount = source.amount;
        
        switch (source.frequency) {
          case 'weekly':
            monthlyAmount = source.amount * 4.33; // Average weeks per month
            break;
          case 'bi-weekly':
            monthlyAmount = source.amount * 2.17; // Average bi-weekly periods per month
            break;
          case 'quarterly':
            monthlyAmount = source.amount / 3;
            break;
          case 'annually':
            monthlyAmount = source.amount / 12;
            break;
          default: // monthly
            monthlyAmount = source.amount;
        }
        
        return total + monthlyAmount;
      }, 0);
  };

  const getActiveIncomeSources = () => {
    return incomeSources.filter(source => source.is_active);
  };

  return (
    <IncomeContext.Provider
      value={{
        incomeSources,
        bankAccounts,
        addIncomeSource,
        updateIncomeSource,
        deleteIncomeSource,
        addBankAccount,
        updateBankAccount,
        deleteBankAccount,
        connectBankAccount,
        syncBankAccount,
        getTotalMonthlyIncome,
        getActiveIncomeSources,
      }}
    >
      {children}
    </IncomeContext.Provider>
  );
};

export const useIncome = () => {
  const context = useContext(IncomeContext);
  if (context === undefined) {
    throw new Error('useIncome must be used within an IncomeProvider');
  }
  return context;
};