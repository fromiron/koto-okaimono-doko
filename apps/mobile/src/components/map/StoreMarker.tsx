import type { Store } from '@koto/schema';
import { Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

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

// A real teardrop pin drawn as ONE view: a square with three fully-rounded
// corners rotated 45°, so the round head flows continuously into the tip —
// no separate head/tail views whose seam the marker bitmap capture could
// expose. The coupon label (or a people glyph for facilities) sits in a
// counter-rotated wrapper. A fixed canvas keeps the captured-bitmap geometry
// deterministic so the tip never drifts. The selected halo is drawn INSIDE
// the drop wrapper's padding — never with negative offsets — because
// Android's marker bitmap capture clips anything outside the canvas bounds.
const CANVAS_W = 110;
// Side of the rotated square; with three corners at HEAD/2 the visible head is
// exactly a circle of this diameter centred on the square's centre, plus the
// one square corner pointing down as the tip.
const HEAD = 46;
const HALO_PAD = 6;
const DROP_TOP = 16; // layout-box top == visual top of the round head
const TIP_RADIUS = 7; // soften the tip corner so it matches the artwork
// The un-rounded corner reaches half the square's diagonal below its centre;
// the small negative fudge accounts for the softened tip.
const TIP_Y = Math.round(DROP_TOP + HEAD / 2 + (HEAD / 2) * Math.SQRT2) - 2;
const CANVAS_H = TIP_Y + 7;
const TIP_ANCHOR_Y = TIP_Y / CANVAS_H;

export function StoreMarker({
  id,
  lat,
  lng,
  onPress,
  selected = false,
  stores,
}: StoreMarkerProps) {
  const { t } = useTranslation();
  const descriptor = getStoreMarkerDescriptor(stores);
  const isFacility = descriptor.kind === 'facility';
  const accessibilityLabel = isFacility
    ? t('map.groupedStores', { count: stores.length })
    : `${stores[0]?.name ?? ''}, ${descriptor.label}`;

  // react-native-maps captures custom marker views to a bitmap on Android. Keep
  // tracking OFF for performance, re-enabling briefly after mount and on any
  // appearance change. Selected markers (at most a handful) stay live so the
  // halo/lift state is never captured mid-layout. NOTE: never attach onLayout
  // inside the marker subtree — Fabric then routes layout events through
  // MarkerManager.onLayoutChange, which crashes casting the view to MapMarker.
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  useEffect(() => {
    setTracksViewChanges(true);
    if (selected) return;
    const handle = setTimeout(() => setTracksViewChanges(false), 800);
    return () => clearTimeout(handle);
  }, [selected, descriptor.kind, descriptor.color, descriptor.label]);

  return (
    <Marker
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      anchor={{ x: 0.5, y: TIP_ANCHOR_Y }}
      coordinate={{ latitude: lat, longitude: lng }}
      identifier={id}
      onPress={onPress}
      stopPropagation
      tracksViewChanges={tracksViewChanges}
      zIndex={selected ? 10 : 1}
    >
      {/* collapsable={false} on every layout-only wrapper: Android otherwise
          flattens them away and the bitmap capture snapshots an inner view with
          smaller bounds, slicing the pin mid-glyph. */}
      <View collapsable={false} style={styles.canvas}>
        <View collapsable={false} style={styles.dropWrap}>
          {selected ? <View pointerEvents="none" style={styles.halo} /> : null}
          <View
            style={[
              styles.drop,
              { backgroundColor: descriptor.color },
              selected && styles.lifted,
            ]}
          >
            {/* Counter-rotate the glyph back upright inside the rotated drop. */}
            <View collapsable={false} style={styles.content}>
              {isFacility ? (
                <Users color={colors.surface} size={20} strokeWidth={2.4} />
              ) : (
                <Text
                  allowFontScaling={false}
                  style={styles.label}
                  tone={descriptor.kind === 'b_only' ? 'default' : 'inverse'}
                  variant="micro"
                >
                  {descriptor.label}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </Marker>
  );
}

const pinShadow = {
  elevation: 4,
  shadowColor: '#2A231C',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.24,
  shadowRadius: 3,
};

const liftedShadow = {
  elevation: 9,
  shadowColor: '#2A231C',
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.3,
  shadowRadius: 6,
};

const styles = StyleSheet.create({
  canvas: {
    width: CANVAS_W,
    height: CANVAS_H,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  // The halo pad is carved out of DROP_TOP so the head (and the tip) sit at the
  // same canvas y whether or not the halo is present.
  dropWrap: {
    position: 'relative',
    padding: HALO_PAD,
    marginTop: DROP_TOP - HALO_PAD,
  },
  halo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderRadius: 999,
    ...liftedShadow,
  },
  drop: {
    width: HEAD,
    height: HEAD,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    borderRadius: HEAD / 2,
    borderBottomRightRadius: TIP_RADIUS,
    transform: [{ rotate: '45deg' }],
    ...pinShadow,
  },
  content: { transform: [{ rotate: '-45deg' }] },
  label: { letterSpacing: 0.2 },
  lifted: { ...liftedShadow },
});
