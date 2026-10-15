// @vitest-environment jsdom
import type { ReactNode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fixtureStores } from '../../../../../packages/dataset-cli/src/testing/database';
import { resources } from '../../i18n/resources';
import { StoreListRow } from './StoreListRow';

const callbacks = vi.hoisted(() => ({ directions: vi.fn() }));
vi.mock('react-native', () => ({
  View: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Pressable: ({
    children,
    onPress,
    disabled,
    accessibilityRole,
  }: {
    children: ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    accessibilityRole?: string;
  }) => (
    <button disabled={disabled} onClick={onPress} role={accessibilityRole}>
      {children}
    </button>
  ),
  AppState: { addEventListener: () => ({ remove: () => {} }) },
  Linking: { openURL: vi.fn() },
  Platform: { OS: 'android', Version: 36 },
}));
vi.mock('lucide-react-native', () => ({ ChevronRight: () => null }));
vi.mock('@/src/components/ui/Text', () => ({
  Text: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: i18next.t }) }));
vi.mock('@/src/features/dataset/datasetStore', () => ({
  useDatasetStore: (select: (state: unknown) => unknown) =>
    select({ meta: { datasetId: 'koto-premium-coupon-2026' } }),
}));
vi.mock('@/src/features/preferences/voucherIntentStore', () => ({
  useVoucherIntentStore: (select: (state: unknown) => unknown) =>
    select({ intent: { medium: 'paper', voucher: 'B' } }),
}));
vi.mock('./DirectionsActions', () => ({
  DirectionsActions: () => (
    <button onClick={callbacks.directions}>経路を見る</button>
  ),
}));

beforeEach(async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-15T00:00:00Z'));
  callbacks.directions.mockClear();
  await i18next.init({
    resources,
    lng: 'ja',
    interpolation: { escapeValue: false },
  });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('shows voucher eligibility before location and keeps route and detail actions separate', () => {
  const select = vi.fn();
  const store = {
    ...fixtureStores[0],
    name: '長い公式店舗名称をそのまま表示する商店',
    mallName: '豊洲施設',
    floor: '2階',
  };
  render(
    <StoreListRow
      onPress={select}
      store={store}
      userLocation={{ latitude: 35.68, longitude: 139.8 }}
    />,
  );
  const detail = screen.getByRole('button', { name: /長い公式店舗名称/ });
  expect(detail.textContent).toContain('B券');
  expect(detail.textContent).toContain('紙');
  expect(detail.textContent).toContain('豊洲施設 / 2階');
  expect(detail.textContent).toContain('直線');
  fireEvent.click(screen.getByRole('button', { name: '経路を見る' }));
  expect(callbacks.directions).toHaveBeenCalledOnce();
  expect(select).not.toHaveBeenCalled();
  fireEvent.click(detail);
  expect(select).toHaveBeenCalledOnce();
});

it('does not invent distance, facility or a compatible media state for an unlocated store', () => {
  render(
    <StoreListRow
      store={{
        ...fixtureStores[1],
        mallName: null,
        shoppingStreet: null,
        floor: null,
        acceptsPaper: false,
        acceptsDigital: false,
      }}
      onPress={() => {}}
    />,
  );
  expect(screen.getByText('位置情報なし')).toBeTruthy();
  expect(screen.queryByText(/直線/)).toBeNull();
  expect(screen.queryByText(/豊洲施設/)).toBeNull();
});
