import React from 'react';
import { Home, Wallet, Sparkles, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', name: 'Anasayfa', icon: Home },
  { id: 'holdings', name: 'Varlıklar', icon: Wallet },
  { id: 'ai-tools', name: 'Yapay Zeka', icon: Sparkles },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    if (window.confirm('Çıkış yapmak istediğinizden emin misiniz?')) {
      await signOut();
    }
  };

  return (
    <>
      {/* Top bar for logout */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex justify-end">
        <button
          onClick={handleSignOut}
          className="text-gray-600 hover:text-red-600 flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Çıkış</span>
        </button>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
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
                <Icon className={`h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                <span className={`text-xs font-medium truncate ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}