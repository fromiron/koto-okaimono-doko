// @vitest-environment jsdom
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { useEffect, type ComponentProps, type ReactNode } from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  createFixtureDatabase,
  fixtureMeta,
  fixtureStores,
  openTestDatabase,
} from '../../../../../packages/dataset-cli/src/testing/database';
import type { StoreMap } from '../../components/map/StoreMap';
import type { StoreBottomSheet } from '../../components/store/StoreBottomSheet';
import {
  createStoreRepository,
  type StoreDatabase,
} from '../db/StoreRepository';
import { useMapStore, KOTO_INITIAL_REGION } from '../map/mapStore';
import {
  useSelectedStoreStore,
  INITIAL_LIST_POSITION,
} from '../selected-store/selectedStoreStore';
import { useFilterStore } from '../filters/filterStore';
import { useDatasetStore } from '../dataset/datasetStore';
import MapScreen from '../../../app/index';

const mocks = vi.hoisted(() => ({
  repository: undefined as unknown,
  hardwareBack: undefined as (() => boolean) | undefined,
  keyboardVisible: false,
  dismiss: vi.fn(),
  checkUpdate: vi.fn(),
  t: (key: string) => key,
  animate: vi.fn(),
  appleMaps: false,
}));
const candidates = [
  fixtureStores[0],
  fixtureStores[1],
  {
    ...fixtureStores[0],
    id: 'third',
    name: '比較商店',
    normalizedName: '比較商店',
  },
];
const otherArea = { ...KOTO_INITIAL_REGION, latitude: 0, longitude: 0 };
type ControlProps = {
  children?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};
function Control({ children, onPress, accessibilityLabel }: ControlProps) {
  return (
    <button aria-label={accessibilityLabel} onClick={onPress}>
      {children}
    </button>
  );
}
vi.mock('react-native', () => ({
  View: ({ children }: ControlProps) => <div>{children}</div>,
  Keyboard: {
    addListener: () => ({ remove() {} }),
    isVisible: () => mocks.keyboardVisible,
    dismiss: () => {
      mocks.keyboardVisible = false;
      mocks.dismiss();
    },
  },
  BackHandler: {
    addEventListener: (_name: string, callback: () => boolean) => {
      mocks.hardwareBack = callback;
      return { remove() {} };
    },
  },
  useWindowDimensions: () => ({ width: 400, height: 800, fontScale: 1 }),
}));
vi.mock('expo-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useFocusEffect: (callback: () => void) => useEffect(callback, [callback]),
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
vi.mock('react-native-reanimated', () => ({ useReducedMotion: () => true }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: mocks.t }) }));
vi.mock('lucide-react-native', () => ({
  Filter: () => null,
  Settings: () => null,
}));
vi.mock('@/src/features/db/useStoreRepository', () => ({
  useStoreRepository: () => mocks.repository,
}));
vi.mock('@/src/features/dataset/useDatasetUpdate', () => ({
  useDatasetUpdate: () => ({ checkUpdate: mocks.checkUpdate }),
}));
vi.mock('@/src/features/preferences/preferencesStore', () => ({
  usePreferencesStore: (select: (state: unknown) => unknown) =>
    select({ locationEnabled: false }),
}));
vi.mock('@/src/features/preferences/voucherIntentStore', () => ({
  useVoucherIntentStore: (select: (state: unknown) => unknown) =>
    select({ intent: { medium: 'any', voucher: 'any' } }),
}));
vi.mock('@/src/components/ui/Button', () => ({ Button: Control }));
vi.mock('@/src/components/ui/IconButton', () => ({ IconButton: Control }));
vi.mock('@/src/components/ui/SearchInput', () => ({
  SearchInput: ({
    value,
    onChangeText,
  }: {
    value: string;
    onChangeText: (value: string) => void;
  }) => (
    <input
      aria-label="search"
      value={value}
      onChange={(event) => onChangeText(event.target.value)}
    />
  ),
}));
vi.mock('@/src/components/map/UserLocationButton', () => ({
  UserLocationButton: () => <button>locate</button>,
}));
vi.mock('@/src/components/map/StoreMap', () => ({
  StoreMap: (props: ComponentProps<typeof StoreMap>) => {
    props.mapRef.current = {
      animateToRegion: (region: typeof otherArea) => {
        mocks.animate(region);
        props.onRegionChangeComplete(region, {
          isGesture: mocks.appleMaps ? undefined : false,
        });
      },
    } as unknown as typeof props.mapRef.current;
    return (
      <div>
        <button
          onClick={() => props.onSelectStores([candidates[0], candidates[2]])}
        >
          facility
        </button>
        <button
          onClick={() => {
            props.onPanDrag();
            props.onRegionChangeComplete(otherArea, { isGesture: true });
          }}
        >
          pan
        </button>
        <button onClick={props.onMapPress}>empty map</button>
        <button onClick={() => props.onRegionChangeComplete(otherArea, {})}>
          apple pan
        </button>
      </div>
    );
  },
}));
vi.mock('@/src/components/store/StoreBottomSheet', () => ({
  StoreBottomSheet: (props: ComponentProps<typeof StoreBottomSheet>) => (
    <div>
      <output data-testid="task">{props.task}</output>
      <output data-testid="position">
        {JSON.stringify(props.scrollPosition)}
      </output>
      <output data-testid="mode">{props.viewMode}</output>
      <output data-testid="results">
        {props.visibleStores.map((store) => store.id).join(',')}
      </output>
      <output data-testid="detail">
        {props.stores.map((store) => store.id).join(',')}
      </output>
      <output>{props.contextNotice}</output>
      {props.queryFailed ? <span>query failed</span> : null}
      {(props.task === 'browse' ? props.visibleStores : props.stores).map(
        (store) => (
          <button key={store.id} onClick={() => props.onSelectStore(store.id)}>
            open:{store.id}
          </button>
        ),
      )}
      <button onClick={props.onClearSelection}>back</button>
      <button
        onClick={() =>
          props.onScrollPositionChange({
            storeId: 'third',
            relativeOffset: 23,
            offset: 423,
          })
        }
      >
        scroll
      </button>
      <button
        onClick={() =>
          props.onScrollPositionChange({
            storeId: 'third',
            relativeOffset: 78,
            offset: 478,
          })
        }
      >
        momentum
      </button>
      <button onClick={() => props.onSheetIndexChange?.(2)}>drag full</button>
      <button onClick={() => props.onChangeViewMode('map')}>show map</button>
    </div>
  ),
}));

