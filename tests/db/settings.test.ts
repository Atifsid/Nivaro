import { migrate } from '@/db/migrations';
import { getSettings, updateSettings } from '@/db/settings';
import { nodeDb } from '../helpers/nodeDb';

test('migrate can run twice and sets schema version 1', async () => {
  const db = nodeDb();
  await migrate(db);
  await migrate(db);
  expect(await db.first<{ user_version: number }>('PRAGMA user_version')).toEqual({ user_version: 1 });
});

test('fresh settings are empty and onboarding is not done', async () => {
  const db = nodeDb();
  await migrate(db);
  expect(await getSettings(db)).toEqual({
    language: null,
    payday: null,
    monthlyBudgetPaise: null,
    firstLaunchAt: null,
    lastSeenAt: null,
    onboardingDone: false,
  });
});

test('updateSettings saves only the given fields', async () => {
  const db = nodeDb();
  await migrate(db);
  await updateSettings(db, { payday: 25 });
  await updateSettings(db, { language: 'ta' });
  expect(await getSettings(db)).toMatchObject({ payday: 25, language: 'ta', monthlyBudgetPaise: null });
});
