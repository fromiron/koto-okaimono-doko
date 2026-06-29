import { categories } from '@koto/core';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Dimensions, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { IconButton } from '@/src/components/ui/IconButton';
import { Text } from '@/src/components/ui/Text';
import { Wrap } from '@/src/components/ui/Wrap';
import { useFilterStore } from '@/src/features/filters/filterStore';
import { useMapStore } from '@/src/features/map/mapStore';
import { usePreferencesStore } from '@/src/features/preferences/preferencesStore';
import { colors, bottomSheetShadow } from '@/src/theme/tokens';

export default function FiltersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const filters = useFilterStore();
  const userLocation = useMapStore((state) => state.userLocation);
  const locationEnabled = usePreferencesStore((state) => state.locationEnabled);
  const radiusAvailable = locationEnabled && userLocation != null;
  // A definite height + bottom anchor makes this a real bottom sheet. The
  // justify-end utility is not honoured on this overlay, so the anchor is set
  // inline; the inner list scrolls and the action footer stays pinned.
  const sheetHeight = Math.round(Dimensions.get('window').height * 0.82);

  return (
    <View className="flex-1 bg-black/40" style={{ justifyContent: 'flex-end' }}>
      <Pressable className="absolute inset-0" onPress={() => router.back()} />
      <View
        className="rounded-t-sheet bg-surface px-6 pt-3"
        style={[bottomSheetShadow, { height: sheetHeight, paddingBottom: Math.max(insets.bottom, 18) }]}
      >
        <View className="mb-4 items-center pt-1">
          <View className="h-1 w-10 rounded-full bg-line" />
        </View>
        <View className="mb-4 min-h-12 flex-row items-center justify-between gap-3">
          <View className="h-12 w-12" />
          <Text variant="title">{t('filters.title')}</Text>
          <IconButton className="bg-neutral-soft" shadow={false} onPress={() => router.back()}>
            <X color={colors.ink} size={24} />
          </IconButton>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <FilterSection title={t('filters.couponType')}>
            <Chip selected={filters.couponType === 'all'} onPress={() => filters.setCouponType('all')}>
              {t('common.all')}
            </Chip>
            <Chip selected={filters.couponType === 'ab'} onPress={() => filters.setCouponType('ab')}>
              {t('filters.ab')}
            </Chip>
            <Chip selected={filters.couponType === 'b_only'} tone="orange" onPress={() => filters.setCouponType('b_only')}>
              {t('filters.bOnly')}
            </Chip>
          </FilterSection>

          <FilterSection title={t('filters.payment')}>
            <Chip selected={filters.payment === 'all'} tone="neutral" onPress={() => filters.setPayment('all')}>
              {t('common.all')}
            </Chip>
            <Chip selected={filters.payment === 'paper'} tone="neutral" onPress={() => filters.setPayment('paper')}>
              {t('filters.paper')}
            </Chip>
            <Chip selected={filters.payment === 'digital'} tone="neutral" onPress={() => filters.setPayment('digital')}>
              {t('filters.digital')}
            </Chip>
          </FilterSection>

          <FilterSection title={t('filters.category')}>
            <Chip selected={filters.categoryMajorId === null} tone="neutral" onPress={() => filters.setCategoryMajorId(null)}>
              {t('common.all')}
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category.id}
                selected={filters.categoryMajorId === category.id}
                tone="neutral"
                onPress={() => filters.setCategoryMajorId(category.id)}
              >
                {t(category.translationKey)}
              </Chip>
            ))}
          </FilterSection>

          <FilterSection divider={false} title={t('filters.radius')}>
            <Chip selected={filters.radiusMeters === 'all'} tone="neutral" onPress={() => filters.setRadiusMeters('all')}>
              {t('common.all')}
            </Chip>
            {(
              [
                [300, 'filters.meters300'],
                [500, 'filters.meters500'],
                [1000, 'filters.meters1000'],
                [2000, 'filters.meters2000'],
              ] as const
            ).map(([value, label]) => (
              <Chip
                key={value}
                disabled={!radiusAvailable}
                selected={filters.radiusMeters === value}
                tone="neutral"
                onPress={() => filters.setRadiusMeters(value)}
              >
                {t(label)}
              </Chip>
            ))}
          </FilterSection>
          {!radiusAvailable ? (
            <Text className="pb-2" tone="muted" variant="caption">
              {t('filters.radiusNeedsLocation')}
            </Text>
          ) : null}
        </ScrollView>

        <View className="gap-4 pt-4">
          <Button size="lg" onPress={() => router.back()}>
            {t('filters.applyConditions')}
          </Button>
          <Pressable className="items-center py-1" onPress={filters.reset}>
            <Text className="text-primary" variant="label">
              {t('filters.resetConditions')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function FilterSection({
  children,
  divider = true,
  title,
}: {
  children: ReactNode;
  divider?: boolean;
  title: string;
}) {
  return (
    <View className={`gap-4 py-5 ${divider ? 'border-b border-line' : ''}`}>
      <Text variant="subtitle">{title}</Text>
      <Wrap gap="md">{children}</Wrap>
    </View>
  );
}
