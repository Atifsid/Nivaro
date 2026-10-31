import { getLocales } from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { updateSettings } from '@/db/settings';
import type { Db, Lang } from '@/db/types';

import bn from './locales/bn.json';
import en from './locales/en.json';
import gu from './locales/gu.json';
import hi from './locales/hi.json';
import kn from './locales/kn.json';
import ml from './locales/ml.json';
import mr from './locales/mr.json';
import ta from './locales/ta.json';
import te from './locales/te.json';

export const resources = {
  en: { translation: en },
  hi: { translation: hi },
  bn: { translation: bn },
  mr: { translation: mr },
  te: { translation: te },
  ta: { translation: ta },
  gu: { translation: gu },
  kn: { translation: kn },
  ml: { translation: ml },
} satisfies Record<Lang, { translation: object }>;

export const LANGUAGES: { code: Lang; nativeName: string }[] = [
  { code: 'en', nativeName: 'English' },
  { code: 'hi', nativeName: 'हिन्दी' },
  { code: 'bn', nativeName: 'বাংলা' },
  { code: 'mr', nativeName: 'मराठी' },
  { code: 'te', nativeName: 'తెలుగు' },
  { code: 'ta', nativeName: 'தமிழ்' },
  { code: 'gu', nativeName: 'ગુજરાતી' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', nativeName: 'മലയാളം' },
];

export function isLang(value: unknown): value is Lang {
  return LANGUAGES.some((l) => l.code === value);
}

export function deviceLanguage(): Lang {
  const code = getLocales()[0]?.languageCode;
  return isLang(code) ? code : 'en';
}

export async function initI18n(lang: Lang | null): Promise<void> {
  const lng = lang ?? deviceLanguage();
  if (i18next.isInitialized) {
    await i18next.changeLanguage(lng);
    return;
  }
  await i18next.use(initReactI18next).init({
    resources,
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export async function setLanguage(db: Db, lang: Lang): Promise<void> {
  await updateSettings(db, { language: lang });
  await i18next.changeLanguage(lang);
}
