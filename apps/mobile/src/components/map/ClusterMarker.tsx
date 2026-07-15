import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/theme/tokens';

type ClusterMarkerProps = {
  id: string;
  lat: number;
  lng: number;
  count: number;
  onPress: () => void;
};

export function ClusterMarker({
  count,
  id,
  lat,
  lng,
  onPress,
}: ClusterMarkerProps) {
  const { t } = useTranslation();
  const size = count >= 100 ? 50 : count >= 25 ? 44 : 38;
  // react-native-maps needs an initial render pass to capture custom marker views on Android.
  const [tracks, setTracks] = useState(true);
  useEffect(() => {
    const handle = setTimeout(() => setTracks(false), 600);
    return () => clearTimeout(handle);
  }, [count]);

  return (
    <Marker
      accessibilityLabel={t('map.groupedStores', { count })}
      accessibilityRole="button"
      anchor={{ x: 0.5, y: 0.5 }}
      coordinate={{ latitude: lat, longitude: lng }}
      identifier={id}
      onPress={onPress}
      stopPropagation
      tracksViewChanges={tracks}
    >
      {/* collapsable={false}: keep the padded ring as the real captured view so
          the bubble's border/shadow isn't clipped by Android view flattening. */}
      <View collapsable={false} style={styles.ring}>
        <View
          style={[
            styles.bubble,
            { borderRadius: size / 2, height: size, width: size },
          ]}
        >
          <Text
            allowFontScaling={false}
            className="text-center"
            tone="inverse"
            variant="label"
          >
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
    shadowColor: '#2A231C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.26,
    shadowRadius: 4,
  },
});
