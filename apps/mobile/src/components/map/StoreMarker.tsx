import { MapPin } from 'lucide-react-native';
import { View } from 'react-native';
import { Marker } from 'react-native-maps';

import { Text } from '@/src/components/ui/Text';

type StoreMarkerProps = {
  id: string;
  lat: number;
  lng: number;
  count: number;
  onPress: () => void;
};

export function StoreMarker({ count, id, lat, lng, onPress }: StoreMarkerProps) {
  return (
    <Marker coordinate={{ latitude: lat, longitude: lng }} identifier={id} onPress={onPress}>
      <View className="items-center">
        <View className="min-h-9 min-w-9 items-center justify-center rounded-full border-2 border-white bg-water-700 px-2">
          {count > 1 ? (
            <Text variant="label" tone="inverse">
              {count}
            </Text>
          ) : (
            <MapPin color="#ffffff" size={18} />
          )}
        </View>
      </View>
    </Marker>
  );
}
