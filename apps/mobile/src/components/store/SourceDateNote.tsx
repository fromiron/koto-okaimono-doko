import { CalendarDays } from 'lucide-react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/theme/tokens';

/** Source provenance shown at the bottom of the store sheet. */
export function SourceDateNote({ sourceDate }: { sourceDate?: string | null }) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-start gap-2 border-t border-line pt-3">
      <CalendarDays color={colors.muted} size={16} />
      <View className="min-w-0 flex-1 gap-1">
        <Text tone="muted" variant="caption">
          {sourceDate
            ? `${t('store.sourceDate')}: ${sourceDate}`
            : t('listing.sourceUnknown')}
        </Text>
        <Text tone="muted" variant="caption">
          {t('listing.sourceNote')}
        </Text>
      </View>
    </View>
  );
}
