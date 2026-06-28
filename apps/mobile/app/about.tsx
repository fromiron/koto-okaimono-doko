import { ChevronLeft, ChevronRight, Github, Globe2, Info, LockKeyhole, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Image, Linking, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { illustrations } from '@/src/assets/illustrations';
import { IconBadge } from '@/src/components/ui/IconBadge';
import { IconButton } from '@/src/components/ui/IconButton';
import { Screen } from '@/src/components/ui/Screen';
import { SurfaceCard } from '@/src/components/ui/SurfaceCard';
import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/theme/tokens';

export default function AboutScreen() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Screen>
      <View className="mb-6 flex-row items-center justify-between">
        <IconButton onPress={() => router.back()}>
          <ChevronLeft color={colors.ink} size={26} />
        </IconButton>
        <Text className="text-center" variant="subtitle">
          {t('about.title')}
        </Text>
        <View className="h-12 w-12" />
      </View>

      <View className="items-center border-b border-line-200 pb-7">
        <Image
          resizeMode="contain"
          source={illustrations.mapEmpty}
          style={{ height: 180, width: '100%' }}
        />
        <View className="mt-1 items-center gap-1">
          <Text className="text-center text-water-700" variant="title">
            koto okaimono doko
          </Text>
          <Text className="text-center text-water-500" variant="subtitle">
            こうとうお買い物どこ
          </Text>
        </View>
      </View>

      <View className="gap-7 py-7">
        <AboutPoint
          body={t('about.body')}
          icon={<Info color={colors.primary} size={28} />}
          title={t('about.unofficialTitle')}
        />
        <AboutPoint
          body={t('about.accuracyBody')}
          icon={<ShieldCheck color={colors.teal} size={28} />}
          title={t('about.accuracyTitle')}
          tone="teal"
        />
        <AboutPoint
          body={t('about.privacyBody')}
          icon={<LockKeyhole color={colors.primary} size={28} />}
          title={t('about.privacyTitle')}
        />
      </View>

      <View className="gap-3 border-t border-line-200 pt-6">
        <LinkRow
          icon={<Globe2 color={colors.teal} size={30} />}
          label={t('about.officialSite')}
          onPress={() => Linking.openURL('https://koto-okaimono-premium.jp/')}
          tone="teal"
        />
        <LinkRow
          icon={<Github color={colors.ink} size={30} />}
          label={t('about.github')}
          onPress={() => Linking.openURL('https://github.com/fromiron/koto-okaimono-doko')}
        />
      </View>

      <View className="items-center gap-3 pt-7">
        <View className="rounded-full border border-water-500 bg-emerald-50 px-4 py-2">
          <Text className="text-water-500" variant="label">
            {t('app.unofficial')}
          </Text>
        </View>
        <Text className="text-center" tone="muted">
          {t('about.disclaimer')}
        </Text>
        <Text variant="caption" tone="muted">
          © 2026 koto okaimono doko
        </Text>
      </View>
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
    <View className="flex-row gap-5">
      <IconBadge tone={tone}>{icon}</IconBadge>
      <View className="min-w-0 flex-1 gap-2">
        <Text variant="subtitle">{title}</Text>
        <Text>{body}</Text>
      </View>
    </View>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
  tone = 'primary',
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'teal';
}) {
  return (
    <Pressable onPress={onPress}>
      <SurfaceCard className="flex-row items-center gap-4 px-4 py-4">
        <IconBadge tone={tone}>{icon}</IconBadge>
        <Text className="min-w-0 flex-1" variant="subtitle">
          {label}
        </Text>
        <ChevronRight color={colors.ink} size={28} />
      </SurfaceCard>
    </Pressable>
  );
}
