import React, { useState } from 'react';
import { DollarSign, Euro, Coins, TrendingUp } from 'lucide-react';
import { PriceCard } from './PriceCard';
import { usePrices } from '../hooks/usePrices';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { AddInvestmentModal } from './AddInvestmentModal';
import { Investment } from '../lib/supabase';
import { Price } from '../hooks/usePrices';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  // ==================================================================
  // DEĞİŞİKLİK: 'lastUpdated' bilgisini de alıyoruz
  // ==================================================================
  const { prices, lastUpdated } = usePrices();
  const { investments, totalPortfolioValue } = useInvestmentsContext();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTypeForModal, setSelectedTypeForModal] = useState<Investment['type'] | undefined>(undefined);

  const handleCardClick = (type: Investment['type']) => {
    setSelectedTypeForModal(type);
    setIsModalOpen(true);
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
      <button
        onClick={() => onNavigate('insights')}
        className="w-full text-left transition-transform duration-200 active:scale-95"
      >
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Panelim</h1>
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <p className="text-blue-100">Birikimlerinize genel bakış</p>
            <div className="text-3xl font-bold">
              ₺{totalPortfolioValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </div>
            <div className={`flex items-center space-x-1 text-sm ${
              totalGain >= 0 ? 'text-green-200' : 'text-red-200'
            }`}>
              <TrendingUp className={`h-4 w-4 ${totalGain < 0 ? 'transform rotate-180' : ''}`} />
              <span>{totalGain >= 0 ? '+' : ''}₺{Math.abs(totalGain).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              <span>({totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>
      </button>

      <div>
        {/* ================================================================== */}
        {/* DEĞİŞİKLİK: Yeni başlık ve zaman bilgisi bölümü */}
        {/* ================================================================== */}
        <div className="flex items-baseline justify-between mb-2 px-1">
            <h2 className="text-xl font-bold text-gray-800">Canlı Piyasa Verileri</h2>
            {lastUpdated && (
                <p className="text-xs text-gray-500 font-medium">
                    {lastUpdated.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
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

      <AddInvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialSelectedType={selectedTypeForModal}
        isDirectAdd={true}
      />
    </div>
  );
}