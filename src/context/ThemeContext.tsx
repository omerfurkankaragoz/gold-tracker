import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // ======================= GÜNCELLENEN BÖLÜM =======================
  // Tema state'inin başlangıç değerini ayarlayan mantığı değiştiriyoruz.
  const [theme, setTheme] = useState<Theme>(() => {
    // Önce kullanıcının tarayıcısında saklanmış bir tema var mı diye bak.
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    
    // Eğer varsa o temayı kullan, yoksa her zaman 'light' (açık) tema ile başla.
    return savedTheme || 'light';
  });
  // ====================================================================

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      if (theme === 'dark') {
        themeColorMeta.setAttribute('content', '#111827'); 
      } else {
        themeColorMeta.setAttribute('content', '#ffffff');
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