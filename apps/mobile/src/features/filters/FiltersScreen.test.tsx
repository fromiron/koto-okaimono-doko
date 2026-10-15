// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import FiltersScreen from '../../../app/filters';
import { useVoucherIntentStore } from '../preferences/voucherIntentStore';
import { useFilterStore } from './filterStore';

const mocks = vi.hoisted(() => ({
  back: vi.fn(),
  setItem: vi.fn(),
  requestLocation: vi.fn(),
  onRequestClose: undefined as (() => void) | undefined,
}));

type NativeProps = {
  children?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  selected?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: string;
};

function Container({ children, accessibilityRole }: NativeProps) {
  return <div role={accessibilityRole}>{children}</div>;
}

function Control({
  children,
  onPress,
  disabled,
  loading,
  selected,
  accessibilityLabel,
}: NativeProps) {
  return (
    <button
      aria-label={accessibilityLabel}
      aria-pressed={selected}
      disabled={disabled || loading}
      onClick={onPress}
    >
      {children}
    </button>
  );
}

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { setItem: mocks.setItem },
}));
vi.mock('expo-router', () => ({ useRouter: () => ({ back: mocks.back }) }));
vi.mock('lucide-react-native', () => ({ X: () => null }));
vi.mock('react-native', () => ({
  Modal: ({
    children,
    onRequestClose,
  }: NativeProps & { onRequestClose: () => void }) => {
    mocks.onRequestClose = onRequestClose;
    return <div>{children}</div>;
  },
  Pressable: ({ onPress }: NativeProps) => (
    <button aria-label="backdrop" onClick={onPress} />
  ),
  ScrollView: Container,
  View: Container,
  useWindowDimensions: () => ({ height: 800, width: 400 }),
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
vi.mock('react-native-reanimated', () => ({ useReducedMotion: () => true }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/src/components/ui/Button', () => ({ Button: Control }));
vi.mock('@/src/components/ui/Chip', () => ({ Chip: Control }));
vi.mock('@/src/components/ui/IconButton', () => ({ IconButton: Control }));
vi.mock('@/src/components/ui/PressableScale', () => ({
  PressableScale: Control,
}));
vi.mock('@/src/components/ui/Text', () => ({ Text: Container }));
vi.mock('@/src/components/ui/Wrap', () => ({ Wrap: Container }));
vi.mock('@/src/features/location/useCurrentLocationWithFeedback', () => ({
  useCurrentLocationWithFeedback: () => ({
    requestLocation: mocks.requestLocation,
    status: 'idle',
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.setItem.mockResolvedValue(undefined);
  mocks.requestLocation.mockResolvedValue({
    latitude: 35.68,
    longitude: 139.8,
  });
  useVoucherIntentStore.setState({
    intent: { medium: 'any', voucher: 'any' },
    saveFailed: false,
  });
  useFilterStore.getState().reset();
});
afterEach(cleanup);

function select(name: string) {
  fireEvent.click(screen.getByRole('button', { name }));
}

it.each(['common.close', 'backdrop', 'system back'])(
  'discards draft selections on %s',
  (close) => {
    useFilterStore.setState({ keyword: 'existing', couponType: 'ab' });
    render(<FiltersScreen />);
    select('voucher.paper');
    select('voucher.B');
    select('filters.bOnly');
    if (close === 'system back') act(() => mocks.onRequestClose?.());
    else select(close);

    expect(mocks.back).toHaveBeenCalledOnce();
    expect(mocks.setItem).not.toHaveBeenCalled();
    expect(useVoucherIntentStore.getState().intent).toEqual({
      medium: 'any',
      voucher: 'any',
    });
    expect(useFilterStore.getState()).toMatchObject({
      keyword: 'existing',
      couponType: 'ab',
    });
  },
);

it('applies saved intent with staged filters and clears the obsolete payment filter', async () => {
  useFilterStore.setState({ payment: 'digital' });
  render(<FiltersScreen />);
  select('voucher.paper');
  select('voucher.B');
  select('filters.bOnly');
  select('filters.meters500');
  await waitFor(() =>
    expect(
      screen
        .getByRole('button', { name: 'filters.meters500' })
        .getAttribute('aria-pressed'),
    ).toBe('true'),
  );
  expect(useFilterStore.getState().radiusMeters).toBe('all');
  select('common.apply');

  await waitFor(() => expect(mocks.back).toHaveBeenCalledOnce());
  expect(useVoucherIntentStore.getState().intent).toEqual({
    medium: 'paper',
    voucher: 'B',
  });
  expect(useFilterStore.getState()).toMatchObject({
    payment: 'all',
    couponType: 'b_only',
    radiusMeters: 500,
  });
});

it('keeps the sheet and original filters when saving fails, then allows retry', async () => {
  mocks.setItem.mockRejectedValueOnce(new Error('storage full'));
  useFilterStore.setState({ couponType: 'ab' });
  render(<FiltersScreen />);
  select('voucher.digital');
  select('filters.bOnly');
  select('common.apply');

  await screen.findByText('voucher.persistenceFailed');
  expect(mocks.back).not.toHaveBeenCalled();
  expect(useVoucherIntentStore.getState().intent).toEqual({
    medium: 'any',
    voucher: 'any',
  });
  expect(useFilterStore.getState().couponType).toBe('ab');
  select('common.apply');
  await waitFor(() => expect(mocks.back).toHaveBeenCalledOnce());
  expect(useFilterStore.getState().couponType).toBe('b_only');
});

it('waits for persistence before applying filters and closing', async () => {
  let finishSave!: () => void;
  mocks.setItem.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finishSave = resolve;
      }),
  );
  render(<FiltersScreen />);
  select('voucher.paper');
  select('filters.bOnly');
  select('common.apply');
  select('backdrop');
  act(() => mocks.onRequestClose?.());

  expect(mocks.back).not.toHaveBeenCalled();
  expect(useFilterStore.getState().couponType).toBe('all');
  await act(async () => finishSave());
  expect(mocks.back).toHaveBeenCalledOnce();
  expect(useFilterStore.getState().couponType).toBe('b_only');
});

it('resets only the draft until Apply', async () => {
  useVoucherIntentStore.setState({ intent: { medium: 'paper', voucher: 'A' } });
  useFilterStore.setState({
    keyword: 'existing',
    couponType: 'ab',
    categoryMajorId: 'eat_drink',
    radiusMeters: 500,
  });
  render(<FiltersScreen />);
  select('filters.resetConditions');

  expect(useVoucherIntentStore.getState().intent).toEqual({
    medium: 'paper',
    voucher: 'A',
  });
  expect(useFilterStore.getState().keyword).toBe('existing');
  select('common.apply');
  await waitFor(() => expect(mocks.back).toHaveBeenCalledOnce());
  expect(useVoucherIntentStore.getState().intent).toEqual({
    medium: 'any',
    voucher: 'any',
  });
  expect(useFilterStore.getState()).toMatchObject({
    keyword: '',
    couponType: 'all',
    categoryMajorId: null,
    radiusMeters: 'all',
  });
});

it('clears only the conflicting advanced store filter, retaining the A voucher choice', async () => {
  render(<FiltersScreen />);
  select('voucher.A');
  select('filters.bOnly');
  expect(screen.getByText('voucher.conflict')).toBeTruthy();
  select('voucher.clearAdvanced');
  expect(screen.queryByText('voucher.conflict')).toBeNull();
  expect(
    screen
      .getByRole('button', { name: 'voucher.A' })
      .getAttribute('aria-pressed'),
  ).toBe('true');
  select('common.apply');
  await waitFor(() => expect(mocks.back).toHaveBeenCalledOnce());
  expect(useFilterStore.getState().couponType).toBe('all');
  expect(useVoucherIntentStore.getState().intent.voucher).toBe('A');
});
