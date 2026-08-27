import { StyleSheet, View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/theme/tokens';

const HIT_SIZE = 52;
const DOT_SIZE = 44;
const RING_WIDTH = 4;

type CircleMarkerViewProps = {
  color: string;
  label: string;
  labelTone: 'default' | 'inverse';
  selected?: boolean;
};

/**
 * Fixed capture tree: one square hit box, a reserved ring, and a filled
 * circle. No rotation, no vector icons, no layout that depends on selected.
 */
export function CircleMarkerView({
  color,
  label,
  labelTone,
  selected = false,
}: CircleMarkerViewProps) {
  return (
    <View collapsable={false} style={styles.hit}>
      <View
        collapsable={false}
        style={[styles.ring, selected ? styles.ringSelected : styles.ringIdle]}
      >
        <View
          collapsable={false}
          style={[styles.dot, { backgroundColor: color }]}
        >
          <Text
            allowFontScaling={false}
            numberOfLines={1}
            tabularNums
            tone={labelTone}
            variant="micro"
          >
            {label}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: HIT_SIZE,
    height: HIT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    width: DOT_SIZE + RING_WIDTH * 2,
    height: DOT_SIZE + RING_WIDTH * 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    padding: RING_WIDTH,
  },
  ringIdle: {
    backgroundColor: 'transparent',
  },
  ringSelected: {
    backgroundColor: colors.surface,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: DOT_SIZE / 2,
    borderColor: colors.surface,
    borderWidth: 2,
  },
});
