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
    return <div className="h-full w-full bg-gray-100" />; // Yüklenirken boş ekran
  }

  // Eğer oturum yoksa Auth ekranını göster, varsa MainApp'i göster
  // DEĞİŞİKLİK: MainApp'e bir 'key' atıyoruz.
  // Bu key, kullanıcı ID'sine bağlıdır. Kullanıcı değiştiğinde (çıkış/giriş),
  // key de değişir ve React, MainApp component'ini tamamen yeniden oluşturur.
  // Bu, eski kullanıcıya ait verilerin ekranda kalmasını %100 engeller.
  return (
    <div className="h-full w-full">
      {!session ? <Auth /> : <MainApp key={session.user.id} />}
    </div>
  );
}

// Ana Uygulama Component'i
function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'holdings':
        return <Holdings />;
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
      <main className="flex-grow overflow-y-auto px-3 py-6 pb-16">
        {renderActiveTab()}
      </main>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;