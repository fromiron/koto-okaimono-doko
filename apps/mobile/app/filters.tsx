import { categories } from '@koto/core';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'react-native-reanimated';

import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { IconButton } from '@/src/components/ui/IconButton';
import { PressableScale } from '@/src/components/ui/PressableScale';
import { Text } from '@/src/components/ui/Text';
import { Wrap } from '@/src/components/ui/Wrap';
import { useFilterStore } from '@/src/features/filters/filterStore';
import {
  selectRadiusWithLocation,
  type DistanceRadius,
} from '@/src/features/filters/selectRadius';
import { useCurrentLocationWithFeedback } from '@/src/features/location/useCurrentLocationWithFeedback';
import { useMapStore } from '@/src/features/map/mapStore';
import { usePreferencesStore } from '@/src/features/preferences/preferencesStore';
import { bottomSheetShadow, colors, space } from '@/src/theme/tokens';

export default function FiltersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const window = useWindowDimensions();
  const filters = useFilterStore();
  const userLocation = useMapStore((state) => state.userLocation);
  const locationEnabled = usePreferencesStore((state) => state.locationEnabled);
  const { requestLocation, status: locationStatus } =
    useCurrentLocationWithFeedback();
  const radiusAvailable = locationEnabled && userLocation != null;
  const radiusRequesting = locationStatus === 'requesting';
  const handleRadiusPress = (radius: DistanceRadius) => {
    void selectRadiusWithLocation({
      currentLocation: userLocation,
      radius,
      requestLocation,
      selectRadius: filters.setRadiusMeters,
    });
  };
  // A definite height + bottom anchor makes this a real bottom sheet. The
  // justify-end utility is not honoured on this overlay, so the anchor is set
  // inline; the inner list scrolls and the action footer stays pinned.
  const sheetHeight = Math.round(
    window.height * (window.width > window.height ? 0.96 : 0.82),
  );

  return (
    <Modal
      animationType={reduceMotion ? 'none' : 'slide'}
      onRequestClose={() => router.back()}
      transparent
      visible
    >
      <View
        className="flex-1"
        style={{ backgroundColor: colors.overlay, justifyContent: 'flex-end' }}
      >
        <Pressable
          accessibilityElementsHidden
          accessible={false}
          className="absolute inset-0"
          importantForAccessibility="no-hide-descendants"
          onPress={() => router.back()}
        />
        <View
          accessibilityViewIsModal
          className="rounded-t-sheet bg-surface pt-4"
          style={[
            bottomSheetShadow,
            {
              height: sheetHeight,
              paddingBottom: Math.max(insets.bottom, 18),
              paddingLeft: Math.max(insets.left, space['2xl']),
              paddingRight: Math.max(insets.right, space['2xl']),
            },
          ]}
        >
          <View className="mb-4 min-h-12 flex-row items-center gap-3">
            <View className="h-12 w-12 shrink-0" />
            <View className="min-w-0 flex-1">
              <Text
                accessibilityRole="header"
                className="text-center"
                variant="title"
              >
                {t('filters.title')}
              </Text>
            </View>
            <IconButton
              accessibilityLabel={t('common.close')}
              className="shrink-0 bg-neutral-soft"
              onPress={() => router.back()}
            >
              <X color={colors.ink} size={24} />
            </IconButton>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <FilterSection title={t('filters.couponType')}>
              <Chip
                selected={filters.couponType === 'all'}
                onPress={() => filters.setCouponType('all')}
              >
                {t('common.all')}
              </Chip>
              <Chip
                selected={filters.couponType === 'ab'}
                onPress={() => filters.setCouponType('ab')}
              >
                {t('filters.ab')}
              </Chip>
              <Chip
                selected={filters.couponType === 'b_only'}
                tone="orange"
                onPress={() => filters.setCouponType('b_only')}
              >
                {t('filters.bOnly')}
              </Chip>
            </FilterSection>

            <FilterSection title={t('filters.payment')}>
              <Chip
                selected={filters.payment === 'all'}
                tone="neutral"
                onPress={() => filters.setPayment('all')}
              >
                {t('common.all')}
              </Chip>
              <Chip
                selected={filters.payment === 'paper'}
                tone="neutral"
                onPress={() => filters.setPayment('paper')}
              >
                {t('filters.paper')}
              </Chip>
              <Chip
                selected={filters.payment === 'digital'}
                tone="neutral"
                onPress={() => filters.setPayment('digital')}
              >
                {t('filters.digital')}
              </Chip>
            </FilterSection>

            <FilterSection title={t('filters.category')}>
              <Chip
                selected={filters.categoryMajorId === null}
                tone="neutral"
                onPress={() => filters.setCategoryMajorId(null)}
              >
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
              <Chip
                selected={filters.radiusMeters === 'all'}
                tone="neutral"
                onPress={() => filters.setRadiusMeters('all')}
              >
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
                  accessibilityHint={
                    radiusAvailable
                      ? undefined
                      : t('filters.radiusNeedsLocation')
                  }
                  disabled={!locationEnabled || radiusRequesting}
                  selected={filters.radiusMeters === value}
                  tone="neutral"
                  onPress={() => handleRadiusPress(value)}
                >
                  {t(label)}
                </Chip>
              ))}
            </FilterSection>
            {!radiusAvailable ? (
              <Text className="pb-2" tone="muted" variant="caption">
                {t(
                  locationEnabled
                    ? 'filters.radiusNeedsLocation'
                    : 'filters.radiusLocationDisabled',
                )}
              </Text>
            ) : null}
          </ScrollView>

          <View className="gap-3 pt-4">
            <Button size="lg" onPress={() => router.back()}>
              {t('common.done')}
            </Button>
            <PressableScale
              accessibilityRole="button"
              className="min-h-11 items-center justify-center self-center rounded-full px-5 active:bg-neutral-soft"
              onPress={filters.reset}
            >
              <Text tone="accent" variant="label">
                {t('filters.resetConditions')}
              </Text>
            </PressableScale>
          </View>
        </View>
      </View>
    </Modal>
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
      <Text accessibilityRole="header" variant="subtitle">
        {title}
      </Text>
      <Wrap gap="md">{children}</Wrap>
    </View>
  );
}
