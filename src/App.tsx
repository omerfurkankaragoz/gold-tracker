import React, { useState } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Holdings } from './components/Holdings';
import { AITools } from './components/AITools';
import { Navigation } from './components/Navigation';
import { useAuth } from './hooks/useAuth';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

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