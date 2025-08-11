import React from 'react';
import { Home, Wallet, AreaChart, User } from 'lucide-react'; // User ikonunu ekliyoruz

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', name: 'Anasayfa', icon: Home },
  { id: 'holdings', name: 'Varlıklar', icon: Wallet },
  { id: 'insights', name: 'Panelim', icon: AreaChart },
  { id: 'profile', name: 'Profil', icon: User }, // Yeni Profil sekmesi
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors min-w-0 flex-1 ${
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className={`text-xs font-medium ${
                isActive ? 'text-gray-600' : 'text-gray-600'
              }`}>
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}