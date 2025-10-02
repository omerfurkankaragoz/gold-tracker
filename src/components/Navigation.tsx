import React from 'react';
import { Home, Wallet, AreaChart, User, WalletMinimal, WalletMinimalIcon, TrendingUpDown, UserRoundCog, ChartCandlestick, Landmark, HandCoins, ChartSpline, CandlestickChart } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', name: 'Piyasalar', icon: CandlestickChart },
  { id: 'holdings', name: 'Varlıklarım', icon: WalletMinimal },
  { id: 'insights', name: 'Panelim', icon: ChartSpline },
  { id: 'profile', name: 'Ayarlar', icon: UserRoundCog },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    // ======================= GÜNCELLENEN BÖLÜM =======================
    // Arka plan renkleri yeni Apple renk paletiyle güncellendi ve alt boşluk eklendi.
    <div 
      className="fixed bottom-0 left-0 right-0 bg-apple-light-bg/80 dark:bg-apple-dark-card/80 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 z-50"
    >
      <div 
        className="flex justify-around items-center max-w-md mx-auto pt-3"
        // Stil, güvenli alan boşluğunu (iPhone'lardaki alt çubuk gibi) içerecek şekilde güncellendi.
        style={{ paddingBottom: `calc( env(safe-area-inset-bottom))` }}
      >
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