let directory: string;
let database: ReturnType<typeof openTestDatabase>;
let repository: ReturnType<typeof createStoreRepository>;
let search: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  vi.clearAllMocks();
  mocks.keyboardVisible = false;
  mocks.appleMaps = false;
  directory = mkdtempSync(path.join(tmpdir(), 'koto-navigation-'));
  const file = path.join(directory, 'stores.sqlite');
  createFixtureDatabase(file, { ...fixtureMeta, storeCount: 3 }, candidates);
  database = openTestDatabase(file);
  repository = createStoreRepository(database as unknown as StoreDatabase);
  mocks.repository = repository;
  search = vi.spyOn(repository, 'searchStores');
  useMapStore.setState({
    region: KOTO_INITIAL_REGION,
    searchRegion: KOTO_INITIAL_REGION,
    pendingSearchRegion: null,
    userLocation: null,
  });
  useSelectedStoreStore.setState({
    task: 'browse',
    selectedStoreIds: [],
    parents: [],
    sheetIndex: 0,
    scrollPosition: INITIAL_LIST_POSITION,
    contextVersion: 0,
  });
  useFilterStore.getState().reset();
  useFilterStore.setState({ keyword: '商店' });
  useDatasetStore.setState({ meta: fixtureMeta });
});
afterEach(async () => {
  cleanup();
  await database.closeAsync();
  rmSync(directory, { recursive: true, force: true });
});
const click = (name: string) =>
  fireEvent.click(screen.getByRole('button', { name }));
async function ready() {
  render(<MapScreen />);
  await screen.findByRole('button', { name: 'open:third' });
}

it('compares three candidates ten times without searching again, restoring list position, sheet and camera', async () => {
  await ready();
  click('scroll');
  click('drag full');
  const originalResults = screen.getByTestId('results').textContent;
  const originalPosition = JSON.stringify({
    storeId: 'third',
    relativeOffset: 23,
    offset: 423,
  });
  const initialCalls = search.mock.calls.length;
  for (let index = 0; index < 10; index++) {
    const id = candidates[index % 3].id;
    click(`open:${id}`);
    await waitFor(() =>
      expect(screen.getByTestId('detail').textContent).toBe(id),
    );
    expect(screen.getByTestId('task').textContent).toBe('store');
    click('back');
    expect(screen.getByTestId('results').textContent).toBe(originalResults);
    expect(screen.getByTestId('position').textContent).toBe(originalPosition);
    expect(screen.getByTestId('mode').textContent).toBe('list');
    expect(useMapStore.getState().region).toEqual(KOTO_INITIAL_REGION);
  }
  expect(search.mock.calls.length).toBe(initialCalls);
  expect(useMapStore.getState().searchRegion).toEqual(KOTO_INITIAL_REGION);
});

it('returns store to its facility, then to browse, preserving each parent position', async () => {
  await ready();
  click('scroll');
  click('facility');
  await waitFor(() =>
    expect(screen.getByTestId('detail').textContent).toBe('located,third'),
  );
  click('scroll');
  click('open:third');
  await waitFor(() =>
    expect(screen.getByTestId('detail').textContent).toBe('third'),
  );
  act(() => {
    expect(mocks.hardwareBack?.()).toBe(true);
  });
  await waitFor(() =>
    expect(screen.getByTestId('detail').textContent).toBe('located,third'),
  );
  expect(screen.getByTestId('task').textContent).toBe('facility');
  expect(JSON.parse(screen.getByTestId('position').textContent!)).toMatchObject(
    { storeId: 'third', offset: 423 },
  );
  click('back');
  expect(screen.getByTestId('task').textContent).toBe('browse');
  expect(JSON.parse(screen.getByTestId('position').textContent!)).toMatchObject(
    { storeId: 'third', offset: 423 },
  );
});

