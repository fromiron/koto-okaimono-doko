import { CalendarDays, Megaphone } from 'lucide-react-native';
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
      className="flex-row items-center gap-2 self-start rounded-full border border-line-200 bg-paper-50 px-4 py-2"
      style={surfaceShadow}
    >
      <CalendarDays color={colors.inkMuted} size={16} />
      <Text variant="caption" tone="muted">
        {t('store.sourceDate')}: {sourceDate ?? '-'}
      </Text>
      <View className="h-4 w-px bg-line-200" />
      <Megaphone color={colors.inkMuted} size={16} />
      <Text variant="caption" tone="muted">
        {t('app.unofficial')}
      </Text>
    </View>
  );
}
