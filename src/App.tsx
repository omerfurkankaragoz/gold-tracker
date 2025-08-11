import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Holdings } from './components/Holdings';
import { AITools } from './components/AITools';
import { Navigation } from './components/Navigation';
import { Insights } from './components/Insights';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'holdings':
        return <Holdings />;
      case 'insights':
        return <Insights />;
      case 'ai-tools':
        return <AITools />;
      default:
        // ==================================================================
        // DEĞİŞİKLİK: Dashboard'a sayfa değiştirme fonksiyonunu gönderiyoruz
        // ==================================================================
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-100">
      <main className="flex-grow overflow-y-auto px-3 py-6 pb-16">
        {renderContent()}
      </main>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;