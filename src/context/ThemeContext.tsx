import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);

    // 1. theme-color meta etiketini güncelle (Tarayıcı arayüzü rengi)
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      if (theme === 'dark') {
        themeColorMeta.setAttribute('content', '#000000'); // Koyu tema arka planı
      } else {
        themeColorMeta.setAttribute('content', '#F2F2F7'); // Açık tema arka planı
      }
    }

    // 2. apple-mobile-web-app-status-bar-style etiketini güncelle (iPhone status bar metin rengi)
    const statusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (statusBarMeta) {
      if (theme === 'dark') {
        // Koyu modda: 'black-translucent' veya 'black' kullanarak metnin BEYAZ olmasını sağlarız.
        statusBarMeta.setAttribute('content', 'black-translucent');
      } else {
        // Açık modda: 'default' kullanarak metnin SİYAH olmasını sağlarız.
        // theme-color etiketi sayesinde arka plan #F2F2F7 olur.
        statusBarMeta.setAttribute('content', 'default');
      }
    }

  }, [theme]);

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

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};