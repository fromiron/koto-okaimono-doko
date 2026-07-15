import { CalendarDays } from 'lucide-react-native';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/theme/tokens';

/** Source provenance shown at the bottom of the store sheet. */
export function SourceDateNote({ sourceDate }: { sourceDate: string }) {
  const { t } = useTranslation();

  return (
    <View className="flex-row items-center gap-2 border-t border-line pt-3">
      <CalendarDays color={colors.muted} size={16} />
      <Text tone="muted" variant="caption">
        {t('store.sourceDate')}: {sourceDate}
      </Text>
    </View>
  );
}
