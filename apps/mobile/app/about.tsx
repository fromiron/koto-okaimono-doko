import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/src/components/ui/Button';
import { IconButton } from '@/src/components/ui/IconButton';
import { Screen } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';

export default function AboutScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Screen>
      <View className="mb-8 flex-row items-center gap-3">
        <IconButton onPress={() => router.back()}>
          <ChevronLeft color="#176762" size={22} />
        </IconButton>
        <Text variant="title">{t('about.title')}</Text>
      </View>

      <View className="gap-5">
        <Text>{t('about.body')}</Text>
        <Text>{t('settings.unofficial')}</Text>
        <Text tone="muted">{t('about.translationReview')}</Text>
        <Button
          onPress={() => Linking.openURL('https://koto-okaimono-premium.jp/')}
          variant="secondary"
        >
          {t('about.source')}
        </Button>
      </View>
    </Screen>
  );
}
