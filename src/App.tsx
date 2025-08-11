// Konum: src/App.tsx

import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Dashboard } from './components/Dashboard';
import { Holdings } from './components/Holdings';
import { AITools } from './components/AITools';
import { Navigation } from './components/Navigation';
import { Insights } from './components/Insights';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { InvestmentDetail } from './components/InvestmentDetail'; // YENİ: Detay component'ini import et

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="h-full w-full bg-gray-100" />;
  }

  return (
    <div className="h-full w-full">
      {!session ? <Auth /> : <MainApp key={session.user.id} />}
    </div>
  );
}

// Ana Uygulama Component'i
function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  // YENİ: Detay sayfası için seçilen varlık ID'sini tutacak state
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);

  // YENİ: Varlık seçildiğinde bu fonksiyon çağrılacak
  const handleSelectInvestment = (id: string) => {
    setActiveTab('holdings'); // Navigasyonun doğru kalması için aktif tab'ı ayarla
    setSelectedInvestmentId(id);
  };

  // YENİ: Detay sayfasından geri gelmek için fonksiyon
  const handleBackToHoldings = () => {
    setSelectedInvestmentId(null);
  };

  const renderContent = () => {
    // YENİ: Eğer bir varlık ID'si seçilmişse, hangi sekmede olursak olalım detay sayfasını göster
    if (selectedInvestmentId) {
      return <InvestmentDetail investmentId={selectedInvestmentId} onBack={handleBackToHoldings} />;
    }

    // Seçim yoksa, normal sekmeyi göster
    switch (activeTab) {
      case 'holdings':
        // YENİ: Holdings component'ine tıklama fonksiyonunu prop olarak gönder
        return <Holdings onSelectInvestment={handleSelectInvestment} />;
      case 'insights':
        return <Insights />;
      case 'ai-tools':
        return <AITools />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-gray-100">
      <main className="flex-grow overflow-y-auto px-4 py-6 pb-20">
        {renderContent()}
      </main>
      {/* Detay sayfasındayken navigasyon barını gizle */}
      {!selectedInvestmentId && (
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}

export default App;