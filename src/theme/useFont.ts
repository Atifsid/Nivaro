import { useTranslation } from 'react-i18next';

import type { Lang } from '@/db/types';

import { fontFor } from './tokens';

const LANGS: Lang[] = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'bn', 'gu'];

export function useFont(weight: 'regular' | 'bold'): string {
  const { i18n } = useTranslation();
  const lang = LANGS.includes(i18n?.language as Lang) ? (i18n.language as Lang) : 'en';
  return fontFor(lang, weight);
}

export function useNumberFont(): string {
  return fontFor('en', 'bold');
}
