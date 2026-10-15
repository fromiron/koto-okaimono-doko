import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { matchesVoucherIntent } from '@koto/core';
import type { Store, VoucherIntent } from '@koto/schema';

import {
  createFixtureDatabase,
  fixtureMeta,
  fixtureStores,
  openTestDatabase,
} from '../../../../../packages/dataset-cli/src/testing/database';
import { createStoreRepository, type StoreDatabase } from './StoreRepository';

const stores: Store[] = (['ab', 'b_only'] as const).flatMap((couponType) =>
  [
    { acceptsPaper: true, acceptsDigital: false },
    { acceptsPaper: false, acceptsDigital: true },
    { acceptsPaper: true, acceptsDigital: true },
    { acceptsPaper: false, acceptsDigital: false },
  ].map((flags, index) => ({
    ...fixtureStores[0]!,
    id: `${couponType}-${index}`,
    name: `${couponType}-${index}`,
    couponType,
    ...flags,
    lat: index === 3 ? null : 35.68,
    lng: index === 3 ? null : 139.8,
  })),
);
let dir: string;
let db: ReturnType<typeof openTestDatabase>;
let repository: ReturnType<typeof createStoreRepository>;

beforeAll(() => {
  dir = mkdtempSync(path.join(tmpdir(), 'koto-voucher-'));
  const file = path.join(dir, 'fixture.sqlite');
  createFixtureDatabase(
    file,
    { ...fixtureMeta, storeCount: stores.length },
    stores,
  );
  db = openTestDatabase(file);
  repository = createStoreRepository(db as unknown as StoreDatabase);
});

afterAll(async () => {
  await db.closeAsync();
  rmSync(dir, { recursive: true, force: true });
});

describe('SQLite voucher intent contract', () => {
  for (const medium of ['any', 'paper', 'digital'] as const) {
    for (const voucher of ['any', 'A', 'B'] as const) {
      it(`${medium} ${voucher} returns the same set used by compatibility and map grouping`, async () => {
        const intent: VoucherIntent = { medium, voucher };
        const expected = stores.filter((store) =>
          matchesVoucherIntent(store, intent),
        );
        const result = await repository.searchStores(intent);
        expect(result.map((store) => store.id)).toEqual(
          expected.map((store) => store.id),
        );
        const groups = await repository.getLocationGroups(intent);
        expect(
          groups.flatMap((group) => group.stores).map((store) => store.id),
        ).toEqual(
          expected
            .filter((store) => store.lat !== null)
            .map((store) => store.id),
        );
      });
    }
  }

  it('keeps advanced store-type conflicts explicit instead of changing the voucher', async () => {
    expect(
      await repository.searchStores({ voucher: 'A', couponType: 'b_only' }),
    ).toEqual([]);
    expect(
      (await repository.searchStores({ voucher: 'B', couponType: 'ab' })).map(
        (store) => store.couponType,
      ),
    ).toEqual(['ab', 'ab', 'ab', 'ab']);
  });

  it('intersects legacy payment constraints rather than silently broadening intent', async () => {
    expect(
      (
        await repository.searchStores({ medium: 'paper', payment: 'digital' })
      ).map((store) => store.id),
    ).toEqual(['ab-2', 'b_only-2']);
  });
});
