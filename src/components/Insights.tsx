import { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, CircleUser } from 'lucide-react';
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
  onNavigate: (tab: string) => void;
}

export function Insights({ isBalanceVisible, onNavigate }: InsightsProps) {
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

  const yAxisDomain = useMemo(() => {
    if (chartData.length < 2) return ['auto', 'auto'];
    const values = chartData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const delta = max - min;
    if (delta === 0) {
      const padding = Math.max(100, min * 0.01);
      return [min - padding, max + padding];
    }
    const padding = delta * 0.01;
    const domainMin = Math.max(0, min - padding);
    const domainMax = max + padding;
    return [domainMin, domainMax];
  }, [chartData]);

  const isLoading = initialLoading || contextLoading || pricesLoading;
  if (isLoading) { /* ... */ }
  if (chartData.length === 0 && totalPortfolioValue === 0) { /* ... */ }

  const startValue = chartData[0]?.value || totalPortfolioValue;
  const endValue = chartData.length > 0 ? chartData[chartData.length - 1].value : totalPortfolioValue;
  const periodChange = endValue - startValue;
  const periodChangePercent = startValue > 0 ? (periodChange / startValue) * 100 : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0 && payload[0].value) {
      const value = payload[0].value;
      return (
        <div className="bg-black/70 dark:bg-apple-dark-card/70 backdrop-blur-sm text-white p-2 px-3 rounded-lg shadow-lg">
          <p className="text-xs font-semibold">{label}</p>
          <p className="font-bold text-base text-white">
            {isBalanceVisible
              ? `₺${Number(value).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
              : '₺******'
            }
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="pt-6">
      {/* ======================= BAŞLANGIÇ: SABİT ÜST BÖLÜM ======================= */}
      {/* ======================= BAŞLANGIÇ: SABİT ÜST BÖLÜM ======================= */}
      <div className="sticky top-0 z-20 bg-apple-light-bg dark:bg-apple-dark-bg py-4 pt-safe">
        <div className="flex items-center justify-between px-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary">Panelim</h1>
          </div>
          <button
            onClick={() => onNavigate('profile')}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <CircleUser className="w-9 h-9 text-apple-light-text-primary dark:text-apple-dark-text-primary" strokeWidth={1.5} />
          </button>
        </div>
      </div>
      {/* ======================= BİTİŞ: SABİT ÜST BÖLÜM ======================= */}

      <div className="px-2 pt-2 pb-4">
        <p className="text-base font-medium text-apple-light-text-secondary dark:text-apple-dark-text-secondary">Toplam Varlık Değeri</p>
        <p className="text-3xl font-bold tracking-tight text-apple-light-text-primary dark:text-apple-dark-text-primary mt-1">
          {isBalanceVisible ? `₺${endValue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '₺******'}
        </p>
        {chartData.length > 1 && (
          <div className={`flex items-center space-x-2 mt-1 font-semibold ${periodChange >= 0 ? 'text-apple-green' : 'text-apple-red'}`}>
            {isBalanceVisible ? (
              <>
                <TrendingUp className="h-5 w-5" />
                <span>₺{Math.abs(periodChange).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
                <span>({Math.abs(periodChangePercent).toFixed(2)}%)</span>
              </>
            ) : (<span>******</span>)}
          </div>
        )}
      </div>

      {/* ======================= BAŞLANGIÇ: KAYAN İÇERİK ======================= */}
      <div className="space-y-8 pt-2">
        <div>
          <div className="h-64 w-full">
            <ResponsiveContainer style={{ outline: 'none' }}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }} tabIndex={-1} style={{ outline: 'none' }}>
                <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0A84FF" stopOpacity={0.4} /><stop offset="95%" stopColor="#0A84FF" stopOpacity={0} /></linearGradient></defs>
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(142, 142, 147, 0.3)', strokeWidth: 2, strokeDasharray: '3 3' }} />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} stroke="#8A8A8E" className="dark:stroke-apple-dark-text-secondary" tickLine={false} axisLine={false} interval="preserveStartEnd" padding={{ left: 20, right: 20 }} />
                <YAxis domain={yAxisDomain} hide={true} />
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

        <AssetSummaryCard summary={assetSummary} loading={isLoading} isBalanceVisible={isBalanceVisible} />
        <PortfolioChart isBalanceVisible={isBalanceVisible} />
      </div>
      {/* ======================= BİTİŞ: KAYAN İÇERİK ======================= */}
    </div>
  );
}