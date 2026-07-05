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
import { colors, iconSizes, surfaceShadow } from '@/src/theme/tokens';

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
          <Text className="text-center" tone="muted" variant="label">
            KOTO OKAIMONO DOKO
          </Text>
        </Stack>
      </Stack>

      {/* One point per splash accent — vermillion, marigold, teal — matching
          the tri-colour feature row on the launch artwork. */}
      <Stack className="py-6" gap="2xl">
        <AboutPoint
          body={t('about.body')}
          icon={<Info color={colors.couponB} size={iconSizes.xl} />}
          title={t('about.unofficialTitle')}
          tone="coupon"
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
    <View className="w-full items-center overflow-hidden rounded-sheet bg-primary px-6 py-8" style={surfaceShadow}>
      {/* Quiet oversized washes keep the solid banner from reading flat. */}
      <View className="absolute -left-12 -top-16 h-44 w-44 rounded-full bg-surface/10" pointerEvents="none" />
      <View className="absolute -bottom-20 -right-10 h-40 w-40 rounded-full bg-surface/10" pointerEvents="none" />
      <View
        className="relative h-20 w-20 items-center justify-center rounded-card bg-surface"
        style={surfaceShadow}
      >
        <ShoppingBag color={colors.primary} size={44} strokeWidth={2.3} />
        <View className="absolute -right-2 -top-2 h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-coupon-b">
          <Heart color={colors.surface} fill={colors.surface} size={14} />
        </View>
      </View>
      <Row className="mt-5" gap="sm">
        <View className="rounded-full bg-surface px-4 py-1">
          <Text className="text-primary" variant="label">
            A・B券
          </Text>
        </View>
        <View className="rounded-full bg-coupon-b px-4 py-1">
          <Text tone="inverse" variant="label">
            B券
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
  tone?: 'primary' | 'teal' | 'coupon';
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
