import { promptContent } from '@/capture/prompt';
import type { Category } from '@/db/categories';
import type { Transaction } from '@/db/transactions';

const tx = { amountPaise: 24900, merchant: 'Blinkit', direction: 'debit' } as Transaction;
const cat = (id: string): Category => ({ id, nameKey: `category.${id}`, icon: '', bucket: 'needs', sort: 0 });
const t = (k: string, o?: Record<string, string>) => (o ? `${k}:${JSON.stringify(o)}` : k);

test('shows the amount and shop, up to three categories and a skip', () => {
  const c = promptContent(tx, [cat('groceries'), cat('food_delivery'), cat('shopping'), cat('fuel')], t);
  expect(c.title).toBe('prompt.title:{"amount":"₹249","merchant":"Blinkit"}');
  expect(c.actions.map((a) => a.id)).toEqual(['groceries', 'food_delivery', 'shopping', 'skip']);
  expect(c.actions[0].label).toBe('category.groceries');
});

test('works with fewer suggestions', () => {
  expect(promptContent(tx, [cat('fuel')], t).actions.map((a) => a.id)).toEqual(['fuel', 'skip']);
});
