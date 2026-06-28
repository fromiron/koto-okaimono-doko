import { CalendarDays } from 'lucide-react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/theme/tokens';

/** Bordered "データ基準日: {date}" note shown at the bottom of the store sheet. */
export function SourceDateNote({ sourceDate }: { sourceDate: string }) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-2 rounded-2xl border border-line-200 px-4 py-3">
      <CalendarDays color={colors.inkMuted} size={18} />
      <Text tone="muted" variant="caption">
        {t('store.sourceDate')}: {sourceDate}
      </Text>
    </View>
  );
}
