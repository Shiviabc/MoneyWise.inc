import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  PiggyBank, 
  Settings, 
  X,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
} from 'lucide-react';

interface SidebarProps {
  mobile?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ mobile, onClose }) => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Income', href: '/income', icon: DollarSign },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Budgets', href: '/budgets', icon: PiggyBank },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <Wallet className="h-8 w-8 text-primary-600" />
          <span className="ml-2 text-lg font-semibold text-gray-900">MoneyWise</span>
        </div>
        {mobile && (
          <button
            type="button"
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <X size={24} />
          </button>
        )}
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon
                className={({ isActive }: { isActive: boolean }) =>
                  `mr-3 h-5 w-5 ${
                    isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`
                }
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="bg-primary-50 rounded-lg p-3">
          <h3 className="text-sm font-medium text-primary-800">Monthly Summary</h3>
          <div className="mt-2 space-y-2">
            <div className="flex justify-between text-xs">
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                <span>Income</span>
              </div>
              <span className="font-medium">$3,240</span>
            </div>
            <div className="flex justify-between text-xs">
              <div className="flex items-center text-red-600">
                <ArrowDownLeft className="w-3 h-3 mr-1" />
                <span>Expenses</span>
              </div>
              <span className="font-medium">$2,185</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;