import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, DollarSign, PiggyBank, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import { useTransactions } from '../context/TransactionContext';
import { useBudgets } from '../context/BudgetContext';
import { useIncome } from '../context/IncomeContext';
import { useAuth } from '../context/AuthContext';
import { CategoryTotal, ChartData } from '../types';
import { formatCurrency } from '../utils/currency';

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6', '#F97316', '#84CC16'];

const CATEGORY_COLORS: Record<string, string> = {
  // Food & Dining
  'Food': '#10B981',
  'Groceries': '#059669',
  'Restaurants': '#047857',
  'Fast Food': '#065F46',
  
  // Housing & Utilities
  'Housing': '#3B82F6',
  'Rent': '#2563EB',
  'Mortgage': '#1D4ED8',
  'Utilities': '#1E40AF',
  'Internet': '#1E3A8A',
  'Phone': '#172554',
  
  // Transportation
  'Transportation': '#8B5CF6',
  'Gas': '#7C3AED',
  'Car Payment': '#6D28D9',
  'Public Transit': '#5B21B6',
  'Uber/Lyft': '#4C1D95',
  
  // Entertainment & Lifestyle
  'Entertainment': '#F59E0B',
  'Movies': '#D97706',
  'Streaming': '#B45309',
  'Gaming': '#92400E',
  'Hobbies': '#78350F',
  
  // Shopping & Personal
  'Shopping': '#EF4444',
  'Clothing': '#DC2626',
  'Electronics': '#B91C1C',
  'Personal Care': '#991B1B',
  'Beauty': '#7F1D1D',
  
  // Health & Fitness
  'Health': '#EC4899',
  'Medical': '#DB2777',
  'Pharmacy': '#BE185D',
  'Gym': '#9D174D',
  'Fitness': '#831843',
  
  // Education & Work
  'Education': '#6366F1',
  'Books': '#4F46E5',
  'Courses': '#4338CA',
  'Work Expenses': '#3730A3',
  
  // Financial & Insurance
  'Insurance': '#14B8A6',
  'Investment': '#0D9488',
  'Savings': '#0F766E',
  'Taxes': '#115E59',
  
  // Income Categories
  'Salary': '#047857',
  'Side Hustle': '#1D4ED8',
  'Investments': '#7E22CE',
  'Freelance': '#059669',
  'Bonus': '#0891B2',
  'Gifts': '#DC2626',
  
  // Miscellaneous
  'Personal': '#F97316',
  'Travel': '#EA580C',
  'Gifts & Donations': '#C2410C',
  'Other': '#9A3412',
};

