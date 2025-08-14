import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader, BarChart2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useInvestmentsContext } from '../context/InvestmentsContext';
import { PortfolioChart } from './PortfolioChart';
import { usePrices } from '../hooks/usePrices';
import { AssetSummaryCard, SummaryData } from './AssetSummaryCard';

type ChartDataPoint = {
  time: string;
  value: number;
};
type TimeRange = '1G' | '1H' | '1A' | '1Y' | 'Tümü';
const timeRanges: { id: TimeRange; label: string }[] = [
  { id: '1G', label: 'Günlük' }, { id: '1H', label: 'Haftalık' }, { id: '1A', label: 'Aylık' },
  { id: '1Y', label: 'Yıllık' }, { id: 'Tümü', label: 'Tümü' },
];

interface InsightsProps {
  isBalanceVisible: boolean;
}

export function Insights({ isBalanceVisible }: InsightsProps) {
  const { investments, totalPortfolioValue, loading: contextLoading } = useInvestmentsContext();
  const { prices, loading: pricesLoading } = usePrices();
  const [historyData, setHistoryData] = useState<ChartDataPoint[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeRange, setActiveRange] = useState<TimeRange>('1A');

  const fetchHistoryData = async (range: TimeRange) => {
    setInitialLoading(true);
    try {
      let finalData = [];
      if (range === '1G') {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
        const { data, error } = await supabase.from('portfolio_history').select('recorded_at, value').gte('recorded_at', yesterday.toISOString()).lt('recorded_at', today.toISOString()).order('recorded_at', { ascending: false }).limit(1);
        if (error) throw error;
        finalData = data || [];
      } else {
        const now = new Date(); let startDate: Date | null = null;
        let queryBuilder = supabase.from('portfolio_history').select('recorded_at, value').order('recorded_at', { ascending: true });
        switch (range) {
          case '1H': startDate = new Date(now.setDate(now.getDate() - 7)); break;
          case '1A': startDate = new Date(now.setMonth(now.getMonth() - 1)); break;
          case '1Y': startDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
          default: startDate = null;
        }
        if (startDate) queryBuilder = queryBuilder.gte('recorded_at', startDate.toISOString());
        const { data, error } = await queryBuilder;
        if (error) throw error;
        finalData = data || [];
      }
      const formattedHistory = finalData.map(item => item && typeof item.value === 'number' ? { time: new Date(item.recorded_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }), value: parseFloat(item.value.toFixed(2)) } : null).filter(Boolean) as ChartDataPoint[];
      setHistoryData(formattedHistory);
    } catch (error) { console.error("Geçmiş verileri çekerken hata:", error); setHistoryData([]); }
    finally { setInitialLoading(false); }
  };

  useEffect(() => { fetchHistoryData(activeRange); }, [activeRange]);

  const assetSummary = useMemo<SummaryData>(() => {
    const summary: SummaryData = {};
    investments.forEach(inv => {
      const price = prices[inv.type]?.sellingPrice || 1;
      if (!summary[inv.type]) summary[inv.type] = { totalAmount: 0, totalValue: 0 };
      summary[inv.type]!.totalAmount += inv.amount;
      summary[inv.type]!.totalValue += inv.amount * price;
    });
    return summary;
  }, [investments, prices]);

  const chartData = useMemo(() => {
    const data = [...historyData];
    if (totalPortfolioValue > 0) data.push({ time: 'Şimdi', value: parseFloat(totalPortfolioValue.toFixed(2)) });
    return data;
  }, [historyData, totalPortfolioValue]);

  const isLoading = initialLoading || contextLoading || pricesLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Loader className="animate-spin text-apple-blue" />
        <p className="mt-4 text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Paneliniz yükleniyor...</p>
      </div>
    );
  }

  if (chartData.length === 0 && totalPortfolioValue === 0) {
    return (
      <div className="text-center py-16 bg-apple-light-card/50 dark:bg-apple-dark-card rounded-2xl">
        <BarChart2 className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="font-semibold text-apple-light-text-secondary dark:text-apple-dark-text-secondary mb-2">Başlamak için Varlık Ekleyin</h3>
        <p className="text-sm text-apple-light-text-secondary dark:text-apple-dark-text-secondary max-w-xs mx-auto">Varlık eklediğinizde grafiğiniz burada oluşacaktır.</p>
      </div>
    );
  }

  const startValue = chartData[0]?.value || totalPortfolioValue;
  const endValue = chartData.length > 0 ? chartData[chartData.length - 1].value : totalPortfolioValue;
  const periodChange = endValue - startValue;
  const periodChangePercent = startValue > 0 ? (periodChange / startValue) * 100 : 0;
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-black/70 dark:bg-apple-dark-card/70 backdrop-blur-sm text-white p-2 rounded-lg shadow-lg">
          <p className="text-xs font-semibold">{label}</p>
          <p className="font-bold text-base text-white">{isBalanceVisible ? `₺${payload[0].value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '₺******'}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="px-2">
        <p className="text-base font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Toplam Varlık Değeri</p>
        <p className="text-3xl font-bold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary mt-1">
          {isBalanceVisible ? `₺${endValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '₺******'}
        </p>
        {chartData.length > 1 && (
          <div className={`flex items-center space-x-2 mt-1 font-semibold ${ periodChange >= 0 ? 'text-apple-green' : 'text-apple-red' }`}>
            {isBalanceVisible ? (
              <>
                <TrendingUp className="h-5 w-5" />
                <span>₺{Math.abs(periodChange).toLocaleString('tr-TR', {minimumFractionDigits: 2})}</span>
                <span>({Math.abs(periodChangePercent).toFixed(2)}%)</span>
              </>
            ) : ( <span>******</span> )}
          </div>
        )}
      </div>

      <div>
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <AreaChart data={chartData}>
              <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0A84FF" stopOpacity={0.4}/><stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/></linearGradient></defs>
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(142, 142, 147, 0.3)', strokeWidth: 2, strokeDasharray: '3 3' }} />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#8A8A8E" className="dark:stroke-apple-dark-text-secondary" tickLine={false} axisLine={false} interval="preserveStartEnd" padding={{ left: 20, right: 20 }}/>
              <Area type="monotone" dataKey="value" stroke="#0A84FF" strokeWidth={2.5} fill="url(#colorValue)" fillOpacity={1} connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between space-x-1 p-1 mt-4 bg-gray-200/50 dark:bg-apple-dark-card rounded-full">
          {timeRanges.map(range => (
            <button key={range.id} onClick={() => setActiveRange(range.id)} className={`flex-1 px-3 py-2 text-sm font-semibold rounded-full transition-all ${range.id === activeRange ? 'bg-apple-light-card dark:bg-gray-700 text-apple-blue shadow-md' : 'text-apple-light-text-secondary dark:text-apple-dark-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}>
              {range.label}
            </button>
          ))}
        </div>
      </div>
      
   <AssetSummaryCard 
        summary={assetSummary} 
        loading={isLoading} 
        isBalanceVisible={isBalanceVisible} 
      />      
      <PortfolioChart />
    </div>
  );
}