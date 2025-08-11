import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Holdings } from './components/Holdings';
import { AITools } from './components/AITools';
import { Navigation } from './components/Navigation';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

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
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Sabit üst bilgi (header) bölümü buradan kaldırıldı. */}

      {/* 2. Kaydırılabilir Ana İçerik Alanı */}
      {/* Header kaldırıldığı için bu alan artık en tepeden başlayacak. */}
      <main className="flex-grow overflow-y-auto w-full max-w-4xl mx-auto px-4 py-6 pb-28">
        {renderContent()}
      </main>

      {/* 3. Sabit Alt Navigasyon */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
