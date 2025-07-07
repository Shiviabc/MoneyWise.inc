import React, { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    currency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    theme: 'light',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await updateProfile({
        currency: formData.currency,
        date_format: formData.dateFormat,
        theme: formData.theme,
      });
      // Show success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to update settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Display Currency
            </label>
            <select
              id="currency"
              name="currency"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="USD">USD - US Dollar ($)</option>
              <option value="INR">INR - Indian Rupee (₹)</option>
              <option value="EUR">EUR - Euro (€)</option>
              <option value="GBP">GBP - British Pound (£)</option>
              <option value="CAD">CAD - Canadian Dollar (C$)</option>
              <option value="AUD">AUD - Australian Dollar (A$)</option>
              <option value="JPY">JPY - Japanese Yen (¥)</option>
              <option value="CNY">CNY - Chinese Yuan (¥)</option>
            </select>
          </div>

          <div>
            <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-1">
              Date Format
            </label>
            <select
              id="dateFormat"
              name="dateFormat"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.dateFormat}
              onChange={handleChange}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (International)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO Format)</option>
              <option value="DD-MM-YYYY">DD-MM-YYYY (Indian Format)</option>
            </select>
          </div>

          <div>
            <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
              Theme
            </label>
            <select
              id="theme"
              name="theme"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={formData.theme}
              onChange={handleChange}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>

          <div className="mt-6">
            <Button 
              type="submit" 
              variant="primary" 
              icon={<Save size={16} />}
              isLoading={isLoading}
            >
              Save Settings
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h2>
        
        <p className="text-sm text-gray-500 mb-4">
          Manage your financial data. You can export your data or reset your account.
        </p>
        
        <div className="space-y-3">
          <Button variant="outline">
            Export All Data
          </Button>
          
          <div className="pt-3 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-1">Danger Zone</h3>
            <p className="text-xs text-gray-500 mb-2">
              These actions cannot be undone. Please proceed with caution.
            </p>
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                className="border-red-300 text-red-700 hover:bg-red-50"
                icon={<RefreshCw size={16} />}
              >
                Reset All Data
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">About MoneyWise Inc</h2>
        <p className="text-sm text-gray-500">
          MoneyWise Inc is a personal finance tracking application designed to help you manage your income, expenses, and budgets.
        </p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">Version: 0.1.0 (Beta)</p>
          <p className="text-sm text-gray-500 mt-1">© 2025 MoneyWise Inc. All rights reserved.</p>
        </div>
      </Card>
    </div>
  );
};

export default Settings;