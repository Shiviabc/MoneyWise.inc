import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Income from './pages/Income';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import PrivateRoute from './components/auth/PrivateRoute';
import { TransactionProvider } from './context/TransactionContext';
import { BudgetProvider } from './context/BudgetContext';
import { IncomeProvider } from './context/IncomeContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <BudgetProvider>
          <IncomeProvider>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<PrivateRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="budgets" element={<Budgets />} />
                  <Route path="income" element={<Income />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Route>
            </Routes>
          </IncomeProvider>
        </BudgetProvider>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;