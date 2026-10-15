import type { Store } from '@koto/schema';
import { describe, expect, it, vi } from 'vitest';

import { getStoreMapLinks, openMapLink } from './directions';
import {
  getAddressText,
  getFacilityAddress,
  getFacilityName,
} from './storeDisplay';

const store: Store = {
  id: 'shop',
  sourceDetailId: null,
  name: '和食 & 甘味「森下」 #1',
  normalizedName: '和食甘味森下',
  postalCode: null,
  address: '森下 1-2-3',
  normalizedAddress: null,
  phone: null,
  categoryMajorId: 'eat_drink',
  categoryMajorLabel: '食べる',
  categoryMinorId: null,
  categoryMinorLabel: null,
  couponType: 'ab',
  acceptsPaper: true,
  acceptsDigital: false,
  mallName: null,
  shoppingStreet: null,
  floor: null,
  areaName: null,
  lat: 35.68,
  lng: 139.8,
  locationSource: 'manual-correction',
  locationConfidence: 'high',
  officialDetailUrl: null,
  homepageUrl: null,
  sourceUpdatedAt: null,
  createdAt: '',
  updatedAt: '',
};
const android = { os: 'android', version: 35 };
const ios = { os: 'ios', version: '18.4' };

describe('external map destinations', () => {
  it('uses distinct Google directions and search contracts with encoded Japanese text', () => {
    const links = getStoreMapLinks(
      { ...store, lat: null, lng: null },
      android,
    )!;
    const directions = new URL(links.directions);
    const search = new URL(links.map);
    expect(directions.pathname).toBe('/maps/dir/');
    expect(directions.searchParams.get('api')).toBe('1');
    expect(directions.searchParams.get('destination')).toBe(
      `${store.name} 東京都江東区森下 1-2-3`,
    );
    expect(search.pathname).toBe('/maps/search/');
    expect(search.searchParams.get('query')).toBe(
      directions.searchParams.get('destination'),
    );
    expect(directions.hash).toBe('');
    expect([...directions.searchParams.keys()]).toEqual(['api', 'destination']);
  });

  it('uses Apple unified directions/search from iOS 18.4 without sending an origin', () => {
    const links = getStoreMapLinks(store, ios)!;
    expect(links.provider).toBe('Apple Maps');
    expect(links.directions).toBe(
      'https://maps.apple.com/directions?destination=35.68%2C139.8',
    );
    expect(new URL(links.map).pathname).toBe('/search');
    expect(new URL(links.map).searchParams.get('query')).toContain(store.name);
    expect(
      getStoreMapLinks(store, { os: 'ios', version: '26.0.1' })?.provider,
    ).toBe('Apple Maps');
  });

  it('uses universal HTTPS URLs with a browser fallback on older iOS', () => {
    expect(
      getStoreMapLinks(store, { os: 'ios', version: '18.3.2' })?.provider,
    ).toBe('Google Maps');
    expect(
      getStoreMapLinks(store, { os: 'ios', version: '17.7' })?.directions,
    ).toContain('https://www.google.com/maps/dir/?api=1');
  });

  it.each(['medium', 'low', 'unknown'] as const)(
    'uses official text instead of %s confidence coordinates',
    (locationConfidence) => {
      const links = getStoreMapLinks(
        { ...store, locationConfidence },
        android,
      )!;
      expect(
        new URL(links.directions).searchParams.get('destination'),
      ).toContain(`${store.name} 東京都江東区`);
    },
  );

  it.each([
    { lat: NaN },
    { lng: Infinity },
    { lat: 91 },
    { lng: 181 },
    { locationSource: 'facility-centroid' },
    { mallName: '森下モール' },
    { shoppingStreet: '森下商店街' },
    { floor: '2F' },
  ])(
    'does not treat an unsuitable point as a shop entrance: %j',
    (overrides) => {
      const links = getStoreMapLinks({ ...store, ...overrides }, android)!;
      expect(
        new URL(links.directions).searchParams.get('destination'),
      ).toContain(store.name);
    },
  );

  it('routes to the named facility without using the first tenant or its floor', () => {
    const links = getStoreMapLinks(
      { ...store, address: '森下 1-2-3 森下モール 2F', floor: '2F' },
      ios,
      '森下モール',
    )!;
    const destination = new URL(links.directions).searchParams.get(
      'destination',
    );
    expect(destination).toBe('森下モール 東京都江東区森下 1-2-3 森下モール');
    expect(destination).not.toContain(store.name);
    expect(destination).not.toContain('2F');
  });

  it('routes an unnamed location group to its address, not a tenant', () => {
    const links = getStoreMapLinks(store, android, null)!;
    expect(new URL(links.directions).searchParams.get('destination')).toBe(
      '東京都江東区森下 1-2-3',
    );
  });

  it('supports address-only destinations and does not invent an address', () => {
    const addressOnly = { ...store, name: '', lat: null, lng: null };
    expect(
      new URL(
        getStoreMapLinks(addressOnly, android)!.directions,
      ).searchParams.get('destination'),
    ).toBe('東京都江東区森下 1-2-3');
    expect(getAddressText({ ...store, address: '  ', floor: '2F' })).toBe('');
    expect(
      getStoreMapLinks({ ...addressOnly, address: ' ' }, android),
    ).toBeNull();
    expect(
      getStoreMapLinks(
        { ...store, address: '', locationConfidence: 'low' },
        ios,
      ),
    ).toBeNull();
  });
});

