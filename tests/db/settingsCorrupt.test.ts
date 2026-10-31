import { migrate } from '@/db/migrations';
import { getSettings } from '@/db/settings';
import { nodeDb } from '../helpers/nodeDb';

test('a corrupt saved value falls back to its default instead of crashing start-up', async () => {
  const db = nodeDb();
  await migrate(db);
  await db.run("INSERT INTO settings (key, value) VALUES ('payday', '{not json')");
  await db.run("INSERT INTO settings (key, value) VALUES ('language', '\"ta\"')");
  expect(await getSettings(db)).toMatchObject({ payday: null, language: 'ta' });
});
