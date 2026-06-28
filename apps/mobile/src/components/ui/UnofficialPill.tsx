import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from './Text';

/** Mint "非公式 / Unofficial" badge used on the map dataset row and the About screen. */
export function UnofficialPill({ className = '' }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <View className={`rounded-full bg-emerald-50 px-3 py-1 ${className}`}>
      <Text className="text-water-500" variant="label">
        {t('app.unofficial')}
      </Text>
    </View>
  );
}
