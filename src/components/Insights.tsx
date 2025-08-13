// Konum: src/components/Insights.tsx

import React, { useState, useEffect, useMemo, useCallback } from 'react'; // useCallback'i kaldırdık
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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
  { id: '1G', label: 'Günlük' },
  { id: '1H', label: 'Haftalık' },
  { id: '1A', label: 'Aylık' },
  { id: '1Y', label: 'Yıllık' },
  { id: 'Tümü', label: 'Tümü' },
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

  // ======================= GÜNCELLENEN BÖLÜM 1 =======================
  // Veri çekme fonksiyonunu daha sade bir hale getirmek için useCallback sarmalayıcısını kaldırdık.
  // Bu, olası state etkileşim sorunlarını ortadan kaldırır.
  const fetchHistoryData = async (range: TimeRange) => {
    setInitialLoading(true);

    try {
      let queryBuilder; // Sorgu oluşturucuyu başta tanımlıyoruz.
      let finalData = [];

      if (range === '1G') {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        const { data: yesterdayData, error: yesterdayError } = await supabase
          .from('portfolio_history')
          .select('recorded_at, value')
          .gte('recorded_at', yesterday.toISOString())
          .lt('recorded_at', today.toISOString())
          .order('recorded_at', { ascending: false })
          .limit(1);
        
        if (yesterdayError) throw yesterdayError;
        finalData = yesterdayData || [];

      } else {
        const now = new Date();
        let startDate: Date | null = null;
        queryBuilder = supabase
          .from('portfolio_history')
          .select('recorded_at, value')
          .order('recorded_at', { ascending: true });

        switch (range) {
          case '1H': startDate = new Date(now.setDate(now.getDate() - 7)); break;
          case '1A': startDate = new Date(now.setMonth(now.getMonth() - 1)); break;
          case '1Y': startDate = new Date(now.setFullYear(now.getFullYear() - 1)); break;
          default: startDate = null; 
        }

        if (startDate) {
          queryBuilder = queryBuilder.gte('recorded_at', startDate.toISOString());
        }
        
        const { data, error } = await queryBuilder;
        if (error) throw error;
        finalData = data || [];
      }
      
      const formattedHistory = finalData
        .map(item => {
          if (item && typeof item.value === 'number') {
            return {
              time: new Date(item.recorded_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
              value: parseFloat(item.value.toFixed(2)),
            };
          }
          return null;
        })
        .filter(Boolean) as ChartDataPoint[];
      
      setHistoryData(formattedHistory);

    } catch (error) {
      console.error("Geçmiş verileri çekerken hata:", error);
      setHistoryData([]);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData(activeRange);
  }, [activeRange]); // Artık sadece activeRange değiştiğinde tetikleniyor.
  // =========================================================================

  const assetSummary = useMemo<SummaryData>(() => {
    const summary: SummaryData = {};
    investments.forEach(investment => {
        const price = prices[investment.type]?.sellingPrice || 1;
        if (!summary[investment.type]) {
            summary[investment.type] = { totalAmount: 0, totalValue: 0 };
        }
        const summaryItem = summary[investment.type]!;
        summaryItem.totalAmount += investment.amount;
        summaryItem.totalValue += investment.amount * price;
    });
    return summary;
  }, [investments, prices]);

  const chartData = useMemo(() => {
    const finalData = [...historyData];
    if (totalPortfolioValue > 0) {
      finalData.push({
        time: 'Şimdi',
        value: parseFloat(totalPortfolioValue.toFixed(2)),
      });
    }
    return finalData;
  }, [historyData, totalPortfolioValue]);

  const isLoading = initialLoading || contextLoading || pricesLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Loader className="animate-spin text-blue-600 h-8 w-8" />
        <p className="mt-4 text-gray-600">Paneliniz yükleniyor...</p>
      </div>
    );
  }

  if (chartData.length === 0 && totalPortfolioValue === 0) {
    return (
        <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <BarChart2 className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">Başlamak için Varlık Ekleyin</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Henüz görüntülenecek bir portföy veriniz yok. İlk varlığınızı eklediğinizde grafiğiniz burada oluşacaktır.
            </p>
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
        <div className="bg-gray-900 text-white p-2 rounded-md shadow-lg border border-gray-700">
          <p className="text-xs font-semibold">{label}</p>
          <p className="font-bold text-base text-blue-300">
            {isBalanceVisible ? 
              `₺${payload[0].value.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '₺******'
            }
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
        <p className="text-sm text-gray-500 mb-2">Toplam Varlıklarım</p>
        <h1 className="text-4xl font-bold text-gray-900">
          {isBalanceVisible ? 
            `₺${endValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : '₺******'
          }
        </h1>
        {chartData.length > 1 && (
            <div className={`flex items-center justify-center space-x-2 mt-2 font-semibold ${ periodChange >= 0 ? 'text-green-600' : 'text-red-600' }`}>
              {isBalanceVisible ? (
                <>
                  <TrendingUp className="h-5 w-5" />
                  <span>{periodChange >= 0 ? '+' : ''}₺{Math.abs(periodChange).toLocaleString('tr-TR', {minimumFractionDigits: 2})}</span>
                  <span>({periodChangePercent.toFixed(2)}%)</span>
                </>
              ) : (
                <span>******</span>
              )}
            </div>
        )}
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <Tooltip content={<CustomTooltip />} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10 }} 
              stroke="#9ca3af" 
              tickLine={false} 
              axisLine={false}
              interval="preserveStartEnd"
              padding={{ left: 10, right: 10 }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#2563eb" 
              strokeWidth={2.5} 
              fill="url(#colorValue)" 
              fillOpacity={1}
              connectNulls 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-between space-x-1 p-1 bg-gray-100 border border-gray-200 rounded-full">
        {timeRanges.map(range => (
          <button
            key={range.id}
            onClick={() => setActiveRange(range.id)}
            // ======================= GÜNCELLENEN BÖLÜM 2 =======================
            // Hover efekti daha temiz bir hale getirildi. 
            // Artık yazı rengi değişmiyor, sadece arka plan rengi hafifçe değişiyor.
            className={`flex-1 px-3 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
              activeRange === range.id
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-transparent text-gray-500 hover:bg-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
      
      <AssetSummaryCard summary={assetSummary} loading={isLoading} />
      
      <PortfolioChart />
      
    </div>
  );
}