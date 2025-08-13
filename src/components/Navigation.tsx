import React from 'react';
import { Home, Wallet, AreaChart, User } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', name: 'Anasayfa', icon: Home },
  { id: 'holdings', name: 'Varlıklar', icon: Wallet },
  { id: 'insights', name: 'Panelim', icon: AreaChart },
  { id: 'profile', name: 'Profil', icon: User },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors w-16 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}