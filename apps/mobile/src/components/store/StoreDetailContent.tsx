import type { Store } from '@koto/schema';
import { CalendarDays, ExternalLink, Footprints, MapPin, Navigation, Phone } from 'lucide-react-native';
import { Image, Linking, Pressable, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

import { StoreMarker } from '@/src/components/map/StoreMarker';
import { Button } from '@/src/components/ui/Button';
import { IconBadge } from '@/src/components/ui/IconBadge';
import { InfoRow } from '@/src/components/ui/InfoRow';
import { SurfaceCard } from '@/src/components/ui/SurfaceCard';
import { Text } from '@/src/components/ui/Text';
import { illustrations } from '@/src/assets/illustrations';
import type { LatLng } from '@/src/features/map/mapStore';
import { colors, surfaceShadow } from '@/src/theme/tokens';

import { CouponBadge } from './CouponBadge';
import { PaymentBadge } from './PaymentBadge';
import {
  getAddressText,
  getCategoryText,
  getDistanceText,
  getDistanceValueText,
  getFacilityAddress,
  getFacilityName,
  openDirections,
} from './storeDisplay';

type StoreDetailContentProps = {
  stores: Store[];
  sourceDate?: string | null;
  userLocation?: LatLng | null;
  mode?: 'sheet' | 'page';
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
  mode: 'sheet' | 'page';
}) {
  const { t } = useTranslation();
  const categoryText = getCategoryText(store, t);

  if (mode === 'page') {
    return (
      <View className="gap-5 pb-8">
        <SurfaceCard className="flex-row gap-4 p-4">
          <Image
            resizeMode="cover"
            source={illustrations.storeDetail}
            style={{ borderRadius: 18, height: 120, width: 120 }}
          />
          <View className="min-w-0 flex-1 justify-center gap-3">
            <Text className="min-w-0" variant="subtitle">
              {store.name}
            </Text>
            <BadgeRow store={store} />
            <Text tone="muted">{categoryText}</Text>
          </View>
        </SurfaceCard>

        <SurfaceCard className="px-4">
          <InfoRow
            icon={<MapPin color={colors.primary} fill={colors.primary} size={28} />}
            label={t('store.address')}
            value={getAddressText(store)}
          />
          {store.phone ? (
            <PhoneRow phone={store.phone} label={t('store.phone')} />
          ) : null}
          <InfoRow
            divider={false}
            icon={
              <IconBadge className="h-10 w-10" tone="teal">
                <Footprints color={colors.teal} size={22} />
              </IconBadge>
            }
            label={t('store.currentDistance')}
            value={getDistanceValueText(store, userLocation, t)}
          />
        </SurfaceCard>

        <View className="flex-row gap-3">
          <Button
            className="flex-1"
            leftIcon={<Navigation color={colors.primary} size={20} />}
            onPress={() => openDirections(store)}
            size="lg"
            variant="secondary"
          >
            {t('store.directions')}
          </Button>
          {store.officialDetailUrl ? (
            <Button
              className="flex-1"
              leftIcon={<ExternalLink color={colors.teal} size={20} />}
              onPress={() => Linking.openURL(store.officialDetailUrl!)}
              size="lg"
              variant="teal"
            >
              {t('store.officialPage')}
            </Button>
          ) : null}
        </View>

        <MapPreview store={store} />
      </View>
    );
  }

  return (
    <View className="gap-5 px-5 pb-8 pt-1">
      <View className="flex-row items-center gap-4">
        <View
          className="h-24 w-24 items-center justify-center rounded-full bg-paper-50"
          style={surfaceShadow}
        >
          <Image
            resizeMode="cover"
            source={illustrations.storeDetail}
            style={{ borderRadius: 48, height: 96, width: 96 }}
          />
        </View>
        <View className="min-w-0 flex-1 gap-2">
          <Text className="min-w-0" variant="subtitle">
            {store.name}
          </Text>
          <BadgeRow store={store} />
          <Text tone="muted">{categoryText}</Text>
        </View>
      </View>

      <View>
        <View className="flex-row items-start gap-3 border-t border-line-200 py-4">
          <MapPin color={colors.primary} fill={colors.primary} size={26} />
          <Text className="min-w-0 flex-1">{getAddressText(store)}</Text>
        </View>
        <View className="flex-row items-center gap-3 border-t border-line-200 py-4">
          <Footprints color={colors.primary} size={26} />
          <Text className="min-w-0 flex-1">{getDistanceText(store, userLocation, t)}</Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <Button
          className="flex-1"
          leftIcon={<Navigation color="#ffffff" size={20} />}
          onPress={() => openDirections(store)}
          size="lg"
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

      {sourceDate ? (
        <View className="flex-row items-center gap-2 rounded-2xl border border-line-200 px-4 py-3">
          <CalendarDays color={colors.inkMuted} size={18} />
          <Text tone="muted" variant="caption">
            {t('store.sourceDate')}: {sourceDate}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function PhoneRow({ phone, label }: { phone: string; label: string }) {
  return (
    <View className="flex-row gap-4 border-b border-line-200 py-4">
      <View className="pt-1">
        <Phone color={colors.primary} fill={colors.primary} size={26} />
      </View>
      <View className="min-w-0 flex-1 gap-1">
        <Text variant="label">{label}</Text>
        <Pressable onPress={() => Linking.openURL(`tel:${phone.replace(/[^0-9+]/g, '')}`)}>
          <Text className="text-water-700">{phone}</Text>
        </Pressable>
      </View>
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
  mode: 'sheet' | 'page';
}) {
  const { t } = useTranslation();
  const title = getFacilityName(stores) ?? t('map.groupedStores', { count: stores.length });
  const first = stores[0];

  return (
    <View className={mode === 'page' ? 'gap-5 pb-8' : 'gap-4 px-5 pb-8 pt-1'}>
      <View className="flex-row items-center gap-4">
        <Image
          resizeMode="cover"
          source={illustrations.mallGroup}
          style={{ borderColor: colors.line, borderRadius: 48, borderWidth: 1, height: 96, width: 96 }}
        />
        <View className="min-w-0 flex-1 gap-2">
          <Text variant="subtitle">{title}</Text>
          <View className="self-start rounded-full bg-facility-700 px-3 py-1">
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
            className={`py-4 ${index < stores.length - 1 ? 'border-b border-line-200' : ''}`}
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

      {sourceDate && mode === 'sheet' ? (
        <View className="flex-row items-center gap-2 rounded-2xl border border-line-200 px-4 py-3">
          <CalendarDays color={colors.inkMuted} size={18} />
          <Text tone="muted" variant="caption">
            {t('store.sourceDate')}: {sourceDate}
          </Text>
        </View>
      ) : null}

      {mode === 'page' && first ? <MapPreview store={first} /> : null}
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
      <View className="h-56 overflow-hidden rounded-[18px] border border-line-200">
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
