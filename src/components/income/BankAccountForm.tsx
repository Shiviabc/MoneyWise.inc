import React, { useState, useEffect } from 'react';
import { BankAccount } from '../../types';
import Button from '../ui/Button';
import { useIncome } from '../../context/IncomeContext';

interface BankAccountFormProps {
  onClose: () => void;
  existingBankAccount?: BankAccount | null;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ onClose, existingBankAccount }) => {
  const { addBankAccount, updateBankAccount } = useIncome();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    bank_name: string;
    account_name: string;
    account_type: 'checking' | 'savings' | 'credit';
    account_number_masked: string;
  }>({
    bank_name: '',
    account_name: '',
    account_type: 'checking',
    account_number_masked: '',
  });

  useEffect(() => {
    if (existingBankAccount) {
      setFormData({
        bank_name: existingBankAccount.bank_name,
        account_name: existingBankAccount.account_name,
        account_type: existingBankAccount.account_type,
        account_number_masked: existingBankAccount.account_number_masked,
      });
    }
  }, [existingBankAccount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const maskAccountNumber = (accountNumber: string) => {
    // Mask all but last 4 digits
    if (accountNumber.length <= 4) return accountNumber;
    return '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-4);
  };

  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    setFormData({
      ...formData,
      account_number_masked: maskAccountNumber(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const bankAccountData = {
        bank_name: formData.bank_name,
        account_name: formData.account_name,
        account_type: formData.account_type,
        account_number_masked: formData.account_number_masked,
        is_connected: false,
        last_sync: '',
      };

      if (existingBankAccount) {
        await updateBankAccount({
          ...bankAccountData,
          id: existingBankAccount.id,
          user_id: existingBankAccount.user_id,
          is_connected: existingBankAccount.is_connected,
          last_sync: existingBankAccount.last_sync,
          created_at: existingBankAccount.created_at,
          updated_at: existingBankAccount.updated_at,
        });
      } else {
        await addBankAccount(bankAccountData);
      }

      onClose();
    } catch (error) {
      console.error('Error saving bank account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">
          Bank Name
        </label>
        <input
          type="text"
          name="bank_name"
          id="bank_name"
          required
          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="e.g., Chase, Bank of America, Wells Fargo"
          value={formData.bank_name}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="account_name" className="block text-sm font-medium text-gray-700">
          Account Nickname
        </label>
        <input
          type="text"
          name="account_name"
          id="account_name"
          required
          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="e.g., Main Checking, Savings Account"
          value={formData.account_name}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="account_type" className="block text-sm font-medium text-gray-700">
          Account Type
        </label>
        <select
          id="account_type"
          name="account_type"
          className="mt-1 block w-full bg-white rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm"
          value={formData.account_type}
          onChange={handleChange}
        >
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
          <option value="credit">Credit</option>
        </select>
      </div>

      <div>
        <label htmlFor="account_number" className="block text-sm font-medium text-gray-700">
          Account Number
        </label>
        <input
          type="text"
          name="account_number"
          id="account_number"
          required
          className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          placeholder="Enter account number"
          onChange={handleAccountNumberChange}
        />
        <p className="mt-1 text-xs text-gray-500">
          Your account number will be masked for security (only last 4 digits visible)
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Bank Integration Coming Soon
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                We're working on secure bank integration using industry-standard services like Plaid. 
                For now, you can add your bank account details and manually sync transactions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {existingBankAccount ? 'Update' : 'Add'} Bank Account
        </Button>
      </div>
    </form>
  );
};

export default BankAccountForm;