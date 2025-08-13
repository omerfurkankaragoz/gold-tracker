import React from 'react';
import { Price } from '../hooks/usePrices';

interface PriceCardProps {
  price: Price;
  icon?: React.ReactNode;
}

export function PriceCard({ price, icon }: PriceCardProps) {
  const isCurrency = price.symbol === 'USD' || price.symbol === 'EUR';
  const fractionDigits = isCurrency ? 2 : 4;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 flex items-center justify-between w-full">
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
            {icon}
          </div>
        )}
        <div className="text-left">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-base">{price.name}</h3>
        </div>
      </div>

      <div className="flex items-center space-x-5 text-right">
        <p className="font-medium text-gray-700 dark:text-gray-300 text-base w-24">
          ₺{price.buyingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: fractionDigits })}
        </p>
        <p className="font-medium text-gray-900 dark:text-white text-base w-24">
          ₺{price.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: fractionDigits })}
        </p>
      </div>
    </div>
  );
}