import React, { useState, useEffect } from 'react';
import { Budget } from '../../types';
import Button from '../ui/Button';
import { useBudgets } from '../../context/BudgetContext';
import { useAuth } from '../../context/AuthContext';
import { getCurrencySymbol } from '../../utils/currency';

interface BudgetFormProps {
  onClose: () => void;
  existingBudget?: Budget | null;
}

const DEFAULT_CATEGORIES = [
  'Food',
  'Housing',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Shopping',
  'Health',
  'Personal',
  'Other',
];

const BudgetForm: React.FC<BudgetFormProps> = ({ onClose, existingBudget }) => {
  const { addBudget, updateBudget } = useBudgets();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    amount: string;
    period: 'weekly' | 'monthly';
    start_date: string;
    category: string;
    customCategory?: string;
  }>({
    name: '',
    amount: '',
    period: 'monthly',
    start_date: new Date().toISOString().split('T')[0],
    category: '',
    customCategory: '',
  });

  const currency = userProfile?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  useEffect(() => {
    if (existingBudget) {
      setFormData({
        name: existingBudget.name,
        amount: existingBudget.amount.toString(),
        period: existingBudget.period,
        start_date: existingBudget.start_date,
        category: existingBudget.category || '',
        customCategory: existingBudget.category && !DEFAULT_CATEGORIES.includes(existingBudget.category)
          ? existingBudget.category
          : '',
      });
    }
  }, [existingBudget]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const finalCategory = formData.category === 'Other' && formData.customCategory 
      ? formData.customCategory 
      : formData.category;

    try {
      const budgetData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        period: formData.period,
        start_date: formData.start_date,
        category: finalCategory || undefined,
      };

      if (existingBudget) {
        await updateBudget({
          ...budgetData,
          id: existingBudget.id,
        });
      } else {
        await addBudget(budgetData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving budget', error);
      // Would handle error display to user in a production app
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Budget Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="e.g., Monthly Budget, Groceries, etc."
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Budget Amount
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{currencySymbol}</span>
          </div>
          <input
            type="number"
            name="amount"
            id="amount"
            min="1"
            step="1"
            required
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
            placeholder="0"
            value={formData.amount}
            onChange={handleChange}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{currency}</span>
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="period" className="block text-sm font-medium text-gray-700">
          Period
        </label>
        <select
          id="period"
          name="period"
          className="mt-1 block w-full bg-white rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
          value={formData.period}
          onChange={handleChange}
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
          Start Date
        </label>
        <input
          type="date"
          name="start_date"
          id="start_date"
          required
          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          value={formData.start_date}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category (Optional)
        </label>
        <select
          id="category"
          name="category"
          className="mt-1 block w-full bg-white rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="">No Category (Overall Budget)</option>
          {DEFAULT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
          <option value="Other">Other (Custom)</option>
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

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {existingBudget ? 'Update' : 'Create'} Budget
        </Button>
      </div>
    </form>
  );
};

export default BudgetForm;