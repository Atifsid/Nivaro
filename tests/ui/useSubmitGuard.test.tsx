import { act, renderHook } from '@testing-library/react-native';

import { useSubmitGuard } from '@/ui/useSubmitGuard';

test('a second tap while saving does not run the action again', async () => {
  let release: () => void = () => {};
  const action = jest.fn(() => new Promise<void>((r) => (release = r)));
  const { result } = await renderHook(() => useSubmitGuard());
  let first: Promise<void> = Promise.resolve();
  await act(async () => {
    first = result.current.run(action);
    result.current.run(action);
  });
  expect(action).toHaveBeenCalledTimes(1);
  expect(result.current.busy).toBe(true);
  await act(async () => {
    release();
    await first;
  });
  expect(result.current.busy).toBe(false);
  await act(async () => {
    await result.current.run(async () => {});
  });
});
