import type { Store } from '@koto/schema';
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

  return (
    <Marker
      anchor={{ x: 0.5, y: 0.95 }}
      coordinate={{ latitude: lat, longitude: lng }}
      identifier={id}
      onPress={onPress}
      stopPropagation
    >
      <View style={styles.markerWrap}>
        {selected ? <View style={styles.selectedHalo} /> : null}
        <View style={[styles.pin, { backgroundColor: descriptor.color }]}>
          <View style={styles.pinContent}>
            <Text className="text-center text-base" tone="inverse" variant="label">
              {descriptor.label}
            </Text>
          </View>
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  markerWrap: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  pin: {
    alignItems: 'center',
    borderColor: colors.surface,
    borderRadius: 25,
    borderWidth: 3,
    height: 50,
    justifyContent: 'center',
    transform: [{ rotate: '45deg' }],
    width: 50,
  },
  pinContent: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    transform: [{ rotate: '-45deg' }],
    width: 44,
  },
  selectedHalo: {
    backgroundColor: colors.surface,
    borderColor: colors.primarySoft,
    borderRadius: 32,
    borderWidth: 6,
    height: 64,
    opacity: 0.96,
    position: 'absolute',
    width: 64,
  },
});
