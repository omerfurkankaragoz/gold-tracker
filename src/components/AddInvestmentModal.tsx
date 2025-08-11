import React, { useState, useMemo, useEffect } from 'react';
import { X, Plus, DollarSign, Euro, Coins, Search, Calendar } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
import { Investment } from '../lib/supabase';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelectedType?: Investment['type'];
  isDirectAdd?: boolean;
}

const investmentTypes = [
  { id: 'usd', name: 'Dolar', symbol: 'USD', icon: DollarSign, unit: '$' },
  { id: 'eur', name: 'Euro', symbol: 'EUR', icon: Euro, unit: '€' },
  { id: 'tl', name: 'Türk Lirası', symbol: 'TRY', icon: () => <>₺</>, unit: '₺' },
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

export function AddInvestmentModal({ isOpen, onClose, initialSelectedType, isDirectAdd = false }: AddInvestmentModalProps) {
  const [selectedType, setSelectedType] = useState<Investment['type']>('gold');
  const [searchQuery, setSearchQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [loading, setLoading] = useState(false);
  
  // ==================================================================
  // DEĞİŞİKLİK 1: Tarih için state ekliyoruz
  // ==================================================================
  const today = new Date().toISOString().split('T')[0];
  const [purchaseDate, setPurchaseDate] = useState(today);

  const { addInvestment } = useInvestmentsContext();
  const { prices } = usePrices();

  const getFractionDigits = (type: Investment['type']) => {
    return type === 'usd' || type === 'eur' ? 2 : 4;
  };

  const currentPriceInfo = useMemo(() => prices[selectedType], [prices, selectedType]);

  const updatePurchasePrice = (type: Investment['type']) => {
    const price = prices[type]?.sellingPrice;
    if (price && price > 0) {
      setPurchasePrice(price.toFixed(getFractionDigits(type)));
    } else {
      setPurchasePrice('');
    }
  };

  // Modal açıldığında tüm state'leri sıfırla
  useEffect(() => {
    if (isOpen) {
      const startType = initialSelectedType || 'gold';
      setSelectedType(startType);
      setAmount('');
      setSearchQuery('');
      setPurchaseDate(today); // Tarihi bugüne ayarla
      updatePurchasePrice(startType); // Fiyatı anlık fiyatla doldur
    }
  }, [isOpen, initialSelectedType, prices]);

  // Varlık türü seçimi değiştiğinde fiyatı güncelle
  useEffect(() => {
    if (isOpen && !isDirectAdd) {
      setPurchaseDate(today); // Tarihi bugüne sıfırla
      updatePurchasePrice(selectedType);
    }
  }, [selectedType]);

  // ==================================================================
  // DEĞİŞİKLİK 2: Tarih değiştiğinde fiyat alanını yönet
  // ==================================================================
  useEffect(() => {
    // Eğer geçmiş bir tarih seçilirse, anlık fiyatı temizle ki kullanıcı manuel girsin
    if (purchaseDate !== today) {
      setPurchasePrice('');
    } 
    // Eğer tarih tekrar bugüne getirilirse, anlık fiyatla tekrar doldur
    else if (purchaseDate === today) {
      updatePurchasePrice(selectedType);
    }
  }, [purchaseDate]);


  const selectedInvestment = investmentTypes.find(inv => inv.id === selectedType);

  const filteredInvestmentTypes = useMemo(() => {
    if (!searchQuery) return investmentTypes.filter(type => type.id !== 'tl');
    return investmentTypes.filter(type =>
      type.id !== 'tl' &&
      (type.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      type.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !purchasePrice || !selectedType || !purchaseDate) return;
    setLoading(true);
    try {
      await addInvestment({
        type: selectedType,
        amount: parseFloat(amount),
        purchase_price: parseFloat(purchasePrice.replace(',', '.')),
        // DEĞİŞİKLİK 3: State'teki tarihi veritabanına gönder
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col h-auto max-h-[90vh] overflow-hidden">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {isDirectAdd && selectedInvestment ? `${selectedInvestment.name} Ekle` : 'Varlık Ekle'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!isDirectAdd && (
            <div className="p-3">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Varlık Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex flex-col space-y-1 max-h-48 overflow-y-auto pr-1">
                {filteredInvestmentTypes.map((type) => {
                  const priceInfo = prices[type.id as Investment['type']];
                  const isSelected = selectedType === type.id;
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id as Investment['type'])}
                      className={`flex w-full items-center p-2.5 rounded-lg text-left transition-all ${
                        isSelected ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center mr-3 ${isSelected ? 'bg-white' : 'bg-gray-100'}`}>
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-grow">
                          <p className={`font-semibold text-xs ${isSelected ? 'text-white' : 'text-gray-800'}`}>{type.name}</p>
                          <p className={`text-xs ${isSelected ? 'text-blue-200' : 'text-gray-500'}`}>{type.symbol}</p>
                      </div>
                      <div className="text-right">
                          <p className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                          ₺{priceInfo?.sellingPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: getFractionDigits(type.id as Investment['type']) }) || '...'}
                          </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="amountInput" className="block text-sm font-medium text-gray-700 mb-1">
                  Miktar ({selectedInvestment?.unit})
                </label>
                <input 
                  id="amountInput"
                  type="tel" 
                  inputMode="decimal"
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg" 
                  placeholder="Örn: 100" 
                  required 
                />
              </div>
              <div>
                <label htmlFor="priceInput" className="block text-sm font-medium text-gray-700 mb-1">
                  Birim Alış Fiyatı (₺)
                </label>
                <input 
                  id="priceInput"
                  type="tel" 
                  inputMode="decimal"
                  value={purchasePrice} 
                  onChange={(e) => setPurchasePrice(e.target.value)} 
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg" 
                  placeholder="Fiyatı girin" 
                  required 
                />
              </div>
            </div>

            {/* DEĞİŞİKLİK 4: Tarih seçici input'u eklendi */}
            <div>
              <label htmlFor="dateInput" className="block text-sm font-medium text-gray-700 mb-1">
                Alış Tarihi
              </label>
              <input 
                id="dateInput"
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                // Gelecekteki bir tarihin seçilmesini engelle
                max={today}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg" 
                required 
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading || !amount || !purchasePrice} 
                className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus className="h-5 w-5" /><span>Ekle</span></>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}