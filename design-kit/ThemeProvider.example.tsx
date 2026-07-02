// Exemple minimal de ThemeProvider React réutilisant theme.ts.
// Copier/adapter dans la nouvelle app (facultatif — seul tokens.css est requis
// si l'app n'est pas en React).

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { darkColors, lightColors, type ThemeColors } from './theme';

interface ThemeContextValue {
  isDark: boolean;
  toggle: () => void;
  c: ThemeColors;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: true,
  toggle: () => {},
  c: darkColors,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('app-theme') !== 'light');

  const toggle = () => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('app-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggle, c: isDark ? darkColors : lightColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// Usage dans un composant :
//   const { c } = useTheme();
//   <div style={{ background: c.bgCard, color: c.textPrimary }}>...</div>
// Ou en pur CSS (sans React) : appliquer data-theme="dark|light" sur <html>
// et utiliser les classes/variables de tokens.css directement.
