import { CalendarDays } from 'lucide-react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/src/components/ui/Text';
import { colors, surfaceShadow } from '@/src/theme/tokens';

type DatasetBadgeProps = {
  sourceDate?: string | null;
};

export function DatasetBadge({ sourceDate }: DatasetBadgeProps) {
  const { t } = useTranslation();

  return (
    <View
      className="flex-row items-center justify-between gap-3 rounded-full border border-line-200 bg-paper-50 px-4 py-3"
      style={surfaceShadow}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <CalendarDays color={colors.inkMuted} size={18} />
        <Text className="min-w-0" variant="caption" tone="muted">
          {t('store.sourceDate')}: {sourceDate ?? '-'}
        </Text>
      </View>
      <View className="shrink-0 rounded-full bg-emerald-50 px-3 py-1">
        <Text className="text-water-500" variant="label">
          {t('app.unofficial')}
        </Text>
      </View>
    </View>
  );
}
