import type { Store } from '@koto/schema';
import type { RefObject } from 'react';
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
  onRegionChangeComplete: (region: MapRegion) => void;
  onSelectStores: (stores: Store[]) => void;
};

export function StoreMap({
  groups,
  initialRegion,
  mapRef,
  onRegionChangeComplete,
  onSelectStores,
}: StoreMapProps) {
  return (
    <MapView
      ref={mapRef}
      initialRegion={initialRegion}
      onRegionChangeComplete={onRegionChangeComplete}
      provider={PROVIDER_GOOGLE}
      showsCompass={false}
      showsMyLocationButton={false}
      showsUserLocation
      style={{ flex: 1 }}
    >
      {groups.map((group) => (
        <StoreMarker
          count={group.stores.length}
          id={group.id}
          key={group.id}
          lat={group.lat}
          lng={group.lng}
          onPress={() => onSelectStores(group.stores)}
        />
      ))}
    </MapView>
  );
}
