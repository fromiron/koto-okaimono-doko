import { isAllowedOfficialDetailUrl, type Store } from '@koto/schema';
import {
  Building2,
  ExternalLink,
  Footprints,
  MapPin,
  Phone,
} from 'lucide-react-native';
import { Linking, Platform, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';

import { StoreMarker } from '@/src/components/map/StoreMarker';
import { Button } from '@/src/components/ui/Button';
import { InfoRow } from '@/src/components/ui/InfoRow';
import { Text } from '@/src/components/ui/Text';
import type { LatLng } from '@/src/features/map/mapStore';
import { colors } from '@/src/theme/tokens';

import { SourceDateNote } from './SourceDateNote';
import { StoreListRow } from './StoreListRow';
import { VoucherStatus } from './VoucherStatus';
import { DirectionsActions } from './DirectionsActions';
import { useDatasetStore } from '@/src/features/dataset/datasetStore';
import { useRef } from 'react';
import {
  getAddressText,
  getCategoryText,
  getDistanceValueText,
  getFacilityAddress,
  getFacilityName,
} from './storeDisplay';

type Mode = 'sheet' | 'page';

type StoreDetailContentProps = {
  stores: Store[];
  sourceDate?: string | null;
  userLocation?: LatLng | null;
  mode?: Mode;
  onSelectStore?: (id: string) => void;
  onStoreLayout?: (id: string, y: number) => void;
  forceFacility?: boolean;
};

export function StoreDetailContent({
  mode = 'sheet',
  onSelectStore,
  onStoreLayout,
  sourceDate,
  stores,
  userLocation,
  forceFacility = false,
}: StoreDetailContentProps) {
  if (stores.length === 0) {
    return null;
  }

  if (forceFacility || stores.length > 1) {
    return (
      <LocationGroupContent
        key={stores.map((store) => store.id).join(',')}
        mode={mode}
        onSelectStore={onSelectStore}
        onStoreLayout={onStoreLayout}
        userLocation={userLocation}
        sourceDate={sourceDate}
        stores={stores}
      />
    );
  }

  return (
    <SingleStoreContent
      key={stores[0].id}
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
      <SourceDateNote sourceDate={store.sourceUpdatedAt ?? sourceDate} />
    </View>
  );
}

function LocationGroupContent({
  mode,
  onSelectStore,
  onStoreLayout,
  sourceDate,
  stores,
  userLocation,
}: {
  stores: Store[];
  userLocation?: LatLng | null;
  sourceDate?: string | null;
  mode: Mode;
  onSelectStore?: (id: string) => void;
  onStoreLayout?: (id: string, y: number) => void;
}) {
  const { t } = useTranslation();
  const title =
    getFacilityName(stores) ?? t('map.groupedStores', { count: stores.length });
  const first = stores[0];
  const rowContainerY = useRef(0);
  const rowPositions = useRef(new Map<string, number>());

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
        {getFacilityAddress(stores) ? (
          <Text className="mt-1" tone="muted">
            {getFacilityAddress(stores)}
          </Text>
        ) : null}
      </View>

      <View
        className="rounded-card border border-line"
        onLayout={(event) => {
          rowContainerY.current = event.nativeEvent.layout.y;
          rowPositions.current.forEach((y, id) =>
            onStoreLayout?.(id, rowContainerY.current + y),
          );
        }}
      >
        {stores.map((store, index) => (
          <View
            key={store.id}
            className={index < stores.length - 1 ? 'border-b border-line' : ''}
            onLayout={(event) => {
              const y = event.nativeEvent.layout.y;
              rowPositions.current.set(store.id, y);
              onStoreLayout?.(store.id, rowContainerY.current + y);
            }}
          >
            <StoreListRow
              onPress={
                onSelectStore ? () => onSelectStore(store.id) : undefined
              }
              store={store}
              userLocation={userLocation}
            />
          </View>
        ))}
      </View>

      {first && getFacilityName(stores) && getFacilityAddress(stores) ? (
        <DirectionsActions
          store={first}
          facilityName={getFacilityName(stores) ?? undefined}
        />
      ) : null}

      {mode === 'page' && first ? <MapPreview store={first} /> : null}
      <SourceDateNote sourceDate={sourceDate} />
    </View>
  );
}

function StoreSummary({ store }: { store: Store }) {
  const { t } = useTranslation();
  const datasetId = useDatasetStore((state) => state.meta?.datasetId);

  return (
    <View className="gap-2 border-b border-line pb-4">
      <Text accessibilityRole="header" variant="title">
        {store.name}
      </Text>
      <VoucherStatus datasetId={datasetId} store={store} />
      <Text tone="muted">{getCategoryText(store, t)}</Text>
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
      <DirectionsActions store={store} />
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
