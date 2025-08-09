import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, DollarSign, Euro, Coins } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
import { AddInvestmentModal } from './AddInvestmentModal';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Investment } from '../lib/supabase';

// Tüm yeni altın türleri için ikon, isim ve birim bilgisi ekliyoruz.
const typeDetails: Record<Investment['type'], { icon: React.ElementType; name: string; unit: string }> = {
  usd: { icon: DollarSign, name: 'Amerikan Doları', unit: '$' },
  eur: { icon: Euro, name: 'Euro', unit: '€' },
  tl: { icon: () => <span className="font-bold">₺</span>, name: 'Türk Lirası', unit: '₺' }, // TL eklendi
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
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Henüz yatırımınız yok</h3>
          <p className="text-gray-600 mb-6">İlk yatırımınızı ekleyerek başlayın</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Yatırım Ekle</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-500">
              <div>Tür</div>
              <div className="text-right">Anlık Değer</div>
              <div className="text-right">Kar/Zarar</div>
              <div className="text-right">İşlem</div>
            </div>
          </div>

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
                <div key={investment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-4 gap-4 items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {details.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {investment.amount} {details.unit}
                        </div>
                        <div className="text-xs text-gray-400">
                          {format(new Date(investment.purchase_date), 'dd MMM yyyy', { locale: tr })}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ₺{currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-sm text-gray-500">
                        ₺{currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} / {details.unit}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`font-semibold flex items-center justify-end space-x-1 ${
                        gain >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {gain >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span>₺{Math.abs(gain).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className={`text-sm ${
                        gain >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
                      </div>
                    </div>

                    <div className="text-right">
                      <button
                        onClick={() => handleDelete(investment.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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