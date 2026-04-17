import { DisplayCurrency, DisplayLanguage, useThemeStore } from '@/store/themeStore';

export const USD_TO_VND_RATE = 27000;

export const getCurrencyByLanguage = (language: DisplayLanguage): DisplayCurrency =>
    language === 'en' ? 'USD' : 'VND';

export const getLanguageLabel = (language: DisplayLanguage) =>
    language === 'en' ? 'English' : 'Vietnamese';

export const getIntlLocale = (language: DisplayLanguage) =>
    language === 'en' ? 'en-US' : 'vi-VN';

export const translate = <T>(content: { vi: T; en: T }, language = useThemeStore.getState().language) =>
    language === 'en' ? content.en : content.vi;

export const formatDisplayCurrency = (
    amount: number,
    language = useThemeStore.getState().language
) => {
    const currency = getCurrencyByLanguage(language);
    const locale = getIntlLocale(language);
    const convertedAmount = currency === 'USD' ? amount / USD_TO_VND_RATE : amount;

    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(convertedAmount);
};

export const formatDisplayDate = (
    value: string | number | Date,
    language = useThemeStore.getState().language,
    options?: Intl.DateTimeFormatOptions
) =>
    new Intl.DateTimeFormat(getIntlLocale(language), options).format(new Date(value));

export const formatDisplayDateTime = (
    value: string | number | Date,
    language = useThemeStore.getState().language
) =>
    formatDisplayDate(value, language, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

