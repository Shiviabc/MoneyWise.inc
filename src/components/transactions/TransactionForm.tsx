import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType } from '../../types';
import Button from '../ui/Button';
import { useTransactions } from '../../context/TransactionContext';
import { useAuth } from '../../context/AuthContext';
import { getCurrencySymbol } from '../../utils/currency';

interface TransactionFormProps {
  onClose: () => void;
  existingTransaction?: Transaction | null;
}

const DEFAULT_CATEGORIES = {
  income: ['Salary', 'Side Hustle', 'Investments', 'Gifts', 'Other'],
  expense: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Utilities', 'Shopping', 'Health', 'Personal', 'Other'],
};

const TransactionForm: React.FC<TransactionFormProps> = ({ onClose, existingTransaction }) => {
  const { addTransaction, updateTransaction } = useTransactions();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    type: TransactionType;
    amount: string;
    description: string;
    date: string;
    category: string;
    customCategory?: string;
  }>({
    type: 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: DEFAULT_CATEGORIES.expense[0],
    customCategory: '',
  });

  const currency = userProfile?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  useEffect(() => {
    if (existingTransaction) {
      setFormData({
        type: existingTransaction.type,
        amount: existingTransaction.amount.toString(),
        description: existingTransaction.description,
        date: existingTransaction.date,
        category: DEFAULT_CATEGORIES[existingTransaction.type].includes(existingTransaction.category)
          ? existingTransaction.category
          : 'Other',
        customCategory: !DEFAULT_CATEGORIES[existingTransaction.type].includes(existingTransaction.category)
          ? existingTransaction.category
          : '',
      });
    }
  }, [existingTransaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      // Reset category when transaction type changes
      setFormData({
        ...formData,
        [name]: value,
        category: DEFAULT_CATEGORIES[value as TransactionType][0],
        customCategory: '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const finalCategory = formData.category === 'Other' && formData.customCategory 
      ? formData.customCategory 
      : formData.category;

    try {
      const transactionData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
        category: finalCategory,
      };

      if (existingTransaction) {
        await updateTransaction({
          ...transactionData,
          id: existingTransaction.id,
        });
      } else {
        await addTransaction(transactionData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving transaction', error);
      // Would handle error display to user in a production app
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label htmlFor="type-income" className="flex items-center space-x-2 cursor-pointer">
            <input
              id="type-income"
              type="radio"
              name="type"
              value="income"
              checked={formData.type === 'income'}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
            />
            <span>Income</span>
          </label>
        </div>
        <div className="flex-1">
          <label htmlFor="type-expense" className="flex items-center space-x-2 cursor-pointer">
            <input
              id="type-expense"
              type="radio"
              name="type"
              value="expense"
              checked={formData.type === 'expense'}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
            />
            <span>Expense</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{currencySymbol}</span>
            </div>
            <input
              type="number"
              name="amount"
              id="amount"
              min="0.01"
              step="0.01"
              required
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">{currency}</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            type="text"
            name="description"
            id="description"
            required
            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            placeholder="What was this transaction for?"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            name="date"
            id="date"
            required
            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="mt-1 block w-full bg-white rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
            value={formData.category}
            onChange={handleChange}
          >
            {DEFAULT_CATEGORIES[formData.type].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {formData.category === 'Other' && (
          <div>
            <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700">
              Custom Category
            </label>
            <input
              type="text"
              name="customCategory"
              id="customCategory"
              className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              placeholder="Enter custom category"
              value={formData.customCategory}
              onChange={handleChange}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {existingTransaction ? 'Update' : 'Save'} Transaction
        </Button>
      </div>
    </form>
  );
};

export default TransactionForm;