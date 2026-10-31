import type { Lang } from '@/db/types';

export const colors = {
  bg: '#0D0D0D',
  surface: '#161616',
  surfaceRaised: '#1E1E1E',
  hairline: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#A3A3A3',
  accent: '#C8F031',
  accentEdge: '#6F8A10',
  onAccent: '#0D0D0D',
  danger: '#FF5A4E',
  warning: '#FFB020',
  positive: '#C8F031',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const type = {
  hero: { fontSize: 40, lineHeight: 46, letterSpacing: -0.8 },
  title: { fontSize: 22, lineHeight: 28 },
  body: { fontSize: 15, lineHeight: 21 },
  small: { fontSize: 12, lineHeight: 16 },
  label: { fontSize: 11, lineHeight: 14, letterSpacing: 1.5 },
} as const;

export const POP_OFFSET = 4;

type Weight = 'regular' | 'bold';

const SCRIPT_FAMILY: Record<Lang, string> = {
  en: 'SpaceGrotesk',
  hi: 'NotoSansDevanagari',
  mr: 'NotoSansDevanagari',
  ta: 'NotoSansTamil',
  te: 'NotoSansTelugu',
  kn: 'NotoSansKannada',
  ml: 'NotoSansMalayalam',
  bn: 'NotoSansBengali',
  gu: 'NotoSansGujarati',
};

export function fontFor(lang: Lang, weight: Weight): string {
  return `${SCRIPT_FAMILY[lang]}_${weight === 'bold' ? '700Bold' : '400Regular'}`;
}
