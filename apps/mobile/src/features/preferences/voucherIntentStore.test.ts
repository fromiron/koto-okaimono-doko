import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = vi.hoisted(() => ({
  getItem: vi.fn<() => Promise<string | null>>(),
  setItem: vi.fn<() => Promise<void>>(),
}));
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: storage,
}));

import {
  defaultVoucherIntent,
  useVoucherIntentStore,
  VOUCHER_INTENT_STORAGE_KEY,
} from './voucherIntentStore';

beforeEach(() => {
  storage.getItem.mockReset().mockResolvedValue(null);
  storage.setItem.mockReset().mockResolvedValue(undefined);
  useVoucherIntentStore.setState({
    intent: defaultVoucherIntent,
    saveFailed: false,
  });
});

describe('voucher intent preference', () => {
  it('allows browsing immediately without a saved choice', async () => {
    expect(useVoucherIntentStore.getState().intent).toEqual(
      defaultVoucherIntent,
    );
    await useVoucherIntentStore.getState().hydrate();
    expect(useVoucherIntentStore.getState().intent).toEqual(
      defaultVoucherIntent,
    );
  });

  it('saves, restores and explicitly clears only voucher intent', async () => {
    const intent = { medium: 'paper', voucher: 'B' } as const;
    expect(await useVoucherIntentStore.getState().setIntent(intent)).toBe(true);
    expect(storage.setItem).toHaveBeenCalledWith(
      VOUCHER_INTENT_STORAGE_KEY,
      JSON.stringify(intent),
    );
    useVoucherIntentStore.setState({ intent: defaultVoucherIntent });
    storage.getItem.mockResolvedValue(JSON.stringify(intent));
    await useVoucherIntentStore.getState().hydrate();
    expect(useVoucherIntentStore.getState().intent).toEqual(intent);
    await useVoucherIntentStore.getState().setIntent(defaultVoucherIntent);
    expect(storage.setItem).toHaveBeenLastCalledWith(
      VOUCHER_INTENT_STORAGE_KEY,
      JSON.stringify(defaultVoucherIntent),
    );
  });

  it.each(['invalid JSON', '{}', '{"medium":"cash","voucher":"B"}'])(
    'ignores malformed persisted intent: %s',
    async (stored) => {
      storage.getItem.mockResolvedValue(stored);
      await useVoucherIntentStore.getState().hydrate();
      expect(useVoucherIntentStore.getState().intent).toEqual(
        defaultVoucherIntent,
      );
    },
  );

  it('keeps the applied intent when saving fails and exposes retryable feedback', async () => {
    storage.setItem.mockRejectedValueOnce(new Error('disk full'));
    expect(
      await useVoucherIntentStore
        .getState()
        .setIntent({ medium: 'digital', voucher: 'A' }),
    ).toBe(false);
    expect(useVoucherIntentStore.getState()).toMatchObject({
      intent: defaultVoucherIntent,
      saveFailed: true,
    });
    expect(
      await useVoucherIntentStore
        .getState()
        .setIntent({ medium: 'digital', voucher: 'A' }),
    ).toBe(true);
    expect(useVoucherIntentStore.getState().saveFailed).toBe(false);
  });

  it('keeps offline browsing available on storage read failures', async () => {
    storage.getItem.mockRejectedValueOnce(new Error('storage unavailable'));
    await useVoucherIntentStore.getState().hydrate();
    expect(useVoucherIntentStore.getState().intent).toEqual(
      defaultVoucherIntent,
    );
  });
});
