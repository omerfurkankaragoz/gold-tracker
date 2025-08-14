import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PieChart as PieChartIcon, PiggyBank } from 'lucide-react';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { usePrices } from '../hooks/usePrices';

const typeDetails: Record<string, { name: string; color: string }> = {
  gold: { name: 'Gram Altın', color: '#FFC300' }, quarter_gold: { name: 'Çeyrek Altın', color: '#F7B600' },
  half_gold: { name: 'Yarım Altın', color: '#EAA700' }, full_gold: { name: 'Tam Altın', color: '#D69800' },
  cumhuriyet_gold: { name: 'Cumhuriyet Altını', color: '#C28900' }, ata_gold: { name: 'Ata Altın', color: '#AD7A00' },
  ayar_14_gold: { name: '14 Ayar Altın', color: '#996B00' }, ayar_18_gold: { name: '18 Ayar Altın', color: '#855C00' },
  gumus: { name: 'Gram Gümüş', color: '#C0C0C0' }, usd: { name: 'Dolar', color: '#28A745' },
  eur: { name: 'Euro', color: '#007BFF' }, tl: { name: 'Türk Lirası', color: '#6F42C1' },
};

export function PortfolioChart() {
  const { investments, totalPortfolioValue } = useInvestmentsContext();
  const { prices } = usePrices();

  const chartData = useMemo(() => {
    if (investments.length === 0 || Object.keys(prices).length === 0) return [];
    const aggregatedData = investments.reduce((acc, inv) => {
      const details = typeDetails[inv.type]; const priceInfo = prices[inv.type];
      if (!details || !priceInfo) return acc;
      const value = inv.amount * priceInfo.sellingPrice;
      if (!acc[details.name]) acc[details.name] = { value: 0, color: details.color };
      acc[details.name].value += value;
      return acc;
    }, {} as Record<string, { value: number; color: string }>);
    return Object.entries(aggregatedData).map(([name, data]) => ({ name, ...data }));
  }, [investments, prices]);

  if (investments.length === 0) {
    return (
      <div className="bg-apple-light-card/50 dark:bg-apple-dark-card rounded-2xl p-6 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <PieChartIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="font-semibold text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Portföy Dağılımı Yok</h3>
          <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary mt-1 max-w-xs mx-auto">Varlık eklediğinizde, dağılım grafiğiniz burada görünecek.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="px-2">
        <h2 className="text-2xl font-bold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary">Portföy Dağılımı</h2>
      </div>
      <div className="bg-apple-light-card dark:bg-apple-dark-card rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="h-48 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" nameKey="name">
                  {chartData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.color} stroke={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number) => `₺${value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`} wrapperClassName="!rounded-xl !shadow-lg !bg-black/70 dark:!bg-apple-dark-card/70 !backdrop-blur-sm" contentStyle={{ backgroundColor: 'transparent', border: 'none' }} labelStyle={{ color: '#fff' }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {chartData.map((entry) => {
              const percentage = totalPortfolioValue > 0 ? (entry.value / totalPortfolioValue) * 100 : 0;
              return (
                <div key={entry.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: entry.color }}></span>
                    <span className="font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-apple-light-text-primary dark:text-apple-dark-text-primary">{percentage.toFixed(1)}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}