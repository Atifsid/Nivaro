import { parseAlert } from '@/capture/parse';
import { cases } from './fixtures/synthetic-alerts';

test.each(cases)('$name', ({ raw, expected }) => {
  expect(parseAlert(raw)).toEqual(expected);
});
