// @vitest-environment jsdom
import type { ReactNode } from 'react';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import i18next from 'i18next';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { fixtureStores } from '../../../../../packages/dataset-cli/src/testing/database';
import { resources } from '../../i18n/resources';
import { DirectionsActions } from './DirectionsActions';

const native = vi.hoisted(() => ({ openURL: vi.fn() }));
vi.mock('react-native', () => ({
  Linking: { openURL: native.openURL },
  Platform: { OS: 'android', Version: 36 },
  View: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
}));
vi.mock('lucide-react-native', () => ({
  MapPin: () => null,
  Navigation: () => null,
}));
vi.mock('@/src/components/ui/Text', () => ({
  Text: ({
    children,
    accessibilityRole,
    selectable,
  }: {
    children: ReactNode;
    accessibilityRole?: string;
    selectable?: boolean;
  }) => (
    <span data-selectable={selectable} role={accessibilityRole}>
      {children}
    </span>
  ),
}));
vi.mock('@/src/components/ui/Button', () => ({
  Button: ({
    children,
    onPress,
    disabled,
    accessibilityLabel,
    accessibilityHint,
  }: {
    children: ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
  }) => (
    <button
      aria-label={accessibilityLabel}
      title={accessibilityHint}
      disabled={disabled}
      onClick={onPress}
    >
      {children}
    </button>
  ),
}));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: i18next.t }) }));

beforeEach(async () => {
  native.openURL.mockReset().mockResolvedValue(undefined);
  await i18next.init({
    resources,
    lng: 'ja',
    interpolation: { escapeValue: false },
  });
});
afterEach(cleanup);

it('opens distinct map and directions screens without requesting location', async () => {
  render(<DirectionsActions store={fixtureStores[0]} />);
  fireEvent.click(screen.getByRole('button', { name: /^経路を見る:/ }));
  await waitFor(() => expect(native.openURL).toHaveBeenCalledOnce());
  const directionUrl = new URL(native.openURL.mock.calls[0][0]);
  expect(directionUrl.pathname).toBe('/maps/dir/');
  expect(directionUrl.searchParams.get('destination')).toContain('テスト商店');
  expect(directionUrl.searchParams.has('origin')).toBe(false);
  await waitFor(() =>
    expect(
      (screen.getByRole('button', { name: '地図で確認' }) as HTMLButtonElement)
        .disabled,
    ).toBe(false),
  );
  fireEvent.click(screen.getByRole('button', { name: '地図で確認' }));
  await waitFor(() => expect(native.openURL).toHaveBeenCalledTimes(2));
  expect(new URL(native.openURL.mock.calls[1][0]).pathname).toBe(
    '/maps/search/',
  );
});

it('shows recovery after Linking fails, exposes a selectable address, and retries', async () => {
  native.openURL.mockRejectedValueOnce(new Error('No URL handler'));
  render(<DirectionsActions compact store={fixtureStores[0]} />);
  expect(screen.queryByRole('button', { name: '地図で確認' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: /^経路を見る:/ }));
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.getByRole('button', { name: '地図で確認' })).toBeTruthy();
  expect(
    screen.getByText('東京都江東区森下1-1').getAttribute('data-selectable'),
  ).toBe('true');
  fireEvent.click(screen.getByRole('button', { name: '再試行' }));
  await waitFor(() => expect(native.openURL).toHaveBeenCalledTimes(2));
  expect(native.openURL.mock.calls[0][0]).toBe(native.openURL.mock.calls[1][0]);
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
});

it('offers map confirmation after a rejected directions handoff', async () => {
  native.openURL.mockRejectedValueOnce(new Error('Cancelled'));
  render(<DirectionsActions compact store={fixtureStores[0]} />);
  fireEvent.click(screen.getByRole('button', { name: /^経路を見る:/ }));
  await screen.findByRole('alert');
  fireEvent.click(screen.getByRole('button', { name: '地図で確認' }));
  await waitFor(() => expect(native.openURL).toHaveBeenCalledTimes(2));
  expect(new URL(native.openURL.mock.calls[1][0]).pathname).toBe(
    '/maps/search/',
  );
  await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
});

it('explains an unavailable destination and disables its action without invoking Linking', () => {
  render(<DirectionsActions store={{ ...fixtureStores[1], address: ' ' }} />);
  const button = screen.getByRole('button', {
    name: /^経路を見る:/,
  }) as HTMLButtonElement;
  expect(button.disabled).toBe(true);
  expect(
    screen.getByText('目的地を特定できる住所・位置情報がありません。'),
  ).toBeTruthy();
  fireEvent.click(button);
  expect(native.openURL).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: '地図で確認' })).toBeNull();
});

it('keeps the compact action short and shows the full external-destination disclosure separately', async () => {
  await i18next.changeLanguage('ko');
  render(<DirectionsActions compact store={fixtureStores[0]} />);
  const button = screen.getByRole('button', { name: /^길찾기:/ });
  expect(button.textContent).toBe('길찾기');
  expect(button.getAttribute('title')).toContain('Google Maps');
  expect(screen.getByText('Google Maps에 목적지를 전달합니다.')).toBeTruthy();
});
