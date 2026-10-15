import type { Store } from '@koto/schema';
import { MapPin, Navigation } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Platform, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/src/components/ui/Button';
import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/theme/tokens';

import { getStoreMapLinks, openMapLink } from './directions';
import { getAddressText } from './storeDisplay';

type MapAction = 'directions' | 'map';

export function DirectionsActions({
  store,
  compact = false,
  facilityName,
}: {
  store: Store;
  compact?: boolean;
  facilityName?: string | null;
}) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<MapAction | null>(null);
  const [failed, setFailed] = useState<MapAction | null>(null);
  const links = getStoreMapLinks(
    store,
    { os: Platform.OS, version: Platform.Version },
    facilityName,
  );
  const isFacility = facilityName !== undefined;
  const label = t(isFacility ? 'store.routeToFacility' : 'store.directions');
  const handoffNote = t('directions.handoffNote', {
    provider: links?.provider,
  });

  async function open(action: MapAction) {
    if (pending) return;
    setPending(action);
    setFailed(null);
    const result = await openMapLink(links?.[action], (url) =>
      Linking.openURL(url),
    );
    setFailed(result === 'failed' ? action : null);
    setPending(null);
  }

  return (
    <View className="gap-2">
      <Button
        accessibilityHint={links ? handoffNote : t('directions.unavailable')}
        accessibilityLabel={`${label}: ${isFacility ? (facilityName ?? getAddressText(store)) : store.name}`}
        disabled={!links || pending !== null}
        leftIcon={
          <Navigation
            color={compact ? colors.primaryStrong : colors.surface}
            size={20}
          />
        }
        loading={pending === 'directions'}
        onPress={() => void open('directions')}
        size={compact ? 'md' : 'lg'}
        variant={compact ? 'secondary' : 'primary'}
      >
        {label}
      </Button>
      {links ? (
        <>
          {!compact || failed ? (
            <Button
              disabled={pending !== null}
              leftIcon={<MapPin color={colors.primaryStrong} size={20} />}
              loading={pending === 'map'}
              onPress={() => void open('map')}
              variant="secondary"
            >
              {t('directions.viewMap')}
            </Button>
          ) : null}
          <Text tone="muted" variant="caption">
            {compact
              ? t('directions.compactNote', { provider: links.provider })
              : handoffNote}
          </Text>
          {!compact &&
          (isFacility ||
            store.mallName ||
            store.shoppingStreet ||
            store.floor) ? (
            <Text tone="muted" variant="caption">
              {t('directions.facilityNote')}
            </Text>
          ) : null}
        </>
      ) : (
        <Text tone="muted" variant="caption">
          {t('directions.unavailable')}
        </Text>
      )}
      {failed ? (
        <View className="gap-2">
          <Text accessibilityRole="alert" tone="danger" variant="caption">
            {t('directions.openFailed')}
          </Text>
          {store.address.trim() ? (
            <View className="gap-1">
              <Text tone="muted" variant="caption">
                {t('directions.copyAddressHint')}
              </Text>
              <Text selectable variant="caption">
                {getAddressText(store)}
              </Text>
            </View>
          ) : null}
          <Button
            disabled={pending !== null}
            onPress={() => void open(failed)}
            variant="secondary"
          >
            {t('common.retry')}
          </Button>
        </View>
      ) : null}
    </View>
  );
}
