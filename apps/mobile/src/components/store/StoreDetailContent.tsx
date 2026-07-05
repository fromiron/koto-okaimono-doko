import { isAllowedOfficialDetailUrl, type Store } from '@koto/schema';
import { Building2, ExternalLink, Footprints, MapPin, Navigation, Phone } from 'lucide-react-native';
import { Linking, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { StoreMarker } from '@/src/components/map/StoreMarker';
import { ActionTile } from '@/src/components/ui/ActionTile';
import { Button } from '@/src/components/ui/Button';
import { InfoRow } from '@/src/components/ui/InfoRow';
import { SurfaceCard } from '@/src/components/ui/SurfaceCard';
import { Text } from '@/src/components/ui/Text';
import type { LatLng } from '@/src/features/map/mapStore';
import { colors } from '@/src/theme/tokens';

import { CouponBadge } from './CouponBadge';
import { PaymentBadge } from './PaymentBadge';
import { SourceDateNote } from './SourceDateNote';
import { StoreAvatar } from './StoreAvatar';
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
};

export function StoreDetailContent({
  mode = 'sheet',
  sourceDate,
  stores,
  userLocation,
}: StoreDetailContentProps) {
  if (stores.length === 0) {
    return null;
  }

  if (stores.length > 1) {
    return <LocationGroupContent mode={mode} sourceDate={sourceDate} stores={stores} />;
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
      <StoreHero store={store} />

      <StoreQuickActions store={store} t={t} />

      <SurfaceCard className="px-4" shadow={mode === 'page'}>
        <InfoRow
          icon={<MapPin color={colors.primary} fill={colors.primary} size={24} />}
          label={t('store.address')}
          value={getAddressText(store)}
        />
        <InfoRow
          divider={false}
          icon={<Footprints color={colors.teal} size={24} />}
          label={t('store.currentDistance')}
          value={getDistanceValueText(store, userLocation, t)}
        />
      </SurfaceCard>

      {mode === 'page' ? (
        <MapPreview store={store} />
      ) : sourceDate ? (
        <SourceDateNote sourceDate={sourceDate} />
      ) : null}
    </View>
  );
}

function LocationGroupContent({
  mode,
  sourceDate,
  stores,
}: {
  stores: Store[];
  sourceDate?: string | null;
  mode: Mode;
}) {
  const { t } = useTranslation();
  const title = getFacilityName(stores) ?? t('map.groupedStores', { count: stores.length });
  const first = stores[0];

  return (
    <View className={mode === 'page' ? 'gap-5 pb-8' : 'gap-4 px-5 pb-8 pt-1'}>
      <View className="flex-row items-center gap-4 overflow-hidden rounded-card border border-line bg-neutral-soft px-4 py-5">
        <View className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-surface/60" pointerEvents="none" />
        <View className="h-24 w-24 items-center justify-center rounded-full border border-line bg-surface">
          <Building2 color={colors.facility} size={36} />
        </View>
        <View className="min-w-0 flex-1 gap-2">
          <Text variant="subtitle">{title}</Text>
          <View className="self-start rounded-full bg-facility px-3 py-1">
            <Text className="text-white" variant="caption">
              {t('store.facilityStoreCount', { count: stores.length })}
            </Text>
          </View>
          <Text tone="muted">{getFacilityAddress(stores)}</Text>
        </View>
      </View>

      <SurfaceCard className="px-4" shadow={mode === 'page'}>
        {stores.map((store, index) => (
          <View
            className={`py-4 ${index < stores.length - 1 ? 'border-b border-line' : ''}`}
            key={store.id}
          >
            <View className="mb-2 flex-row items-start justify-between gap-3">
              <Text className="min-w-0 flex-1" variant="label">
                {store.name}
              </Text>
              <CouponBadge couponType={store.couponType} />
            </View>
            <Text tone="muted">
              {[store.floor, getCategoryText(store, t)].filter(Boolean).join(' / ')}
            </Text>
          </View>
        ))}
      </SurfaceCard>

      {first ? (
        <Button leftIcon={<Navigation color="#ffffff" size={20} />} onPress={() => openDirections(first)} size="lg">
          {t('store.routeToFacility')}
        </Button>
      ) : null}

      {sourceDate && mode === 'sheet' ? <SourceDateNote sourceDate={sourceDate} /> : null}

      {mode === 'page' && first ? <MapPreview store={first} /> : null}
    </View>
  );
}

/** Tinted place-card banner: monogram, name, coupon + payment badges, category. */
function StoreHero({ store }: { store: Store }) {
  const { t } = useTranslation();

  return (
    <View className="items-center gap-3 overflow-hidden rounded-card border border-line bg-primary-soft px-5 py-6">
      {/* Quiet oversized washes give the flat tint card a sense of depth. */}
      <View className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-primary/10" pointerEvents="none" />
      <View className="absolute -bottom-14 -left-12 h-32 w-32 rounded-full bg-surface/60" pointerEvents="none" />
      <StoreAvatar name={store.name} size={80} />
      <Text className="text-center" variant="subtitle">
        {store.name}
      </Text>
      <BadgeRow store={store} />
      <Text className="text-center" tone="muted">
        {getCategoryText(store, t)}
      </Text>
    </View>
  );
}

/** Route / call / official as an even row of icon tiles. */
function StoreQuickActions({ store, t }: { store: Store; t: TFunction }) {
  const officialDetailUrl =
    store.officialDetailUrl && isAllowedOfficialDetailUrl(store.officialDetailUrl)
      ? store.officialDetailUrl
      : null;
  const phone = store.phone ? store.phone.replace(/[^0-9+]/g, '') : null;

  return (
    <View className="flex-row gap-3">
      <ActionTile
        icon={<Navigation color={colors.surface} size={22} />}
        label={t('store.directions')}
        onPress={() => openDirections(store)}
        variant="primary"
      />
      {phone ? (
        <ActionTile
          icon={<Phone color={colors.primary} size={22} />}
          label={t('store.phone')}
          onPress={() => Linking.openURL(`tel:${phone}`)}
        />
      ) : null}
      {officialDetailUrl ? (
        <ActionTile
          icon={<ExternalLink color={colors.primary} size={22} />}
          label={t('store.officialPage')}
          onPress={() => Linking.openURL(officialDetailUrl)}
        />
      ) : null}
    </View>
  );
}

function BadgeRow({ store }: { store: Store }) {
  const { t } = useTranslation();

  return (
    <View className="flex-row flex-wrap items-center justify-center gap-2">
      <CouponBadge couponType={store.couponType} />
      {store.acceptsPaper ? <PaymentBadge label={t('filters.paper')} /> : null}
      {store.acceptsDigital ? <PaymentBadge label={t('filters.digital')} /> : null}
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
      <View className="h-56 overflow-hidden rounded-card border border-line">
        <MapView
          initialRegion={{
            latitude: store.lat,
            latitudeDelta: 0.012,
            longitude: store.lng,
            longitudeDelta: 0.012,
          }}
          provider={PROVIDER_GOOGLE}
          scrollEnabled={false}
          showsCompass={false}
          showsMyLocationButton={false}
          style={{ flex: 1 }}
          zoomEnabled={false}
        >
          <StoreMarker id={`preview-${store.id}`} lat={store.lat} lng={store.lng} onPress={() => {}} stores={[store]} />
        </MapView>
      </View>
      <Text variant="caption" tone="muted">
        {t('store.mapPinNote')}
      </Text>
    </View>
  );
}
