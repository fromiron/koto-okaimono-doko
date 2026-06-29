import { Github, Globe2, Heart, Info, LockKeyhole, ShieldCheck, ShoppingBag } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Linking, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { IconBadge } from '@/src/components/ui/IconBadge';
import { NavRow } from '@/src/components/ui/NavRow';
import { Row } from '@/src/components/ui/Row';
import { Screen } from '@/src/components/ui/Screen';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { Stack } from '@/src/components/ui/Stack';
import { Text } from '@/src/components/ui/Text';
import { UnofficialPill } from '@/src/components/ui/UnofficialPill';
import { colors, iconSizes } from '@/src/theme/tokens';

export default function AboutScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <ScreenHeader title={t('about.title')} />

      <Stack className="items-center border-b border-line pb-6" gap="lg">
        <AboutHero />
        <Stack className="items-center" gap="xs">
          <Text className="text-center text-primary" variant="display">
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

function AboutHero() {
  return (
    <View
      className="w-full items-center justify-center overflow-hidden rounded-sheet border border-line bg-primary-soft"
      style={{ height: 168 }}
    >
      <View className="relative h-20 w-20 items-center justify-center">
        <ShoppingBag color={colors.teal} size={60} strokeWidth={2.4} />
        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
          <Heart color={colors.teal} fill={colors.teal} size={18} style={{ marginTop: 7 }} />
        </View>
      </View>
      <Row className="mt-3" gap="sm">
        <View className="rounded-full bg-primary px-3 py-1">
          <Text tone="inverse" variant="label">
            A・B
          </Text>
        </View>
        <View className="rounded-full bg-coupon-b px-3 py-1">
          <Text tone="inverse" variant="label">
            B
          </Text>
        </View>
      </Row>
    </View>
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
