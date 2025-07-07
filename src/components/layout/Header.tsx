import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
              onClick={onMenuClick}
            >
              <Menu size={24} />
            </button>
            <div className="ml-4 md:ml-0">
              <h1 className="text-lg font-semibold text-primary-800">MoneyWise Inc</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-primary-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <span className="sr-only">View notifications</span>
              <Bell size={20} />
            </button>
            <Link 
              to="/profile"
              className="bg-primary-100 text-primary-800 flex text-sm rounded-full p-2 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <span className="sr-only">View profile</span>
              <User size={18} />
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Logout"
            >
              <span className="sr-only">Logout</span>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;