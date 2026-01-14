import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Session } from '@supabase/supabase-js';
import { supabase, Investment } from './lib/supabase';
import { Dashboard } from './components/Dashboard';
import { PortfolioList } from './components/PortfolioList';
import { Insights } from './components/Insights';
import { Auth } from './components/Auth';
import { Profile } from './components/Profile';
import { InvestmentDetail } from './components/InvestmentDetail';
import { AddInvestmentPage } from './components/AddInvestmentPage';
import { Navigation } from './components/Navigation';
import { History } from './components/History';
import { HistoryDetail } from './components/HistoryDetail';

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
    return <div className="h-full w-full bg-apple-light-bg dark:bg-apple-dark-bg" />;
  }

  return (
    <div className="h-full w-full">
      {!session ? <Auth /> : <MainApp key={session.user.id} />}
    </div>
  );
}

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [addInvestmentState, setAddInvestmentState] = useState<{
    isOpen: boolean;
    initialType?: Investment['type'];
    initialPortfolioId?: string;
  }>({ isOpen: false });

  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(() => {
    const savedState = localStorage.getItem('isBalanceVisible');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  useEffect(() => {
    localStorage.setItem('isBalanceVisible', JSON.stringify(isBalanceVisible));
  }, [isBalanceVisible]);

  const handleSelectInvestment = (id: string) => {
    setSelectedInvestmentId(id);
  };

  const handleBackToList = () => {
    setSelectedInvestmentId(null);
  };

  const handleSelectSale = (id: string) => {
    setSelectedSaleId(id);
  };

  const handleBackToHistory = () => {
    setSelectedSaleId(null);
  };

  const handleGoToAddInvestment = (initialPortfolioId?: string, initialType?: Investment['type']) => {
    setAddInvestmentState({ isOpen: true, initialType, initialPortfolioId });
  };

  const handleBackFromAdd = () => {
    setAddInvestmentState({ isOpen: false });
  };

  const renderContent = () => {
    // Add Investment Page
    if (addInvestmentState.isOpen) {
      return (
        <AddInvestmentPage
          onBack={handleBackFromAdd}
          initialSelectedType={addInvestmentState.initialType}
          initialPortfolioId={addInvestmentState.initialPortfolioId}
          isDirectAdd={!!addInvestmentState.initialType}
        />
      );
    }

    // Investment Detail
    if (selectedInvestmentId) {
      return <InvestmentDetail investmentId={selectedInvestmentId} onBack={handleBackToList} />;
    }

    // Sale Detail
    if (selectedSaleId) {
      return <HistoryDetail saleId={selectedSaleId} onBack={handleBackToHistory} />;
    }

    switch (activeTab) {
      case 'portfolios':
        return (
          <PortfolioList
            onSelectInvestment={handleSelectInvestment}
            onAddInvestment={(portfolioId) => handleGoToAddInvestment(portfolioId)}
            isBalanceVisible={isBalanceVisible}
          />
        );
      case 'insights':
        return <Insights isBalanceVisible={isBalanceVisible} onNavigate={setActiveTab} />;
      case 'history':
        return <History onSelectSale={handleSelectSale} isBalanceVisible={isBalanceVisible} />;
      case 'profile':
        return <Profile />;
      default:
        return (
          <Dashboard
            onNavigate={setActiveTab}
            onAddInvestment={(type) => handleGoToAddInvestment(undefined, type)}
            isBalanceVisible={isBalanceVisible}
            setIsBalanceVisible={setIsBalanceVisible}
          />
        );
    }
  };

  const isFullScreenPageOpen = !!selectedInvestmentId || !!selectedSaleId || addInvestmentState.isOpen;

  const pageKey = addInvestmentState.isOpen
    ? 'add-investment'
    : selectedInvestmentId
      ? `investment-${selectedInvestmentId}`
      : selectedSaleId
        ? `sale-${selectedSaleId}`
        : activeTab;

  return (
    <div className="h-full w-full flex flex-col bg-apple-light-bg dark:bg-apple-dark-bg">
      <main
        className="flex-grow overflow-y-auto px-4"
        style={{ paddingBottom: '7rem' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={pageKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      {!isFullScreenPageOpen && (
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
    </div>
  );
}

export default App;