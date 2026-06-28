import type { Store } from '@koto/schema';
import type { RefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import { StoreMarker } from './StoreMarker';
import type { MapRegion } from '@/src/features/map/mapStore';

export type StoreLocationGroup = {
  id: string;
  lat: number;
  lng: number;
  stores: Store[];
};

type StoreMapProps = {
  mapRef: RefObject<MapView | null>;
  initialRegion: MapRegion;
  groups: StoreLocationGroup[];
  selectedStoreIds: string[];
  showsUserLocation: boolean;
  onMapPress: () => void;
  onRegionChangeComplete: (region: MapRegion) => void;
  onSelectStores: (stores: Store[]) => void;
};

export function StoreMap({
  groups,
  initialRegion,
  mapRef,
  onMapPress,
  onRegionChangeComplete,
  onSelectStores,
  selectedStoreIds,
  showsUserLocation,
}: StoreMapProps) {
  const selected = new Set(selectedStoreIds);

  return (
    <View style={styles.mapLayer}>
      <MapView
        ref={mapRef}
        initialRegion={initialRegion}
        onPress={onMapPress}
        onRegionChangeComplete={onRegionChangeComplete}
        provider={PROVIDER_GOOGLE}
        showsCompass={false}
        showsMyLocationButton={false}
        showsUserLocation={showsUserLocation}
        style={StyleSheet.absoluteFill}
      >
        {groups.map((group) => (
          <StoreMarker
            id={group.id}
            key={group.id}
            lat={group.lat}
            lng={group.lng}
            onPress={() => onSelectStores(group.stores)}
            selected={group.stores.some((store) => selected.has(store.id))}
            stores={group.stores}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapLayer: {
    flex: 1,
    elevation: 0,
    zIndex: 0,
  },
});
