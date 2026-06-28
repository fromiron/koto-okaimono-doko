import { categories } from '@koto/core';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/src/components/ui/Button';
import { Chip } from '@/src/components/ui/Chip';
import { IconButton } from '@/src/components/ui/IconButton';
import { Screen } from '@/src/components/ui/Screen';
import { Text } from '@/src/components/ui/Text';
import { useFilterStore } from '@/src/features/filters/filterStore';

export default function FiltersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const filters = useFilterStore();

  return (
    <Screen>
      <View className="mb-8 flex-row items-center justify-between">
        <Text variant="title">{t('filters.title')}</Text>
        <IconButton onPress={() => router.back()}>
          <X color="#176762" size={22} />
        </IconButton>
      </View>

      <FilterSection title={t('filters.couponType')}>
        <Chip selected={filters.couponType === 'all'} onPress={() => filters.setCouponType('all')}>
          {t('common.all')}
        </Chip>
        <Chip selected={filters.couponType === 'ab'} onPress={() => filters.setCouponType('ab')}>
          {t('filters.ab')}
        </Chip>
        <Chip selected={filters.couponType === 'b_only'} onPress={() => filters.setCouponType('b_only')}>
          {t('filters.bOnly')}
        </Chip>
      </FilterSection>

      <FilterSection title={t('filters.payment')}>
        <Chip selected={filters.payment === 'all'} onPress={() => filters.setPayment('all')}>
          {t('common.all')}
        </Chip>
        <Chip selected={filters.payment === 'paper'} onPress={() => filters.setPayment('paper')}>
          {t('filters.paper')}
        </Chip>
        <Chip selected={filters.payment === 'digital'} onPress={() => filters.setPayment('digital')}>
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
            onPress={() => filters.setCategoryMajorId(category.id)}
          >
            {t(category.translationKey)}
          </Chip>
        ))}
      </FilterSection>

      <FilterSection title={t('filters.radius')}>
        {[
          [300, 'filters.meters300'],
          [500, 'filters.meters500'],
          [1000, 'filters.meters1000'],
          [2000, 'filters.meters2000'],
        ].map(([value, label]) => (
          <Chip
            key={value}
            selected={filters.radiusMeters === value}
            onPress={() => filters.setRadiusMeters(value as 300 | 500 | 1000 | 2000)}
          >
            {t(label as 'filters.meters300')}
          </Chip>
        ))}
      </FilterSection>

      <View className="mt-6 flex-row gap-3">
        <Button className="flex-1" variant="secondary" onPress={filters.reset}>
          {t('common.reset')}
        </Button>
        <Button className="flex-1" onPress={() => router.back()}>
          {t('common.apply')}
        </Button>
      </View>
    </Screen>
  );
}

function FilterSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <View className="mb-7 gap-3">
      <Text variant="label">{title}</Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
  );
}
