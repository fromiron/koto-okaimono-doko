import type { Store } from '@koto/schema';

import { colors } from '../../theme/tokens';

export type StoreMarkerDescriptor = {
  kind: 'ab' | 'b_only' | 'facility';
  label: string;
  color: string;
};

export function getStoreMarkerDescriptor(
  stores: Array<Pick<Store, 'couponType'>>,
): StoreMarkerDescriptor {
  if (stores.length > 1) {
    return {
      color: colors.facility,
      kind: 'facility',
      label: String(stores.length),
    };
  }

  const store = stores[0];
  if (store?.couponType === 'b_only') {
    return { color: colors.couponB, kind: 'b_only', label: 'B' };
  }

  return { color: colors.primaryStrong, kind: 'ab', label: 'A・B' };
}
