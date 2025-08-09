import React from 'react';
import { Bot, TrendingUp, Target, Lightbulb, BarChart3, Shield } from 'lucide-react';

const aiTools = [
  {
    id: 'risk-profile',
    title: 'Yatırımcı Risk Profilim',
    description: 'Birkaç soruya cevap vererek yatırım karakterinizi öğrenin ve daha isabetli analizler alın.',
    icon: Shield,
    color: 'from-blue-500 to-blue-600',
    action: 'Risk Profilini Belirle',
  },
  {
    id: 'portfolio-analysis',
    title: 'Portföy Analizi',
    description: 'Portföyünüzün detaylı analizini ve kişiselleştirilmiş yatırım önerillerini alın.',
    icon: BarChart3,
    color: 'from-gray-700 to-gray-800',
    action: 'Analiz ve Öneriler Al',
  },
  {
    id: 'investment-advisor',
    title: 'Yatırım Hedefi Danışmanı',
    description: 'Bir hedef belirleyin, yapay zeka size özel bir yatırım planı oluştursun.',
    icon: Target,
    color: 'from-green-500 to-green-600',
    action: 'Hedefim İçin Plan Oluştur',
  },
];

export function AITools() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Yapay Zeka Araçları</h1>
        <p className="text-gray-600">Finansal kararlarınız için yapay zekadan destek alın.</p>
      </div>

      <div className="space-y-4">
        {aiTools.map((tool) => {
          const Icon = tool.icon;
          
          return (
            <div key={tool.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${tool.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-4">{tool.description}</p>
                    
                    <button className="bg-gray-900 text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-colors inline-flex items-center space-x-2">
                      <Bot className="h-4 w-4" />
                      <span>{tool.action}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming Soon Features */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-center space-x-2 mb-4">
          <Lightbulb className="h-6 w-6 text-purple-600" />
          <h2 className="text-lg font-semibold text-purple-900">Yakında Gelecek Özellikler</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-50 rounded-xl p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Otomatik Uyarılar</h3>
            <p className="text-sm text-purple-700">Hedef fiyatlara ulaştığında otomatik bildirimler alın</p>
          </div>
          
          <div className="bg-white bg-opacity-50 rounded-xl p-4">
            <h3 className="font-semibold text-purple-900 mb-2">Piyasa Analizleri</h3>
            <p className="text-sm text-purple-700">Günlük AI destekli piyasa yorumları ve öngörüler</p>
          </div>
        </div>
      </div>
    </div>
  );
}