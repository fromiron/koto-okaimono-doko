import { categories } from '@koto/core';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
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
import { useVoucherIntentStore } from '@/src/features/preferences/voucherIntentStore';
import { bottomSheetShadow, colors, space } from '@/src/theme/tokens';

export default function FiltersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const window = useWindowDimensions();
  const filters = useFilterStore();
  const { intent, setIntent, saveFailed } = useVoucherIntentStore();
  const [draftIntent, setDraftIntent] = useState(intent);
  const [draftFilters, setDraftFilters] = useState(() => ({
    keyword: filters.keyword,
    couponType: filters.couponType,
    categoryMajorId: filters.categoryMajorId,
    radiusMeters: filters.radiusMeters,
  }));
  const [applying, setApplying] = useState(false);
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
      selectRadius: (radiusMeters) =>
        setDraftFilters((draft) => ({ ...draft, radiusMeters })),
    });
  };
  const handleClose = () => {
    if (!applying) router.back();
  };
  const handleApply = async () => {
    setApplying(true);
    const saved = await setIntent(draftIntent);
    setApplying(false);
    if (!saved) return;
    filters.setKeyword(draftFilters.keyword);
    filters.setCouponType(draftFilters.couponType);
    filters.setPayment('all');
    filters.setCategoryMajorId(draftFilters.categoryMajorId);
    filters.setRadiusMeters(draftFilters.radiusMeters);
    router.back();
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
      onRequestClose={handleClose}
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
          onPress={handleClose}
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
              disabled={applying}
              onPress={handleClose}
            >
              <X color={colors.ink} size={24} />
            </IconButton>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <Text tone="muted" variant="caption">
              {t('voucher.persistence')}
            </Text>
            {saveFailed ? (
              <Text accessibilityRole="alert" className="pt-2" tone="danger">
                {t('voucher.persistenceFailed')}
              </Text>
            ) : null}
            <FilterSection title={t('voucher.medium')}>
              {(['any', 'paper', 'digital'] as const).map((medium) => (
                <Chip
                  key={medium}
                  disabled={applying}
                  selected={draftIntent.medium === medium}
                  tone="neutral"
                  onPress={() =>
                    setDraftIntent((draft) => ({ ...draft, medium }))
                  }
                >
                  {t(`voucher.${medium === 'any' ? 'notSpecified' : medium}`)}
                </Chip>
              ))}
            </FilterSection>

            <FilterSection title={t('voucher.voucher')}>
              {(['any', 'A', 'B'] as const).map((voucher) => (
                <Chip
                  key={voucher}
                  disabled={applying}
                  selected={draftIntent.voucher === voucher}
                  onPress={() =>
                    setDraftIntent((draft) => ({ ...draft, voucher }))
                  }
                >
                  {t(`voucher.${voucher === 'any' ? 'notSpecified' : voucher}`)}
                </Chip>
              ))}
            </FilterSection>

            <FilterSection title={t('voucher.advancedStoreType')}>
              <Chip
                disabled={applying}
                selected={draftFilters.couponType === 'all'}
                onPress={() =>
                  setDraftFilters((draft) => ({ ...draft, couponType: 'all' }))
                }
              >
                {t('common.all')}
              </Chip>
              <Chip
                disabled={applying}
                selected={draftFilters.couponType === 'ab'}
                onPress={() =>
                  setDraftFilters((draft) => ({ ...draft, couponType: 'ab' }))
                }
              >
                {t('filters.ab')}
              </Chip>
              <Chip
                disabled={applying}
                selected={draftFilters.couponType === 'b_only'}
                tone="orange"
                onPress={() =>
                  setDraftFilters((draft) => ({
                    ...draft,
                    couponType: 'b_only',
                  }))
                }
              >
                {t('filters.bOnly')}
              </Chip>
            </FilterSection>
            <Text className="pt-2" tone="muted" variant="caption">
              {t('voucher.advancedStoreTypeHelp')}
            </Text>
            {draftIntent.voucher === 'A' &&
            draftFilters.couponType === 'b_only' ? (
              <View className="gap-2 pt-3">
                <Text accessibilityRole="alert" tone="danger" variant="caption">
                  {t('voucher.conflict')}
                </Text>
                <Button
                  disabled={applying}
                  variant="secondary"
                  onPress={() =>
                    setDraftFilters((draft) => ({
                      ...draft,
                      couponType: 'all',
                    }))
                  }
                >
                  {t('voucher.clearAdvanced')}
                </Button>
              </View>
            ) : null}

            <FilterSection title={t('filters.category')}>
              <Chip
                disabled={applying}
                selected={draftFilters.categoryMajorId === null}
                tone="neutral"
                onPress={() =>
                  setDraftFilters((draft) => ({
                    ...draft,
                    categoryMajorId: null,
                  }))
                }
              >
                {t('common.all')}
              </Chip>
              {categories.map((category) => (
                <Chip
                  key={category.id}
                  disabled={applying}
                  selected={draftFilters.categoryMajorId === category.id}
                  tone="neutral"
                  onPress={() =>
                    setDraftFilters((draft) => ({
                      ...draft,
                      categoryMajorId: category.id,
                    }))
                  }
                >
                  {t(category.translationKey)}
                </Chip>
              ))}
            </FilterSection>

            <FilterSection divider={false} title={t('filters.radius')}>
              <Chip
                disabled={applying || radiusRequesting}
                selected={draftFilters.radiusMeters === 'all'}
                tone="neutral"
                onPress={() =>
                  setDraftFilters((draft) => ({
                    ...draft,
                    radiusMeters: 'all',
                  }))
                }
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
                  disabled={applying || !locationEnabled || radiusRequesting}
                  selected={draftFilters.radiusMeters === value}
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
            <Button
              disabled={radiusRequesting}
              loading={applying}
              size="lg"
              onPress={() => void handleApply()}
            >
              {t('common.apply')}
            </Button>
            <PressableScale
              accessibilityRole="button"
              className="min-h-11 items-center justify-center self-center rounded-full px-5 active:bg-neutral-soft"
              disabled={applying || radiusRequesting}
              onPress={() => {
                setDraftIntent({ medium: 'any', voucher: 'any' });
                setDraftFilters({
                  keyword: '',
                  couponType: 'all',
                  categoryMajorId: null,
                  radiusMeters: 'all',
                });
              }}
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
