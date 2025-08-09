import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { InvestmentsProvider } from './context/InvestmentsContext.tsx'; // Yeni eklenen satır

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InvestmentsProvider> {/* App'i sarmalıyoruz */}
      <App />
    </InvestmentsProvider>
  </StrictMode>
);