describe('external map handoff', () => {
  it('reports a rejected OS handoff and permits a successful retry', async () => {
    const links = getStoreMapLinks(store, android)!;
    const openURL = vi
      .fn()
      .mockRejectedValueOnce(new Error('No handler'))
      .mockResolvedValueOnce(undefined);
    await expect(openMapLink(links.directions, openURL)).resolves.toBe(
      'failed',
    );
    await expect(openMapLink(links.directions, openURL)).resolves.toBe(
      'opened',
    );
    expect(openURL.mock.calls).toEqual([
      [links.directions],
      [links.directions],
    ]);
  });

  it('supports map confirmation after a failed directions handoff', async () => {
    const links = getStoreMapLinks(store, ios)!;
    const openURL = vi
      .fn()
      .mockRejectedValueOnce(new Error('Cancelled'))
      .mockResolvedValueOnce(undefined);
    await expect(openMapLink(links.directions, openURL)).resolves.toBe(
      'failed',
    );
    await expect(openMapLink(links.map, openURL)).resolves.toBe('opened');
    expect(openURL).toHaveBeenLastCalledWith(links.map);
  });

  it('does not invoke the OS when destination information is missing', async () => {
    const openURL = vi.fn();
    await expect(openMapLink(undefined, openURL)).resolves.toBe(
      'missing-destination',
    );
    expect(openURL).not.toHaveBeenCalled();
  });
});

describe('facility names', () => {
  it('does not present one tenant floor or a different address as a shared facility address', () => {
    expect(getFacilityAddress([])).toBe('');
    expect(
      getFacilityAddress([
        { ...store, floor: '2F' },
        { ...store, floor: '3F' },
      ]),
    ).toBe(getAddressText({ ...store, floor: null }));
    expect(
      getFacilityAddress([store, { ...store, address: '豊洲 1-1-1' }]),
    ).toBe('');
  });
  it('uses a facility name only when every store shares it', () => {
    expect(getFacilityName([])).toBeNull();
    expect(
      getFacilityName([store, { ...store, mallName: 'モール' }]),
    ).toBeNull();
    expect(
      getFacilityName([
        { ...store, mallName: 'モール' },
        { ...store, mallName: ' モール ' },
      ]),
    ).toBe('モール');
    expect(
      getFacilityName([
        { ...store, mallName: 'モールA', shoppingStreet: '商店街' },
        { ...store, mallName: 'モールB', shoppingStreet: '商店街' },
      ]),
    ).toBe('商店街');
    expect(getFacilityName([{ ...store, mallName: ' ' }])).toBeNull();
  });
});
