import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DisplayLanguage = 'vi' | 'en';
export type DisplayCurrency = 'VND' | 'USD';

const getCurrencyFromLanguage = (language: DisplayLanguage): DisplayCurrency =>
    language === 'en' ? 'USD' : 'VND';

const getLanguageFromCurrency = (currency: DisplayCurrency): DisplayLanguage =>
    currency === 'USD' ? 'en' : 'vi';

interface ThemeState {
    isDark: boolean;
    language: DisplayLanguage;
    currency: DisplayCurrency;
    toggleTheme: () => void;
    setLanguage: (language: DisplayLanguage) => void;
    setCurrency: (currency: DisplayCurrency) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            isDark: false,
            language: 'vi',
            currency: 'VND',
            toggleTheme: () => set((state) => ({ isDark: !state.isDark })),
            setLanguage: (language) =>
                set({
                    language,
                    currency: getCurrencyFromLanguage(language),
                }),
            setCurrency: (currency) =>
                set({
                    currency,
                    language: getLanguageFromCurrency(currency),
                }),
        }),
        {
            name: 'theme-storage',
        }
    )
);
