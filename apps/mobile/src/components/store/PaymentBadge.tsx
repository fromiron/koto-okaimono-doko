import { FileText } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/theme/tokens';

export function PaymentBadge({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-1 rounded-full border border-water-500 bg-paper-50 px-3 py-1">
      <FileText color={colors.teal} size={14} />
      <Text className="text-water-500" variant="label">
        {label}
      </Text>
    </View>
  );
}
