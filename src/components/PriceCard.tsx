import React from 'react';
import { Price } from '../hooks/usePrices';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceCardProps {
  price: Price;
  icon?: React.ReactNode;
}

export function PriceCard({ price, icon }: PriceCardProps) {
  const isCurrency = price.symbol === 'USD' || price.symbol === 'EUR';
  const fractionDigits = isCurrency ? 2 : 4;

  const change = price.change || 0;
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 flex items-center justify-between w-full">
      {/* Sol Taraf: İkon ve İsim/Sembol */}
      <div className="flex items-center space-x-4">
        {icon && (
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
            {icon}
          </div>
        )}
        <div className="text-left">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-md">{price.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{price.symbol}</p>
        </div>
      </div>

      {/* ======================= GÜNCELLENEN BÖLÜM ======================= */}
      {/* Sağ Taraf: Alış ve Satış Fiyatları */}
      <div className="text-right flex items-center space-x-4">
        {/* Alış Fiyatı */}
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 dark:text-gray-400">Alış</span>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            ₺{price.buyingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: fractionDigits })}
          </p>
        </div>
        {/* Satış Fiyatı */}
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 dark:text-gray-400">Satış</span>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">
            ₺{price.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: fractionDigits })}
          </p>
        </div>
      </div>
      {/* ==================================================================== */}
    </div>
  );
}