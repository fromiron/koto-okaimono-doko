import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Text } from './Text';

/** Quiet neutral "非公式 / Unofficial" badge — a disclaimer, so it carries no brand hue. */
export function UnofficialPill({ className = '' }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <View className={`rounded-full bg-neutral-soft px-3 py-1 ${className}`}>
      <Text tone="muted" variant="label">
        {t('app.unofficial')}
      </Text>
    </View>
  );
}
