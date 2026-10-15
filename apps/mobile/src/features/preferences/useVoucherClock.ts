import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useVoucherIntentStore } from './voucherIntentStore';

/** One clock for all voucher labels, mounted by AppProviders. */
export function useVoucherClock() {
  const now = useVoucherIntentStore((state) => state.now);

  useEffect(() => {
    const day = 24 * 60 * 60 * 1000;
    const japanOffset = 9 * 60 * 60 * 1000;
    const refresh = () => useVoucherIntentStore.setState({ now: new Date() });
    const untilMidnight = day - ((Date.now() + japanOffset) % day);
    const timer = setTimeout(refresh, untilMidnight);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [now]);
}
