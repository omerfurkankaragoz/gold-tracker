import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { InvestmentsProvider } from './context/InvestmentsContext.tsx';
import { PortfoliosProvider } from './context/PortfoliosContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <InvestmentsProvider>
        <PortfoliosProvider>
          <App />
        </PortfoliosProvider>
      </InvestmentsProvider>
    </ThemeProvider>
  </StrictMode>
);
