import React, { useState, useEffect } from 'react';
import { IncomeSource, BankAccount } from '../../types';
import Button from '../ui/Button';
import { useIncome } from '../../context/IncomeContext';
import { useAuth } from '../../context/AuthContext';
import { getCurrencySymbol } from '../../utils/currency';

interface IncomeSourceFormProps {
  onClose: () => void;
  existingIncomeSource?: IncomeSource | null;
}

const IncomeSourceForm: React.FC<IncomeSourceFormProps> = ({ onClose, existingIncomeSource }) => {
  const { addIncomeSource, updateIncomeSource, bankAccounts } = useIncome();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    amount: string;
    frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually';
    source_type: 'manual' | 'bank' | 'employer';
    bank_account_id?: string;
    is_active: boolean;
    next_payment_date?: string;
  }>({
    name: '',
    amount: '',
    frequency: 'monthly',
    source_type: 'manual',
    is_active: true,
  });

  const currency = userProfile?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currency);

  useEffect(() => {
    if (existingIncomeSource) {
      setFormData({
        name: existingIncomeSource.name,
        amount: existingIncomeSource.amount.toString(),
        frequency: existingIncomeSource.frequency,
        source_type: existingIncomeSource.source_type,
        bank_account_id: existingIncomeSource.bank_account_id || '',
        is_active: existingIncomeSource.is_active,
        next_payment_date: existingIncomeSource.next_payment_date || '',
      });
    }
  }, [existingIncomeSource]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const incomeSourceData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        frequency: formData.frequency,
        source_type: formData.source_type,
        bank_account_id: formData.bank_account_id || undefined,
        is_active: formData.is_active,
        next_payment_date: formData.next_payment_date || undefined,
      };

      if (existingIncomeSource) {
        await updateIncomeSource({
          ...incomeSourceData,
          id: existingIncomeSource.id,
          user_id: existingIncomeSource.user_id,
          created_at: existingIncomeSource.created_at,
          updated_at: existingIncomeSource.updated_at,
        });
      } else {
        await addIncomeSource(incomeSourceData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving income source:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Income Source Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="e.g., Main Job, Side Hustle, Freelance"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

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
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">
          Payment Frequency
        </label>
        <select
          id="frequency"
          name="frequency"
          className="mt-1 block w-full bg-white rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
          value={formData.frequency}
          onChange={handleChange}
        >
          <option value="weekly">Weekly</option>
          <option value="bi-weekly">Bi-weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="annually">Annually</option>
        </select>
      </div>

      <div>
        <label htmlFor="source_type" className="block text-sm font-medium text-gray-700">
          Source Type
        </label>
        <select
          id="source_type"
          name="source_type"
          className="mt-1 block w-full bg-white rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
          value={formData.source_type}
          onChange={handleChange}
        >
          <option value="manual">Manual Entry</option>
          <option value="employer">Employer Direct Deposit</option>
          <option value="bank">Bank Account</option>
        </select>
      </div>

      {formData.source_type === 'bank' && (
        <div>
          <label htmlFor="bank_account_id" className="block text-sm font-medium text-gray-700">
            Bank Account
          </label>
          <select
            id="bank_account_id"
            name="bank_account_id"
            className="mt-1 block w-full bg-white rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
            value={formData.bank_account_id}
            onChange={handleChange}
          >
            <option value="">Select a bank account</option>
            {bankAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.bank_name} - {account.account_name} ({account.account_number_masked})
              </option>
            ))}
          </select>
        </div>
      )}

      {(formData.frequency === 'weekly' || formData.frequency === 'bi-weekly' || formData.frequency === 'monthly') && (
        <div>
          <label htmlFor="next_payment_date" className="block text-sm font-medium text-gray-700">
            Next Payment Date (Optional)
          </label>
          <input
            type="date"
            name="next_payment_date"
            id="next_payment_date"
            className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            value={formData.next_payment_date}
            onChange={handleChange}
          />
        </div>
      )}

      <div className="flex items-center">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          checked={formData.is_active}
          onChange={handleChange}
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
          Active income source
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {existingIncomeSource ? 'Update' : 'Add'} Income Source
        </Button>
      </div>
    </form>
  );
};

export default IncomeSourceForm;