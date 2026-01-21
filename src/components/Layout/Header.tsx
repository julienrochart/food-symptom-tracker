import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onLogoClick?: () => void;
}

export function Header({ onLogoClick }: HeaderProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 safe-area-top">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={onLogoClick}
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <div className="bg-green-100 w-8 h-8 rounded-full flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">HealthTracker</h1>
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={signOut}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}