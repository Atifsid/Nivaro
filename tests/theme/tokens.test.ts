import { colors, fontFor } from '@/theme/tokens';
import { contrastRatio } from '../helpers/contrast';

test('core palette matches the Bold & punchy direction', () => {
  expect(colors.bg).toBe('#0D0D0D');
  expect(colors.surface).toBe('#161616');
  expect(colors.hairline).toBe('#2A2A2A');
  expect(colors.accent).toBe('#C8F031');
  expect(colors.accentEdge).toBe('#6F8A10');
});

test('muted text is readable on the background and on surfaces', () => {
  expect(contrastRatio(colors.textMuted, colors.bg)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(colors.textMuted, colors.surface)).toBeGreaterThanOrEqual(4.5);
  expect(contrastRatio(colors.onAccent, colors.accent)).toBeGreaterThanOrEqual(4.5);
});

test('each language gets a font for its script', () => {
  expect(fontFor('en', 'bold')).toBe('SpaceGrotesk_700Bold');
  expect(fontFor('ta', 'bold')).toBe('NotoSansTamil_700Bold');
  expect(fontFor('hi', 'regular')).toBe('NotoSansDevanagari_400Regular');
  expect(fontFor('mr', 'regular')).toBe('NotoSansDevanagari_400Regular');
  expect(fontFor('bn', 'bold')).toBe('NotoSansBengali_700Bold');
});

test('every font a language can ask for is bundled', () => {
  const { FONT_MAP } = require('@/theme/fonts');
  const langs = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'bn', 'gu'] as const;
  for (const l of langs) for (const w of ['regular', 'bold'] as const) expect(FONT_MAP[fontFor(l, w)]).toBeDefined();
});
