import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Create a Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Placeholder database (will be replaced by Supabase in production)
let transactions = [
  {
    id: '1',
    amount: 2500,
    description: 'Salary',
    date: '2025-06-01',
    type: 'income',
    category: 'Salary',
  },
  {
    id: '2',
    amount: 800,
    description: 'Rent',
    date: '2025-06-05',
    type: 'expense',
    category: 'Housing',
  },
];

let budgets = [
  {
    id: '1',
    name: 'Monthly Budget',
    amount: 3000,
    period: 'monthly',
    startDate: '2025-06-01',
  },
];

// TRANSACTION ROUTES

// Get all transactions
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

// Get transaction by ID
app.get('/api/transactions/:id', (req, res) => {
  const transaction = transactions.find(t => t.id === req.params.id);
  if (!transaction) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  res.json(transaction);
});

// Create transaction
app.post('/api/transactions', (req, res) => {
  const { amount, description, date, type, category } = req.body;
  
  if (!amount || !description || !date || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newTransaction = {
    id: uuidv4(),
    amount: parseFloat(amount),
    description,
    date,
    type,
    category: category || 'Uncategorized',
  };
  
  transactions.push(newTransaction);
  res.status(201).json(newTransaction);
});

// Update transaction
app.put('/api/transactions/:id', (req, res) => {
  const { amount, description, date, type, category } = req.body;
  
  const index = transactions.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  
  transactions[index] = {
    ...transactions[index],
    amount: amount ? parseFloat(amount) : transactions[index].amount,
    description: description || transactions[index].description,
    date: date || transactions[index].date,
    type: type || transactions[index].type,
    category: category || transactions[index].category,
  };
  
  res.json(transactions[index]);
});

// Delete transaction
app.delete('/api/transactions/:id', (req, res) => {
  const index = transactions.findIndex(t => t.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  
  transactions.splice(index, 1);
  res.status(204).send();
});

// BUDGET ROUTES

// Get all budgets
app.get('/api/budgets', (req, res) => {
  res.json(budgets);
});

// Get budget by ID
app.get('/api/budgets/:id', (req, res) => {
  const budget = budgets.find(b => b.id === req.params.id);
  if (!budget) {
    return res.status(404).json({ error: 'Budget not found' });
  }
  res.json(budget);
});

// Create budget
app.post('/api/budgets', (req, res) => {
  const { name, amount, period, startDate, category } = req.body;
  
  if (!name || !amount || !period || !startDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newBudget = {
    id: uuidv4(),
    name,
    amount: parseFloat(amount),
    period,
    startDate,
    category,
  };
  
  budgets.push(newBudget);
  res.status(201).json(newBudget);
});

// Update budget
app.put('/api/budgets/:id', (req, res) => {
  const { name, amount, period, startDate, category } = req.body;
  
  const index = budgets.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Budget not found' });
  }
  
  budgets[index] = {
    ...budgets[index],
    name: name || budgets[index].name,
    amount: amount ? parseFloat(amount) : budgets[index].amount,
    period: period || budgets[index].period,
    startDate: startDate || budgets[index].startDate,
    category: category !== undefined ? category : budgets[index].category,
  };
  
  res.json(budgets[index]);
});

// Delete budget
app.delete('/api/budgets/:id', (req, res) => {
  const index = budgets.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Budget not found' });
  }
  
  budgets.splice(index, 1);
  res.status(204).send();
});

// SUMMARY ROUTES

// Get financial summary
app.get('/api/summary', (req, res) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const mainBudget = budgets.find(b => !b.category) || budgets[0];
  const budgetAmount = mainBudget ? mainBudget.amount : 0;
  
  // Get spending by category
  const categories = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.amount;
    });
  
  const spendingByCategory = Object.entries(categories).map(([category, amount]) => ({
    category,
    amount,
  }));
  
  // Get recent transactions
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  res.json({
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    budgetAmount,
    budgetRemaining: Math.max(budgetAmount - totalExpenses, 0),
    spendingByCategory,
    recentTransactions,
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;