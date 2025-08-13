// Konum: src/components/Insights.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
// Eye ve EyeOff import'ları kaldırıldı, sadece TrendingUp, Loader, BarChart2 kalıyor
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

// Props arayüzü, App.tsx'den gelen verileri almak için aynı kalıyor
interface InsightsProps {
  isBalanceVisible: boolean;
}

// Props'tan artık setIsBalanceVisible fonksiyonunu almıyoruz, çünkü burada buton yok
export function Insights({ isBalanceVisible }: InsightsProps) {
  const { investments, totalPortfolioValue, loading: contextLoading } = useInvestmentsContext();
  const { prices, loading: pricesLoading } = usePrices();
  
  const [historyData, setHistoryData] = useState<ChartDataPoint[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const initializeChart = async () => {
      setInitialLoading(true);
      try {
        const { data: history, error } = await supabase
          .from('portfolio_history')
          .select('recorded_at, value')
          .order('recorded_at', { ascending: true })
          .limit(30);

        if (error) throw error;

        const formattedHistory = history
          ?.map(item => {
            if (item && typeof item.value === 'number') {
              return {
                time: new Date(item.recorded_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }),
                value: parseFloat(item.value.toFixed(2)),
              };
            }
            return null;
          })
          .filter(Boolean) as ChartDataPoint[] || [];
        
        setHistoryData(formattedHistory);
      } catch (error) {
        console.error("Geçmiş verileri çekerken hata:", error);
        setHistoryData([]);
      } finally {
        setInitialLoading(false);
      }
    };
    initializeChart();
  }, []);

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
      {/* ======================= DEĞİŞİKLİK BURADA ======================= */}
      {/* Toplam varlıklar kartından göz ikonu butonu kaldırıldı */}
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
      {/* ================================================================= */}

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
      
      <AssetSummaryCard summary={assetSummary} loading={isLoading} />
      
      <PortfolioChart />
      
    </div>
  );
}