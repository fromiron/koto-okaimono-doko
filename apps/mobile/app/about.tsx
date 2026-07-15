import { Github, Globe2, LockKeyhole, ShieldCheck } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { NavRow } from '@/src/components/ui/NavRow';
import { Screen } from '@/src/components/ui/Screen';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { Stack } from '@/src/components/ui/Stack';
import { SurfaceCard } from '@/src/components/ui/SurfaceCard';
import { Text } from '@/src/components/ui/Text';
import { UnofficialPill } from '@/src/components/ui/UnofficialPill';
import { colors, iconSizes } from '@/src/theme/tokens';

export default function AboutScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <ScreenHeader title={t('about.title')} />

      <Stack className="border-b border-line pb-6" gap="md">
        <UnofficialPill className="self-start" />
        <Text accessibilityRole="header" variant="subtitle">
          {t('app.name')}
        </Text>
        <Text>{t('about.body')}</Text>
      </Stack>

      <Stack className="py-6" gap="xl">
        <AboutPoint
          body={t('about.accuracyBody')}
          icon={<ShieldCheck color={colors.teal} size={iconSizes.lg} />}
          title={t('about.accuracyTitle')}
        />
        <AboutPoint
          body={t('about.privacyBody')}
          icon={
            <LockKeyhole color={colors.primaryStrong} size={iconSizes.lg} />
          }
          title={t('about.privacyTitle')}
        />
      </Stack>

      <SurfaceCard className="px-4">
        <NavRow
          icon={<Globe2 color={colors.teal} size={iconSizes.xl} />}
          label={t('about.officialSite')}
          onPress={() => Linking.openURL('https://koto-okaimono-premium.jp/')}
          role="link"
        />
        <NavRow
          divider={false}
          icon={<Github color={colors.ink} size={iconSizes.lg} />}
          label={t('about.github')}
          onPress={() =>
            Linking.openURL('https://github.com/fromiron/koto-okaimono-doko')
          }
          role="link"
        />
      </SurfaceCard>

      <Stack className="items-center pt-6" gap="sm">
        <Text className="text-center" tone="muted">
          {t('about.disclaimer')}
        </Text>
        <Text tone="muted" variant="caption">
          © 2026 koto okaimono doko
        </Text>
      </Stack>
    </Screen>
  );
}

function AboutPoint({
  body,
  icon,
  title,
}: {
  body: string;
  icon: ReactNode;
  title: string;
}) {
  return (
    <View className="flex-row items-start gap-4">
      <View className="w-7 items-center pt-1">{icon}</View>
      <Stack className="min-w-0 flex-1" gap="sm">
        <Text accessibilityRole="header" variant="subtitle">
          {title}
        </Text>
        <Text>{body}</Text>
      </Stack>
    </View>
  );
}
