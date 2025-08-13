import React from 'react';
import { DollarSign, Euro, Coins, TrendingUp, Eye, EyeOff, Gem } from 'lucide-react';
import { PriceCard } from './PriceCard';
import { usePrices } from '../hooks/usePrices';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { Investment } from '../lib/supabase';
import { Price } from '../hooks/usePrices';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  onAddInvestment: (type: Investment['type']) => void;
  isBalanceVisible: boolean;
  setIsBalanceVisible: (isVisible: boolean) => void;
}

export function Dashboard({ onNavigate, onAddInvestment, isBalanceVisible, setIsBalanceVisible }: DashboardProps) {
  const { prices } = usePrices();
  const { investments, totalPortfolioValue } = useInvestmentsContext();

  const handleCardClick = (type: Investment['type']) => {
    onAddInvestment(type);
  };

  const totalInvested = investments.reduce((total, inv) => total + (inv.amount * inv.purchase_price), 0);
  const totalGain = totalPortfolioValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  const priceCardsToShow = Object.entries(prices).filter(([key, p]) => key !== 'tl' && (p as Price).sellingPrice > 0);

  return (
    <div className="space-y-8">
      <div
        onClick={() => onNavigate('insights')}
        className="w-full text-left bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-6 text-white shadow-lg cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Panelim</h2>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsBalanceVisible(!isBalanceVisible); }}
            className="p-1 rounded-full text-blue-200 hover:bg-white/20 transition-colors"
          >
            {isBalanceVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </button>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-semibold tracking-tight">
            {isBalanceVisible ? `₺${totalPortfolioValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '₺******'}
          </p>
          <div className={`mt-2 flex items-center space-x-1 text-sm ${totalGain >= 0 ? 'text-green-200' : 'text-red-200'}`}>
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
        <div className="flex items-baseline justify-between mb-3 px-2">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Piyasalar</h2>
          <div className="flex space-x-16">
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Alış</span>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Satış</span>
          </div>
        </div>
        <div className="flex flex-col space-y-3">
          {priceCardsToShow.map(([type, price]) => {
            const typedPrice = price as Price;
            const getIcon = () => {
              if (type === 'gumus') return Gem;
              if (typedPrice.name.toLowerCase().includes('altın') || typedPrice.name.toLowerCase().includes('bilezik')) return Coins;
              if (typedPrice.symbol === 'USD') return DollarSign;
              return Euro;
            };
            const Icon = getIcon();
            return (
              <button key={type} onClick={() => handleCardClick(type as Investment['type'])} className="w-full">
                <PriceCard price={typedPrice} icon={<Icon className="h-6 w-6 text-blue-600" />} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}