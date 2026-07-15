import { isAllowedOfficialDetailUrl, type Store } from '@koto/schema';
import {
  Building2,
  ChevronRight,
  ExternalLink,
  Footprints,
  MapPin,
  Navigation,
  Phone,
} from 'lucide-react-native';
import { Linking, Platform, Pressable, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { StoreMarker } from '@/src/components/map/StoreMarker';
import { Button } from '@/src/components/ui/Button';
import { InfoRow } from '@/src/components/ui/InfoRow';
import { SurfaceCard } from '@/src/components/ui/SurfaceCard';
import { Text } from '@/src/components/ui/Text';
import type { LatLng } from '@/src/features/map/mapStore';
import { colors } from '@/src/theme/tokens';

import { CouponBadge } from './CouponBadge';
import { PaymentBadge } from './PaymentBadge';
import { SourceDateNote } from './SourceDateNote';
import {
  getAddressText,
  getCategoryText,
  getDistanceValueText,
  getFacilityAddress,
  getFacilityName,
  openDirections,
} from './storeDisplay';

type Mode = 'sheet' | 'page';

type StoreDetailContentProps = {
  stores: Store[];
  sourceDate?: string | null;
  userLocation?: LatLng | null;
  mode?: Mode;
  onSelectStore?: (id: string) => void;
};

export function StoreDetailContent({
  mode = 'sheet',
  onSelectStore,
  sourceDate,
  stores,
  userLocation,
}: StoreDetailContentProps) {
  if (stores.length === 0) {
    return null;
  }

  if (stores.length > 1) {
    return (
      <LocationGroupContent
        mode={mode}
        onSelectStore={onSelectStore}
        sourceDate={sourceDate}
        stores={stores}
      />
    );
  }

  return (
    <SingleStoreContent
      mode={mode}
      sourceDate={sourceDate}
      store={stores[0]}
      userLocation={userLocation}
    />
  );
}

function SingleStoreContent({
  mode,
  sourceDate,
  store,
  userLocation,
}: {
  store: Store;
  sourceDate?: string | null;
  userLocation?: LatLng | null;
  mode: Mode;
}) {
  const { t } = useTranslation();

  return (
    <View className={mode === 'page' ? 'gap-5 pb-8' : 'gap-5 px-5 pb-8 pt-1'}>
      <StoreSummary store={store} />

      <StoreQuickActions store={store} t={t} />

      <View className="border-y border-line px-1">
        <InfoRow
          icon={
            <MapPin color={colors.primary} fill={colors.primary} size={24} />
          }
          label={t('store.address')}
          value={getAddressText(store)}
        />
        <InfoRow
          divider={false}
          icon={<Footprints color={colors.teal} size={24} />}
          label={t('store.currentDistance')}
          value={getDistanceValueText(store, userLocation, t)}
        />
      </View>

      {mode === 'page' ? <MapPreview store={store} /> : null}
      {sourceDate ? <SourceDateNote sourceDate={sourceDate} /> : null}
    </View>
  );
}

function LocationGroupContent({
  mode,
  onSelectStore,
  sourceDate,
  stores,
}: {
  stores: Store[];
  sourceDate?: string | null;
  mode: Mode;
  onSelectStore?: (id: string) => void;
}) {
  const { t } = useTranslation();
  const title =
    getFacilityName(stores) ?? t('map.groupedStores', { count: stores.length });
  const first = stores[0];

  return (
    <View className={mode === 'page' ? 'gap-5 pb-8' : 'gap-4 px-5 pb-8 pt-1'}>
      <View className="border-b border-line pb-4">
        <View className="mb-2 flex-row items-center gap-3">
          <Building2 color={colors.facility} size={24} />
          <Text
            accessibilityRole="header"
            className="min-w-0 flex-1"
            variant="subtitle"
          >
            {title}
          </Text>
        </View>
        <Text variant="label">
          {t('store.facilityStoreCount', { count: stores.length })}
        </Text>
        <Text className="mt-1" tone="muted">
          {getFacilityAddress(stores)}
        </Text>
      </View>

      <SurfaceCard className="px-4">
        {stores.map((store, index) => (
          <Pressable
            accessibilityLabel={`${store.name}, ${getCategoryText(store, t)}`}
            accessibilityRole={onSelectStore ? 'button' : undefined}
            className={`flex-row items-center gap-3 py-4 ${index < stores.length - 1 ? 'border-b border-line' : ''}`}
            disabled={!onSelectStore}
            key={store.id}
            onPress={() => onSelectStore?.(store.id)}
          >
            <View className="min-w-0 flex-1 gap-1">
              <Text variant="label">{store.name}</Text>
              <Text tone="muted">
                {[store.floor, getCategoryText(store, t)]
                  .filter(Boolean)
                  .join(' / ')}
              </Text>
            </View>
            <CouponBadge couponType={store.couponType} />
            {onSelectStore ? (
              <ChevronRight color={colors.muted} size={20} />
            ) : null}
          </Pressable>
        ))}
      </SurfaceCard>

      {first ? (
        <Button
          leftIcon={<Navigation color="#ffffff" size={20} />}
          onPress={() => openDirections(first)}
          size="lg"
        >
          {t('store.routeToFacility')}
        </Button>
      ) : null}

      {mode === 'page' && first ? <MapPreview store={first} /> : null}
      {sourceDate ? <SourceDateNote sourceDate={sourceDate} /> : null}
    </View>
  );
}

function StoreSummary({ store }: { store: Store }) {
  const { t } = useTranslation();

  return (
    <View className="gap-2 border-b border-line pb-4">
      <Text accessibilityRole="header" variant="title">
        {store.name}
      </Text>
      <Text tone="muted">{getCategoryText(store, t)}</Text>
      <BadgeRow store={store} />
    </View>
  );
}

function StoreQuickActions({ store, t }: { store: Store; t: TFunction }) {
  const officialDetailUrl =
    store.officialDetailUrl &&
    isAllowedOfficialDetailUrl(store.officialDetailUrl)
      ? store.officialDetailUrl
      : null;
  const phone = store.phone ? store.phone.replace(/[^0-9+]/g, '') : null;

  return (
    <View className="gap-3">
      <Button
        leftIcon={<Navigation color={colors.surface} size={20} />}
        onPress={() => openDirections(store)}
        size="lg"
      >
        {t('store.directions')}
      </Button>
      {phone || officialDetailUrl ? (
        <View className="flex-row gap-3">
          {phone ? (
            <Button
              className="flex-1"
              leftIcon={<Phone color={colors.primaryStrong} size={20} />}
              onPress={() => Linking.openURL(`tel:${phone}`)}
              variant="secondary"
            >
              {t('store.phone')}
            </Button>
          ) : null}
          {officialDetailUrl ? (
            <Button
              className="flex-1"
              leftIcon={<ExternalLink color={colors.primaryStrong} size={20} />}
              onPress={() => Linking.openURL(officialDetailUrl)}
              variant="secondary"
            >
              {t('store.officialPage')}
            </Button>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function BadgeRow({ store }: { store: Store }) {
  const { t } = useTranslation();

  return (
    <View className="flex-row flex-wrap items-center gap-2">
      <CouponBadge couponType={store.couponType} />
      {store.acceptsPaper ? <PaymentBadge label={t('filters.paper')} /> : null}
      {store.acceptsDigital ? (
        <PaymentBadge label={t('filters.digital')} />
      ) : null}
    </View>
  );
}

function MapPreview({ store }: { store: Store }) {
  const { t } = useTranslation();

  if (store.lat === null || store.lng === null) {
    return null;
  }

  return (
    <View className="gap-2">
      <View
        accessibilityElementsHidden
        className="h-56 overflow-hidden rounded-card border border-line"
        importantForAccessibility="no-hide-descendants"
      >
        <MapView
          initialRegion={{
            latitude: store.lat,
            latitudeDelta: 0.012,
            longitude: store.lng,
            longitudeDelta: 0.012,
          }}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          pointerEvents="none"
          scrollEnabled={false}
          showsCompass={false}
          showsMyLocationButton={false}
          style={{ flex: 1 }}
          zoomEnabled={false}
        >
          <StoreMarker
            id={`preview-${store.id}`}
            lat={store.lat}
            lng={store.lng}
            onPress={() => {}}
            stores={[store]}
          />
        </MapView>
      </View>
      <Text variant="caption" tone="muted">
        {t('store.mapPinNote')}
      </Text>
    </View>
  );
}
