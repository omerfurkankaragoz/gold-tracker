import React from 'react';
import { DollarSign, Euro, Coins, TrendingUp } from 'lucide-react';
import { PriceCard } from './PriceCard';
import { PortfolioChart } from './PortfolioChart';
import { usePrices } from '../hooks/usePrices';
import { useInvestmentsContext } from '../context/InvestmentsContext';

export function Dashboard() {
  const { prices } = usePrices();
  const { investments } = useInvestmentsContext();

  const calculatePortfolioValue = () => {
    return investments.reduce((total, investment) => {
      const currentPrice = prices[investment.type]?.price || 0;
      return total + (investment.amount * currentPrice);
    }, 0);
  };

  const portfolioValue = calculatePortfolioValue();
  const totalInvested = investments.reduce((total, inv) =>
    total + (inv.amount * inv.purchase_price), 0
  );
  const totalGain = portfolioValue - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Panelim</h1>
          <TrendingUp className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <p className="text-blue-100">Birikimlerinize genel bakış</p>
          <div className="text-3xl font-bold">
            ₺{portfolioValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </div>
          <div className={`flex items-center space-x-1 text-sm ${
            totalGain >= 0 ? 'text-green-200' : 'text-red-200'
          }`}>
            <TrendingUp className={`h-4 w-4 ${totalGain < 0 ? 'rotate-180' : ''}`} />
            <span>{totalGain >= 0 ? '+' : ''}₺{Math.abs(totalGain).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            <span>({totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PriceCard
          price={prices.gold}
          icon={<Coins className="h-5 w-5" />}
        />
        <PriceCard
          price={prices.usd}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <PriceCard
          price={prices.eur}
          icon={<Euro className="h-5 w-5" />}
        />
      </div>
      <PortfolioChart />
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">✨</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Güncel Piyasa Yorumu AI</h2>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-gray-700 leading-relaxed">
            Bugün altın fiyatları %{Math.abs(prices.gold.changePercent).toFixed(2)}
            {prices.gold.change >= 0 ? ' yükseldi' : ' düştü'}.
            Dolar/TL paritesi ise güncel seviyesini koruyor.
            Portföyünüzde toplam ₺{portfolioValue.toLocaleString('tr-TR')} değerinde yatırımınız bulunuyor.
          </p>
        </div>
      </div>
    </div>
  );
}