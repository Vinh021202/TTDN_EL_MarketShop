import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function useAppTheme() {
    const isDark = useThemeStore((state) => state.isDark);
    const language = useThemeStore((state) => state.language);

    useEffect(() => {
        document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
        document.documentElement.lang = language;
        document.body.classList.toggle('ttdn-dark-mode', isDark);
    }, [isDark, language]);
}
