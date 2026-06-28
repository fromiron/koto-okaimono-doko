import { categories } from '@koto/core';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { IconButton } from '@/src/components/ui/IconButton';
import { Text } from '@/src/components/ui/Text';
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

  return (
    <View className="flex-1 justify-end bg-black/40">
      <Pressable className="absolute inset-0" onPress={() => router.back()} />
      <View
        className="max-h-[82%] rounded-t-[28px] bg-paper-50 px-6 pt-3"
        style={[bottomSheetShadow, { paddingBottom: Math.max(insets.bottom, 18) }]}
      >
        <View className="mb-5 items-center">
          <View className="h-1.5 w-24 rounded-full bg-line-200" />
        </View>
        <View className="mb-6 flex-row items-center justify-center">
          <Text className="text-center" variant="title">
            {t('filters.title')}
          </Text>
          <View className="absolute right-0">
            <IconButton className="bg-gray-100" shadow={false} onPress={() => router.back()}>
              <X color={colors.ink} size={28} />
            </IconButton>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
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
            <Chip selected={filters.payment === 'all'} onPress={() => filters.setPayment('all')}>
              {t('common.all')}
            </Chip>
            <Chip selected={filters.payment === 'paper'} tone="teal" onPress={() => filters.setPayment('paper')}>
              {t('filters.paper')}
            </Chip>
            <Chip selected={filters.payment === 'digital'} tone="teal" onPress={() => filters.setPayment('digital')}>
              {t('filters.digital')}
            </Chip>
          </FilterSection>

          <FilterSection title={t('filters.category')}>
            <Chip selected={filters.categoryMajorId === null} onPress={() => filters.setCategoryMajorId(null)}>
              {t('common.all')}
            </Chip>
            {categories.map((category) => (
              <Chip
                key={category.id}
                selected={filters.categoryMajorId === category.id}
                tone={category.id === 'life_home' ? 'purple' : 'primary'}
                onPress={() => filters.setCategoryMajorId(category.id)}
              >
                {t(category.translationKey)}
              </Chip>
            ))}
          </FilterSection>

          <FilterSection divider={false} title={t('filters.radius')}>
            <Chip selected={filters.radiusMeters === 'all'} onPress={() => filters.setRadiusMeters('all')}>
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
            <Text className="text-water-700" variant="label">
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
    <View className={`gap-4 py-5 ${divider ? 'border-b border-line-200' : ''}`}>
      <Text variant="subtitle">{title}</Text>
      <View className="flex-row flex-wrap gap-3">{children}</View>
    </View>
  );
}
