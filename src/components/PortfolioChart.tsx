import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';
import { Investment } from '../lib/supabase'; // Tipi import ediyoruz

// Tüm yatırım türleri için isim ve renk tanımlamaları yapıyoruz.
const typeDetails: Record<Investment['type'], { name: string; color: string }> = {
    gold: { name: 'Gram Altın', color: '#FFC300' },
    quarter_gold: { name: 'Çeyrek Altın', color: '#F7B600' },
    half_gold: { name: 'Yarım Altın', color: '#EAA700' },
    full_gold: { name: 'Tam Altın', color: '#D69800' },
    usd: { name: 'Dolar', color: '#28A745' },
    eur: { name: 'Euro', color: '#007BFF' },
};

export function PortfolioChart() {
  const { investments } = useInvestmentsContext();
  const { prices } = usePrices();

  // Portföydeki varlıkları anlık değerlerine göre gruplayıp hesaplıyoruz
  const chartData = Object.entries(
    investments.reduce((acc, investment) => {
      const { type, amount } = investment;
      const currentPrice = prices[type]?.price || 0;
      const currentValue = amount * currentPrice;
      const details = typeDetails[type];

      if (!acc[type]) {
        // İsimleri artık typeDetails'ten alıyoruz.
        acc[type] = { name: details?.name || type, value: 0 };
      }
      acc[type].value += currentValue;
      return acc;
    }, {} as Record<string, { name: string; value: number }>)
  ).map(([key, data]) => ({ ...data, type: key as Investment['type'] }));

  const totalPortfolioValue = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalPortfolioValue > 0 ? ((data.value / totalPortfolioValue) * 100).toFixed(2) : 0;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold">{data.name}</p>
          <p className="text-gray-700">Değer: ₺{data.value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
          <p className="text-sm text-gray-500">Portföydeki Payı: %{percentage}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-2 mb-4">
        <PieChartIcon className="h-5 w-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">Portföy Dağılımı</h2>
      </div>

      {investments.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center text-center">
          <TrendingUp className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="font-semibold text-gray-700">Grafik için veri yok</h3>
          <p className="text-sm text-gray-500">Portföy dağılımınızı görmek için varlık ekleyin.</p>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry) => (
                  // Renkleri artık typeDetails'ten alıyoruz.
                  <Cell key={`cell-${entry.name}`} fill={typeDetails[entry.type]?.color || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}