const Dashboard: React.FC = () => {
  const { transactions, getTotalByType, getCategoryTotals } = useTransactions();
  const { budgets, getTotalBudget, getRemainingBudget } = useBudgets();
  const { getTotalMonthlyIncome } = useIncome();
  const { userProfile } = useAuth();

  const currency = userProfile?.currency || 'USD';

  const totalIncome = getTotalByType('income');
  const totalExpenses = getTotalByType('expense');
  const monthlyIncomeFromSources = getTotalMonthlyIncome();
  const netBalance = (totalIncome + monthlyIncomeFromSources) - totalExpenses;
  const budgetTotal = getTotalBudget();
  const budgetRemaining = getRemainingBudget();
  const budgetUsedPercentage = budgetTotal > 0 
    ? Math.min(Math.floor(((budgetTotal - budgetRemaining) / budgetTotal) * 100), 100)
    : 0;

  const expenseCategories: CategoryTotal[] = getCategoryTotals('expense');
  const incomeCategories: CategoryTotal[] = getCategoryTotals('income');

  // Enhanced pie chart data with better categorization and real expense data
  const pieData: ChartData[] = expenseCategories
    .filter(category => category.amount > 0) // Only show categories with actual expenses
    .sort((a, b) => b.amount - a.amount) // Sort by amount descending
    .map((category, index) => ({
      name: category.category,
      value: category.amount,
      color: CATEGORY_COLORS[category.category] || COLORS[index % COLORS.length],
      percentage: ((category.amount / totalExpenses) * 100).toFixed(1),
    }));

  // Enhanced bar chart data with actual expense breakdown by category
  const getMonthlyData = () => {
    const monthlyData = new Map();
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    // Initialize months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      monthlyData.set(monthKey, { 
        name: monthKey,
        income: 0, 
        totalExpenses: 0,
        // Initialize all expense categories
        food: 0,
        housing: 0,
        transportation: 0,
        entertainment: 0,
        shopping: 0,
        health: 0,
        other: 0
      });
    }

    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      if (date >= sixMonthsAgo) {
        const monthKey = date.toLocaleString('default', { month: 'short' });
        const currentData = monthlyData.get(monthKey);
        
        if (currentData) {
          if (transaction.type === 'income') {
            currentData.income += transaction.amount;
          } else {
            currentData.totalExpenses += transaction.amount;
            
            // Categorize expenses based on actual transaction categories
            const category = transaction.category.toLowerCase();
            if (category.includes('food') || category.includes('groceries') || category.includes('restaurant') || category.includes('dining')) {
              currentData.food += transaction.amount;
            } else if (category.includes('housing') || category.includes('rent') || category.includes('utilities') || category.includes('mortgage')) {
              currentData.housing += transaction.amount;
            } else if (category.includes('transportation') || category.includes('gas') || category.includes('car') || category.includes('uber') || category.includes('taxi')) {
              currentData.transportation += transaction.amount;
            } else if (category.includes('entertainment') || category.includes('movies') || category.includes('streaming') || category.includes('gaming')) {
              currentData.entertainment += transaction.amount;
            } else if (category.includes('shopping') || category.includes('clothing') || category.includes('electronics') || category.includes('retail')) {
              currentData.shopping += transaction.amount;
            } else if (category.includes('health') || category.includes('medical') || category.includes('pharmacy') || category.includes('doctor')) {
              currentData.health += transaction.amount;
            } else {
              currentData.other += transaction.amount;
            }
          }
          
          monthlyData.set(monthKey, currentData);
        }
      }
    });

    return Array.from(monthlyData.values());
  };

  const monthlyData = getMonthlyData();

  const formatCurrencyValue = (amount: number) => formatCurrency(amount, currency);

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Custom tooltip for pie chart
  const renderPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrencyValue(data.value)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 p-2 rounded-lg bg-green-100">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-gray-500 text-sm">Total Income</h3>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrencyValue(totalIncome + monthlyIncomeFromSources)}
            </div>
            <div className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>
                {monthlyIncomeFromSources > 0 && `${formatCurrencyValue(monthlyIncomeFromSources)} from sources`}
              </span>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 p-2 rounded-lg bg-red-100">
                <ArrowDownLeft className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-gray-500 text-sm">Total Expenses</h3>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrencyValue(totalExpenses)}
            </div>
            <div className="text-xs text-red-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>Monthly Expenses</span>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 p-2 rounded-lg bg-primary-100">
                <DollarSign className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-gray-500 text-sm">Net Balance</h3>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrencyValue(netBalance)}
            </div>
            <div className={`text-xs mt-1 flex items-center ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netBalance >= 0 ? '+' : ''}{formatCurrencyValue(netBalance)}
            </div>
          </div>
        </Card>

        <Card className="flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 p-2 rounded-lg bg-secondary-100">
                <PiggyBank className="h-6 w-6 text-secondary-600" />
              </div>
              <h3 className="text-gray-500 text-sm">Budget Remaining</h3>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold text-gray-900">
              {formatCurrencyValue(budgetRemaining)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-300 ${budgetUsedPercentage > 80 ? 'bg-red-600' : 'bg-primary-600'}`}
                style={{ width: `${budgetUsedPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {budgetUsedPercentage}% of budget used
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1" title="Monthly Expense Breakdown">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrencyValue(value as number)} 
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Bar dataKey="income" name="Income" fill="#047857" radius={[2, 2, 0, 0]} />
                <Bar dataKey="food" name="Food & Dining" fill="#10B981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="housing" name="Housing & Utilities" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="transportation" name="Transportation" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="entertainment" name="Entertainment" fill="#F59E0B" radius={[2, 2, 0, 0]} />
                <Bar dataKey="shopping" name="Shopping" fill="#EF4444" radius={[2, 2, 0, 0]} />
                <Bar dataKey="health" name="Health & Medical" fill="#EC4899" radius={[2, 2, 0, 0]} />
                <Bar dataKey="other" name="Other" fill="#6B7280" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="col-span-1" title="Expense Categories Distribution">
          <div className="h-80 flex flex-col">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderPieLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={renderPieTooltip} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Legend */}
                <div className="mt-2 max-h-20 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {pieData.slice(0, 8).map((entry, index) => (
                      <div key={`legend-${index}`} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="truncate" title={entry.name}>
                          {entry.name} ({entry.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                  {pieData.length > 8 && (
                    <div className="text-center text-xs text-gray-500 mt-1">
                      +{pieData.length - 8} more categories
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <PiggyBank className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No expense data available</p>
                  <p className="text-sm text-gray-400">Add some transactions to see the breakdown</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Category Breakdown Summary */}
      {expenseCategories.length > 0 && (
        <Card title="Top Expense Categories">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.slice(0, 6).map((category, index) => {
              const percentage = ((category.amount / totalExpenses) * 100).toFixed(1);
              const color = CATEGORY_COLORS[category.category] || COLORS[index % COLORS.length];
              
              return (
                <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: color }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{category.category}</p>
                      <p className="text-sm text-gray-500">{percentage}% of expenses</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrencyValue(category.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent Transactions */}
      <Card title="Recent Transactions">
        <div className="overflow-hidden">
          {recentTransactions.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span 
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        style={{
                          backgroundColor: CATEGORY_COLORS[transaction.category] ? `${CATEGORY_COLORS[transaction.category]}20` : '#E5E7EB',
                          color: CATEGORY_COLORS[transaction.category] || '#374151'
                        }}
                      >
                        {transaction.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrencyValue(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <ArrowUpRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">Add some transactions to see them here</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;