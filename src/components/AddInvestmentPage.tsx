import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, Search, DollarSign, Euro, Coins, Plus, Info, Gem, TurkishLira } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
import { Investment } from '../lib/supabase';

interface AddInvestmentPageProps {
  onBack: () => void;
  initialSelectedType?: Investment['type'];
  isDirectAdd?: boolean;
}

const investmentTypes = [
  { id: 'tl', name: 'Türk Lirası', symbol: 'TRY', icon: TurkishLira, unit: '₺' },
  { id: 'usd', name: 'Dolar', symbol: 'USD', icon: DollarSign, unit: '$' },
  { id: 'eur', name: 'Euro', symbol: 'EUR', icon: Euro, unit: '€' },
  { id: 'gumus', name: 'Gram Gümüş', symbol: 'G', icon: Gem, unit: 'gr' },
  { id: 'gold', name: 'Gram Altın', symbol: 'GA', icon: Coins, unit: 'gr' },
  { id: 'quarter_gold', name: 'Çeyrek Altın', symbol: 'CE-K', icon: Coins, unit: 'adet' },
  { id: 'half_gold', name: 'Yarım Altın', symbol: 'YA-K', icon: Coins, unit: 'adet' },
  { id: 'full_gold', 'name': 'Tam Altın', symbol: 'TA-K', icon: Coins, unit: 'adet' },
  { id: 'cumhuriyet_gold', name: 'Cumhuriyet Altını', symbol: 'CMR', icon: Coins, unit: 'adet' },
  { id: 'ata_gold', name: 'Ata Altın', symbol: 'ATA', icon: Coins, unit: 'adet' },
  { id: 'ayar_14_gold', name: '14 Ayar Altın', symbol: '14-K', icon: Coins, unit: 'gr' },
  { id: 'ayar_18_gold', name: '18 Ayar Altın', symbol: '18-K', icon: Coins, unit: 'gr' },
];

export function AddInvestmentPage({ onBack, initialSelectedType, isDirectAdd = false }: AddInvestmentPageProps) {
  const [selectedType, setSelectedType] = useState<Investment['type']>(initialSelectedType || 'gold');
  const [searchQuery, setSearchQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [purchaseDate, setPurchaseDate] = useState(today);

  const { addInvestment } = useInvestmentsContext();
  const { prices } = usePrices();

  const getFractionDigits = (type: Investment['type']) => (type === 'usd' || type === 'eur' ? 2 : 4);
  
  const updatePurchasePrice = (type: Investment['type']) => {
    if (type === 'tl') {
      setPurchasePrice('1');
      return;
    }
    const price = prices[type]?.sellingPrice;
    setPurchasePrice(price ? price.toFixed(getFractionDigits(type)) : '');
  };

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

  const selectedInvestment = useMemo(() => investmentTypes.find(inv => inv.id === selectedType), [selectedType]);
  
  const filteredInvestmentTypes = useMemo(() => {
    if (!searchQuery) return investmentTypes;
    return investmentTypes.filter(type =>
      type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const totalCost = (parseFloat(amount) || 0) * (parseFloat(purchasePrice) || 0);

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
      } as Omit<Investment, 'id' | 'created_at' | 'updated_at' | 'user_id'>);
      onBack();
    } catch (error) {
      console.error('Yatırım eklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in text-gray-900 dark:text-gray-100">
      <div className="relative flex items-center justify-center p-2 mb-4">
        <button onClick={onBack} className="absolute left-0 p-2 bg-gray-100 dark:bg-gray-800 rounded-full transition-transform active:scale-90">
          <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-semibold">Varlık Ekle</h1>
      </div>

      {/* ======================= GÜNCELLENEN BÖLÜM ======================= */}
      {/* "Toplam Maliyet" kutusunun durumuna göre alt boşluk (padding) dinamik olarak değişir */}
      <div className={`flex-1 overflow-y-auto px-2 space-y-6 transition-all duration-300 ${totalCost > 0 ? 'pb-40' : 'pb-8'}`}>
        {!isDirectAdd && (
          <div className="space-y-4">
             <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 px-2">Varlık Türü</h2>
            <div className="relative px-2">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Varlık Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-base border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 px-2">
              {filteredInvestmentTypes.map((type) => {
                const isSelected = selectedType === type.id;
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id as Investment['type'])}
                    className={`p-3 rounded-xl text-center transition-all flex flex-col items-center justify-center space-y-2 h-24 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className={`p-3 rounded-full transition-colors ${isSelected ? 'bg-blue-500' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      <Icon className={`h-6 w-6 transition-colors ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                    </div>
                    <span
                      className={`font-semibold text-xs transition-colors ${
                        isSelected ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {type.name.replace(' Altını', '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4">
           <h2 className="text-lg font-semibold text-gray-500 dark:text-gray-400 px-2">İşlem Detayları</h2>
           <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 space-y-4 mx-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Miktar ({selectedInvestment?.unit})
                  </label>
                  <input
                    type="tel"
                    inputMode="decimal"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg text-base text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800/50 focus:border-blue-500"
                    placeholder="10"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Alış Fiyatı (₺)
                  </label>
                  <input
                    type="tel"
                    inputMode="decimal"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    disabled={selectedType === 'tl'}
                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-lg text-base text-gray-900 dark:text-gray-100 disabled:bg-gray-200 dark:disabled:bg-gray-600 disabled:text-gray-500 focus:bg-white dark:focus:bg-gray-800/50 focus:border-blue-500"
                    placeholder="Fiyat"
                    required
                  />
                </div>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Alış Tarihi</label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                max={today}
                className="block w-full box-border p-3 bg-gray-100 dark:bg-gray-700 border-2 border-transparent rounded-xl text-base text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 appearance-none"
                required
              />
            </div>
           </div>
        </div>
      </div>
      {/* ==================================================================== */}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-100/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        {totalCost > 0 && (
          <div className="flex items-center justify-between bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-xl mb-3">
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5" />
              <span className="font-semibold text-sm">Toplam Maliyet</span>
            </div>
            <span className="font-bold text-base">
              ₺{totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={loading || !amount || !purchasePrice}
          className="w-full p-4 bg-blue-600 text-white font-bold text-lg rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg shadow-blue-500/20"
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