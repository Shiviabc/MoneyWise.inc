import React, { useState } from 'react';
import { Plus, Edit2, Trash2, DollarSign, Building2, CreditCard, RefreshCw, Link } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useIncome } from '../context/IncomeContext';
import { IncomeSource, BankAccount } from '../types';
import IncomeSourceForm from '../components/income/IncomeSourceForm';
import BankAccountForm from '../components/income/BankAccountForm';

const Income: React.FC = () => {
  const { 
    incomeSources, 
    bankAccounts, 
    deleteIncomeSource, 
    deleteBankAccount, 
    connectBankAccount, 
    syncBankAccount,
    getTotalMonthlyIncome 
  } = useIncome();
  
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [editIncomeSource, setEditIncomeSource] = useState<IncomeSource | null>(null);
  const [editBankAccount, setEditBankAccount] = useState<BankAccount | null>(null);

  const handleEditIncomeSource = (incomeSource: IncomeSource) => {
    setEditIncomeSource(incomeSource);
    setShowIncomeForm(true);
  };

  const handleEditBankAccount = (bankAccount: BankAccount) => {
    setEditBankAccount(bankAccount);
    setShowBankForm(true);
  };

  const handleDeleteIncomeSource = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this income source?')) {
      await deleteIncomeSource(id);
    }
  };

  const handleDeleteBankAccount = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      await deleteBankAccount(id);
    }
  };

  const handleConnectBank = async (id: string) => {
    try {
      await connectBankAccount(id);
      // In a real app, this would open Plaid Link or similar
      alert('Bank account connected successfully! (Demo mode)');
    } catch (error) {
      console.error('Error connecting bank account:', error);
    }
  };

  const handleSyncBank = async (id: string) => {
    try {
      await syncBankAccount(id);
      alert('Bank account synced successfully! (Demo mode)');
    } catch (error) {
      console.error('Error syncing bank account:', error);
    }
  };

  const handleFormClose = () => {
    setShowIncomeForm(false);
    setShowBankForm(false);
    setEditIncomeSource(null);
    setEditBankAccount(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getFrequencyDisplay = (frequency: string) => {
    const frequencies: Record<string, string> = {
      weekly: 'Weekly',
      'bi-weekly': 'Bi-weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      annually: 'Annually',
    };
    return frequencies[frequency] || frequency;
  };

  const getSourceTypeIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'bank':
        return <Building2 className="h-5 w-5" />;
      case 'employer':
        return <DollarSign className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'credit':
        return <CreditCard className="h-5 w-5" />;
      default:
        return <Building2 className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Income Management</h1>
        <div className="mt-2 sm:mt-0 flex space-x-2">
          <Button 
            variant="outline" 
            size="md" 
            icon={<Building2 size={16} />}
            onClick={() => setShowBankForm(true)}
          >
            Add Bank Account
          </Button>
          <Button 
            variant="primary" 
            size="md" 
            icon={<Plus size={16} />}
            onClick={() => setShowIncomeForm(true)}
          >
            Add Income Source
          </Button>
        </div>
      </div>

      {/* Income Summary */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Total Monthly Income</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {formatCurrency(getTotalMonthlyIncome())}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              From {incomeSources.filter(source => source.is_active).length} active sources
            </p>
          </div>
          <div className="text-green-600">
            <DollarSign className="h-12 w-12" />
          </div>
        </div>
      </Card>

      {/* Income Sources */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Income Sources</h2>
          <Button 
            variant="primary" 
            size="sm" 
            icon={<Plus size={16} />}
            onClick={() => setShowIncomeForm(true)}
          >
            Add Source
          </Button>
        </div>

        <div className="space-y-4">
          {incomeSources.map((source) => (
            <div key={source.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${source.is_active ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {getSourceTypeIcon(source.source_type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{source.name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(source.amount)} • {getFrequencyDisplay(source.frequency)}
                      {!source.is_active && ' • Inactive'}
                    </p>
                    {source.next_payment_date && (
                      <p className="text-xs text-gray-400">
                        Next payment: {new Date(source.next_payment_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditIncomeSource(source)}
                    className="text-primary-600 hover:text-primary-900 p-2 rounded-full hover:bg-primary-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteIncomeSource(source.id)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {incomeSources.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No income sources added yet</p>
              <Button
                variant="primary"
                icon={<Plus size={16} />}
                onClick={() => setShowIncomeForm(true)}
              >
                Add Your First Income Source
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Bank Accounts */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Bank Accounts</h2>
          <Button 
            variant="outline" 
            size="sm" 
            icon={<Plus size={16} />}
            onClick={() => setShowBankForm(true)}
          >
            Add Account
          </Button>
        </div>

        <div className="space-y-4">
          {bankAccounts.map((account) => (
            <div key={account.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${account.is_connected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {getAccountTypeIcon(account.account_type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{account.account_name}</h3>
                    <p className="text-sm text-gray-500">
                      {account.bank_name} • {account.account_number_masked}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        account.is_connected 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {account.is_connected ? 'Connected' : 'Not Connected'}
                      </span>
                      {account.last_sync && (
                        <span className="text-xs text-gray-400">
                          Last sync: {new Date(account.last_sync).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {!account.is_connected ? (
                    <button
                      onClick={() => handleConnectBank(account.id)}
                      className="text-primary-600 hover:text-primary-900 p-2 rounded-full hover:bg-primary-50"
                      title="Connect Account"
                    >
                      <Link className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSyncBank(account.id)}
                      className="text-secondary-600 hover:text-secondary-900 p-2 rounded-full hover:bg-secondary-50"
                      title="Sync Account"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEditBankAccount(account)}
                    className="text-primary-600 hover:text-primary-900 p-2 rounded-full hover:bg-primary-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBankAccount(account.id)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {bankAccounts.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No bank accounts added yet</p>
              <Button
                variant="outline"
                icon={<Plus size={16} />}
                onClick={() => setShowBankForm(true)}
              >
                Add Your First Bank Account
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Income Source Form Modal */}
      {showIncomeForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editIncomeSource ? 'Edit Income Source' : 'Add Income Source'}
                </h2>
                <button
                  onClick={handleFormClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <IncomeSourceForm 
                onClose={handleFormClose} 
                existingIncomeSource={editIncomeSource} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Bank Account Form Modal */}
      {showBankForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editBankAccount ? 'Edit Bank Account' : 'Add Bank Account'}
                </h2>
                <button
                  onClick={handleFormClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <BankAccountForm 
                onClose={handleFormClose} 
                existingBankAccount={editBankAccount} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;