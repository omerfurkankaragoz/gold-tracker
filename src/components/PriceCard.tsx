import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Price } from '../hooks/usePrices';

interface PriceCardProps {
  price: Price;
  icon?: React.ReactNode;
  unit?: string;
}

export function PriceCard({ price, icon, unit = '' }: PriceCardProps) {
  const isPositive = price.change >= 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon && <div className="text-gray-600">{icon}</div>}
          <h3 className="font-semibold text-gray-900">{price.name}</h3>
        </div>
        <span className="text-xs font-medium text-gray-500">{price.symbol}</span>
      </div>
      
      <div className="space-y-2">
        <div className="text-2xl font-bold text-gray-900">
          ₺{price.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          {unit && <span className="text-lg text-gray-500 ml-1">{unit}</span>}
        </div>
        
        <div className={`flex items-center space-x-1 text-sm font-medium ${
          isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>{isPositive ? '+' : ''}₺{price.change.toFixed(2)}</span>
          <span>({isPositive ? '+' : ''}{price.changePercent.toFixed(2)}%)</span>
        </div>
      </div>
    </div>
  );
}