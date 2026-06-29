import type { Store } from '@koto/schema';
import { Building2, ExternalLink, Footprints, MapPin, Navigation, Phone } from 'lucide-react-native';
import { Linking, Pressable, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import { StoreMarker } from '@/src/components/map/StoreMarker';
import { Button } from '@/src/components/ui/Button';
import { IconBadge } from '@/src/components/ui/IconBadge';
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
  getDistanceText,
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

  if (mode === 'page') {
    return (
      <View className="gap-5 pb-8">
        <StoreIdentity mode="page" store={store} />

        <SurfaceCard className="px-4">
          <InfoRow
            icon={<MapPin color={colors.primary} fill={colors.primary} size={28} />}
            label={t('store.address')}
            value={getAddressText(store)}
          />
          {store.phone ? <PhoneRow label={t('store.phone')} phone={store.phone} /> : null}
          <InfoRow
            divider={false}
            icon={
              <IconBadge className="h-10 w-10" tone="teal">
                <Footprints color={colors.teal} size={20} />
              </IconBadge>
            }
            label={t('store.currentDistance')}
            value={getDistanceValueText(store, userLocation, t)}
          />
        </SurfaceCard>

        <StoreActions store={store} />
        <MapPreview store={store} />
      </View>
    );
  }

  return (
    <View className="gap-5 px-5 pb-8 pt-1">
      <StoreIdentity mode="sheet" store={store} />

      <View>
        <View className="flex-row items-start gap-3 border-t border-line py-4">
          <MapPin color={colors.primary} fill={colors.primary} size={24} />
          <Text className="min-w-0 flex-1">{getAddressText(store)}</Text>
        </View>
        <View className="flex-row items-center gap-3 border-t border-line py-4">
          <Footprints color={colors.primary} size={24} />
          <Text className="min-w-0 flex-1">{getDistanceText(store, userLocation, t)}</Text>
        </View>
      </View>

      <StoreActions store={store} />

      {sourceDate ? <SourceDateNote sourceDate={sourceDate} /> : null}
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
      <View className="flex-row items-center gap-4">
        <View className="h-24 w-24 items-center justify-center rounded-full border border-line bg-neutral-soft">
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

/** Avatar + name + badges + category block, sized for the sheet or the page card. */
function StoreIdentity({ mode, store }: { mode: Mode; store: Store }) {
  const { t } = useTranslation();
  const column = (
    <View className="min-w-0 flex-1 gap-2">
      <Text className="min-w-0" variant="subtitle">
        {store.name}
      </Text>
      <BadgeRow store={store} />
      <Text tone="muted">{getCategoryText(store, t)}</Text>
    </View>
  );

  if (mode === 'page') {
    return (
      <SurfaceCard className="flex-row items-center gap-4 p-4">
        <StoreAvatar name={store.name} size={88} />
        {column}
      </SurfaceCard>
    );
  }

  return (
    <View className="flex-row items-center gap-4">
      <StoreAvatar name={store.name} size={88} />
      {column}
    </View>
  );
}

/** Directions (primary) + official-page (secondary) actions, consistent in sheet and page. */
function StoreActions({ store }: { store: Store }) {
  const { t } = useTranslation();

  return (
    <View className="flex-row gap-3">
      <Button
        className="flex-1"
        leftIcon={<Navigation color="#ffffff" size={20} />}
        onPress={() => openDirections(store)}
        size="lg"
        variant="primary"
      >
        {t('store.directions')}
      </Button>
      {store.officialDetailUrl ? (
        <Button
          className="flex-1"
          leftIcon={<ExternalLink color={colors.primary} size={20} />}
          onPress={() => Linking.openURL(store.officialDetailUrl!)}
          size="lg"
          variant="secondary"
        >
          {t('store.officialPage')}
        </Button>
      ) : null}
    </View>
  );
}

function PhoneRow({ label, phone }: { label: string; phone: string }) {
  return (
    <View className="flex-row gap-4 border-b border-line py-4">
      <View className="pt-1">
        <Phone color={colors.primary} fill={colors.primary} size={24} />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <Text variant="label">{label}</Text>
        <Pressable onPress={() => Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`)}>
          <Text className="text-primary">{phone}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function BadgeRow({ store }: { store: Store }) {
  const { t } = useTranslation();

  return (
    <View className="flex-row flex-wrap items-center gap-2">
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
