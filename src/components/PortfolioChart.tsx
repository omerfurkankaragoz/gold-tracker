import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieChartIcon, PiggyBank } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices'; // Fiyatları doğrudan burada kullanıyoruz
import { Investment } from '../lib/supabase';

// Her varlık türü için bir isim ve renk belirleyelim
const typeDetails: Record<string, { name: string; color: string }> = {
    gold: { name: 'Gram Altın', color: '#FFC300' },
    quarter_gold: { name: 'Çeyrek Altın', color: '#F7B600' },
    half_gold: { name: 'Yarım Altın', color: '#EAA700' },
    full_gold: { name: 'Tam Altın', color: '#D69800' },
    cumhuriyet_gold: { name: 'Cumhuriyet Altını', color: '#C28900' },
    ata_gold: { name: 'Ata Altın', color: '#AD7A00' },
    ayar_14_gold: { name: '14 Ayar Altın', color: '#996B00' },
    ayar_18_gold: { name: '18 Ayar Altın', color: '#855C00' },
    ayar_22_bilezik: { name: '22 Ayar Bilezik', color: '#704D00' },
    gumus: { name: 'Gram Gümüş', color: '#C0C0C0' }, // GÜMÜŞ EKLENDİ (gümüş rengi)
    usd: { name: 'Dolar', color: '#28A745' },
    eur: { name: 'Euro', color: '#007BFF' },
    tl: { name: 'Türk Lirası', color: '#6F42C1' },
};

export function PortfolioChart() {
  const { investments, totalPortfolioValue } = useInvestmentsContext();
  const { prices } = usePrices(); // Fiyatları burada güvenli bir şekilde alıyoruz

  // Grafik için veriyi, yatırımlar veya fiyatlar değiştiğinde yeniden hesaplıyoruz
  const chartData = useMemo(() => {
    // Fiyatlar henüz yüklenmediyse, çökmemesi için boş bir dizi döndür
    if (investments.length === 0 || Object.keys(prices).length === 0) {
      return [];
    }

    const aggregatedData = investments.reduce((acc, investment) => {
      const { type } = investment;
      const details = typeDetails[type];
      const priceInfo = prices[type];

      // Eğer varlığın fiyat bilgisi yoksa (henüz yüklenmediyse vb.), bu adımı atla
      if (!details || !priceInfo) {
        return acc;
      }
      
      const investmentValue = investment.amount * priceInfo.sellingPrice;

      if (!acc[details.name]) {
        acc[details.name] = { value: 0, color: details.color };
      }
      
      acc[details.name].value += investmentValue;
      return acc;
    }, {} as Record<string, { value: number, color: string }>);

    return Object.entries(aggregatedData).map(([name, data]) => ({ name, ...data }));

  }, [investments, prices]); // Bu bağımlılıklar sayesinde her şey güncel kalır


  // Portföy boşsa gösterilecek modern uyarı ekranı
  if (investments.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <PieChartIcon className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Portföy Dağılımı</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8">
            <PiggyBank className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-700">Henüz Varlık Yok</h3>
            <p className="text-sm text-gray-500 mt-1">Varlık eklediğinizde, dağılım grafiğiniz burada görünecek.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-2 mb-4">
        <PieChartIcon className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Portföy Dağılımı</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="h-48 w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={entry.color} stroke={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `₺${value.toLocaleString('tr-TR', {minimumFractionDigits: 2})}`}
                wrapperClassName="!rounded-xl !border-gray-200 !shadow-lg"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {chartData.map((entry) => {
            const percentage = totalPortfolioValue > 0 ? (entry.value / totalPortfolioValue) * 100 : 0;
            return (
              <div key={entry.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                  <span className="text-gray-700">{entry.name}</span>
                </div>
                <span className="font-semibold text-gray-800">{percentage.toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}