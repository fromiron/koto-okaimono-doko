import type { Store } from '@koto/schema';
import type { RefObject } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import type { MapRegion } from '@/src/features/map/mapStore';

import { ClusterMarker } from './ClusterMarker';
import type { MarkerCluster } from './clusterGroups';
import { StoreMarker } from './StoreMarker';

export type StoreLocationGroup = {
  id: string;
  lat: number;
  lng: number;
  stores: Store[];
};

type StoreMapProps = {
  mapRef: RefObject<MapView | null>;
  initialRegion: MapRegion;
  clusters: MarkerCluster<StoreLocationGroup>[];
  selectedStoreIds: string[];
  showsUserLocation: boolean;
  onMapPress: () => void;
  onRegionChangeComplete: (region: MapRegion) => void;
  onSelectStores: (stores: Store[]) => void;
  onClusterPress: (cluster: MarkerCluster<StoreLocationGroup>) => void;
};

export function StoreMap({
  clusters,
  initialRegion,
  mapRef,
  onClusterPress,
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
        {clusters.map((cluster) => {
          if (cluster.items.length === 1) {
            const group = cluster.items[0];
            return (
              <StoreMarker
                id={group.id}
                key={group.id}
                lat={group.lat}
                lng={group.lng}
                onPress={() => onSelectStores(group.stores)}
                selected={group.stores.some((store) => selected.has(store.id))}
                stores={group.stores}
              />
            );
          }
          return (
            <ClusterMarker
              count={cluster.count}
              id={cluster.id}
              key={cluster.id}
              lat={cluster.lat}
              lng={cluster.lng}
              onPress={() => onClusterPress(cluster)}
            />
          );
        })}
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
