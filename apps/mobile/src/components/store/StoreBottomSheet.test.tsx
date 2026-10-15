// @vitest-environment jsdom
import {
  useEffect,
  useImperativeHandle,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import type {
  BottomSheetFlatListMethods,
  BottomSheetScrollViewMethods,
} from '@gorhom/bottom-sheet';
import type { Store } from '@koto/schema';
import type {
  FlatListProps,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollViewProps,
} from 'react-native';
type BottomSheetFlatListProps<T> = FlatListProps<T> & {
  ref?: React.Ref<BottomSheetFlatListMethods>;
};
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { fixtureStores } from '../../../../../packages/dataset-cli/src/testing/database';
import { StoreBottomSheet } from './StoreBottomSheet';

const mocks = vi.hoisted(() => ({
  list: null as BottomSheetFlatListProps<Store> | null,
  scroll: null as
    | (ScrollViewProps & { ref?: React.Ref<BottomSheetScrollViewMethods> })
    | null,
  scrollTo: vi.fn(),
  indexes: [0],
  scrollToIndex: vi.fn(),
  scrollToOffset: vi.fn(),
  snapToIndex: vi.fn(),
  sheet: null as {
    enableContentPanningGesture?: boolean;
    enableHandlePanningGesture?: boolean;
    handleComponent?: unknown;
    onChange?: (index: number) => void;
  } | null,
}));
const stores = Array.from({ length: 30 }, (_, index) => ({
  ...fixtureStores[0],
  id: `store-${index}`,
  name: `store-${index}`,
}));
function View({
  children,
  onLayout,
  style,
}: {
  children?: ReactNode;
  onLayout?: (event: LayoutChangeEvent) => void;
  style?: { top?: number };
}) {
  useEffect(() => {
    onLayout?.({
      nativeEvent: {
        layout: { x: 0, y: style?.top ?? 0, width: 400, height: 100 },
      },
    } as LayoutChangeEvent);
  }, [onLayout, style?.top]);
  return <div>{children}</div>;
}
vi.mock('react-native', () => ({
  View,
  ActivityIndicator: () => null,
  useWindowDimensions: () => ({ width: 400, height: 800, fontScale: 1 }),
}));
vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('lucide-react-native', () => ({
  AlertCircle: () => null,
  ChevronLeft: () => null,
  SearchX: () => null,
}));
vi.mock('@/src/components/ui/Text', () => ({ Text: View }));
vi.mock('@/src/components/ui/Button', () => ({ Button: View }));
vi.mock('@/src/components/ui/PressableScale', () => ({ PressableScale: View }));
vi.mock('@/src/components/ui/SegmentedToggle', () => ({
  SegmentedToggle: () => null,
}));
vi.mock('./StoreListRow', () => ({
  StoreListRow: ({ store, onPress }: { store: Store; onPress: () => void }) => (
    <button onClick={onPress}>{store.name}</button>
  ),
}));
vi.mock('./StoreDetailContent', () => ({
  StoreDetailContent: ({
    stores,
    onSelectStore,
    onStoreLayout,
  }: {
    stores: Store[];
    onSelectStore: (id: string) => void;
    onStoreLayout: (id: string, y: number) => void;
  }) => {
    useEffect(() => {
      stores.forEach((store, index) =>
        onStoreLayout(store.id, 200 + index * 100),
      );
    }, [stores, onStoreLayout]);
    return (
      <div>
        {stores.map((store) => (
          <button key={store.id} onClick={() => onSelectStore(store.id)}>
            {store.name}
          </button>
        ))}
      </div>
    );
  },
}));
vi.mock('@gorhom/bottom-sheet', () => ({
  default: ({
    children,
    ref,
    ...props
  }: {
    children: ReactNode;
    ref: React.Ref<unknown>;
    enableContentPanningGesture?: boolean;
    enableHandlePanningGesture?: boolean;
    handleComponent?: unknown;
    onChange?: (index: number) => void;
  }) => {
    mocks.sheet = props;
    useImperativeHandle(ref, () => ({ snapToIndex: mocks.snapToIndex }));
    return <div>{children}</div>;
  },
  BottomSheetScrollView: (
    props: ScrollViewProps & { ref?: React.Ref<BottomSheetScrollViewMethods> },
  ) => {
    mocks.scroll = props;
    useImperativeHandle(
      props.ref,
      () =>
        ({
          scrollTo: mocks.scrollTo,
        }) as unknown as BottomSheetScrollViewMethods,
    );
    return <div>{props.children}</div>;
  },
  BottomSheetFlatList: (props: BottomSheetFlatListProps<Store>) => {
    mocks.list = props;
    useImperativeHandle(
      props.ref,
      () =>
        ({
          scrollToIndex: mocks.scrollToIndex,
          scrollToOffset: mocks.scrollToOffset,
        }) as unknown as BottomSheetFlatListMethods,
    );
    useEffect(() => {
      props.onContentSizeChange?.(400, 3000);
    }, []);
    const Cell = props.CellRendererComponent!;
    return (
      <div>
        {props.ListHeaderComponent as ReactNode}
        {mocks.indexes.map((index) => {
          const item = props.data![index];
          return (
            <Cell
              key={item.id}
              {...({
                item,
                index,
                cellKey: item.id,
                style: { top: index * 100 + 120 },
                children: props.renderItem?.({
                  item,
                  index,
                  separators: {
                    highlight() {},
                    unhighlight() {},
                    updateProps() {},
                  },
                }),
              } as ComponentProps<typeof Cell>)}
            />
          );
        })}
      </div>
    );
  },
}));
const base: ComponentProps<typeof StoreBottomSheet> = {
  task: 'browse',
  contextVersion: 0,
  sheetIndex: 2,
  scrollPosition: { storeId: 'store-20', offset: 200, relativeOffset: 23 },
  onScrollPositionChange: vi.fn(),
  stores: [],
  visibleStores: stores,
  visibleStoreCount: stores.length,
  viewMode: 'list',
  onChangeViewMode: vi.fn(),
  onSelectStore: vi.fn(),
  onClearSelection: vi.fn(),
  onResetFilters: vi.fn(),
  onRetryQuery: vi.fn(),
};
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  mocks.indexes = [0];
  mocks.list = null;
  mocks.scroll = null;
  mocks.scrollToIndex.mockReset();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

it('finds a moved anchor outside the old pixel window and restores its measured relative offset', () => {
  const { rerender } = render(<StoreBottomSheet {...base} />);
  expect(mocks.scrollToIndex).toHaveBeenCalledWith({
    index: 20,
    viewOffset: -23,
    animated: false,
  });
  mocks.indexes = [19, 20, 21];
  rerender(<StoreBottomSheet {...base} />);
  expect(mocks.scrollToOffset).toHaveBeenLastCalledWith({
    offset: 2143,
    animated: false,
  });
  act(() =>
    mocks.list?.onScrollEndDrag?.({
      nativeEvent: { contentOffset: { x: 0, y: 2150 } },
    } as NativeSyntheticEvent<NativeScrollEvent>),
  );
  expect(base.onScrollPositionChange).toHaveBeenLastCalledWith({
    storeId: 'store-20',
    offset: 2150,
    relativeOffset: 30,
  });
});

it('bounds failed virtual-list measurement retries and announces a safe top reset', () => {
  mocks.scrollToIndex.mockImplementation(({ index }: { index: number }) =>
    mocks.list?.onScrollToIndexFailed?.({
      index,
      highestMeasuredFrameIndex: 0,
      averageItemLength: 100,
    }),
  );
  render(<StoreBottomSheet {...base} />);
  act(() => vi.advanceTimersByTime(400));
  expect(mocks.scrollToIndex).toHaveBeenCalledTimes(4);
  expect(mocks.scrollToOffset).toHaveBeenLastCalledWith({
    offset: 0,
    animated: false,
  });
  expect(screen.getByText('navigation.positionReset')).toBeTruthy();
  act(() => vi.advanceTimersByTime(5000));
  expect(mocks.scrollToIndex).toHaveBeenCalledTimes(4);
});

it('resets a removed anchor immediately and does not retry after leaving the list', () => {
  const { unmount } = render(
    <StoreBottomSheet
      {...base}
      scrollPosition={{ storeId: 'deleted', offset: 1500, relativeOffset: 23 }}
    />,
  );
  expect(mocks.scrollToIndex).not.toHaveBeenCalled();
  expect(mocks.scrollToOffset).toHaveBeenLastCalledWith({
    offset: 0,
    animated: false,
  });
  expect(screen.getByText('navigation.positionReset')).toBeTruthy();
  unmount();
  act(() => vi.advanceTimersByTime(5000));
  expect(mocks.scrollToIndex).not.toHaveBeenCalled();
});

it.each(['browse', 'store'] as const)(
  'does not reapply the starting offset after a user scroll rerenders %s',
  (task) => {
    function Screen() {
      const [position, setPosition] = useState({
        storeId: null as string | null,
        relativeOffset: 0,
        offset: 0,
      });
      return (
        <StoreBottomSheet
          {...base}
          task={task}
          stores={task === 'store' ? [stores[0]] : []}
          scrollPosition={position}
          onScrollPositionChange={setPosition}
        />
      );
    }
    render(<Screen />);
    const beforeListCommands = mocks.scrollToOffset.mock.calls.length;
    const beforeDetailCommands = mocks.scrollTo.mock.calls.length;
    const beforeIndexCommands = mocks.scrollToIndex.mock.calls.length;
    const before = task === 'browse' ? mocks.list : mocks.scroll;
    expect(before?.contentOffset).toBeUndefined();
    act(() =>
      before?.onScrollEndDrag?.({
        nativeEvent: { contentOffset: { x: 0, y: 550 } },
      } as NativeSyntheticEvent<NativeScrollEvent>),
    );
    const after = task === 'browse' ? mocks.list : mocks.scroll;
    expect(after).not.toBe(before);
    expect(after?.contentOffset).toBeUndefined();
    act(() => {
      after?.onContentSizeChange?.(400, 3100);
      vi.advanceTimersByTime(1000);
    });
    expect(mocks.scrollToOffset).toHaveBeenCalledTimes(beforeListCommands);
    expect(mocks.scrollTo).toHaveBeenCalledTimes(beforeDetailCommands);
    expect(mocks.scrollToIndex).toHaveBeenCalledTimes(beforeIndexCommands);
  },
);

it.each(['browse', 'facility'] as const)(
  'saves final momentum offset before selecting from %s and restores that offset',
  (task) => {
    mocks.indexes = [3, 4, 5];
    const save = vi.fn();
    const select = vi.fn();
    const initial = { storeId: null, relativeOffset: 0, offset: 0 };
    const props = {
      ...base,
      task,
      stores: task === 'facility' ? stores : [],
      scrollPosition: initial,
      onScrollPositionChange: save,
      onSelectStore: select,
    };
    const { rerender } = render(<StoreBottomSheet {...props} />);
    const scrollable = task === 'browse' ? mocks.list : mocks.scroll;
    const event = (y: number) =>
      ({
        nativeEvent: { contentOffset: { x: 0, y } },
      }) as NativeSyntheticEvent<NativeScrollEvent>;
    act(() => {
      scrollable?.onScrollBeginDrag?.(event(0));
      scrollable?.onScrollEndDrag?.(event(200));
    });
    expect(save).toHaveBeenCalledTimes(1);
    act(() => {
      scrollable?.onScroll?.(event(350));
      scrollable?.onScroll?.(event(478));
    });
    expect(save).toHaveBeenCalledTimes(3);
    fireEvent.click(screen.getByRole('button', { name: 'store-3' }));
    const saved = save.mock.lastCall![0];
    expect(saved.offset).toBe(478);
    expect(saved).toMatchObject(
      task === 'browse'
        ? { storeId: 'store-3', relativeOffset: 58 }
        : { storeId: 'store-2', relativeOffset: 78 },
    );
    expect(save.mock.invocationCallOrder.at(-1)).toBeLessThan(
      select.mock.invocationCallOrder[0],
    );
    rerender(
      <StoreBottomSheet
        {...props}
        task="store"
        stores={[stores[3]]}
        contextVersion={1}
      />,
    );
    rerender(
      <StoreBottomSheet {...props} scrollPosition={saved} contextVersion={2} />,
    );
    act(() =>
      (task === 'browse' ? mocks.list : mocks.scroll)?.onContentSizeChange?.(
        400,
        3000,
      ),
    );
    if (task === 'browse')
      expect(mocks.scrollToOffset).toHaveBeenLastCalledWith({
        offset: 478,
        animated: false,
      });
    else
      expect(mocks.scrollTo).toHaveBeenLastCalledWith({
        y: 478,
        animated: false,
      });
  },
);

it('lets content scroll at every sheet height while retaining handle resizing', () => {
  const onChange = vi.fn();
  render(
    <StoreBottomSheet {...base} sheetIndex={1} onSheetIndexChange={onChange} />,
  );
  expect(mocks.sheet?.enableContentPanningGesture).toBe(false);
  expect(mocks.sheet?.enableHandlePanningGesture).not.toBe(false);
  expect(mocks.sheet?.handleComponent).toBeDefined();
  act(() => mocks.sheet?.onChange?.(2));
  expect(onChange).toHaveBeenCalledWith(2);
});
