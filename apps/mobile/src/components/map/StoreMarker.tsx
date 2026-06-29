import type { Store } from '@koto/schema';
import { Building2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/theme/tokens';

import { getStoreMarkerDescriptor } from './markerDescriptor';

type StoreMarkerProps = {
  id: string;
  lat: number;
  lng: number;
  stores: Store[];
  selected?: boolean;
  onPress: () => void;
};

// The marker is a "ticket-stub" tag (coupon color + white border + ticket eye +
// label) with a downward nub whose tip marks the precise coordinate. A fixed
// canvas keeps the captured-bitmap geometry deterministic so the tip never
// drifts; the selected halo is absolutely positioned so it never shifts the tip.
const CANVAS_W = 150;
const CANVAS_H = 92;
const TAG_TOP = 14;
const TAG_H = 42;
const NUB_H = 12;
// nub tip y inside the canvas (tag bottom - 2px overlap + nub height)
const TIP_Y = TAG_TOP + TAG_H - 2 + NUB_H;
const TIP_ANCHOR_Y = TIP_Y / CANVAS_H;

export function StoreMarker({ id, lat, lng, onPress, selected = false, stores }: StoreMarkerProps) {
  const descriptor = getStoreMarkerDescriptor(stores);
  const isFacility = descriptor.kind === 'facility';

  // react-native-maps captures custom marker views to a bitmap on Android. Keep
  // tracking OFF for performance, re-enabling only briefly after mount and on any
  // appearance change so the capture stays correct.
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  useEffect(() => {
    setTracksViewChanges(true);
    const handle = setTimeout(() => setTracksViewChanges(false), 800);
    return () => clearTimeout(handle);
  }, [selected, descriptor.kind, descriptor.color, descriptor.label]);

  return (
    <Marker
      anchor={isFacility ? { x: 0.5, y: 0.5 } : { x: 0.5, y: TIP_ANCHOR_Y }}
      coordinate={{ latitude: lat, longitude: lng }}
      identifier={id}
      onPress={onPress}
      stopPropagation
      tracksViewChanges={tracksViewChanges}
      zIndex={selected ? 10 : 1}
    >
      <View style={styles.canvas}>
        {isFacility ? (
          <View style={styles.facilityWrap}>
            {selected ? <View pointerEvents="none" style={styles.halo} /> : null}
            <View style={[styles.facility, selected && styles.lifted]}>
              <Building2 color={colors.surface} size={20} strokeWidth={2.4} />
            </View>
          </View>
        ) : (
          <View style={styles.tagGroup}>
            <View style={styles.tagWrap}>
              {selected ? <View pointerEvents="none" style={styles.halo} /> : null}
              <View style={[styles.tag, { backgroundColor: descriptor.color }, selected && styles.lifted]}>
                <View style={styles.eye} />
                <Text style={styles.label} tone="inverse" variant="micro">
                  {descriptor.label}
                </Text>
              </View>
            </View>
            <View style={[styles.nub, { borderTopColor: descriptor.color }]} />
          </View>
        )}
      </View>
    </Marker>
  );
}

const pinShadow = {
  elevation: 4,
  shadowColor: '#1B2430',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.26,
  shadowRadius: 3,
};

const liftedShadow = {
  elevation: 9,
  shadowColor: '#1B2430',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.32,
  shadowRadius: 6,
};

const styles = StyleSheet.create({
  canvas: { width: CANVAS_W, height: CANVAS_H, alignItems: 'center', justifyContent: 'flex-start' },
  tagGroup: { marginTop: TAG_TOP, alignItems: 'center' },
  tagWrap: { position: 'relative' },
  halo: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    backgroundColor: colors.surface,
    borderRadius: 18,
    ...liftedShadow,
  },
  tag: {
    height: TAG_H,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: colors.surface,
    ...pinShadow,
  },
  eye: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.surface, opacity: 0.92 },
  label: { letterSpacing: 0.3 },
  nub: {
    marginTop: -2,
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderTopWidth: NUB_H,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  facilityWrap: { marginTop: CANVAS_H / 2 - 21, position: 'relative' },
  facility: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: colors.facility,
    borderWidth: 2.5,
    borderColor: colors.surface,
    ...pinShadow,
  },
  lifted: { ...liftedShadow },
});
