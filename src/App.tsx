import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Holdings } from './components/Holdings';
import { AITools } from './components/AITools';
import { Navigation } from './components/Navigation';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // useAuth ve ona bağlı tüm kontrol mantığı kaldırıldı.
  // Artık Auth component'i de import edilmiyor.

  const renderContent = () => {
    switch (activeTab) {
      case 'holdings':
        return <Holdings />;
      case 'ai-tools':
        return <AITools />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="px-4 py-6 pb-20 max-w-4xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;