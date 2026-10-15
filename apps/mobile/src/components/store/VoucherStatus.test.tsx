// @vitest-environment jsdom
import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';

const appState = vi.hoisted(() => ({ listener: (_state: string) => {} }));
vi.mock('react-native', () => ({
  AppState: {
    addEventListener: (_event: string, listener: (state: string) => void) => {
      appState.listener = listener;
      return { remove: vi.fn() };
    },
  },
}));
vi.mock('@/src/components/ui/Text', () => ({
  Text: ({ children }: { children: ReactNode }) =>
    createElement('span', {}, children),
}));
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: vi.fn(), setItem: vi.fn() },
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: { medium?: string; voucher?: string }) =>
      key === 'voucher.compatible'
        ? `${values?.medium} · ${values?.voucher} accepted`
        : key,
  }),
}));

import { VoucherStatus } from './VoucherStatus';
import { useVoucherClock } from '@/src/features/preferences/useVoucherClock';
import {
  defaultVoucherIntent,
  useVoucherIntentStore,
} from '@/src/features/preferences/voucherIntentStore';

const store = {
  couponType: 'ab' as const,
  acceptsPaper: true,
  acceptsDigital: false,
};
const datasetId = 'koto-premium-coupon-2026';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-15T00:00:00Z'));
  useVoucherIntentStore.setState({
    intent: defaultVoucherIntent,
    now: new Date(),
  });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('VoucherStatus', () => {
  it('names the chosen paper B voucher at an AB store', () => {
    render(
      <VoucherStatus
        store={store}
        datasetId={datasetId}
        intent={{ medium: 'paper', voucher: 'B' }}
      />,
    );
    expect(screen.getByText('voucher.paper · voucher.B accepted')).toBeTruthy();
  });

  it('shows only confirmed media and types for an unspecified choice', () => {
    render(<VoucherStatus store={store} datasetId={datasetId} />);
    expect(
      screen.getByText('voucher.paper · voucher.AB accepted'),
    ).toBeTruthy();
    expect(screen.queryByText(/digital/)).toBeNull();
  });

  it('does not claim support with missing media or unverified dataset season', () => {
    const view = render(
      <VoucherStatus
        store={{ ...store, acceptsPaper: false }}
        datasetId={datasetId}
      />,
    );
    expect(screen.getByText('voucher.unknown')).toBeTruthy();
    view.rerender(
      <VoucherStatus store={store} datasetId="koto-premium-coupon-2027" />,
    );
    expect(screen.getByText('voucher.unknown')).toBeTruthy();
  });

  it('rejects A vouchers at a B-only store', () => {
    render(
      <VoucherStatus
        store={{ ...store, couponType: 'b_only' }}
        datasetId={datasetId}
        intent={{ medium: 'paper', voucher: 'A' }}
      />,
    );
    expect(screen.getByText('voucher.incompatible')).toBeTruthy();
  });

  it('removes acceptance at Japan midnight without needing navigation', () => {
    vi.setSystemTime(new Date('2026-12-31T14:59:59Z'));
    useVoucherIntentStore.setState({ now: new Date() });
    renderHook(() => useVoucherClock());
    render(<VoucherStatus store={store} datasetId={datasetId} />);
    expect(screen.getByText(/accepted/)).toBeTruthy();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByText('voucher.seasonExpired')).toBeTruthy();
  });

  it('refreshes the season when resuming after expiry', () => {
    renderHook(() => useVoucherClock());
    render(<VoucherStatus store={store} datasetId={datasetId} />);
    vi.setSystemTime(new Date('2027-01-01T00:00:00Z'));
    act(() => appState.listener('active'));
    expect(screen.getByText('voucher.seasonExpired')).toBeTruthy();
  });
});
