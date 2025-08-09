import React, { useState, useMemo } from 'react';
import { X, Plus, DollarSign, Euro, Coins, Search, TrendingUp, TrendingDown } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
import { Investment } from '../lib/supabase';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tüm yatırım türlerini ve detaylarını içeren merkezi bir liste
const investmentTypes = [
  { id: 'usd', name: 'Amerikan Doları', symbol: 'USD', icon: DollarSign, unit: '$' },
  { id: 'eur', name: 'Euro', symbol: 'EUR', icon: Euro, unit: '€' },
  { id: 'tl', name: 'Türk Lirası', symbol: 'TRY', icon: () => <>₺</>, unit: '₺' }, // TL eklendi
  { id: 'gold', name: 'Gram Altın', symbol: 'GA', icon: Coins, unit: 'gr' },
  { id: 'quarter_gold', name: 'Çeyrek Altın', symbol: 'CE-K', icon: Coins, unit: 'adet' },
  { id: 'half_gold', name: 'Yarım Altın', symbol: 'YA-K', icon: Coins, unit: 'adet' },
  { id: 'full_gold', name: 'Tam Altın', symbol: 'TA-K', icon: Coins, unit: 'adet' },
  { id: 'cumhuriyet_gold', name: 'Cumhuriyet Altını', symbol: 'CMR', icon: Coins, unit: 'adet' },
  { id: 'ata_gold', name: 'Ata Altın', symbol: 'ATA', icon: Coins, unit: 'adet' },
  { id: 'ayar_14_gold', name: '14 Ayar Altın', symbol: '14-K', icon: Coins, unit: 'gr' },
  { id: 'ayar_18_gold', name: '18 Ayar Altın', symbol: '18-K', icon: Coins, unit: 'gr' },
  { id: 'ayar_22_bilezik', name: '22 Ayar Bilezik', symbol: '22-K', icon: Coins, unit: 'gr' },
];

export function AddInvestmentModal({ isOpen, onClose }: AddInvestmentModalProps) {
  const [selectedType, setSelectedType] = useState<Investment['type']>('gold');
  const [searchQuery, setSearchQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const { addInvestment } = useInvestmentsContext();
  const { prices } = usePrices();

  const selectedInvestment = investmentTypes.find(inv => inv.id === selectedType)!;
  
  const filteredInvestmentTypes = useMemo(() => {
    if (!searchQuery) return investmentTypes;
    return investmentTypes.filter(type =>
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !purchasePrice) return;
    setLoading(true);
    try {
      await addInvestment({
        type: selectedType,
        amount: parseFloat(amount),
        purchase_price: parseFloat(purchasePrice),
        purchase_date: new Date(purchaseDate).toISOString(),
      } as Omit<Investment, 'id' | 'created_at' | 'updated_at'>);
      onClose();
    } catch (error) {
      console.error('Yatırım eklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* ANA KAPSAYICI: overflow-hidden eklenerek köşelerin düzgün görünmesi sağlandı */}
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col h-[90vh] max-h-[700px] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Varlık Ekle</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Varlık Ara (örn: Çeyrek, USD)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-2">
            {filteredInvestmentTypes.map((type) => {
              const currentPriceInfo = prices[type.id as Investment['type']];
              const isSelected = selectedType === type.id;
              const isPositive = currentPriceInfo?.change >= 0;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id as Investment['type'])}
                  className={`w-full p-4 border-2 rounded-xl flex items-center justify-between transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{type.name}</p>
                    <p className="text-sm text-gray-500">{type.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ₺{currentPriceInfo?.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) || '...'}
                    </p>
                    <div className={`flex items-center justify-end space-x-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      <span>{currentPriceInfo?.change.toFixed(2) || '0.00'}</span>
                      <span>({currentPriceInfo?.changePercent.toFixed(2) || '0.00'}%)</span>
                    </div>
                  </div>
                </button>
              );
            })}
             {filteredInvestmentTypes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>Sonuç bulunamadı.</p>
                </div>
             )}
          </div>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Miktar ({selectedInvestment.unit})
              </label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl" placeholder="Miktar girin" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Birim Alış Fiyatı (₺)
              </label>
              <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl" placeholder={`Mevcut: ₺${prices[selectedType]?.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`} required />
            </div>
            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl bg-white hover:bg-gray-100">
                İptal
              </button>
              <button onClick={handleSubmit} disabled={loading} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="h-5 w-5" /><span>Ekle</span></>}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
}