import type { Store } from '@koto/schema';
import { Linking, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/src/components/ui/Button';
import { Text } from '@/src/components/ui/Text';

import { CouponBadge } from './CouponBadge';
import { PaymentBadge } from './PaymentBadge';

type StoreDetailContentProps = {
  stores: Store[];
  sourceDate?: string | null;
};

export function StoreDetailContent({ sourceDate, stores }: StoreDetailContentProps) {
  const { t } = useTranslation();

  if (stores.length === 0) {
    return null;
  }

  return (
    <View className="gap-5 px-5 pb-8 pt-4">
      {stores.map((store) => (
        <View className="gap-3 border-b border-line-200 pb-5" key={store.id}>
          <View className="flex-row flex-wrap items-center gap-2">
            <CouponBadge couponType={store.couponType} />
            {store.acceptsPaper ? <PaymentBadge label={t('filters.paper')} /> : null}
            {store.acceptsDigital ? <PaymentBadge label={t('filters.digital')} /> : null}
          </View>
          <Text variant="subtitle">{store.name}</Text>
          <Text tone="muted">{store.address}</Text>
          <Text variant="caption" tone="muted">
            {t(`categories.major.${store.categoryMajorId}`, store.categoryMajorLabel)}
            {store.categoryMinorId
              ? ` / ${t(`categories.minor.${store.categoryMinorId}`, store.categoryMinorLabel ?? '')}`
              : ''}
          </Text>
          {sourceDate ? (
            <Text variant="caption" tone="muted">
              {t('store.sourceDate')}: {sourceDate}
            </Text>
          ) : null}
          <View className="flex-row gap-2">
            <Button className="flex-1" onPress={() => openDirections(store)}>
              {t('store.directions')}
            </Button>
            {store.officialDetailUrl ? (
              <Button className="flex-1" variant="secondary" onPress={() => Linking.openURL(store.officialDetailUrl!)}>
                {t('store.officialPage')}
              </Button>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

function openDirections(store: Store) {
  const query = encodeURIComponent(`${store.name} 東京都江東区${store.address}`);
  const latLng = store.lat !== null && store.lng !== null ? `${store.lat},${store.lng}` : query;
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?q=${query}`
      : `https://www.google.com/maps/search/?api=1&query=${latLng}`;
  void Linking.openURL(url);
}
