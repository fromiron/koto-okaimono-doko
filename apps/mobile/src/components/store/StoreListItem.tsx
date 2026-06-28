import type { Store } from '@koto/schema';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CouponBadge } from './CouponBadge';
import { PaymentBadge } from './PaymentBadge';
import { Text } from '../ui/Text';

type StoreListItemProps = {
  store: Store;
  onPress?: () => void;
};

export function StoreListItem({ onPress, store }: StoreListItemProps) {
  const { t } = useTranslation();

  return (
    <Pressable className="flex-row gap-3 border-b border-line-200 py-4" onPress={onPress}>
      <View className="min-w-0 flex-1 gap-2">
        <View className="flex-row flex-wrap items-center gap-2">
          <CouponBadge couponType={store.couponType} />
          {store.acceptsPaper ? <PaymentBadge label={t('filters.paper')} /> : null}
          {store.acceptsDigital ? <PaymentBadge label={t('filters.digital')} /> : null}
        </View>
        <Text variant="label">{store.name}</Text>
        <Text variant="caption" tone="muted">
          {store.address}
        </Text>
        <Text variant="caption" tone="muted">
          {t(`categories.major.${store.categoryMajorId}`, store.categoryMajorLabel)}
          {store.categoryMinorId
            ? ` / ${t(`categories.minor.${store.categoryMinorId}`, store.categoryMinorLabel ?? '')}`
            : ''}
        </Text>
      </View>
      <ChevronRight color="#69727e" size={18} />
    </Pressable>
  );
}
