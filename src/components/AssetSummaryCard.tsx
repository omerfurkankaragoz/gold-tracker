import React from 'react';
import { Coins, DollarSign, Euro, Gem,TurkishLiraIcon } from 'lucide-react';

export type SummaryData = {
  [key: string]: { totalAmount: number; totalValue: number } | undefined;
};

// ======================= DEĞİŞİKLİK 1: PROP ARAYÜZÜ GÜNCELLENDİ =======================
interface AssetSummaryCardProps {
  summary: SummaryData;
  loading: boolean;
  isBalanceVisible: boolean; // Yeni prop eklendi
}
// ====================================================================================

const assetDetails: { [key: string]: { name: string, unit: string, icon: React.ElementType } } = {
  usd: { name: 'Dolar', unit: '$', icon: DollarSign }, eur: { name: 'Euro', unit: '€', icon: Euro },
  tl: { name: 'Türk Lirası', unit: '₺', icon: TurkishLiraIcon },
  gumus: { name: 'Gram Gümüş', unit: 'gr', icon: Gem }, gold: { name: 'Gram Altın', unit: 'gr', icon: Coins },
  quarter_gold: { name: 'Çeyrek Altın', unit: 'adet', icon: Coins }, half_gold: { name: 'Yarım Altın', unit: 'adet', icon: Coins },
  full_gold: { name: 'Tam Altın', unit: 'adet', icon: Coins }, cumhuriyet_gold: { name: 'Cumhuriyet Altını', unit: 'adet', icon: Coins },
  ata_gold: { name: 'Ata Altın', unit: 'adet', icon: Coins }, ayar_14_gold: { name: '14 Ayar Altın', unit: 'gr', icon: Coins },
  ayar_18_gold: { name: '18 Ayar Altın', unit: 'gr', icon: Coins },
};
const displayOrder = ['tl', 'usd', 'eur', 'gumus', 'gold', 'quarter_gold', 'half_gold', 'full_gold', 'cumhuriyet_gold', 'ata_gold', 'ayar_14_gold', 'ayar_18_gold'];

export function AssetSummaryCard({ summary, loading, isBalanceVisible }: AssetSummaryCardProps) {
  const hasData = Object.values(summary).some(item => item && item.totalAmount > 0);
  if (loading || !hasData) return null;

  return (
    <div className="space-y-4">
      <div className="px-2">
        <h2 className="text-2xl font-bold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary">Varlık Özetim</h2>
      </div>
      <div className="space-y-3">
        {displayOrder.map(key => {
          const item = summary[key];
          const details = assetDetails[key];
          if (!item || !details || item.totalAmount === 0) return null;
          const Icon = details.icon;
          return (
            <div key={key} className="flex items-center justify-between p-4 bg-apple-light-card dark:bg-apple-dark-card rounded-2xl">
              <div className="flex items-center space-x-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-full flex-shrink-0">
                  <Icon className="h-6 w-6 text-apple-blue" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-base text-apple-light-text-primary dark:text-apple-dark-text-primary">{details.name}</p>
                  {/* ======================= DEĞİŞİKLİK 2: KOŞULLU GÖSTERİM ======================= */}
                  <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary">
                    {isBalanceVisible ? 
                      `${item.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: key === 'tl' ? 2 : 0, maximumFractionDigits: 4 })} ${details.unit}`
                      : '******'
                    }
                  </p>
                </div>
              </div>
              <p className="font-semibold text-lg text-apple-light-text-primary dark:text-apple-dark-text-primary">
                {isBalanceVisible ? 
                  `₺${item.totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
                  : '******'
                }
              </p>
              {/* ==================================================================================== */}
            </div>
          );
        })}
      </div>
    </div>
  );
}