import { ChevronLeft, Github, Globe2, Info, LockKeyhole, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Image, Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { illustrations } from '@/src/assets/illustrations';
import { IconBadge } from '@/src/components/ui/IconBadge';
import { IconButton } from '@/src/components/ui/IconButton';
import { NavRow } from '@/src/components/ui/NavRow';
import { Row } from '@/src/components/ui/Row';
import { Screen } from '@/src/components/ui/Screen';
import { Stack } from '@/src/components/ui/Stack';
import { Text } from '@/src/components/ui/Text';
import { UnofficialPill } from '@/src/components/ui/UnofficialPill';
import { colors, iconSizes } from '@/src/theme/tokens';

export default function AboutScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Screen>
      <Row className="mb-6 justify-between">
        <IconButton onPress={() => router.back()}>
          <ChevronLeft color={colors.ink} size={iconSizes.lg} />
        </IconButton>
        <Text className="text-center" variant="subtitle">
          {t('about.title')}
        </Text>
        <View className="h-12 w-12" />
      </Row>

      <Stack className="items-center border-b border-line pb-6" gap="xs">
        <Image resizeMode="contain" source={illustrations.mapEmpty} style={{ height: 180, width: '100%' }} />
        <Stack className="items-center" gap="xs">
          <Text className="text-center text-primary" variant="title">
            こうとうお買い物どこ
          </Text>
          <Text className="text-center text-teal" variant="subtitle">
            koto okaimono doko
          </Text>
        </Stack>
      </Stack>

      <Stack className="py-6" gap="2xl">
        <AboutPoint
          body={t('about.body')}
          icon={<Info color={colors.primary} size={iconSizes.xl} />}
          title={t('about.unofficialTitle')}
        />
        <AboutPoint
          body={t('about.accuracyBody')}
          icon={<ShieldCheck color={colors.teal} size={iconSizes.xl} />}
          title={t('about.accuracyTitle')}
          tone="teal"
        />
        <AboutPoint
          body={t('about.privacyBody')}
          icon={<LockKeyhole color={colors.primary} size={iconSizes.xl} />}
          title={t('about.privacyTitle')}
        />
      </Stack>

      <Stack className="border-t border-line pt-6" gap="md">
        <NavRow
          surface
          icon={<Globe2 color={colors.teal} size={iconSizes.xl} />}
          iconTone="teal"
          label={t('about.officialSite')}
          labelVariant="subtitle"
          onPress={() => Linking.openURL('https://koto-okaimono-premium.jp/')}
        />
        <NavRow
          surface
          icon={<Github color={colors.ink} size={iconSizes.xl} />}
          label={t('about.github')}
          labelVariant="subtitle"
          onPress={() => Linking.openURL('https://github.com/fromiron/koto-okaimono-doko')}
        />
      </Stack>

      <Stack className="items-center pt-6" gap="md">
        <UnofficialPill className="px-4 py-2" />
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
  tone = 'primary',
}: {
  body: string;
  icon: ReactNode;
  title: string;
  tone?: 'primary' | 'teal';
}) {
  return (
    <Row align="start" gap="lg">
      <IconBadge tone={tone}>{icon}</IconBadge>
      <Stack className="min-w-0 flex-1" gap="sm">
        <Text variant="subtitle">{title}</Text>
        <Text>{body}</Text>
      </Stack>
    </Row>
  );
}
