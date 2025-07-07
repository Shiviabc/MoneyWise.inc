import React, { createContext, useState, useContext, useEffect } from 'react';
import { Budget } from '../types';
import { useTransactions } from './TransactionContext';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getTotalBudget: () => number;
  getRemainingBudget: () => number;
  getBudgetProgress: (id: string) => number;
  getBudgetByCategory: (category: string) => Budget | undefined;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const { transactions, getTotalByType } = useTransactions();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user]);

  const fetchBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const addBudget = async (budget: Omit<Budget, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert([{ ...budget, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      setBudgets([data, ...budgets]);
    } catch (error) {
      console.error('Error adding budget:', error);
      throw error;
    }
  };

  const updateBudget = async (budget: Budget) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .update(budget)
        .eq('id', budget.id);

      if (error) throw error;
      setBudgets(budgets.map((b) => (b.id === budget.id ? budget : b)));
    } catch (error) {
      console.error('Error updating budget:', error);
      throw error;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBudgets(budgets.filter((b) => b.id !== id));
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw error;
    }
  };

  const getTotalBudget = () => {
    const mainBudget = budgets.find(budget => !budget.category);
    return mainBudget ? mainBudget.amount : budgets.reduce((total, budget) => total + budget.amount, 0);
  };

  const getRemainingBudget = () => {
    const totalExpenses = getTotalByType('expense');
    return getTotalBudget() - totalExpenses;
  };

  const getBudgetProgress = (id: string) => {
    const budget = budgets.find((b) => b.id === id);
    if (!budget) return 0;

    if (budget.category) {
      const categoryExpenses = transactions
        .filter((t) => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return Math.min(categoryExpenses / budget.amount, 1);
    } else {
      const totalExpenses = getTotalByType('expense');
      return Math.min(totalExpenses / budget.amount, 1);
    }
  };

  const getBudgetByCategory = (category: string) => {
    return budgets.find((budget) => budget.category === category);
  };

  return (
    <BudgetContext.Provider
      value={{
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        getTotalBudget,
        getRemainingBudget,
        getBudgetProgress,
        getBudgetByCategory,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgets = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudgets must be used within a BudgetProvider');
  }
  return context;
};