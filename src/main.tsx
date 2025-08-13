import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { InvestmentsProvider } from './context/InvestmentsContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx'; // ThemeProvider'ı import ediyoruz

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* ================= DEĞİŞİKLİK BURADA ================= */}
    <ThemeProvider>
      <InvestmentsProvider>
        <App />
      </InvestmentsProvider>
    </ThemeProvider>
    {/* ======================================================= */}
  </StrictMode>
);