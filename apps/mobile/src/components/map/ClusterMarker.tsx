import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';

import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/theme/tokens';

type ClusterMarkerProps = {
  id: string;
  lat: number;
  lng: number;
  count: number;
  onPress: () => void;
};

export function ClusterMarker({ count, id, lat, lng, onPress }: ClusterMarkerProps) {
  const size = count >= 100 ? 50 : count >= 25 ? 44 : 38;
  // react-native-maps needs an initial render pass to capture custom marker views on Android.
  const [tracks, setTracks] = useState(true);
  useEffect(() => {
    const handle = setTimeout(() => setTracks(false), 600);
    return () => clearTimeout(handle);
  }, [count]);

  return (
    <Marker
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={{ latitude: lat, longitude: lng }}
      identifier={id}
      onPress={onPress}
      stopPropagation
      tracksViewChanges={tracks}
    >
      <View style={styles.ring}>
        <View style={[styles.bubble, { borderRadius: size / 2, height: size, width: size }]}>
          <Text className="text-center" tone="inverse" variant="label">
            {count}
          </Text>
        </View>
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  bubble: {
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderColor: colors.surface,
    borderWidth: 3,
    elevation: 6,
    justifyContent: 'center',
    shadowColor: '#1B2430',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.26,
    shadowRadius: 4,
  },
});
