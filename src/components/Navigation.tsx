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
    // ======================= GÜNCELLENEN BÖLÜM =======================
    // Arka plan renkleri yeni Apple renk paletiyle güncellendi
    <div 
      className="fixed bottom-0 left-0 right-0 bg-apple-light-bg/80 dark:bg-apple-dark-card/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 z-50"
      style={{ paddingTop: '0.75rem', paddingBottom: `calc(0.75rem` }}
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 transition-colors w-20 h-12 ${
                isActive
                  ? 'text-apple-blue'
                  : 'text-apple-light-text-secondary dark:text-apple-dark-text-secondary hover:text-apple-light-text-primary dark:hover:text-apple-dark-text-primary'
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[11px] font-medium">
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
    // ====================================================================
  );
}