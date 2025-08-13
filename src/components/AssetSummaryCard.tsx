import React from 'react';
import { Coins, DollarSign, Euro, Gem } from 'lucide-react';

export type SummaryData = {
  [key: string]: {
    totalAmount: number;
    totalValue: number;
  } | undefined;
};

interface AssetSummaryCardProps {
  summary: SummaryData;
  loading: boolean;
}

const assetDetails: { [key: string]: { name: string, unit: string, icon: React.ElementType } } = {
  usd: { name: 'Dolar', unit: '$', icon: DollarSign },
  eur: { name: 'Euro', unit: '€', icon: Euro },
  tl: { name: 'Türk Lirası', unit: '₺', icon: () => <span className="font-bold">₺</span> },
  gumus: { name: 'Gram Gümüş', unit: 'gr', icon: Gem },
  gold: { name: 'Gram Altın', unit: 'gr', icon: Coins },
  quarter_gold: { name: 'Çeyrek Altın', unit: 'adet', icon: Coins },
  half_gold: { name: 'Yarım Altın', unit: 'adet', icon: Coins },
  full_gold: { name: 'Tam Altın', unit: 'adet', icon: Coins },
  cumhuriyet_gold: { name: 'Cumhuriyet Altını', unit: 'adet', icon: Coins },
  ata_gold: { name: 'Ata Altın', unit: 'adet', icon: Coins },
  ayar_14_gold: { name: '14 Ayar Altın', unit: 'gr', icon: Coins },
  ayar_18_gold: { name: '18 Ayar Altın', unit: 'gr', icon: Coins },
  ayar_22_bilezik: { name: '22 Ayar Bilezik', unit: 'gr', icon: Coins },
};

const displayOrder = [
  'tl', 'usd', 'eur', 'gumus', 'gold', 'quarter_gold', 'half_gold', 'full_gold',
  'cumhuriyet_gold', 'ata_gold', 'ayar_14_gold', 'ayar_18_gold', 'ayar_22_bilezik'
];

export function AssetSummaryCard({ summary, loading }: AssetSummaryCardProps) {
  const hasData = Object.values(summary).some(item => item && item.totalAmount > 0);

  if (loading || !hasData) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Varlık Özetim</h2>
      <div className="space-y-3">
        {displayOrder.map(key => {
          const item = summary[key];
          const details = assetDetails[key];
          
          if (!item || !details || item.totalAmount === 0) return null;

          const Icon = details.icon;

          return (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{details.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.totalAmount.toLocaleString('tr-TR', { 
                        minimumFractionDigits: key === 'tl' ? 2 : 0,
                        maximumFractionDigits: 4 
                    })} {details.unit}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">
                  ₺{item.totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}