// Konum: src/components/AddInvestmentPage.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Search, DollarSign, Euro, Coins, Plus, Info } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
import { Investment } from '../lib/supabase';

// Component'in dışarıdan alacağı prop'lar
interface AddInvestmentPageProps {
  onBack: () => void;
  initialSelectedType?: Investment['type'];
  isDirectAdd?: boolean;
}

// Varlık türleri ve detayları
const investmentTypes = [
  { id: 'tl', name: 'Türk Lirası', symbol: 'TRY', icon: () => <>₺</>, unit: '₺' },
  { id: 'usd', name: 'Dolar', symbol: 'USD', icon: DollarSign, unit: '$' },
  { id: 'eur', name: 'Euro', symbol: 'EUR', icon: Euro, unit: '€' },
  { id: 'gold', name: 'Gram Altın', symbol: 'GA', icon: Coins, unit: 'gr' },
  { id: 'quarter_gold', name: 'Çeyrek Altın', symbol: 'CE-K', icon: Coins, unit: 'adet' },
  { id: 'half_gold', name: 'Yarım Altın', symbol: 'YA-K', icon: Coins, unit: 'adet' },
  { id: 'full_gold', 'name': 'Tam Altın', symbol: 'TA-K', icon: Coins, unit: 'adet' },
  { id: 'cumhuriyet_gold', name: 'Cumhuriyet Altını', symbol: 'CMR', icon: Coins, unit: 'adet' },
  { id: 'ata_gold', name: 'Ata Altın', symbol: 'ATA', icon: Coins, unit: 'adet' },
  { id: 'ayar_14_gold', name: '14 Ayar Altın', symbol: '14-K', icon: Coins, unit: 'gr' },
  { id: 'ayar_18_gold', name: '18 Ayar Altın', symbol: '18-K', icon: Coins, unit: 'gr' },
  { id: 'ayar_22_bilezik', name: '22 Ayar Bilezik', symbol: '22-K', icon: Coins, unit: 'gr' },
];

export function AddInvestmentPage({ onBack, initialSelectedType, isDirectAdd = false }: AddInvestmentPageProps) {
  // State'ler
  const [selectedType, setSelectedType] = useState<Investment['type']>(initialSelectedType || 'gold');
  const [searchQuery, setSearchQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [purchaseDate, setPurchaseDate] = useState(today);

  // Context ve Hook'lar
  const { addInvestment } = useInvestmentsContext();
  const { prices } = usePrices();

  // Yardımcı Fonksiyonlar
  const getFractionDigits = (type: Investment['type']) => (type === 'usd' || type === 'eur' ? 2 : 4);
  
  const updatePurchasePrice = (type: Investment['type']) => {
    if (type === 'tl') {
      setPurchasePrice('1');
      return;
    }
    const price = prices[type]?.sellingPrice;
    setPurchasePrice(price ? price.toFixed(getFractionDigits(type)) : '');
  };

  // Effect'ler
  useEffect(() => {
    const startType = initialSelectedType || 'gold';
    setSelectedType(startType);
    setAmount('');
    setSearchQuery('');
    setPurchaseDate(today);
    updatePurchasePrice(startType);
  }, [initialSelectedType, prices]);

  useEffect(() => {
    if (!isDirectAdd) {
      setPurchaseDate(today);
      updatePurchasePrice(selectedType);
    }
  }, [selectedType]);

  // Hesaplamalar
  const selectedInvestment = useMemo(() => investmentTypes.find(inv => inv.id === selectedType), [selectedType]);
  
  const filteredInvestmentTypes = useMemo(() => {
    if (!searchQuery) return investmentTypes;
    return investmentTypes.filter(type =>
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const totalCost = (parseFloat(amount) || 0) * (parseFloat(purchasePrice) || 0);

  // Form Gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !purchasePrice || !selectedType || !purchaseDate) return;
    setLoading(true);
    try {
      await addInvestment({
        type: selectedType,
        amount: parseFloat(amount),
        purchase_price: parseFloat(purchasePrice.replace(',', '.')),
        purchase_date: new Date(purchaseDate).toISOString(),
      } as Omit<Investment, 'id' | 'created_at' | 'updated_at'>);
      onBack();
    } catch (error) {
      console.error('Yatırım eklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== RENDER =====
  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Üst Başlık ve Geri Butonu */}
      <div className="relative flex items-center justify-center p-2 mb-4">
        <button onClick={onBack} className="absolute left-0 p-2 bg-gray-100 rounded-full transition-transform active:scale-90">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Varlık Ekle</h1>
      </div>

    {/* Scroll Alanı */}
    <div className="flex-1 overflow-y-auto px-3 space-y-4 pb-32">
      {/* Varlık Türü Seçimi */}
      {!isDirectAdd && (
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-sm font-semibold text-gray-500 mb-3">VARLIK TÜRÜ</h2>
          <div className="relative mb-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Varlık Ara (Dolar, Çeyrek Altın vb.)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 text-base border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredInvestmentTypes.map((type) => {
              const isSelected = selectedType === type.id;
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id as Investment['type'])}
                  className={`p-3 rounded-xl text-left transition-all border-2 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                      : 'bg-gray-50 border-transparent hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                    <span
                      className={`font-bold text-sm ${
                        isSelected ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      {type.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* İşlem Detayları */}
      <div className="bg-white rounded-2xl shadow p-4">
        <h2 className="text-sm font-semibold text-gray-500 mb-3">İŞLEM DETAYLARI</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Miktar ({selectedInvestment?.unit})
              </label>
              <input
                type="tel"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 bg-gray-100 border-2 border-transparent rounded-xl text-base focus:bg-white focus:border-blue-500"
                placeholder="Örn: 10"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Alış Fiyatı (₺)
              </label>
              <input
                type="tel"
                inputMode="decimal"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                disabled={selectedType === 'tl'}
                className="w-full p-3 bg-gray-100 border-2 border-transparent rounded-xl text-base disabled:bg-gray-200 disabled:text-gray-500 focus:bg-white focus:border-blue-500"
                placeholder="Fiyat"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Alış Tarihi</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              max={today}
              className="w-full p-3 bg-gray-100 border-2 border-transparent rounded-xl text-base focus:bg-white focus:border-blue-500"
              required
            />
          </div>
        </form>
      </div>
    </div>

    {/* Sabit Alt Bar */}
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
      {totalCost > 0 && (
        <div className="flex items-center justify-between bg-blue-50 text-blue-800 p-3 rounded-xl mb-3">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5" />
            <span className="font-semibold text-sm">Toplam Maliyet</span>
          </div>
          <span className="font-bold text-sm">
            ₺{totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}
      <button
        type="submit"
        onClick={handleSubmit}
        disabled={loading || !amount || !purchasePrice}
        className="w-full p-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all active:scale-95"
      >
        {loading ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <Plus className="w-6 h-6" />
            <span>Varlığı Ekle</span>
          </>
        )}
      </button>
    </div>
  </div>
);

}