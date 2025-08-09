import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const periods = ['Günlük', 'Aylık', 'Yıllık'] as const;
type Period = typeof periods[number];

// Sample data - in real app this would come from your backend
const generateSampleData = (period: Period) => {
  const dataPoints = period === 'Günlük' ? 24 : period === 'Aylık' ? 30 : 12;
  const baseValue = 45000;
  
  return Array.from({ length: dataPoints }, (_, i) => {
    const variation = (Math.random() - 0.5) * 0.1;
    const value = baseValue + (baseValue * variation) + (i * 100);
    
    let label = '';
    if (period === 'Günlük') {
      label = `${i.toString().padStart(2, '0')}:00`;
    } else if (period === 'Aylık') {
      label = `${i + 1}`;
    } else {
      const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 
                     'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      label = months[i];
    }
    
    return {
      time: label,
      value: Math.round(value),
    };
  });
};

export function PortfolioChart() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Aylık');
  const data = generateSampleData(selectedPeriod);
  const currentValue = data[data.length - 1]?.value || 0;
  const previousValue = data[data.length - 2]?.value || 0;
  const change = currentValue - previousValue;
  const changePercent = (change / previousValue) * 100;
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Portföy Değer Grafiği</h2>
        </div>
        
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          ₺{currentValue.toLocaleString('tr-TR')}
        </div>
        <div className={`flex items-center space-x-1 text-sm font-medium ${
          change >= 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          <TrendingUp className={`h-4 w-4 ${change < 0 ? 'rotate-180' : ''}`} />
          <span>{change >= 0 ? '+' : ''}₺{Math.abs(change).toLocaleString('tr-TR')}</span>
          <span>({change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%)</span>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
            />
            <YAxis hide />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, stroke: '#3B82F6', strokeWidth: 2, fill: 'white' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}