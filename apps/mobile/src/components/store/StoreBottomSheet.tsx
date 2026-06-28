import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import type { Store } from '@koto/schema';
import { useEffect, useMemo, useRef } from 'react';

import { StoreDetailContent } from './StoreDetailContent';

type StoreBottomSheetProps = {
  stores: Store[];
  sourceDate?: string | null;
};

export function StoreBottomSheet({ sourceDate, stores }: StoreBottomSheetProps) {
  const ref = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['18%', '54%', '88%'], []);

  useEffect(() => {
    if (stores.length > 0) {
      ref.current?.snapToIndex(1);
    } else {
      ref.current?.close();
    }
  }, [stores.length]);

  return (
    <BottomSheet
      ref={ref}
      backgroundStyle={{ backgroundColor: '#faf8f2' }}
      enablePanDownToClose
      handleIndicatorStyle={{ backgroundColor: '#69727e' }}
      index={-1}
      snapPoints={snapPoints}
    >
      <BottomSheetScrollView>
        <StoreDetailContent sourceDate={sourceDate} stores={stores} />
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
