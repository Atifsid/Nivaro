import { listCategories, seedDefaultCategories } from '@/db/categories';
import { migrate } from '@/db/migrations';
import { nodeDb } from '../helpers/nodeDb';

test('default categories seed once with Indian buckets', async () => {
  const db = nodeDb();
  await migrate(db);
  await seedDefaultCategories(db);
  await seedDefaultCategories(db);
  const cats = await listCategories(db);
  expect(cats).toHaveLength(22);
  expect(cats.find((c) => c.id === 'rent')).toMatchObject({ bucket: 'needs', nameKey: 'category.rent' });
  expect(cats.find((c) => c.id === 'salary')?.bucket).toBe('income');
  expect(cats.find((c) => c.id === 'savings_investments')?.bucket).toBe('savings');
});
