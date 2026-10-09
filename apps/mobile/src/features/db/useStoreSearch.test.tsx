// @vitest-environment jsdom
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { StoreSearchParams } from '@koto/schema';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  createFixtureDatabase,
  fixtureStores,
  openTestDatabase,
} from '../../../../../packages/dataset-cli/src/testing/database';
import {
  createStoreRepository,
  groupStoresByLocation,
  type StoreDatabase,
} from './StoreRepository';
import { useStoreSearch } from './useStoreSearch';
import { filterGroupsByRadius } from '../filters/filterByRadius';

let dir: string;
let db: ReturnType<typeof openTestDatabase>;
let repository: ReturnType<typeof createStoreRepository>;
beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'koto-search-'));
  const file = path.join(dir, 'stores.sqlite');
  createFixtureDatabase(file);
  db = openTestDatabase(file);
  repository = createStoreRepository(db as unknown as StoreDatabase);
});
afterEach(async () => {
  cleanup();
  await db.closeAsync();
  rmSync(dir, { recursive: true, force: true });
});

it('updates keyword, coupon, payment and category results while detail remains selected', async () => {
  const selectedIds = ['located'];
  const { result, rerender } = renderHook(
    ({ params }: { params: StoreSearchParams }) =>
      useStoreSearch(repository, params, selectedIds, 0),
    { initialProps: { params: {} } },
  );
  await waitFor(() => expect(result.current.stores).toHaveLength(2));
  expect(result.current.selectedStores[0]?.id).toBe('located');
  for (const params of [
    { keyword: '座標なし' },
    { couponType: 'b_only' as const },
    { payment: 'digital' as const },
    { categoryMajorId: 'dining' },
  ]) {
    rerender({ params });
    await waitFor(() => expect(result.current.queryStatus).toBe('success'));
    expect(result.current.stores).toEqual([fixtureStores[1]]);
    expect(result.current.selectedStores[0]?.id).toBe('located');
  }
  rerender({
    params: { bounds: { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 } },
  });
  await waitFor(() => expect(result.current.stores).toEqual([]));
  expect(result.current.selectedStores[0]?.id).toBe('located');
});

it('includes unlocated global matches and detail, but excludes them from pins and radius results', async () => {
  const params = { keyword: '商店' };
  const ids = ['unlocated'];
  const { result } = renderHook(() =>
    useStoreSearch(repository, params, ids, 0),
  );
  await waitFor(() => expect(result.current.stores).toHaveLength(2));
  expect(result.current.selectedStores).toEqual([fixtureStores[1]]);
  expect(groupStoresByLocation(result.current.stores)).toHaveLength(1);
  expect(
    filterGroupsByRadius(
      result.current.stores,
      { latitude: 35.68, longitude: 139.8 },
      500,
    ),
  ).toEqual([fixtureStores[0]]);
});

it('ignores superseded responses and shows errors while keeping the last good results', async () => {
  const ids: string[] = [];
  const { result, rerender } = renderHook(
    ({ params }: { params: StoreSearchParams }) =>
      useStoreSearch(repository, params, ids, 0),
    { initialProps: { params: {} } },
  );
  await waitFor(() => expect(result.current.stores).toHaveLength(2));
  let finish!: (value: typeof fixtureStores) => void;
  const search = vi.spyOn(repository, 'searchStores').mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  rerender({ params: { keyword: 'old' } });
  await waitFor(() => expect(finish).toBeDefined());
  rerender({ params: { keyword: 'missing' } });
  await waitFor(() => expect(result.current.stores).toEqual([]));
  await act(async () => finish(fixtureStores));
  expect(result.current.stores).toEqual([]);
  search.mockRejectedValueOnce(new Error('read failed'));
  rerender({ params: { keyword: 'error' } });
  await waitFor(() => expect(result.current.queryStatus).toBe('error'));
  expect(result.current.stores).toEqual([]);
});
