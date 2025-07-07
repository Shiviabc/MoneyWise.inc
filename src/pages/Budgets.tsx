import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useBudgets } from '../context/BudgetContext';
import { useTransactions } from '../context/TransactionContext';
import { Budget } from '../types';
import BudgetForm from '../components/budgets/BudgetForm';

const Budgets: React.FC = () => {
  const { budgets, deleteBudget, getBudgetProgress } = useBudgets();
  const { getCategoryTotals } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);

  const handleEdit = (budget: Budget) => {
    setEditBudget(budget);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await deleteBudget(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditBudget(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const expenseCategories = getCategoryTotals('expense');

  const getBudgetStatus = (budget: Budget) => {
    const progress = getBudgetProgress(budget.id) * 100;
    let statusColor = 'bg-primary-600';
    
    if (progress > 90) {
      statusColor = 'bg-red-600';
    } else if (progress > 75) {
      statusColor = 'bg-warning-500';
    } else if (progress > 50) {
      statusColor = 'bg-secondary-600';
    }
    
    return {
      progress: Math.min(progress, 100),
      statusColor,
    };
  };

  const getCategorySpent = (category?: string) => {
    if (!category) {
      return expenseCategories.reduce((total, cat) => total + cat.amount, 0);
    }
    
    const categoryData = expenseCategories.find((cat) => cat.category === category);
    return categoryData ? categoryData.amount : 0;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
        <Button 
          variant="primary" 
          size="md" 
          icon={<Plus size={16} />}
          onClick={() => setShowForm(true)}
          className="mt-2 sm:mt-0"
        >
          Create Budget
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {editBudget ? 'Edit Budget' : 'Create New Budget'}
                </h2>
                <button
                  onClick={handleFormClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <BudgetForm 
                onClose={handleFormClose} 
                existingBudget={editBudget} 
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {budgets.map((budget) => {
          const { progress, statusColor } = getBudgetStatus(budget);
          const spent = getCategorySpent(budget.category);
          
          return (
            <Card key={budget.id} className="transform transition-all hover:shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
                  <p className="text-sm text-gray-500">
                    {budget.period === 'monthly' ? 'Monthly' : 'Weekly'} budget
                    {budget.category ? ` for ${budget.category}` : ''}
                  </p>
                </div>
                <div className="mt-2 sm:mt-0 flex space-x-2">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="text-primary-600 hover:text-primary-900 p-2 rounded-full hover:bg-primary-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-2 flex justify-between">
                <span className="text-sm text-gray-500">Budget</span>
                <span className="text-sm font-medium">{formatCurrency(budget.amount)}</span>
              </div>
              
              <div className="mb-2 flex justify-between">
                <span className="text-sm text-gray-500">Spent</span>
                <span className="text-sm font-medium">{formatCurrency(spent)}</span>
              </div>
              
              <div className="mb-2 flex justify-between">
                <span className="text-sm text-gray-500">Remaining</span>
                <span className={`text-sm font-medium ${spent > budget.amount ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(Math.max(budget.amount - spent, 0))}
                </span>
              </div>
              
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${statusColor} h-2 rounded-full transition-all duration-500 ease-in-out`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>{progress.toFixed(0)}% used</span>
                  <span>
                    {spent > budget.amount
                      ? `${formatCurrency(spent - budget.amount)} over budget`
                      : `${formatCurrency(budget.amount - spent)} remaining`}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}

        {budgets.length === 0 && (
          <Card className="text-center py-10">
            <p className="text-gray-500 mb-4">You haven't created any budgets yet</p>
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setShowForm(true)}
            >
              Create Your First Budget
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Budgets;