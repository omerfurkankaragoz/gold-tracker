// Konum: src/context/ThemeContext.tsx (YENİ DOSYA)

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

// Temanın tipini ve başlangıç durumunu tanımlıyoruz
type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// Context'i oluşturuyoruz
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Uygulamamızı sarmalayacak olan Provider component'i
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Tarayıcının veya sistemin tercihini veya local storage'daki kaydı okuyoruz
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme as Theme;
    }
    // Sistem tercihini kontrol et
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Tema her değiştiğinde bu fonksiyon çalışır
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    // Seçimi kullanıcının tarayıcısında sakla
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Temayı değiştiren fonksiyon
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Bu custom hook, component'lerden context'e kolayca erişmemizi sağlayacak
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};