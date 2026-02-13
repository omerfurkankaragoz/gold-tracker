import React, { memo } from 'react';
import { Price } from '../hooks/usePrices';

interface PriceCardProps {
  price: Price;
  icon?: React.ReactNode;
}

export const PriceCard = memo(function PriceCard({ price, icon }: PriceCardProps) {
  const isCurrency = price.symbol === 'USD' || price.symbol === 'EUR';
  const fractionDigits = isCurrency ? 2 : 4;

  return (
    <div className="bg-apple-light-card dark:bg-apple-dark-card rounded-2xl p-4 flex items-center justify-between w-full">
      <div className="flex items-center space-x-3">
        {icon && (
          <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full">
            {icon}
          </div>
        )}
        <div className="text-left">
          <h3 className="font-semibold text-apple-light-text-primary dark:text-apple-dark-text-primary text-base">{price.name}</h3>
        </div>
      </div>
      <div className="flex items-center space-x-5 text-right">
        <p className="font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary text-base w-24">
          ₺{price.buyingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: fractionDigits })}
        </p>
        <p className="font-semibold text-apple-light-text-primary dark:text-apple-dark-text-primary text-base w-24">
          ₺{price.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: fractionDigits })}
        </p>
      </div>
    </div>
  );
});