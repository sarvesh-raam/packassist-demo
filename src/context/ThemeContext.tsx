import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Theme colors type
export interface ThemeColors {
    bg: string;
    bgSecondary: string;
    cardBg: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    border: string;
    borderLight: string;
    accent: string;
    accentHover: string;
    accentLight: string;
    inputBg: string;
    labelBg: string;
    error: string;
    errorBg: string;
    success: string;
    successBg: string;
    warning: string;
    warningBg: string;
    shadow: string;
    shadowMd: string;
    shadowLg: string;
    glass: string;
    glassHover: string;
}

// Light theme
const lightTheme: ThemeColors = {
    bg: '#f8f9fa',
    bgSecondary: '#ffffff',
    cardBg: '#ffffff',
    text: '#202124',
    textSecondary: '#5f6368',
    textTertiary: '#80868b',
    border: '#dadce0',
    borderLight: '#e8eaed',
    accent: '#1a73e8',
    accentHover: '#1967d2',
    accentLight: '#e8f0fe',
    inputBg: '#ffffff',
    labelBg: '#ffffff',
    error: '#d93025',
    errorBg: '#fce8e6',
    success: '#34a853',
    successBg: '#e6f4ea',
    warning: '#fbbc04',
    warningBg: '#fef7e0',
    shadow: '0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15)',
    shadowMd: '0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15)',
    shadowLg: '0 2px 6px 2px rgba(60, 64, 67, 0.15), 0 8px 24px 4px rgba(60, 64, 67, 0.15)',
    glass: 'rgba(255, 255, 255, 0.95)',
    glassHover: 'rgba(241, 243, 244, 1)',
};

// Dark theme
const darkTheme: ThemeColors = {
    bg: '#000000',
    bgSecondary: '#1a1a1c',
    cardBg: '#1a1a1c',
    text: '#e8eaed',
    textSecondary: '#9aa0a6',
    textTertiary: '#80868b',
    border: '#3c4043',
    borderLight: '#3c4043',
    accent: '#8ab4f8',
    accentHover: '#aecbfa',
    accentLight: 'rgba(138, 180, 248, 0.1)',
    inputBg: 'transparent',
    labelBg: '#1a1a1c',
    error: '#f28b82',
    errorBg: 'rgba(242, 139, 130, 0.1)',
    success: '#81c995',
    successBg: 'rgba(129, 201, 149, 0.1)',
    warning: '#fdd663',
    warningBg: 'rgba(253, 214, 99, 0.1)',
    shadow: 'none',
    shadowMd: 'none',
    shadowLg: 'none',
    glass: 'rgba(48, 49, 52, 0.95)',
    glassHover: 'rgba(60, 64, 67, 1)',
};

interface ThemeContextType {
    isDark: boolean;
    theme: ThemeColors;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDark, setIsDark] = useState(() =>
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    const theme = isDark ? darkTheme : lightTheme;
    const toggleTheme = () => setIsDark(!isDark);

    return (
        <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Export themes for direct access if needed
export { lightTheme, darkTheme };
