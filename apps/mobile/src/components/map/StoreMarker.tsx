import type { Store } from '@koto/schema';
import { Store as StoreGlyph } from 'lucide-react-native';
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

export function StoreMarker({ id, lat, lng, onPress, selected = false, stores }: StoreMarkerProps) {
  const descriptor = getStoreMarkerDescriptor(stores);
  const isFacility = descriptor.kind === 'facility';

  return (
    <Marker
      anchor={isFacility ? { x: 0.5, y: 0.5 } : { x: 0.5, y: 0.96 }}
      coordinate={{ latitude: lat, longitude: lng }}
      identifier={id}
      onPress={onPress}
      stopPropagation
      tracksViewChanges={selected}
    >
      <View style={[styles.wrap, selected && styles.wrapSelected]}>
        {selected ? <View style={isFacility ? styles.haloCircle : styles.haloPin} /> : null}
        {isFacility ? (
          <View style={[styles.facility, selected && styles.facilityScaled]}>
            <StoreGlyph color={colors.surface} size={20} strokeWidth={2.4} />
          </View>
        ) : (
          <View style={[styles.pin, { backgroundColor: descriptor.color }, selected && styles.pinScaled]}>
            <View style={styles.pinContent}>
              <Text className="text-center" tone="inverse" variant="label">
                {descriptor.label}
              </Text>
            </View>
          </View>
        )}
      </View>
    </Marker>
  );
}

const PIN_SIZE = 38;
const pinShadow = {
  elevation: 5,
  shadowColor: '#111827',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.28,
  shadowRadius: 4,
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  wrapSelected: {
    height: 64,
    width: 64,
  },
  pin: {
    alignItems: 'center',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: PIN_SIZE / 2,
    borderColor: colors.surface,
    borderTopLeftRadius: PIN_SIZE / 2,
    borderTopRightRadius: PIN_SIZE / 2,
    borderWidth: 3,
    height: PIN_SIZE,
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
    width: PIN_SIZE,
    ...pinShadow,
  },
  pinScaled: {
    transform: [{ rotate: '-45deg' }, { scale: 1.18 }],
  },
  pinContent: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
  },
  facility: {
    alignItems: 'center',
    backgroundColor: colors.facility,
    borderColor: colors.surface,
    borderRadius: 21,
    borderWidth: 3,
    height: 42,
    justifyContent: 'center',
    width: 42,
    ...pinShadow,
  },
  facilityScaled: {
    transform: [{ scale: 1.18 }],
  },
  haloPin: {
    backgroundColor: colors.surface,
    borderColor: colors.primarySoft,
    borderRadius: 32,
    borderWidth: 5,
    bottom: 2,
    height: 56,
    position: 'absolute',
    width: 56,
  },
  haloCircle: {
    backgroundColor: colors.surface,
    borderColor: colors.primarySoft,
    borderRadius: 30,
    borderWidth: 5,
    height: 60,
    position: 'absolute',
    width: 60,
  },
});
