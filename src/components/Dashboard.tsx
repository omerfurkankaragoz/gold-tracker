// Konum: src/components/Dashboard.tsx

import React from 'react'; // useState import'u kaldırıldı
import { DollarSign, Euro, Coins, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { PriceCard } from './PriceCard';
import { usePrices } from '../hooks/usePrices';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { Investment } from '../lib/supabase';
import { Price } from '../hooks/usePrices';

// ================= DEĞİŞİKLİK 1: PROPLAR GÜNCELLENDİ =================
interface DashboardProps {
  onNavigate: (tab: string) => void;
  onAddInvestment: (type: Investment['type']) => void;
  isBalanceVisible: boolean;
  setIsBalanceVisible: (isVisible: boolean) => void;
}

export function Dashboard({ onNavigate, onAddInvestment, isBalanceVisible, setIsBalanceVisible }: DashboardProps) {
// =========================================================================
  const { prices, lastUpdated } = usePrices();
  const { investments, totalPortfolioValue } = useInvestmentsContext();

  // YEREL STATE KALDIRILDI
  
  const handleCardClick = (type: Investment['type']) => {
    onAddInvestment(type);
  };

  const totalInvested = investments.reduce((total, inv) =>
    total + (inv.amount * inv.purchase_price), 0
  );
  const totalGain = totalPortfolioValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const priceCardsToShow = Object.entries(prices).filter(
    ([key, p]) => key !== 'tl' && (p as Price).sellingPrice > 0
  );

  return (
    <div className="space-y-6">
      <div // Ana kart artık bir buton değil, div
        onClick={() => onNavigate('insights')}
        className="w-full text-left bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Panelim</h1>
          <button 
            onClick={(e) => {
              e.stopPropagation(); 
              // ================= DEĞİŞİKLİK 2: PROPTAN GELEN FONKSİYON KULLANILIYOR =================
              setIsBalanceVisible(!isBalanceVisible);
            }}
            className="p-1 rounded-full text-blue-200 hover:bg-white/20 transition-colors"
          >
            {isBalanceVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </button>
        </div>
        
        <div className="space-y-2">
          <p className="text-blue-100">Birikimlerinize genel bakış</p>
          <div className="text-3xl font-bold">
            {isBalanceVisible ? `₺${totalPortfolioValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '₺******'}
          </div>
          <div className={`flex items-center space-x-1 text-sm ${
            totalGain >= 0 ? 'text-green-200' : 'text-red-200'
          }`}>
            {isBalanceVisible ? (
              <>
                <TrendingUp className={`h-4 w-4 ${totalGain < 0 ? 'transform rotate-180' : ''}`} />
                <span>{totalGain >= 0 ? '+' : ''}₺{Math.abs(totalGain).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                <span>({totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%)</span>
              </>
            ) : (
              <span>******</span>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2 px-1">
          <h2 className="text-xl font-bold text-gray-800">Canlı Piyasa Verileri</h2>
          {lastUpdated && (
            <p className="text-xs text-gray-500 font-medium">
              {lastUpdated.toLocaleTimeString('tr-TR', {
                hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Istanbul'
              })}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {priceCardsToShow.map(([type, price]) => {
            const typedPrice = price as Price;
            const isGold = typedPrice.name.toLowerCase().includes('altın') || typedPrice.name.toLowerCase().includes('bilezik');
            const Icon = isGold ? Coins : (typedPrice.symbol === 'USD' ? DollarSign : Euro);
            
            return (
              <button key={type} onClick={() => handleCardClick(type as Investment['type'])} className="text-left h-full">
                <PriceCard price={typedPrice} icon={<Icon className="h-5 w-5" />} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}