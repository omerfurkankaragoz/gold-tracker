import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Euro, Coins } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
import { AddInvestmentModal } from './AddInvestmentModal';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Investment } from '../lib/supabase';

// typeDetails objesi aynı kalacak...
const typeDetails: Record<Investment['type'], { icon: React.ElementType; name: string; unit: string }> = {
  usd: { icon: DollarSign, name: 'Amerikan Doları', unit: '$' },
  eur: { icon: Euro, name: 'Euro', unit: '€' },
  tl: { icon: () => <span className="font-bold">₺</span>, name: 'Türk Lirası', unit: '₺' },
  gold: { icon: Coins, name: 'Gram Altın', unit: 'gr' },
  quarter_gold: { icon: Coins, name: 'Çeyrek Altın', unit: 'adet' },
  half_gold: { icon: Coins, name: 'Yarım Altın', unit: 'adet' },
  full_gold: { icon: Coins, name: 'Tam Altın', unit: 'adet' },
  cumhuriyet_gold: { icon: Coins, name: 'Cumhuriyet A.', unit: 'adet' },
  ata_gold: { icon: Coins, name: 'Ata Altın', unit: 'adet' },
  ayar_14_gold: { icon: Coins, name: '14 Ayar Altın', unit: 'gr' },
  ayar_18_gold: { icon: Coins, name: '18 Ayar Altın', unit: 'gr' },
  ayar_22_bilezik: { icon: Coins, name: '22 Ayar Bilezik', unit: 'gr' },
};


export function Holdings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { investments, deleteInvestment } = useInvestmentsContext();
  const { prices } = usePrices();

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu yatırımı silmek istediğinizden emin misiniz?')) {
      await deleteInvestment(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Varlıklarım</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Ekle</span>
        </button>
      </div>

      {investments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
          {/* Boş liste durumu aynı kalacak... */}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* ESKİ TABLO BAŞLIĞI TAMAMEN KALDIRILDI */}
          
          <div className="divide-y divide-gray-200">
            {investments.map((investment) => {
              const details = typeDetails[investment.type];
              const Icon = details.icon;
              const currentPrice = prices[investment.type]?.price || 0;
              const currentValue = investment.amount * currentPrice;
              const purchaseValue = investment.amount * investment.purchase_price;
              const gain = currentValue - purchaseValue;
              const gainPercent = purchaseValue > 0 ? (gain / purchaseValue) * 100 : 0;

              return (
                // HER BİR VARLIK İÇİN YENİ KART TASARIMI
                <div key={investment.id} className="p-4 transition-colors hover:bg-gray-50">
                  {/* Üst Kısım: Varlık Bilgisi ve Sil Butonu */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{details.name}</p>
                        <p className="text-sm text-gray-500">
                          {investment.amount} {details.unit}
                        </p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(investment.purchase_date), 'dd MMM yyyy', { locale: tr })}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(investment.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Alt Kısım: Finansal Veriler (2 Sütunlu Grid) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Anlık Değer</p>
                      <p className="font-semibold text-gray-900 break-words">
                        ₺{currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-gray-500 break-words">
                        ₺{currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} / {details.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Kar/Zarar</p>
                      <div className={`font-semibold flex items-center space-x-1 break-words ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {gain >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        <span>₺{Math.abs(gain).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <p className={`text-sm ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AddInvestmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}