it('only commits a panned area when the user searches there', async () => {
  await ready();
  const initialCalls = search.mock.calls.length;
  click('pan');
  expect(search.mock.calls.length).toBe(initialCalls);
  expect(screen.getByTestId('results').textContent).toContain('unlocated');
  click('map.searchHere');
  await waitFor(() => expect(search.mock.calls.length).toBe(initialCalls + 1));
  expect(screen.getByTestId('results').textContent).toBe('');
  expect(useMapStore.getState().searchRegion).toEqual(otherArea);
  expect(useFilterStore.getState().keyword).toBe('');
});

it('keeps detail on new search, hides old results immediately, and never restores old conditions', async () => {
  await ready();
  click('scroll');
  click('open:located');
  await waitFor(() =>
    expect(screen.getByTestId('detail').textContent).toBe('located'),
  );
  fireEvent.change(screen.getByRole('textbox', { name: 'search' }), {
    target: { value: '座標なし' },
  });
  expect(screen.getByTestId('results').textContent).toBe('');
  await waitFor(() =>
    expect(screen.getByTestId('results').textContent).toBe('unlocated'),
  );
  expect(screen.getByTestId('detail').textContent).toBe('located');
  expect(screen.getByText('navigation.outsideResults')).toBeTruthy();
  click('back');
  expect(useFilterStore.getState().keyword).toBe('座標なし');
  expect(screen.getByTestId('results').textContent).toBe('unlocated');
  expect(JSON.parse(screen.getByTestId('position').textContent!)).toEqual(
    INITIAL_LIST_POSITION,
  );
});

it('dismisses the keyboard before Android back navigates and keeps selection across outside-app pauses', async () => {
  await ready();
  click('open:located');
  await waitFor(() =>
    expect(screen.getByTestId('detail').textContent).toBe('located'),
  );
  mocks.keyboardVisible = true;
  act(() => {
    expect(mocks.hardwareBack?.()).toBe(true);
  });
  expect(mocks.dismiss).toHaveBeenCalled();
  expect(screen.getByTestId('task').textContent).toBe('store');
  fireEvent(window, new Event('blur'));
  fireEvent(window, new Event('focus'));
  expect(screen.getByTestId('detail').textContent).toBe('located');
  act(() => {
    expect(mocks.hardwareBack?.()).toBe(true);
  });
  expect(screen.getByTestId('task').textContent).toBe('browse');
});

it('falls back to the parent with a notice if a dataset revision removes the selected store', async () => {
  await ready();
  click('open:third');
  await waitFor(() =>
    expect(screen.getByTestId('detail').textContent).toBe('third'),
  );
  database.db.exec("DELETE FROM stores WHERE id = 'third'");
  act(() =>
    useDatasetStore.setState({
      meta: { ...fixtureMeta, version: 'r1-new', revision: 'b'.repeat(64) },
    }),
  );
  await waitFor(() =>
    expect(screen.getByTestId('task').textContent).toBe('browse'),
  );
  expect(screen.getByText('navigation.selectionMissing')).toBeTruthy();
  await waitFor(() =>
    expect(screen.getByTestId('results').textContent).not.toContain('third'),
  );
});

it('recognizes Apple Maps moves without gesture metadata after suppressing detail camera completion', async () => {
  mocks.appleMaps = true;
  await ready();
  click('open:located');
  await waitFor(() =>
    expect(screen.getByTestId('detail').textContent).toBe('located'),
  );
  expect(screen.queryByRole('button', { name: 'map.searchHere' })).toBeNull();
  click('apple pan');
  expect(screen.getByRole('button', { name: 'map.searchHere' })).toBeTruthy();
  expect(useMapStore.getState().searchRegion).toEqual(KOTO_INITIAL_REGION);
});

it('captures final scrolling before a map-marker selection without writing global state each frame', async () => {
  await ready();
  click('scroll');
  click('momentum');
  expect(useSelectedStoreStore.getState().scrollPosition).toEqual(
    INITIAL_LIST_POSITION,
  );
  const camera = useMapStore.getState().region;
  click('facility');
  await waitFor(() =>
    expect(screen.getByTestId('task').textContent).toBe('facility'),
  );
  expect(useSelectedStoreStore.getState().parents[0].scrollPosition).toEqual({
    storeId: 'third',
    relativeOffset: 78,
    offset: 478,
  });
  click('back');
  expect(useSelectedStoreStore.getState().scrollPosition).toEqual({
    storeId: 'third',
    relativeOffset: 78,
    offset: 478,
  });
  expect(useMapStore.getState().region).toEqual(camera);
  expect(useFilterStore.getState().keyword).toBe('商店');
});
