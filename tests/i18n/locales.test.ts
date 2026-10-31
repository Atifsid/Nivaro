import { DEFAULT_CATEGORIES } from '@/db/categories';
import { LANGUAGES, resources } from '@/i18n';

type Tree = { [k: string]: string | Tree };

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(tree)) {
    if (k === '_review') continue;
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[key] = v;
    else Object.assign(out, flatten(v, key));
  }
  return out;
}

const en = flatten(resources.en.translation as Tree);

test('there are nine languages in the agreed order', () => {
  expect(LANGUAGES.map((l) => l.code)).toEqual(['en', 'hi', 'bn', 'mr', 'te', 'ta', 'gu', 'kn', 'ml']);
});

test.each(LANGUAGES.map((l) => l.code))('%s has exactly the English keys and no empty text', (code) => {
  const t = flatten(resources[code].translation as Tree);
  expect(Object.keys(t).sort()).toEqual(Object.keys(en).sort());
  for (const [k, v] of Object.entries(t)) expect([k, v.trim().length > 0]).toEqual([k, true]);
});

test.each(LANGUAGES.filter((l) => l.code !== 'en').map((l) => l.code))(
  '%s is flagged for native speaker review',
  (code) => {
    expect((resources[code].translation as Tree)._review).toBe('needs native speaker review');
  },
);

test.each(LANGUAGES.map((l) => l.code))('%s keeps every {{placeholder}} from English', (code) => {
  const t = flatten(resources[code].translation as Tree);
  for (const [k, v] of Object.entries(en)) {
    const want = (v.match(/{{\w+}}/g) ?? []).sort();
    expect([k, (t[k].match(/{{\w+}}/g) ?? []).sort()]).toEqual([k, want]);
  }
});

test('every default category has an English name', () => {
  for (const [id] of DEFAULT_CATEGORIES) expect(en[`category.${id}`]).toBeTruthy();
});
